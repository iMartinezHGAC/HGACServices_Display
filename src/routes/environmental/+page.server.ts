import PocketBase from 'pocketbase';

import type { PageServerLoad } from './$types';

const pb = new PocketBase('https://r319c7uoppfpk2dt.h-gac.com');

export const load: PageServerLoad = async () => {
	return {
		post: await pb.collection('programs').getFullList({expand: 'blurb, links'})
  }
}
