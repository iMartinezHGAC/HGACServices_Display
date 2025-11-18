import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
  let record
  try {
    record = await locals.pb.collection('jurisdictions').getFullList({})
  } catch (error: unknown) {
    console.error("Error from pocketbase", error)
  }
  return {
    data: record
  }
}
