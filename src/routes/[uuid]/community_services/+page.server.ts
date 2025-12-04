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

type TableArgumentType = {
  tableName: string,
  subtableNames: string[] | null | undefined 
}

async function fetchTables(pb: PocketBase, tableName: string, options: TableFetchOptions): Promise<TableDataResult> {
  const defaultOptions: TableFetchOptions = {
    sort: '',
    expand: '',
    filter: '',
    perPage: 900,
  }

  const mergedOptions = { ...defaultOptions, ...options }
  const results: TableDataResult = {}

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
    console.error(err)
  }
  return results
}

function createHartString(collection: string) {
  const hartString = `${PB_URL}api/collections/${collection}/dashboard-schema`
  console.log('Attempting to fetch data from custom endpoint')
  return hartString
}

async function tryPocketbase<T>(fn: ()=> Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn()
  } catch(error) {
    console.error('Pocketbase encountered an error:', error)
    return fallback
  }
}

async function fetchSubtables(hartString: string) {
  console.log('using URI:', hartString)
  try {
    const res = await fetch(hartString)
    return await res.json()
  } catch(error) {
    console.error('Failed to get subtable data')
    return null
  }
}

async function useFetchSubtables(tableName: string) {
  return await fetchSubtables(createHartString(tableName))
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

  let tableFetchObject: TableArgumentType[] = await Promise.all(
    tableNames.map(async (tableName: string) => {
      const subtableNames = await useFetchSubtables(tableName);
      return {tableName, subtableNames}
    })
  )

  tableNames.forEach(async (tableName: string)=> {
    let subtables = await useFetchSubtables(tableName)
    tableFetchObject.push({
      tableName: tableName,
      subtableNames: subtables
    })
  })

  let tables: TableDataResult
  let projectDetails: object
  console.log('table fetch object', tableFetchObject)

  for (const tableArgument of tableFetchObject) {

    const subtables = tableArgument.subtableNames !== null && tableArgument.subtableNames !== undefined
          ? tableArgument.subtableNames 
          : [""]
    try {
      //tableLivable = await fetchTables(locals.pb, tableNames.filter(str => str !== ''), {expand: 'assistance', filter: 'jurisdiction="7rhur9qxcgq9z23"'})
      tables = await fetchTables(locals.pb, tableArgument.tableName, {
        expand: subtables.join(" "),
        filter: `jurisdiction = "${params.uuid}"`
      })
    } catch (err) {
      console.error(err)
    }
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
