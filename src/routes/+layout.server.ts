// +layout.server.ts (full revised script)
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

  // Generic authentication
  try {
    await locals.pb.collection("users").authWithPassword(PB_GENERIC_USER, PB_GENERIC_PASS);
    if (!locals.pb.authStore.isValid) throw new Error("Invalid token after auth");
    console.log("Generic authentication successful");
  } catch (error) {
    console.error("Generic authentication failed:", error);
  }

  // Fetch dashboard_tabs
  let dash_tabs: DashboardType[] | { error: string };
  try {
    dash_tabs = (await locals.pb.collection("dashboard_tabs").getFullList()) as DashboardType[];
  } catch (err) {
    console.error("Failed to fetch dashboard_tabs:", err);
    dash_tabs = { error: err instanceof Error ? err.message : "Unknown error" };
  }

  // Fetch programs
  let programs: ProgramType[] = [];
  try {
    programs = await locals.pb.collection("programs").getFullList<ProgramType>();
  } catch (err) {
    console.error("Failed to fetch programs:", err);
    programs = [];
  }

  // Initial full counts
  let dashboardTabsCounts: Record<string, number> = programs.reduce((acc, program) => {
    if (program.dashboard_tabs) {
      const tab = program.dashboard_tabs;
      acc[tab] = (acc[tab] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  console.log("Initial dashboardTabsCounts:", dashboardTabsCounts);

  if (juris_id) {
    const tabsToSubtract: string[] = [];

    const checkPromises = programs.map(async (program: ProgramType) => {
      if (!program.dashboard_tabs || !program.parent_table) {
        console.log(`Skipping program "${program.program_name || program.id}" – missing data`);
        return;
      }

      const tab = program.dashboard_tabs;
      const table = program.parent_table;

      console.log(`\n--- Checking program "${program.program_name || program.id}" (tab: ${tab}, table: ${table}) ---`);

      try {
        const subCollectionsNames = await getSubtableSchema(table, PB_URL);

        const filter = GenerateFilter(subCollectionsNames ?? [], juris_id);

        console.log(`  Subtables: ${subCollectionsNames?.join(", ") || "none"}`);
        console.log(`  Generated filter: ${filter}`);

        const peek = await locals.pb.collection(table).getFirstListItem("", { filter });

        console.log(`  → Found at least one matching record → no subtraction`);
        console.log(`  → Peeked jurisdiction (confirmation): "${peek.jurisdiction || "empty/''"}"`);

      } catch (error: any) {
        if (error?.status === 404 || error?.isAbort) {
          console.log(`  → No matching records found (404) → subtracting 1 from tab ${tab}`);
          tabsToSubtract.push(tab);
        } else {
          console.error(`  → Unexpected error for ${table}:`, error);
          // Conservative: subtract on unexpected errors to avoid over-counting
          tabsToSubtract.push(tab);
        }
      }
    });

    await Promise.all(checkPromises);

    console.log("\nTabs to subtract:", tabsToSubtract);
    console.log("Subtraction count:", tabsToSubtract.length);

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
