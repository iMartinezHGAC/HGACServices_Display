// +layout.server.ts (revised – sequential checks to avoid "Too many subrequests" overload)
import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";
import { PB_GENERIC_USER, PB_GENERIC_PASS, PB_URL } from "$env/static/private";
import type { DashboardType, TabCountType } from "../ambient";
import { filter } from "d3";

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
    dash_tabs = await locals.pb.collection("dashboard_tabs").getFullList<DashboardType>()
  } catch (err) {
    console.error("Failed to fetch dashboard_tabs:", err);
    dash_tabs = { error: err instanceof Error ? err.message : "Unknown error" };
  }

  let tabCounts: TabCountType[]
  try {
    tabCounts = await locals.pb.collection("tab_visibility").getFullList<TabCountType>({
      filter: `jurisdiction.id = '${juris_id}'`
    });
  } catch (err) {
    console.error("Failed to fetch programs:", err);
    tabCounts = [];
  }

  return {
    uuid: params.uuid,
    routeID: url.pathname,
    dashboard_groups: dash_tabs,
    dash_count: tabCounts,
  };
};
