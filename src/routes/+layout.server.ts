import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";
import { PB_GENERIC_USER, PB_GENERIC_PASS, PB_URL } from "$env/static/private";
import type { DashboardType, PotentialTabType, TabCountType, UtilizationType } from "../ambient";
import { UI_THEME_COOKIE } from "../state/uiTheme.svelte";

export const load: LayoutServerLoad = async ({ locals, url, params, cookies }) => {
  if (url.pathname === "/") {
    throw redirect(302, "/selector");
  }

  const juris_id = params.uuid;

  /********************** UTILIZATION **************/
  let utilData: UtilizationType | null = null
  const jurisId = params.uuid;

  try {
    const res = await fetch(`${PB_URL}/api/jurisdiction/${jurisId}/utilization`)
    utilData = await res.json()
  } catch (error) {
    console.error(error)
  }
  /********************** UTILIZATION **************/
  try {
    // Generic authentication with diagnostics
    await locals.pb.collection("users").authWithPassword(PB_GENERIC_USER, PB_GENERIC_PASS);
    console.log("Generic authentication attempted");
    console.log("authStore.isValid:", locals.pb.authStore.isValid);
    console.log("authStore.model id:", locals.pb.authStore.model?.id ?? "none");
  } catch (error) {
    console.error("Generic authentication failed:", error);
  }

  let dash_tabs: DashboardType[] | { error: string };
  try {
    dash_tabs = await locals.pb.collection("dashboard_tabs").getFullList<DashboardType>()
  } catch (err) {
    console.error("Failed to fetch dashboard_tabs:", err);
    dash_tabs = { error: err instanceof Error ? err.message : "Unknown error" };
  }

  return {
    uuid: params.uuid,
    routeID: url.pathname,
    dashboard_groups: dash_tabs,
    utilization: utilData,
    uiTheme: cookies.get(UI_THEME_COOKIE) ?? null
  };
};
