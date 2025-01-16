import PocketBase from 'pocketbase';

import type { PageServerLoad } from './$types';

const pb = new PocketBase('https://r319c7uoppfpk2dt.h-gac.com');
// trashbash
// solid waste
// wqm
// clean rivers
// vwqm
// OPTIONAL: watershed based planning

export const load: PageServerLoad = async () => {
	return {
		post: await pb.collection('programs').getFullList({expand: 'blurb, links'}),
    trashbash: await pb.collection('05_trash_bash').getFullList({expand: 'collection_site_id'}),
    solidWaste: await pb.collection('01_solid_waste').getFullList()
  }
}
