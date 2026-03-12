// +page.server.ts (revised – fixed response handling + consistent with filter)
import { PB_URL } from "$env/static/private";
import type { PageServerLoad } from "./$types";
import { FetchTable, GenerateFilter, getSubtableSchema } from "../../helpers/apiHelpers";
import type { PotentialTabType, TabCountRecord, TabCountType, UtilizationType } from "../../../ambient";

export const load: PageServerLoad = async ({ locals, params, parent }) => {
  const collections = ['34_gc_tow_and_go', '35_rtp', '36_transportation_improvement_plan'];
  const juris_id = params.uuid;
  const pbData: Array<{ collection: string; subCollections: Record<string, any[]>; error?: string }> = [];

  const parentData = await parent()

  for (const table of collections) {
    console.log('Processing table', table);

    try {
      const subCollectionsNames = (await getSubtableSchema(table, PB_URL)) ?? [];
      console.log('Subtables', subCollectionsNames);

      const joinedSubtables = subCollectionsNames.length > 0 ? subCollectionsNames.join(',') : '';

      const filter = GenerateFilter(subCollectionsNames, juris_id);
      console.log('Generated filter for data load:', filter);



      const mainResponse = await FetchTable(locals.pb, table, {
        perPage: 1000,
        filter: GenerateFilter(subCollectionsNames, juris_id),
        expand: joinedSubtables,
      });

      const mainRecords = Array.isArray(mainResponse) ? mainResponse : [];



      const subCollections: { [key: string]: any[] } = {};

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
      pbData.push({
        collection: table,
        subCollections: {},
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return {
    ...parentData,
    pbData: pbData,
  };
};

