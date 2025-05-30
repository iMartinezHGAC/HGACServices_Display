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
    perPage: 200,
  }

  const mergedOptions = {...defaultOptions, ...options}
  const results: TableDataResult = {}

  for ( const tableName of tableNames) {
    try {
      const records = await pb.collection(tableName).getFullList({
        sort: mergedOptions.sort,
        expand: mergedOptions.expand,
        filter: mergedOptions.filter,
        perPage: mergedOptions.perPage,
      })
      /* const mostRecentEntries = records.filter((entry: any)=> {
        return new Date(entry.from_date).getTime() === new Date('2025-01-01').getTime()
      }) */
      results[tableName] = records 
    } catch (err) {
      results[tableName] = {error: err instanceof Error ? err.message : "Unknown error"}
      console.error(err)
    }
  }
  return results
}

export const load: PageServerLoad = async ({locals, params}) => {
  const programData = await locals.pb.collection('programs').getFullList({
    filter: `dashboard_tabs.tab_name = "${params.programPage}"`,
    expand: 'blurb, links, dashboard_tabs',
  })
  const tableNames = programData.map((program: ProgramType) => program.parent_table)

  const tablesData = await fetchTables(locals.pb, tableNames, {expand: 'jurisdiction'})

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
