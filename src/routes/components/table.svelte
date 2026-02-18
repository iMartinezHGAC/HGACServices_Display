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
  }

  const { data, columns = [] }: Props = $props();

  $inspect('TABLE props', data, columns);

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

  // Detect if the *header* (displayed text) represents money
  function isMonetaryField(key: string): boolean {
    const keywords = [
      'cost', 'budget', 'dollar', 'dollars', 'price', 'fee', 'payment',
      'expense', 'revenue', 'income', 'profit', 'salary', 'funding',
      'amount', 'total', 'charge', 'balance', 'paid', 'due', 'spend', 'value'
    ];
    const lowerKey = key.toLowerCase();
    const lowerHeader = snakeToHuman(key).toLowerCase();   // this is what the user sees
    return keywords.some(word => lowerKey.includes(word) || lowerHeader.includes(word));
  }

  // Format numbers with commas + $ when header sounds like money
  function formatDisplayValue(key: string, val: any): string {
    if (val instanceof Date) {
      return val.toISOString().split('T')[0];
    }
    if (typeof val === 'number') {
      const numStr = val.toLocaleString('en-US');
      return isMonetaryField(key) ? `$${numStr}` : numStr;
    }
    if (typeof val === 'string') return val;
    if (Array.isArray(val)) return `${val.length} item(s)`;
    return val != null ? String(val) : '-';
  }
</script>

<div class="w-full overflow-x-auto max-h-96">
  <table class="table-auto border-collapse border border-gray-400 mx-auto">
    {#if records && allKeys}
      <thead>
        <tr>
          {#each allKeys as key}
            <th class="font-bold px-4 py-2 border border-gray-300 bg-gray-100 text-left sticky top-0 z-10">
              {snakeToHuman(key)}
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
