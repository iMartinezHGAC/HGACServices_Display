<script lang="ts">
	import type { EventType } from "../../ambient";
	import { snakeToHuman } from "../helpers/caseConversion";

  type PB_Record_Type = {
    collectionId: string;
    collectionName: string;
    id: string;
    [key: string]: string | number | Date | any;
  };

  interface Props {
    data: PB_Record_Type | PB_Record_Type[] | EventType[] | null;  
    columns?: string[];  
    title?: string;           // optional custom title — **always overrides** when passed
  }

  const { data, columns = [], title: providedTitle }: Props = $props();

  $inspect('TABLE props', data);
  $inspect('Title', providedTitle)

  let records: PB_Record_Type[] | EventType[] | null = data
    ? Array.isArray(data) ? data : [data] 
    : null

  if (records && records.length > 0 && 'event_name' in records[0]) {
    records = records.map(record => {
      if (record.event_date) {
        record.event_date = new Date(record.event_date).toISOString().split('T')[0];
      }
      return record;
    });
  }

  const excludedKeys = ['collectionId', 'collectionName', 'id', 'created', 'from_date', 'jurisdiction', 'source_jurisdiction', 'to_date', 'updated', 'FormData', 'email', 'address', 'program'];

  let allKeys: string[] | null = records 
    ? columns.length > 0 
      ? columns 
      : (function() {
          const computedKeys = [...new Set(records.flatMap(record => Object.keys(record).filter(key => !excludedKeys.includes(key))))];
          if (records.length > 0 && 'event_name' in records[0]) {
            const preferredOrder = ['event_name', 'event_description', 'event_date', 'attendee_count'];
            return preferredOrder.filter(key => computedKeys.includes(key))
              .concat(computedKeys.filter(key => !preferredOrder.includes(key)));
          }
          return computedKeys;
        })()
    : null

  // Detect money columns
  function isMonetaryField(key: string): boolean {
    const keywords = [
      'cost', 'budget', 'dollar', 'dollars', 'price', 'fee', 'payment',
      'expense', 'revenue', 'income', 'profit', 'salary', 'funding',
      'amount', 'total', 'charge', 'balance', 'paid', 'due', 'spend', 'value'
    ];
    const lowerKey = key.toLowerCase();
    const lowerHeader = snakeToHuman(key).toLowerCase();
    return keywords.some(word => lowerKey.includes(word) || lowerHeader.includes(word));
  }

  // Detect year columns (no commas)
  function isYearField(key: string): boolean {
    const keywords = ['year', 'yr', 'years'];
    const lowerKey = key.toLowerCase();
    const lowerHeader = snakeToHuman(key).toLowerCase();
    return keywords.some(word => lowerKey.includes(word) || lowerHeader.includes(word));
  }

  // Clean header: Title Case + no excess whitespace
  function formatHeader(key: string): string {
    let header = snakeToHuman(key);
    header = header.trim().replace(/\s+/g, ' ');
    return header.replace(/\w\S*/g, txt => 
      txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase()
    );
  }

  // Format numbers: commas + $ for money, NO commas for years
  function formatDisplayValue(key: string, val: any): string {
    if (val instanceof Date) {
      return val.toISOString().split('T')[0];
    }
    if (typeof val === 'number') {
      if (isYearField(key)) {
        return val.toString();
      }
      const numStr = val.toLocaleString('en-US');
      return isMonetaryField(key) ? `$${numStr}` : numStr;
    }
    if (typeof val === 'string') return val;
    if (Array.isArray(val)) return `${val.length} item(s)`;
    return val != null ? String(val) : '-';
  }

  // Title logic (fixed for Svelte 5 props):
  // - If `title` prop is passed (even empty string), use it exactly
  // - If `title` prop is completely omitted, show "Events" ONLY for EventType[]
  // - data / collectionName / columns are never used for the title
  let displayTitle = $derived(
    providedTitle !== undefined 
      ? providedTitle 
      : (records && records.length > 0 && 'event_name' in records[0] 
          ? 'Events' 
          : null)
  );
</script>

<div class="w-full">
  <!-- Centered title with Metropolis font -->
  {#if displayTitle}
    <h2 class="text-2xl font-semibold mb-4 text-gray-900 tracking-tight text-center font-[Metropolis]">
      {displayTitle}
    </h2>
  {/if}

  <!-- Scrollable table -->
  <div class="w-full overflow-x-auto max-h-96">
    <table class="table-auto border-collapse border border-gray-400 mx-auto w-full">
      {#if records && allKeys}
        <thead>
          <tr>
            {#each allKeys as key}
              <th class="font-bold px-4 py-2 border border-gray-300 bg-gray-100 text-left sticky top-0 z-10">
                {formatHeader(key)}
              </th>
            {/each}
          </tr>
        </thead>
        <tbody>
          {#each records as record}
            <tr>
              {#each allKeys as key}
                {@const val = key in record ? record[key] : null}
                {@const isNumeric = typeof val === 'number'}
                <td class="px-4 py-2 border border-gray-300 {isNumeric ? 'text-right font-medium' : ''}">
                  {#if key in record}
                    {formatDisplayValue(key, val)}
                  {:else}
                    -
                  {/if}
                </td>
              {/each}
            </tr>
          {/each}
        </tbody>
      {:else}
        <thead>
          <tr>
            <th class="font-bold px-4 py-2 border border-gray-300 bg-gray-100 text-left sticky top-0 z-10">No data</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Consider using HART to manage your data</td>
          </tr>
        </tbody>
      {/if}
    </table>
  </div>
</div>
