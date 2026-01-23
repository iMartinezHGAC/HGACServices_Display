
import { PB_URL } from '$env/static/private';
import type { AdworkType, EventType, SchemaMultiType, SchemaType, TableDataResult, TableFetchOptions } from '../../../ambient';
import type { PageServerLoad } from './$types';
import PocketBase from 'pocketbase'
//import {PB_GENERIC_USER, PB_GENERIC_PASS} from "$env/static/private"

async function fetchTable(pb: PocketBase, tableName: string, options: TableFetchOptions): Promise<Object> {
  const defaultOptions: TableFetchOptions = {
    sort: '',
    expand: '',
    filter: '',
    perPage: 50,
  }
  const mergedOptions = { ...defaultOptions, ...options }
  let results = {}

  try {
    let records = await pb.collection(tableName).getList(100, 1, {
      sort: mergedOptions.sort,
      expand: mergedOptions.expand,
      filter: mergedOptions.filter,
      perPage: mergedOptions.perPage,
    })
    results = records
  } catch (err) {
    results = { error: err instanceof Error ? err.message : "Unknown error" }
    console.error(err)
  }
  return results
}
async function getSchema(tableName: string): Promise<SchemaType[]> {
  try {
    const response = await fetch(`${PB_URL}/api/collections/${tableName}/schema`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to fetch schema:', error);
    throw error;
  }
}

async function useGetSchema(tableName: string = "05_trash_bash"): Promise<SchemaMultiType> {
  const schema = await getSchema(tableName);

  return {
    tableName,
    schema
  };
}

async function getSubtableSchema(tableName: string) {
  let res = await fetch(`${PB_URL}/api/collections/${tableName}/dashboard-schema`)
  return await res.json()
}

async function getProjectByID(tableName: string, matchedName: string) {
  let res = await fetch(`${PB_URL}/api/collections/${tableName}/getproject/${matchedName}`)
  return await res.json()
}


export const load: PageServerLoad = async ({ locals, params }) => {
  const juris_id = params.uuid
  const programData = await locals.pb.collection('programs').getFullList({
    expand: 'links,blurb',
    filter: `dashboard_tabs.tab_name = "environmental"`,
  })

  let tableNames: string[] = await programData.map((program: ProgramType) => program.parent_table)
  console.log("table names", tableNames)
  //console.log('juris_id', juris_id)

  /*
  const entries = await locals.pb.collection('05_trash_bash').getFullList({
    expand: 'collection_site_id'
  })
  */

  let tablesData: TableDataResult = {}
  let schema: SchemaMultiType[] = []

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentQuarter = Math.floor(currentMonth / 3);
  let startQuarter = currentQuarter - 5;
  let startYear = now.getFullYear();
  while (startQuarter < 0) {
    startQuarter += 4;
    startYear -= 1;
  }
  const startMonth = startQuarter * 3;
  const start = new Date(Date.UTC(startYear, startMonth, 1, 0, 0, 0));
  const startISO = start.toISOString().replace('T', ' ');
  const nowISO = now.toISOString().replace('T', ' ');

  for (let i = 0; i < tableNames.length; i++) {
    let subtable = await getSubtableSchema(tableNames[i])
    let joinedSubtables = ""
    if (subtable && subtable.length > 0) joinedSubtables = subtable.join(',')
    console.log('subtables if any', subtable)
    tablesData[tableNames[i]] = await fetchTable(locals.pb, tableNames[i], {
      perPage: 1000,
      filter: `jurisdiction = "${juris_id}" && ((from_date >= "${startISO}" && from_date <= "${nowISO}") || (to_date >= "${startISO}" && to_date <= "${nowISO}"))`,
      expand: joinedSubtables // ""
    });
    schema.push(await useGetSchema(tableNames[i]))
  }

  let projectDetails: AdworkType[] = []
  const filterPartsAdwork = tableNames.map(name => `program.parent_table = "${name.replace(/"/g, '\\"')}"`); // Escape double quotes if present
  const filterAdwork = filterPartsAdwork.join(' || ');
  try {
    projectDetails = await locals.pb.collection('one_liners').getFullList({
      filter: filterAdwork
    })
    //console.log('Project Details if any', projectDetails)
  } catch (err) {
    console.error('Error trying to get project details', err)
  }

  let eventsData: EventType[] = []
  const filterParts = tableNames.map(name => `program = "${name.replace(/"/g, '\\"')}"`); // Escape double quotes if present
  const filter = filterParts.join(' || ');
  try {
    eventsData = await locals.pb.collection('events_json').getFullList({
      filter: filter
    })
    console.log('Event Data if any', eventsData)
  } catch (err) {
    console.error('Error trying to get events data', err)
  }

  return {
    post: programData,
    tableNames: tableNames,
    tablesData: tablesData,
    schema: schema,
    projectDetails: projectDetails,
    eventsData: eventsData
  }
}
