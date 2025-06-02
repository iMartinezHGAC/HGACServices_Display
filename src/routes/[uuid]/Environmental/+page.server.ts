import type { PageServerLoad } from './$types';
import PocketBase from 'pocketbase'
//import {PB_GENERIC_USER, PB_GENERIC_PASS} from "$env/static/private"

interface TableFetchOptions {
  sort?: string;
  expand?: string;
  filter?: string;
  perPage?: number;
}

interface TableDataResult<T = any> {
  [tableName: string]: T | {error: string}
}

async function fetchTables(pb: PocketBase, tableNames: string[], options: TableFetchOptions): Promise<TableDataResult> {
  const defaultOptions: TableFetchOptions = {
    sort: '',
    expand: '',
    filter: '',
    perPage: 50,
  }

  const mergedOptions = {...defaultOptions, ...options}
  const results: TableDataResult = {}

  for ( const tableName of tableNames) {
    try {
      const records = await pb.collection("33_hgac_coop_purchasing").getFullList({
        sort: mergedOptions.sort,
        expand: mergedOptions.expand,
        filter: mergedOptions.filter,
        perPage: mergedOptions.perPage,
      })
      results[tableName] = records 
    } catch (err) {
      results[tableName] = {error: err instanceof Error ? err.message : "Unknown error"}
        results[tableName] = await pb.collection("33_hgac_coop_purchasing").getFullList({perPage: 40})
      console.error(err)
    }
  }
  return results
}

export const load: PageServerLoad = async ({locals, params}) => {
  const programData = await locals.pb.collection('programs').getFullList({
    filter: `dashboard_tabs.tab_name = "Environmental"`,
  })
  let tableNames: string[] = []
  tableNames = await programData.map((program: ProgramType) => program.parent_table)

  let tablesData: TableDataResult
  try {
  tablesData = await fetchTables(locals.pb, tableNames.filter(str => str !== ''), {})
  } catch(err) {
    console.error(err)
  }
  /*
  const entries = await locals.pb.collection('05_trash_bash').getFullList({
    expand: 'collection_site_id'
  })
  */
	return {
		post: programData,
    tablesData: tablesData,
  }
}
