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
  const start = new Date(Date.UTC(startYear, startMonth, 1, 0, 0, 0));
  const startISO = start.toISOString().replace('T', ' ');
  const nowISO = now.toISOString().replace('T', ' ');

  return { start: startISO, now: nowISO };
}

export function GenerateFilter(subCollectionNames: string[] = [], juris_id: string) {
  const { start: startISO } = GetFiveQuarters();

  // Strict exact match on single relation (excludes empty "", null, N/A/wrong ID)
  const jurisdictionCondition = `jurisdiction = "${juris_id}"`;

  let dateCondition: string;

  if (subCollectionNames.length > 0) {
    // Critical: NO space between subfield and ?operator (per official PocketBase syntax examples)
    const subConditions = subCollectionNames.map(
      (name) => `${name}.from_date?>= "${startISO}"`
    );

    dateCondition =
      subConditions.length > 1
        ? `(${subConditions.join(" || ")})`
        : subConditions[0];
  } else {
    dateCondition = `from_date >= "${startISO}"`;
  }

  // Optional grouping parens for clarity/safety
  return `(${jurisdictionCondition}) && (${dateCondition})`;
}

import PocketBase from 'pocketbase'
import type { PB_Record_Type, TableFetchOptions } from '../../ambient';

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
