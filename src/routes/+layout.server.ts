import { redirect } from "@sveltejs/kit"
import type { LayoutServerLoad } from "./$types"
import { PB_GENERIC_USER, PB_GENERIC_PASS, PB_URL } from "$env/static/private"
import { GenerateFilter, getSubtableSchema } from "./helpers/apiHelpers"

export const load: LayoutServerLoad = async ({ locals, url, params }) => {
  if (url.pathname === "/") {
    redirect(302, '/selector')
  }

  const juris_id = params.uuid
  console.log('juris_id in layout', juris_id)

  try {
    const authData = await locals.pb.collection('users').authWithPassword(PB_GENERIC_USER, PB_GENERIC_PASS)
  } catch (error) {
    console.log(error)
  }



  let dash_tabs: DashboardType[] | { error: string }
  try {
    dash_tabs = await locals.pb.collection('dashboard_tabs').getFullList() as DashboardType[]
  } catch (err) {
    console.error(err)
    dash_tabs = { error: err instanceof Error ? err.message : "Unknown error" }
  }

  const programs = await locals.pb.collection('programs').getFullList<ProgramType>();

  // Build initial counts
  const dashboardTabsCounts: Record<string, number> = programs.reduce((acc, program) => {
    if (program.dashboard_tabs) {
      const tab = program.dashboard_tabs;
      acc[tab] = (acc[tab] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  console.log('Initial dashboardTabsCounts:', dashboardTabsCounts);

  // Track which tabs we decide to subtract for debugging
  const tabsToSubtract: string[] = [];

  // Check each program
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
      // Attempt to fetch the first record (empty filter = any record)
      const peek = await locals.pb.collection(table).getFirstListItem('', {
        filter: GenerateFilter(subCollectionsNames, juris_id)
      });

      // If it succeeds → table has ≥1 record → no subtraction
      console.log(`  → ${table} has data (no subtraction)\nproof: ${peek}`);
    } catch (error: any) {
      // getFirstListItem throws a ClientResponseError with 404 if no records
      // Also catches if collection doesn't exist, permission denied, etc.
      if (error?.status === 404 || error?.isAbort) {
        console.log(`  → ${table} is empty or not found (will subtract 1 from tab ${tab})`);
        tabsToSubtract.push(tab);
      } else {
        // Unexpected error – log it but don't subtract to be safe
        console.error(`  → Unexpected error checking ${table}:`, error);
      }
    }
  });

  // Await all checks
  await Promise.all(checkPromises);

  console.log('Tabs to subtract:', tabsToSubtract);
  console.log('Number of subtractions:', tabsToSubtract.length);

  // Perform subtractions and clean up
  tabsToSubtract.forEach((tab) => {
    if (dashboardTabsCounts[tab] !== undefined) {
      dashboardTabsCounts[tab]--;
      if (dashboardTabsCounts[tab] <= 0) {
        delete dashboardTabsCounts[tab];
      }
    }
  });

  console.log('Final dashboardTabsCounts:', dashboardTabsCounts);

  return {
    uuid: params.uuid,
    routeID: url.pathname,
    dashboard_groups: dash_tabs,
    dash_count: dashboardTabsCounts,
  }
}
