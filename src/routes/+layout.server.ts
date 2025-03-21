import { redirect } from "@sveltejs/kit"
import type { LayoutServerLoad } from "./$types"

export const load: LayoutServerLoad = async ({url, params}) => {
  if(url.pathname === "/") {
    redirect(302, '/overview')
  }
  return {
    uuid: params.uuid,
    routeID: url.pathname,
  }
}
