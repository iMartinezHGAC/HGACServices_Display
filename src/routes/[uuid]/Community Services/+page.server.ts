import type { PageServerLoad } from './$types';
import PocketBase from 'pocketbase'

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
    perPage: 900,
  }

  const mergedOptions = {...defaultOptions, ...options}
  const results: TableDataResult = {}


  for ( const tableName of tableNames) {
    try {

      const lower_limit: number = Math.floor(Math.random() * 3);
      const upper_limit: number = Math.floor(Math.random() * 300) + 100;
      let records
      if(tableName === "33_hgac_coop_purchasing") {
        records = await pb.collection(tableName).getList(lower_limit,upper_limit,{
          sort: mergedOptions.sort,
          expand: mergedOptions.expand,
          filter: mergedOptions.filter,
          perPage: mergedOptions.perPage,
        })
      } else {
        records = await pb.collection(tableName).getList(1,1,{
          sort: mergedOptions.sort,
          expand: mergedOptions.expand,
          filter: mergedOptions.filter,
          perPage: mergedOptions.perPage,
        })
      }
      results[tableName] = records 
    } catch (err) {
      results[tableName] = {error: err instanceof Error ? err.message : "Unknown error"}
      results[tableName] = await pb.collection("33_hgac_coop_purchasing").getList(1,50,{perPage: 40})
      console.error(err)
    }
  }
  return results
}

export const load: PageServerLoad = async ({locals, params}) => {
  const programData = await locals.pb.collection('programs').getFullList({
    expand: 'links,blurb',
    filter: `dashboard_tabs.tab_name = "Community Services"`,
  })
  let tableNames: string[] = []
  tableNames = await programData.map((program: ProgramType) => program.parent_table)
  //tableNames.unshift("33_hgac_coop_purchasing")
  console.log("table names", tableNames)

  let tablesData: TableDataResult
  let tables: TableDataResult
  let tableLivable: TableDataResult
  try {
      //tableLivable = await fetchTables(locals.pb, tableNames.filter(str => str !== ''), {expand: 'assistance', filter: 'jurisdiction="7rhur9qxcgq9z23"'})
      tableLivable = await fetchTables(locals.pb, tableNames.filter(str => str !== ''), {expand: 'assistance, studies'})
    } catch(err) {
      console.error(err)
  }
  try {
      tables = await fetchTables(locals.pb, tableNames.filter(str => str !== ''), {})
    } catch(err) {
      console.error(err)
  }
  //console.log('table data',tablesData)
  /*
  const entries = await locals.pb.collection('05_trash_bash').getFullList({
    expand: 'collection_site_id'
  })
  */
	return {
		post: programData,
    tablesData: {...tables, ...tableLivable},
  }
}
