import { redirect } from "@sveltejs/kit"
import type { LayoutServerLoad } from "./$types"
import { PB_GENERIC_USER, PB_GENERIC_PASS } from "$env/static/private"

export const load: LayoutServerLoad = async ({ locals, url, params }) => {
  /*
  if(url.pathname === "/") {
    redirect(302, '/overview')
  }
  */
  try {
    const authData = await locals.pb.collection('users').authWithPassword(PB_GENERIC_USER, PB_GENERIC_PASS)
  } catch (error) {
    console.log(error)
  }

  let programs: DashboardType[] | { error: string }
  try {
    programs = await locals.pb.collection('dashboard_tabs').getFullList() as DashboardType[]
  } catch (err) {
    console.error(err)
    programs = { error: err instanceof Error ? err.message : "Unknown error" }
  }

  return {
    uuid: params.uuid,
    routeID: url.pathname,
    dashboard_groups: programs,
  }
}
