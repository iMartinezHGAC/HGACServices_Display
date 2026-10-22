
import PocketBase from 'pocketbase'
import type { AdworkType, PB_Record_Type, TableFetchOptions } from '../../ambient';

/** Default reporting window used by the dashboards, in quarters. */
export const DEFAULT_QUARTERS = 5;

/**
 * From the first day of the quarter `quarters` quarters before the current one, through today,
 * e.g. 5 quarters on 2026-10-22 is 2025-07-01 .. 2026-10-22. Returned in PocketBase's
 * "YYYY-MM-DD HH:MM:SS" format (no ms, no Z).
 */
export function GetQuarters(quarters: number = DEFAULT_QUARTERS) {
  const now = new Date();
  const currentQuarterStartMonth = Math.floor(now.getUTCMonth() / 3) * 3;

  // Date.UTC rolls negative months back into earlier years
  const start = new Date(Date.UTC(now.getUTCFullYear(), currentQuarterStartMonth - quarters * 3, 1));

  const formatDate = (d: Date): string =>
    d.toISOString().replace('T', ' ').slice(0, 19);

  return {
    start: formatDate(start),
    now: formatDate(now)
  };
}

/** "Data shown is from <start> through <today>": the GetQuarters window, for the info tooltip and print footer. */
export function GetDataRangeText(quarters: number = DEFAULT_QUARTERS): string {
  const { start, now } = GetQuarters(quarters);
  const fmt = (d: string) =>
    new Date(d.replace(' ', 'T') + 'Z').toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC'
    });
  return `Data shown is from ${fmt(start)} through ${fmt(now)}`;
}

/**
 * Records that overlap [start, now]: began on or before today and ended on or after the start.
 * A record with no to_date is treated as a single-date record, so its from_date must be in the window.
 * `prefix` is "" for fields on the collection itself or "<relation>." for an expanded relation.
 */
function overlapCondition(prefix: string, start: string, now: string): string {
  return `(${prefix}from_date?<= "${now}" && (${prefix}to_date?>= "${start}" || (${prefix}to_date?= "" && ${prefix}from_date?>= "${start}")))`;
}

/**
 * Jurisdiction filter plus a date-window filter.
 * `quarters` sets the window (default DEFAULT_QUARTERS); pass null to skip the date rule entirely.
 */
export function GenerateFilter(
  subCollectionNames: string[] | null | undefined,
  juris_id: string | undefined,
  quarters: number | null = DEFAULT_QUARTERS
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

  const jurisdictionCondition = `jurisdiction = "${juris_id.trim()}"`;

  if (quarters === null) return `(${jurisdictionCondition})`;

  const { start, now } = GetQuarters(quarters);

  let dateCondition: string;

  if (subs.length > 0) {
    // Relation fields (multiple or single) – a linked record must overlap the window
    const subConditions = subs.map(name => overlapCondition(`${name}.`, start, now));

    dateCondition =
      subConditions.length > 1
        ? `(${subConditions.join(' || ')})`
        : subConditions[0];
  } else {
    // Direct fields on the main collection (your 38_table_of_data case)
    dateCondition = overlapCondition('', start, now);
  }

  return `(${jurisdictionCondition}) && (${dateCondition})`;
}
export async function FetchTable(pb: PocketBase, tableName: string, options: TableFetchOptions): Promise<PB_Record_Type[] | { error: string }> {
  const defaultOptions: TableFetchOptions = {
    sort: '',
    expand: '',
    filter: '',
    perPage: 1000, // PocketBase's max page size: fewest round trips
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
