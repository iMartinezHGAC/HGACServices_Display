import { PB_URL } from "$env/static/private";
import type { PageServerLoad } from "./$types";
import type { CollectionWSubType, TableDataResult, TableFetchOptions } from "../../../ambient";
import { FetchTable, GenerateFilter, GetFiveQuarters, getSubtableSchema } from "../../helpers/apiHelpers";



export const load: PageServerLoad = async ({ locals, params }) => {
  const collections = ['34_gc_tow_and_go', '35_rtp', '36_transportation_improvement_plan'];
  const juris_id = params.uuid
  let pbData = []

  for (const table of collections) {
    console.log('Table to get subtables', table);
    let subCollectionsNames = await getSubtableSchema(table, PB_URL);
    console.log('Subtables RAW', subCollectionsNames);

    let joinedSubtables = ""
    if (subCollectionsNames && subCollectionsNames.length > 0) joinedSubtables = subCollectionsNames.join(',')

    let mainResponse = await FetchTable(locals.pb, table, {
      perPage: 1000,
      filter: GenerateFilter(subCollectionsNames, juris_id),
      expand: joinedSubtables, // Add this if fetchTable supports it; otherwise, use the direct call above.
    });

    const mainRecords = mainResponse ?? []; // Assuming fetchTable returns { items: [...], ... }

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

      subCollections[subTable] = allSubs;
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

