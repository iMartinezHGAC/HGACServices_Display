// +page.server.ts
import { PB_URL } from "$env/static/private";
import type { PageServerLoad } from "./$types";
import { FetchTable, GenerateFilter, getSubtableSchema } from "../../helpers/apiHelpers";

export const load: PageServerLoad = async ({ locals, params }) => {
  try {
    console.log('[Page Load Start] params.uuid:', params.uuid);
    console.log('[Page Load] PB_URL present:', !!PB_URL);
    console.log('[Page Load] locals.pb authenticated:', locals.pb.authStore.isValid);
    console.log('[Page Load] authStore token exists:', !!locals.pb.authStore.token);

    const collections = ['34_gc_tow_and_go', '35_rtp', '36_transportation_improvement_plan'];
    const juris_id = params.uuid;

    if (!juris_id) {
      console.error('[Page Load] Missing juris_id');
      return { pbData: [] };
    }

    const pbData: Array<{
      collection: string;
      mainRecords?: any[];
      subCollections: { [key: string]: any[] };
      error?: string;
    }> = [];

    for (const table of collections) {
      console.log(`[Page Load] Processing table: ${table}`);

      let subCollectionsNames: string[] = [];
      let mainRecords: any[] = [];
      const subCollections: { [key: string]: any[] } = {};
      let tableError: string | undefined;

      try {
        // Schema fetch
        if (!PB_URL) {
          throw new Error('PB_URL env var missing');
        }
        subCollectionsNames = (await getSubtableSchema(table, PB_URL)) || [];
        console.log(`[Page Load] Subtables for ${table}:`, subCollectionsNames);

        const joinedSubtables = subCollectionsNames.length > 0 ? subCollectionsNames.join(',') : '';

        // Main fetch
        const mainResponse = await FetchTable(locals.pb, table, {
          perPage: 1000,
          filter: GenerateFilter(subCollectionsNames, juris_id),
          expand: joinedSubtables,
        });

        mainRecords = mainResponse?.items || mainResponse || [];
        console.log(`[Page Load] Fetched ${mainRecords.length} main records for ${table}`);

        // Deduplicate subcollections
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
      } catch (err: any) {
        console.error(`[Page Load] Error processing ${table}:`, err?.message || err);
        tableError = err instanceof Error ? err.message : 'Table processing failed';
        mainRecords = [];
      }

      pbData.push({
        collection: table,
        mainRecords: mainRecords.length > 0 ? mainRecords : undefined,
        subCollections,
        error: tableError,
      });
    }

    console.log('[Page Load] Completed – pbData has', pbData.length, 'entries');
    return { pbData };
  } catch (criticalErr: any) {
    console.error('[Page Load] Critical failure:', criticalErr);
    return { pbData: [] };
  }
};
