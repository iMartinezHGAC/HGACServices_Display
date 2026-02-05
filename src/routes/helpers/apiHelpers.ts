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

export function GenerateFilter(subCollectionNames: string[], juris_id: string) {
  const { start: startISO, now: nowISO } = GetFiveQuarters();

  const innerDateCondition = `from_date <= "${nowISO}"`;

  if (subCollectionNames && subCollectionNames.length > 0) {
    const subConditions = subCollectionNames.map(
      (name) => `(${name}.${innerDateCondition})`
    );

    const overlappingCondition =
      subConditions.length > 1
        ? `(${subConditions.join(" || ")})`
        : subConditions[0];

    return `jurisdiction.id = "${juris_id}" && ${overlappingCondition}`;
  } else {
    return `jurisdiction.id = "${juris_id}" && (${innerDateCondition})`;
  }
}

import PocketBase from 'pocketbase'
import type { PB_Record_Type, TableFetchOptions } from '../../ambient';

export async function FetchTable(pb: PocketBase, tableName: string, options: TableFetchOptions): Promise<Object> {
  const defaultOptions: TableFetchOptions = {
    sort: '',
    expand: '',
    filter: '',
    perPage: 50,
  }
  const mergedOptions = { ...defaultOptions, ...options }
  let results = {}

  try {
    let records = await pb.collection(tableName).getFullList<PB_Record_Type[]>({
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
