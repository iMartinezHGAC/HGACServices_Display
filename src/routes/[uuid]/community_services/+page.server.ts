import { PB_URL } from '$env/static/private';
import type { AdworkType, EventType, SchemaMultiType, SchemaType, TableDataResult, TableFetchOptions } from '../../../ambient';
import { FetchTable, GenerateFilter } from '../../helpers/apiHelpers';
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
    filter: `dashboard_tabs.tab_name = "community_services"`,
  })

  let tableNames: string[] = await programData.map((program: ProgramType) => program.parent_table)
  //console.log("table names", tableNames)
  console.log('juris_id', juris_id)

  /*
  const entries = await locals.pb.collection('05_trash_bash').getFullList({
    expand: 'collection_site_id'
  })
  */

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
  const filterPartsAdwork = tableNames.map(name => `program.parent_table = "${name.replace(/"/g, '\\"')}"`);
  const filterAdwork = filterPartsAdwork.join(' || ');

  // Critical fix: For multiple relations, use "?=" to mean "at least one" related record matches
  // Without the "?", PocketBase treats it as "all must match" or fails to match subfields properly.
  const jurisFilterPart = juris_id ? `jurisdiction.id ?= "${juris_id.replace(/"/g, '\\"')}"` : '';

  // Combine: (existing OR conditions) && jurisdiction condition
  let filter = '';

  if (filterAdwork) {
    filter = `(${filterAdwork})`;
  }

  if (jurisFilterPart) {
    if (filter) {
      filter = `${filter} && ${jurisFilterPart}`;
    } else {
      filter = jurisFilterPart;
    }
  }

  // Optional: Log the filter for debugging
  console.log('Generated filter:', filter || '(no filter)');

  try {
    projectDetails = await locals.pb.collection('one_liners').getFullList({
      filter: filter || undefined,  // PocketBase ignores empty/undefined filters
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
