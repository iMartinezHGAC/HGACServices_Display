import { PB_URL } from '$env/static/private';
import type { PageServerLoad } from './$types';
import PocketBase from 'pocketbase'

interface TableFetchOptions {
  sort?: string;
  expand?: string;
  filter?: string;
  perPage?: number;
}

interface TableDataResult<T = any> {
  [tableName: string]: T | { error: string }
}

async function fetchTables(pb: PocketBase, tableNames: string[], options: TableFetchOptions): Promise<TableDataResult> {
  const defaultOptions: TableFetchOptions = {
    sort: '',
    expand: '',
    filter: '',
    perPage: 900,
  }

  const mergedOptions = { ...defaultOptions, ...options }
  const results: TableDataResult = {}

  for (const tableName of tableNames) {
    try {
      let records = await pb.collection(tableName).getList(1, 1, {
        sort: mergedOptions.sort,
        expand: mergedOptions.expand,
        filter: mergedOptions.filter,
        perPage: mergedOptions.perPage,
      })
      results[tableName] = records
    } catch (err) {
      results[tableName] = { error: err instanceof Error ? err.message : "Unknown error" }
      results[tableName] = await pb.collection("33_hgac_coop_purchasing").getList(1, 50, { perPage: 40 })
      console.error(err)
    }
  }
  return results
}

export const load: PageServerLoad = async ({ locals, params, url }) => {
  // console.log('params', params)
  let fullpath = url.pathname.split("/")
  let path = fullpath[fullpath.length - 1]
  // console.log('url', path)

  const programData = await locals.pb.collection('programs').getFullList({
    expand: 'links,blurb',
    filter: `dashboard_tabs.tab_name = "${path}"`,
  })

  let tableNames: string[] = []
  tableNames = await programData.map((program: ProgramType) => program.parent_table)

  let tablesData: TableDataResult
  let tables: TableDataResult
  let tableLivable: TableDataResult
  let res = await fetch(`http://${PB_URL}/api/collections/${tableNames[0]}/relation-fields`)
  let tableSubtables = await res.json()
  // console.log('SUBTABLES: ', ...tableSubtables)
  let projectDetails: object

  try {
    //tableLivable = await fetchTables(locals.pb, tableNames.filter(str => str !== ''), {expand: 'assistance', filter: 'jurisdiction="7rhur9qxcgq9z23"'})
    tables = await fetchTables(locals.pb, tableNames.filter(str => str !== ''), {
      expand: tableSubtables,
      filter: `jurisdiction = "${params.uuid}"`
    })
  } catch (err) {
    console.error(err)
  }


  try {
    projectDetails = await locals.pb.collection('one_liners').getFullList({
      filter: `program.program_name = "Livable Centers"`
    })
  } catch (err) {
    console.error('Error trying to get project details', err)
  }
  return {
    post: programData,
    tablesData: tables,
    projectDetails: projectDetails
  }
}
