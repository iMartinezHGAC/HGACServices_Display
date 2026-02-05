<script lang="ts">
	import type { EventType } from "../../ambient";
	import { snakeToHuman } from "../helpers/caseConversion";

  type PB_Record_Type = {
    collectionId: string;
    collectionName: string;
    id: string;
    [key: string]: string | number | Date;
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
</script>

<!-- Outer wrapper provides horizontal scrolling if table is wide + vertical limit -->
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
<td class="px-4 py-2 border border-gray-300">
  {#if key in record}
    {@const val = record[key]}
    {#if typeof val === 'string' || typeof val === 'number' || val instanceof Date}
      {val instanceof Date ? val.toISOString().split('T')[0] : val}
    {:else if Array.isArray(val)}
      {val.length} item(s) <!-- or val.join(', ') if strings -->
    {:else}
      [Complex data] <!-- or JSON.stringify(val) for debug -->
    {/if}
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
