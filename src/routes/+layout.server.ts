// +layout.server.ts (revised – sequential checks to avoid "Too many subrequests" overload)
import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";
import { PB_GENERIC_USER, PB_GENERIC_PASS, PB_URL } from "$env/static/private";
import { GenerateFilter, getSubtableSchema } from "./helpers/apiHelpers";

export const load: LayoutServerLoad = async ({ locals, url, params }) => {
  if (url.pathname === "/") {
    throw redirect(302, "/selector");
  }

  const juris_id = params.uuid;
  console.log("juris_id in layout", juris_id);

  // Generic authentication with diagnostics
  try {
    await locals.pb.collection("users").authWithPassword(PB_GENERIC_USER, PB_GENERIC_PASS);
    console.log("Generic authentication attempted");
    console.log("authStore.isValid:", locals.pb.authStore.isValid);
    console.log("authStore.model id:", locals.pb.authStore.model?.id ?? "none");
  } catch (error) {
    console.error("Generic authentication failed:", error);
  }

  let dash_tabs: DashboardType[] | { error: string };
  try {
    dash_tabs = (await locals.pb.collection("dashboard_tabs").getFullList()) as DashboardType[];
  } catch (err) {
    console.error("Failed to fetch dashboard_tabs:", err);
    dash_tabs = { error: err instanceof Error ? err.message : "Unknown error" };
  }

  let programs: ProgramType[] = [];
  try {
    programs = await locals.pb.collection("programs").getFullList<ProgramType>();
  } catch (err) {
    console.error("Failed to fetch programs:", err);
    programs = [];
  }

  let dashboardTabsCounts: Record<string, number> = programs.reduce((acc, program) => {
    if (program.dashboard_tabs) {
      acc[program.dashboard_tabs] = (acc[program.dashboard_tabs] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  console.log("Initial dashboardTabsCounts:", dashboardTabsCounts);

  if (juris_id) {
    const tabsToSubtract: string[] = [];

    // Sequential loop instead of Promise.all to prevent concurrent overload → avoids "Too many subrequests" and ClientResponseError 0
    for (const program of programs) {
      if (!program.dashboard_tabs || !program.parent_table) {
        console.log(`Skipping program "${program.program_name || program.id}" – missing data`);
        continue;
      }

      const tab = program.dashboard_tabs;
      const table = program.parent_table;

      console.log(`\n--- Checking program (tab: ${tab}, table: ${table}) ---`);

      try {
        const subCollectionsNames = await getSubtableSchema(table, PB_URL) ?? [];

        const filter = GenerateFilter(subCollectionsNames, juris_id);

        console.log(`  Subtables: ${subCollectionsNames.join(", ") || "none"}`);
        console.log(`  Filter: ${filter}`);

        await locals.pb.collection(table).getFirstListItem("", { filter });

        console.log(`  → Has relevant data → no subtraction`);
      } catch (error: any) {
        if (error?.status === 404 || error?.isAbort) {
          console.log(`  → No relevant data (404) → subtracting tab ${tab}`);
          tabsToSubtract.push(tab);
        } else {
          console.error(`  → Check failed for ${table} (status: ${error?.status ?? "unknown"}):`, error);
          // DO NOT subtract on unexpected errors (e.g., "Too many subrequests", network abort, permission)
          // This prevents over-subtraction when PB is temporarily overloaded
          console.log(`  → Unexpected error – NOT subtracting to avoid incorrect zero counts`);
        }
      }
    }

    console.log("\nTabs to subtract:", tabsToSubtract);

    tabsToSubtract.forEach((tab) => {
      if (dashboardTabsCounts[tab] !== undefined) {
        dashboardTabsCounts[tab]--;
        if (dashboardTabsCounts[tab] <= 0) delete dashboardTabsCounts[tab];
      }
    });

    console.log("Final dashboardTabsCounts:", dashboardTabsCounts);
  } else {
    console.log("No juris_id – using full counts");
  }

  return {
    uuid: params.uuid,
    routeID: url.pathname,
    dashboard_groups: dash_tabs,
    dash_count: dashboardTabsCounts,
  };
};
