import type { PageServerLoad } from './$types';
import PocketBase from 'pocketbase'
import {PB_GENERIC_USER, PB_GENERIC_PASS} from "$env/static/private"

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
    const authData = await pb.collection('users').authWithPassword(PB_GENERIC_USER, PB_GENERIC_PASS)
  } catch(error) {
  }
    try {
      const records = await pb.collection(tableName).getFullList({
        sort: mergedOptions.sort,
        expand: mergedOptions.expand,
        filter: mergedOptions.filter,
        perPage: mergedOptions.perPage,
      })
      const mostRecentEntries = records.filter((entry: any)=> {
        return new Date(entry.from_date).getTime() === new Date('2025-01-01').getTime()
      })
      results[tableName] = records 
    } catch (err) {
      results[tableName] = {error: err instanceof Error ? err.message : "Unknown error"}
      console.error(err)
    }
  }
  return results
}

export const load: PageServerLoad = async ({locals, params}) => {
  try {
    const authData = await locals.pb.collection('users').authWithPassword(PB_GENERIC_USER, PB_GENERIC_PASS)
  } catch(error) {
  }

  const programData = await locals.pb.collection('programs').getFullList({
    expand: 'blurb, links',
    filter: "dashboard_group = 'hgac_buy'"
  })
  const tableNames = programData.map((program: ProgramType) => program.parent_table)

  const tablesData = await fetchTables(locals.pb, tableNames, {expand: 'jurisdiction'})

  const entries = await locals.pb.collection('05_trash_bash').getFullList({
    expand: 'collection_site_id'
  })

  const mostRecent = entries.reduce((maxDate: Date, entry: any) => {
    const currentDate = new Date(entry.date)
    return currentDate >= maxDate ? currentDate : maxDate
  }, new Date(0))



	return {
		post: programData,
    tablesData: tablesData,
  }
}
