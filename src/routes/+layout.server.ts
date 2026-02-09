// +layout.server.ts
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

  // Perform generic authentication
  try {
    await locals.pb.collection("users").authWithPassword(PB_GENERIC_USER, PB_GENERIC_PASS);

    if (!locals.pb.authStore.isValid) {
      throw new Error("Authentication succeeded but token is invalid");
    }

    console.log("Generic authentication successful");
  } catch (error) {
    console.error("Generic authentication failed:", error);
    // Continue with unauthenticated client – downstream fetches will likely fail gracefully
  }

  // Fetch dashboard_tabs with error handling
  let dash_tabs: DashboardType[] | { error: string };
  try {
    dash_tabs = (await locals.pb.collection("dashboard_tabs").getFullList()) as DashboardType[];
  } catch (err) {
    console.error("Failed to fetch dashboard_tabs:", err);
    dash_tabs = { error: err instanceof Error ? err.message : "Unknown error" };
  }

  // Fetch programs with error handling and fallback
  let programs: ProgramType[] = [];
  try {
    programs = await locals.pb.collection("programs").getFullList<ProgramType>();
  } catch (err) {
    console.error("Failed to fetch programs:", err);
    programs = []; // Fallback to empty array so UI can still render (counts will be zero)
  }

  // Default/full counts when no jurisdiction is selected or programs failed to load
  let dashboardTabsCounts: Record<string, number> = programs.reduce((acc, program) => {
    if (program.dashboard_tabs) {
      const tab = program.dashboard_tabs;
      acc[tab] = (acc[tab] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  console.log("Initial dashboardTabsCounts:", dashboardTabsCounts);

  // Only perform jurisdiction-specific checks/subtractions if we have a valid juris_id
  if (juris_id) {
    const tabsToSubtract: string[] = [];

    const checkPromises = programs.map(async (program: ProgramType) => {
      if (!program.dashboard_tabs || !program.parent_table) {
        console.log(`Skipping program "${program.program_name || program.id}" – no dashboard_tabs or parent_table`);
        return;
      }

      const tab = program.dashboard_tabs;
      const table = program.parent_table;

      console.log(`Checking program "${program.program_name || program.id}" (tab: ${tab}, table: ${table})`);

      try {
        let subCollectionsNames = await getSubtableSchema(table, PB_URL);

        // Peek to see if any record exists for this jurisdiction
        const peek = await locals.pb.collection(table).getFirstListItem("", {
          filter: GenerateFilter(subCollectionsNames, juris_id),
        });

        console.log(`  → ${table} has data (no subtraction)\nproof: ${JSON.stringify(peek)}`);
      } catch (error: any) {
        if (error?.status === 404 || error?.isAbort) {
          console.log(`  → ${table} is empty or not found (will subtract 1 from tab ${tab})`);
          tabsToSubtract.push(tab);
        } else {
          console.error(`  → Unexpected error checking ${table}:`, error);
        }
      }
    });

    await Promise.all(checkPromises);

    console.log("Tabs to subtract:", tabsToSubtract);
    console.log("Number of subtractions:", tabsToSubtract.length);

    // Apply subtractions
    tabsToSubtract.forEach((tab) => {
      if (dashboardTabsCounts[tab] !== undefined) {
        dashboardTabsCounts[tab]--;
        if (dashboardTabsCounts[tab] <= 0) {
          delete dashboardTabsCounts[tab];
        }
      }
    });

    console.log("Final dashboardTabsCounts (after subtraction):", dashboardTabsCounts);
  } else {
    console.log("No juris_id – using full/unsubtracted dashboardTabsCounts");
  }

  return {
    uuid: params.uuid,
    routeID: url.pathname,
    dashboard_groups: dash_tabs,
    dash_count: dashboardTabsCounts,
  };
};
