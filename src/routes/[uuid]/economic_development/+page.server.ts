import { PB_URL } from '$env/static/private';
import type { AdworkType, EventType, SchemaMultiType, SchemaType, TableDataResult, TableFetchOptions } from '../../../ambient';
import { buildAdworkFilter, FetchTable, GenerateFilter } from '../../helpers/apiHelpers';
import type { PageServerLoad } from './$types';

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
    filter: `dashboard_tabs.tab_name = "economic_development"`,
  })

  let tableNames: string[] = await programData.map((program: ProgramType) => program.parent_table)

  let tablesData: TableDataResult = {}
  let schema: SchemaMultiType[] = []

  for (let i = 0; i < tableNames.length; i++) {
    let subtable = await getSubtableSchema(tableNames[i]) ?? [""]
    console.log('subtables if any', subtable)
    tablesData[tableNames[i]] = await FetchTable(locals.pb, tableNames[i], {
      perPage: 1000,
      filter: GenerateFilter(subtable, juris_id),
      expand: subtable.join(', ') // ""
    });
    schema.push(await useGetSchema(tableNames[i]))
  }

  let projectDetails: AdworkType[] = []
  try {
    projectDetails = await locals.pb.collection('one_liners').getFullList({
      filter: buildAdworkFilter(tableNames, juris_id) || undefined,  // PocketBase ignores empty/undefined filters
      expand: 'program'
    });
    console.log('Project Details if any', projectDetails);
  } catch (err) {
    console.error('Error trying to get project details', err);
  }

  let eventsData: EventType[] = []
  const filterParts = tableNames.map(name => `program = "${name.replace(/"/g, '\\"')}"`); // Escape double quotes if present
  const eventFilter = filterParts.join(' || ');
  try {
    eventsData = await locals.pb.collection('events_json').getFullList({
      filter: eventFilter
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
