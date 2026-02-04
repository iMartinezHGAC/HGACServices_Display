import { PB_URL } from "$env/static/private";
import PocketBase from 'pocketbase'
import type { PageServerLoad } from "./$types";
import type { CollectionWSubType, TableDataResult, TableFetchOptions } from "../../../ambient";
import { GenerateFilter, GetFiveQuarters } from "../../helpers/apiHelpers";


async function fetchTable(pb: PocketBase, tableName: string, options: TableFetchOptions): Promise<Object> {
  const defaultOptions: TableFetchOptions = {
    sort: '',
    expand: '',
    filter: '',
    perPage: 50,
  }

  const mergedOptions = { ...defaultOptions, ...options }
  let results = {}

  try {

    const lower_limit: number = Math.floor(Math.random() * 3);
    const upper_limit: number = Math.floor(Math.random() * 300) + 100;
    let records
    if (tableName === "33_hgac_coop_purchasing") {
      records = await pb.collection(tableName).getList(lower_limit, upper_limit, {
        sort: mergedOptions.sort,
        expand: mergedOptions.expand,
        filter: mergedOptions.filter,
        perPage: mergedOptions.perPage,
      })
    } else {
      records = await pb.collection(tableName).getList(1, 1, {
        sort: mergedOptions.sort,
        expand: mergedOptions.expand,
        filter: mergedOptions.filter,
        perPage: mergedOptions.perPage,
      })
    }
    results = records
  } catch (err) {
    results = { error: err instanceof Error ? err.message : "Unknown error" }
    console.error(err)
  }
  return results
}

async function getSchema(tableName: string) {
  let res = await fetch(`${PB_URL}/api/collections/${tableName}/schema`)
  return await res.json()
}

async function getSubtableSchema(tableName: string) {
  let res = await fetch(`${PB_URL}/api/collections/${tableName}/dashboard-schema`)
  return await res.json()
}

export const load: PageServerLoad = async ({ locals, params }) => {
  const collections = ['34_gc_tow_and_go', '35_rtp', '36_transportation_improvement_plan'];
  const juris_id = params.uuid
  let pbData = []

  for (const table of collections) {
    console.log('Table to get subtables', table);
    let subCollectionsNames = await getSubtableSchema(table);
    console.log('Subtables RAW', subCollectionsNames);

    const filter = `jurisdiction.name = "${params.uuid}"`;
    const expand = subCollectionsNames.join(',');
    let joinedSubtables = ""
    if (subCollectionsNames && subCollectionsNames.length > 0) joinedSubtables = subCollectionsNames.join(',')

    let { start, now } = GetFiveQuarters()

    let mainResponse = await fetchTable(locals.pb, table, {
      perPage: 1000,
      filter: GenerateFilter(subCollectionsNames, juris_id),
      expand: joinedSubtables, // Add this if fetchTable supports it; otherwise, use the direct call above.
    });

    const mainRecords = mainResponse.items ?? []; // Assuming fetchTable returns { items: [...], ... }

    const subCollections: { [key: string]: any } = {};

    for (const name of subCollectionsNames) {
      const subTable = table + '_' + name;
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

      // Mimic the structure of fetchTable response
      const subRecord = {
        page: 1,
        perPage: 1000,
        totalItems: allSubs.length,
        totalPages: 1,
        items: allSubs,
      };

      subCollections[subTable] = subRecord;
    }

    pbData.push({
      collection: table,
      subCollections,
    });
  }

  return {
    pbData: pbData,
  };
};

