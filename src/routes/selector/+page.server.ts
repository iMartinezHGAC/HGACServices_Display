import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
  let record
  try {
    record = await locals.pb.collection('jurisdictions').getFullList({
      filter: 'jurisdiction_id ~ "CNTY" || jurisdiction_id ~ "CITY" || jurisdiction_id ~ "ISD" || jurisdiction_id ~ "CCP"'
    })
  } catch (error: unknown) {
    console.error("Error from pocketbase", error)
  }
  return {
    data: record
  }
}
