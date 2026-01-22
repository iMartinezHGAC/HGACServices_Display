<script lang="ts">
	import type { EventType } from "../../ambient";
	import { snakeToHuman } from "../helpers/caseConversion";

  // Emphasizing TypeScript: Define a type for PocketBase records, including fixed properties and dynamic key-value pairs.
  type PB_Record_Type = {
    collectionId: string;
    collectionName: string;
    id: string;
    [key: string]: string | number | Date;  // Dynamic properties allowing string, number, or Date values
  };

  interface Props {
    data: PB_Record_Type | PB_Record_Type[] | EventType[] | null;  
    columns?: string[];  
  }

  const { data, columns = [] }: Props = $props();

  $inspect('props', data);

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
  // Define excluded keys to remove from display
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

<!-- Wrap the table in a div for independent scrolling of body with fixed header -->
<div class="overflow-auto max-h-96">
  <!-- Render records as a table with keys as bold headers, using Tailwind CSS classes for styling -->
  <table class="table-auto border-collapse border border-gray-400 w-full">
    {#if records && allKeys}
      
    <thead>
      <tr>
        {#each allKeys as key}
          <th class="font-bold px-4 py-2 border border-gray-300 bg-gray-100 text-left sticky top-0 z-10">{snakeToHuman(key)}</th>
        {/each}
      </tr>
    </thead>
    <tbody>
      {#each records as record}
        <tr>
          {#each allKeys as key}
            <td class="px-4 py-2 border border-gray-300">
              {#if key in record}
                {typeof record[key] === 'object' && record[key] instanceof Date ? record[key].toISOString() : record[key]}
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
          <th class="font-bold px-4 py-2 border border-gray-300 bg-gray-100 text-left sticky top-0 z-10" >No data</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Consider using HART to manange you data</td>
        </tr>
      </tbody>
    {/if}
  </table>
</div>
<!-- Optional note on using columns prop for filtered display -->
<!--
{#if columns.length > 0}
  <p>Note: If you intended to filter/display only specific columns, replace the dynamic entries loop with:</p>
  <pre>
    {#each columns as col}
      <li>{col}: {typeof record[col] === 'object' && record[col] instanceof Date ? record[col].toISOString() : record[col]}</li>
    {/each}
  </pre>
{/if}
-->
