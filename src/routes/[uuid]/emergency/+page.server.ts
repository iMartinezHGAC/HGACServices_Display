import type { PageServerLoad } from './$types';
// trashbash
// solid waste
// wqm
// clean rivers
// vwqm
// OPTIONAL: watershed based planning
import {PB_GENERIC_USER, PB_GENERIC_PASS} from "$env/static/private"


export const load: PageServerLoad = async ({locals}) => {
  try {
    const authData = await locals.pb.collection('users').authWithPassword(PB_GENERIC_USER, PB_GENERIC_PASS)
  } catch(error) {
  }

  const entries = await locals.pb.collection('05_trash_bash').getFullList({
    expand: 'collection_site_id'
  })

  const mostRecent = entries.reduce((maxDate: Date, entry: any) => {
    const currentDate = new Date(entry.date)
    return currentDate >= maxDate ? currentDate : maxDate
  }, new Date(0))

  const mostRecentEntries = entries.filter((entry: any)=> {
    return new Date(entry.date).getTime() === mostRecent.getTime()
  })

	return {
		post: await locals.pb.collection('programs').getFullList({expand: 'blurb, links'}),
    trashbash: mostRecentEntries,
    solidWaste: await locals.pb.collection('01_solid_waste').getFullList()
  }
}
