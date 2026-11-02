import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, parent }) => {
  // The layout signs locals.pb in; the logos collection may need that
  await parent()

  let record
  try {
    record = await locals.pb.collection('jurisdictions').getFullList({
      filter: 'jurisdiction_id ~ "CNTY" || jurisdiction_id ~ "CITY" || jurisdiction_id ~ "ISD" || jurisdiction_id ~ "CCP"'
    })
  } catch (error: unknown) {
    console.error("Error from pocketbase", error)
  }

  // Every jurisdiction's sigil in one request, as small thumbnails for the list (jurisdiction id → url).
  // '96x96f' fits the image inside 96px without cropping; PocketBase serves the original instead when
  // that size isn't in the image field's thumb list, or for SVGs.
  const sigils: Record<string, string> = {}
  try {
    const logos = await locals.pb.collection('jurisdiction_logos').getFullList({
      fields: 'id,collectionId,collectionName,jurisdiction,image'
    })
    for (const logo of logos) {
      if (logo.jurisdiction && logo.image) {
        sigils[logo.jurisdiction] = locals.pb.files.getURL(logo, logo.image, { thumb: '96x96f' })
      }
    }
  } catch (error: unknown) {
    console.error("Error fetching jurisdiction logos", error)
  }

  return {
    data: record,
    sigils
  }
}
