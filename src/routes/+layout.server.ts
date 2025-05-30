import { redirect } from "@sveltejs/kit"
import type { LayoutServerLoad } from "./$types"
import { filter } from "d3"

export const load: LayoutServerLoad = async ({locals, url, params}) => {
  if(url.pathname === "/") {
    redirect(302, '/overview')
  }
  let programs
  try {
     programs = await locals.pb.collection('programs').getFullList()
  } catch(err) {
    console.error(err)
  }

  const dashboard_groups = programs.filter((program: ProgramType) => program.dashboard_group)
  
  console.log('server uuid',params.uuid)
  return {
    uuid: params.uuid,
    routeID: url.pathname,
    dashboard_groups: dashboard_groups,
  }
}
