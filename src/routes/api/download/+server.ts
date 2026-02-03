import type { RequestHandler } from './$types';
import { json, error } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ url, locals }) => {
  const juris_id = url.searchParams.get('jurisdiction');

  if (!juris_id) {
    throw error(400, 'Jurisdiction parameter is required');
  }

  try {
    // Fetch the single record matching the location
    const record = await locals.pb.collection('jurisdiction_logos').getFirstListItem(
      `jurisdiction.id = "${juris_id}"`
    );
    const data = await record

    // Assuming your file field is named 'image' — change if different
    const fileField = 'image';
    console.log(data, data[fileField])

    const thumbnailUrl = locals.pb.files.getURL(record, record[fileField], {
      thumb: '800x0' // adjust size as needed; '0x600' for height-constrained, etc.
    });

    const fullUrl = locals.pb.files.getURL(record, record[fileField]);

    return json({
      thumbnailUrl,
      fullUrl,
      filename: record[fileField]
    });
  } catch (err) {
    console.error('Image fetch error:', err);
    throw error(404, 'No image found for this location');
  }
};
