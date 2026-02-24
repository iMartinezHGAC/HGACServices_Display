
import PocketBase from 'pocketbase'
import type { AdworkType, PB_Record_Type, TableFetchOptions } from '../../ambient';

export function GetFiveQuarters() {
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
  const start = new Date(Date.UTC(startYear, startMonth, 1));

  // PocketBase loves clean "YYYY-MM-DD HH:MM:SS" (no ms, no Z)
  const formatDate = (d: Date): string =>
    d.toISOString().replace('T', ' ').slice(0, 19);

  return {
    start: formatDate(start),
    now: formatDate(now)
  };
}

export function GenerateFilter(
  subCollectionNames: string[] | null | undefined,
  juris_id: string | undefined
): string {
  // Defensive clean-up – remove empty strings, nulls, undefined
  const subs = Array.isArray(subCollectionNames)
    ? subCollectionNames
      .filter((name): name is string => typeof name === 'string' && name.trim() !== '')
      .map(name => name.trim())
    : [];

  if (!juris_id?.trim()) {
    console.warn('GenerateFilter: missing juris_id → returning empty filter');
    return "id = ''";
  }

  const { start, now } = GetFiveQuarters();

  const jurisdictionCondition = `jurisdiction = "${juris_id.trim()}"`;

  let dateCondition: string;

  if (subs.length > 0) {
    // Relation fields (multiple or single) – any linked record must be inside the 5-quarter window
    const subConditions = subs.map(name =>
      `(${name}.from_date?<= "${now}" || ${name}.to_date?>= "${start}")`
    );

    dateCondition =
      subConditions.length > 1
        ? `(${subConditions.join(' || ')})`
        : subConditions[0];
  } else {
    // Direct fields on the main collection (your 38_table_of_data case)
    dateCondition = `(from_date?<= "${now}" || to_date?>= "${start}")`
  }

  // Final PocketBase filter – 100% safe syntax
  return `(${jurisdictionCondition}) && (${dateCondition})`;
}
export async function FetchTable(pb: PocketBase, tableName: string, options: TableFetchOptions): Promise<PB_Record_Type[] | { error: string }> {
  const defaultOptions: TableFetchOptions = {
    sort: '',
    expand: '',
    filter: '',
    perPage: 50,
  }
  const mergedOptions = { ...defaultOptions, ...options }
  let results = {}

  try {
    let records = await pb.collection(tableName).getFullList<PB_Record_Type>({
      // note: getFullList handles pagination internally; perPage is the batch size
      sort: mergedOptions.sort,
      expand: mergedOptions.expand,
      filter: mergedOptions.filter,
      batch: mergedOptions.perPage, // use 'batch' if your SDK expects it, otherwise perPage works
    });
    return records; // always array on success
  } catch (err) {
    console.error(`Error fetching ${tableName}:`, err);
    return []; // always return array, even on error
  }
}


export async function getSchema(tableName: string, PB_URL: string) {
  let res = await fetch(`${PB_URL}/api/collections/${tableName}/schema`)
  return await res.json()
}

export async function getSubtableSchema(tableName: string, PB_URL: string) {
  let res = await fetch(`${PB_URL}/api/collections/${tableName}/dashboard-schema`)
  return await res.json()
}

export function buildEventFilter(tableNames: string[], juris_id: string) {
  const filterParts = tableNames.map((name: string) =>
    `program = "${name.replace(/"/g, '\\"')}"`
  ); // Escape double quotes if present

  const programFilter = filterParts.join(' || ');

  // Add AND with jurisdiction using PocketBase's `?=` operator
  // (?= = "any/at-least-one equals" – perfect for multi-select/relation fields)
  const escapedJurisId = String(juris_id ?? '').replace(/"/g, '\\"');

  return programFilter
    ? `(${programFilter}) && jurisdiction.id ?= "${escapedJurisId}"`
    : `jurisdiction.id ?= "${escapedJurisId}"`; // fallback if no programs

}

export function buildAdworkFilter(tableNames: string[], juris_id: string) {
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

  //console.log('Generated filter:', filter || '(no filter)');
  return filter
}
