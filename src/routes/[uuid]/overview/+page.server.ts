import { PB_URL } from "$env/static/private";
import type { PageServerLoad } from "./$types";
import { FetchTable, GenerateFilter, getSubtableSchema } from "../../helpers/apiHelpers";

export const load: PageServerLoad = async ({ locals, params }) => {
  const collections = ['34_gc_tow_and_go', '35_rtp', '36_transportation_improvement_plan'];
  const juris_id = params.uuid;
  const pbData: Array<{ collection: string; subCollections: Record<string, any[]>; error?: string }> = [];

  for (const table of collections) {
    console.log('Processing table', table);

    try {
      const subCollectionsNames = await getSubtableSchema(table, PB_URL) ?? [];
      console.log('Subtables', subCollectionsNames);

      const joinedSubtables = subCollectionsNames.length > 0 ? subCollectionsNames.join(',') : '';

      const filter = GenerateFilter(subCollectionsNames, juris_id);
      const mainResponse = await FetchTable(locals.pb, table, {
        perPage: 1000,
        filter: GenerateFilter(subCollectionsNames, juris_id),
        expand: joinedSubtables,
      });

      const mainRecords = Array.isArray(mainResponse) ? mainResponse : [];

      if ('error' in mainResponse) {
        console.error(`Error fetching table ${table}:`, mainResponse.error);
      } const subCollections: { [key: string]: any[] } = {};

      for (const name of subCollectionsNames) {
        const subTable = `${table}_${name}`;
        const allSubs: any[] = [];
        const seen = new Set<string>();

        for (const rec of mainRecords) {
          let subs = rec.expand?.[name] ?? [];
          if (!Array.isArray(subs)) subs = subs ? [subs] : [];

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
    } catch (error: any) {
      console.error(`Failed to load data for table ${table}:`, error);
      // Push partial/empty data to avoid breaking the page
      pbData.push({
        collection: table,
        subCollections: {},
        error: error instanceof Error ? error.message : "Unknown error loading table",
      });
    }
  }

  return {
    pbData,
  };
};
