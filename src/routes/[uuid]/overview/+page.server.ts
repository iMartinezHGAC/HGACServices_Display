import { PB_URL } from "$env/static/private";
import PocketBase from 'pocketbase'
import type { PageServerLoad } from "./$types";
import { GetFiveQuarters } from "../../helpers/apiHelpers";

async function fetchTable(pb: PocketBase, tableName: string, options: { filter: string; expand?: string }): Promise<any> {
  try {
    // Use getFullList to reliably get all records matching the filter (handles paging internally)
    const records = await pb.collection(tableName).getFullList({
      filter: options.filter,
      expand: options.expand ?? '',
      sort: '-created', // or whatever default sort you want; adjust as needed
    });

    return {
      page: 1,
      perPage: records.length,
      totalItems: records.length,
      totalPages: 1,
      items: records,
    };
  } catch (err) {
    console.error(err);
    return { error: err instanceof Error ? err.message : "Unknown error" };
  }
}

async function getSubtableSchema(tableName: string) {
  let res = await fetch(`${PB_URL}/api/collections/${tableName}/dashboard-schema`);
  return await res.json();
}

export const load: PageServerLoad = async ({ locals, params }) => {
  const collections = ['34_gc_tow_and_go', '35_rtp', '36_transportation_improvement_plan'];
  const juris_id = params.uuid;
  let pbData = [];

  // Fix 1: Destructure the correct variable names returned by GetFiveQuarters
  const { startISO, nowISO } = GetFiveQuarters();

  for (const table of collections) {
    console.log('Table to get subtables', table);
    const subCollectionsNames: string[] = await getSubtableSchema(table);
    console.log('Subtables RAW', subCollectionsNames);

    const joinedSubtables = subCollectionsNames.length > 0 ? subCollectionsNames.join(',') : '';

    // Fix 2 & 3: Correct jurisdiction filter + proper interval overlap
    const filter = `jurisdiction = "${juris_id}"`;

    const mainResponse = await fetchTable(locals.pb, table, {
      filter,
      expand: joinedSubtables,
    });

    if ('error' in mainResponse) {
      // Handle error gracefully if needed
      console.error(`Error fetching ${table}:`, mainResponse.error);
      continue;
    }

    const mainRecords = mainResponse.items;

    const subCollections: { [key: string]: any } = {};

    for (const name of subCollectionsNames) {
      const subTable = `${table}_${name}`;
      console.log('Subtable', subTable);

      const allSubs: any[] = [];
      const seen = new Set<string>();

      for (const rec of mainRecords) {
        let subs = rec.expand?.[name] ?? [];
        if (!Array.isArray(subs)) {
          subs = subs ? [subs] : [];
        }
        for (const sub of subs) {
          if (sub?.id && !seen.has(sub.id)) {
            seen.add(sub.id);
            allSubs.push(sub);
          }
        }
      }

      subCollections[subTable] = {
        page: 1,
        perPage: allSubs.length,
        totalItems: allSubs.length,
        totalPages: 1,
        items: allSubs,
      };
    }

    pbData.push({
      collection: table,
      subCollections,
    });
  }

  return {
    pbData,
  };
};
