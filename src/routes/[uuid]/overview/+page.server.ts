// +page.server.ts
import { PB_URL } from "$env/static/private";
import type { PageServerLoad } from "./$types";
import { FetchTable, GenerateFilter, getSubtableSchema } from "../../helpers/apiHelpers";

export const load: PageServerLoad = async ({ locals, params }) => {
  // Top-level safety: entire load wrapped to prevent any uncaught 500
  try {
    console.log('[Page Load Start] params:', params);
    console.log('[Page Load] PB_URL present:', !!PB_URL);
    console.log('[Page Load] locals.pb authenticated:', locals.pb.authStore.isValid);
    console.log('[Page Load] authStore token:', locals.pb.authStore.token ? 'present' : 'missing');

    const collections = ['34_gc_tow_and_go', '35_rtp', '36_transportation_improvement_plan'];
    const juris_id = params.uuid;

    if (!juris_id) {
      console.error('[Page Load] Missing juris_id – returning empty data');
      return { pbData: [], loadError: 'No jurisdiction ID provided' };
    }

    const pbData: Array<{
      collection: string;
      mainRecords?: any[];
      subCollections: { [key: string]: any[] };
      error?: string;
    }> = [];

    for (const table of collections) {
      console.log(`[Page Load] Starting processing for table: ${table}`);

      let subCollectionsNames: string[] = [];
      let mainRecords: any[] = [];
      const subCollections: { [key: string]: any[] } = {};
      let tableError: string | undefined;

      try {
        // Schema fetch (uses PB_URL directly – most likely point of failure on deploy)
        try {
          if (!PB_URL) throw new Error('PB_URL environment variable missing');
          subCollectionsNames = (await getSubtableSchema(table, PB_URL)) || [];
          console.log(`[Page Load] Subtables for ${table}:`, subCollectionsNames);
        } catch (schemaErr: any) {
          console.error(`[Page Load] Schema fetch failed for ${table}:`, schemaErr?.message || schemaErr);
          subCollectionsNames = [];
        }

        const joinedSubtables = subCollectionsNames.length > 0 ? subCollectionsNames.join(',') : '';

        // Main data fetch (uses authenticated locals.pb)
        try {
          const mainResponse = await FetchTable(locals.pb, table, {
            perPage: 1000,
            filter: GenerateFilter(subCollectionsNames, juris_id),
            expand: joinedSubtables,
          });

          mainRecords = mainResponse?.items || mainResponse || [];
          console.log(`[Page Load] Fetched ${mainRecords.length} main records for ${table}`);
        } catch (fetchErr: any) {
          console.error(`[Page Load] Main fetch failed for ${table}:`, fetchErr?.message || fetchErr);
          mainRecords = [];
        }

        // Subcollection deduplication processing
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
      } catch (unexpectedErr: any) {
        console.error(`[Page Load] Unexpected error processing ${table}:`, unexpectedErr);
        tableError = unexpectedErr instanceof Error ? unexpectedErr.message : 'Unknown error';
      }

      pbData.push({
        collection: table,
        mainRecords: mainRecords.length > 0 ? mainRecords : undefined,
        subCollections,
        error: tableError,
      });
    }

    console.log('[Page Load] Successfully prepared pbData with', pbData.length, 'entries');
    return { pbData, loadError: undefined };
  } catch (globalErr: any) {
    console.error('[Page Load] CRITICAL uncaught error in load function:', globalErr);
    return {
      pbData: [],
      loadError: globalErr instanceof Error ? globalErr.message : 'Critical load failure',
    };
  }
};
