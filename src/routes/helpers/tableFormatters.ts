import { snakeToHuman } from "./caseConversion";

/**
 * Main public function – drop-in replacement (no changes to existing calls).
 * New optional 5th parameter: `sortBy` (keeps parameter order intact).
 */
export function combineRelatedRecords(
  tablesData: Record<string, any>,
  parentCollection: string,
  relatedFields: string[] | null = null,
  columnOrder: string[] = [],
  sortBy?: string   // "fiscal_year" or "-fiscal_year"
): { data: any[]; columns: string[] } | null {
  const raw = tablesData[parentCollection];
  if (!raw) return null;

  // Supports both full PB response and direct array (your RTP case)
  const items: any[] = Array.isArray(raw)
    ? raw
    : (raw.items && Array.isArray(raw.items) ? raw.items : []);

  if (!items.length) {
    return null;
  }

  let combinedRecords: any[] = [];
  let hasMultipleSources = false;

  if (relatedFields && relatedFields.length > 0) {
    // Related expand mode
    hasMultipleSources = relatedFields.length > 1;
    for (const parent of items) {
      const expand = parent.expand ?? {}

      for (const field of relatedFields) {
        const rel = expand[field];
        if (!rel) continue;

        const relArray = Array.isArray(rel) ? rel : [rel];

        for (const record of relArray) {
          const newRecord = { ...record };
          if (hasMultipleSources) {
            newRecord.source = snakeToHuman(field);
          }
          combinedRecords.push(newRecord);
        }
      }
    }
  } else {
    // Direct table.items mode
    hasMultipleSources = false;
    combinedRecords = items.map((item: any) => ({ ...item }));
  }

  if (combinedRecords.length === 0) {
    return null;
  }

  return buildTableData(combinedRecords, hasMultipleSources, columnOrder, sortBy);
}

/**
 * Core helper – builds clean table-ready data + columns from any array of PocketBase records.
 * Now includes optional `sortBy` (5th param in the public API).
 * • "fiscal_year" → ascending
 * • "-fiscal_year" → descending
 * Supports numbers, dates, strings (case-insensitive), and nulls intelligently.
 */
export function buildTableData(
  records: any[],
  hasMultipleSources: boolean = false,
  columnOrder: string[] = [],
  sortBy?: string   // "field" or "-field"
): { data: any[]; columns: string[] } | null {
  if (!records?.length) {
    return null;
  }

  const excludedKeys = [
    "collectionId",
    "collectionName",
    "id",
    "created",
    "from_date",
    "jurisdiction",
    "source_jurisdiction",
    "to_date",
    "updated",
    "FormData",
    "email",
    "address",
    "program",
  ];

  let columns: string[];

  if (columnOrder.length > 0) {
    columns = [...columnOrder];
    if (hasMultipleSources && !columns.includes("source")) {
      columns.unshift("source");
    }
  } else {
    const seen = new Set<string>();
    const keys: string[] = [];

    records.forEach((r) => {
      Object.keys(r).forEach((k) => {
        if (!excludedKeys.includes(k) && !seen.has(k)) {
          seen.add(k);
          keys.push(k);
        }
      });
    });

    if (hasMultipleSources) {
      const sourceIdx = keys.indexOf("source");
      if (sourceIdx !== -1) {
        keys.splice(sourceIdx, 1);
        keys.unshift("source");
      }
    }

    columns = keys;
  }

  // Shallow clones + sorting
  let data = records.map((r) => ({ ...r }));

  if (sortBy) {
    const isDescending = sortBy.startsWith('-');
    const field = isDescending ? sortBy.slice(1) : sortBy;

    data.sort((a, b) => {
      let valA = a[field];
      let valB = b[field];

      // Nulls last (asc) / first (desc)
      if (valA == null && valB == null) return 0;
      if (valA == null) return isDescending ? -1 : 1;
      if (valB == null) return isDescending ? 1 : -1;

      // Numbers (fiscal_year, funding, etc.)
      if (typeof valA === 'number' && typeof valB === 'number') {
        return isDescending ? valB - valA : valA - valB;
      }

      // Dates (PocketBase timestamps)
      if (typeof valA === 'string' && typeof valB === 'string') {
        const dateA = new Date(valA);
        const dateB = new Date(valB);
        if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
          return isDescending
            ? dateB.getTime() - dateA.getTime()
            : dateA.getTime() - dateB.getTime();
        }
      }

      // Strings (case-insensitive)
      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();
      return isDescending
        ? strB.localeCompare(strA)
        : strA.localeCompare(strB);
    });
  }

  return { data, columns };
}


// -----------------------------------------------------------------------------
// 1. Product of multiple columns (row-wise)
//    e.g. attendees × documents, or revenue × count, etc.
// -----------------------------------------------------------------------------
export function addMultipliedColumn<T extends Record<string, any>>(
  data: T[],
  resultColumnName: string,
  ...columns: (keyof T | string)[]
): T[] {
  if (!data?.length) return data;

  const resultKey = resultColumnName.trim();

  return data.map((row) => {
    let product = 1;

    for (const col of columns) {
      const value = row[col];
      // Treat null/undefined as 0, skip non-numbers
      const num = typeof value === 'number' ? value : Number(value);
      product *= Number.isFinite(num) ? num : 0;
    }

    return {
      ...row,
      [resultKey]: product,
    };
  });
}

// -----------------------------------------------------------------------------
// 2. Product of one column × constant number
//    Great for: scaling, unit conversion, applying weights, estimated totals, etc.
// -----------------------------------------------------------------------------
export function addScaledColumn<T extends Record<string, any>>(
  data: T[],
  resultColumnName: string,
  sourceColumn: keyof T | string,
  multiplier: number
): T[] {
  if (!data?.length) return data;

  const resultKey = resultColumnName.trim();
  const srcKey = sourceColumn as string;

  return data.map((row) => {
    const value = row[srcKey];
    const num = typeof value === 'number' ? value : Number(value);

    const scaled =
      Number.isFinite(num) && Number.isFinite(multiplier)
        ? num * multiplier
        : 0;

    return {
      ...row,
      [resultKey]: scaled,
    };
  });
}
