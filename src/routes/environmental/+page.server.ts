import type { PageServerLoad } from './$types';
// trashbash
// solid waste
// wqm
// clean rivers
// vwqm
// OPTIONAL: watershed based planning

export const load: PageServerLoad = async ({locals}) => {
	return {
		post: await locals.pb.collection('programs').getFullList({expand: 'blurb, links'}),
    trashbash: await locals.pb.collection('05_trash_bash').getFullList({
      expand: 'collection_site_id'
    }),
    solidWaste: await locals.pb.collection('01_solid_waste').getFullList()
  }
}
