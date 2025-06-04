<script lang="ts">
	import type { PageData } from './$types';
  import {navigating} from '$app/state'

  const routedFrom = navigating.from?.route.id?.split('/')[2]
  const routedTo = navigating.to?.route.id?.split('/')[2]
  const routedFromLeft = checkRouteDirection(routedFrom, routedTo)

	import BarChartTb from "$routes/charts/BarChartTB.svelte";
	import CardBody from "$routes/components/card_body.svelte";
	import { checkRouteDirection } from '$routes/helpers/flyAnimationDirection';

	let { data}: { data: PageData } = $props();

  const programs: ProgramType[] = data.post
  const tablesData: DataObject[] = data.tablesData as DataObject[]
  $inspect(tablesData)
  const cardNames=$derived(programs.map(program => program.program_name))
  const programNames=$derived(
    programs
    .map(program => program.parent_table)
    .filter(str => str !== '')
  )

  function makeBar<T = any>(dataset: T[], key1: keyof T, key2: keyof T) {
    if(dataset && dataset.length > 1) {
      return dataset.map((item: T) => ({
          juris: item[key1],
          value: item[key2]
        }))    
    }
  }


let trash_pounds = $derived(makeBar(tablesData["33_hgac_coop_purchasing"].items, "from_date" ,"orders_count"))
let tires = $derived(makeBar(tablesData["33_hgac_coop_purchasing"].items, "from_date", "orders_dollars"))


// Define the structure of an item object with flexible keys
interface Item {
  [key: string]: any; // Allows any key-value pair
}

// Define the structure of the main object
interface DataObject {
  [key: string]: {
    items: Item[];
    page: number,
    perPage: number,
    totalItems: number,
    totalPages: number,
  };
}

// List of fields to exclude
const EXCLUDED_FIELDS = [
  "collectionId",
  "collectionName",
  "from_date",
  "id",
  "jurisdiction",
  "to_date",
];
// Function to get unique field names, excluding specified fields
function getUniqueFieldNamesExcluding(data: unknown): string[] {
  const uniqueKeys = new Set<string>();

  // Check if data is an array
  if (!Array.isArray(data)) {
    console.error("Error: Input data is not an array:", data);
    return [];
  }

  // Iterate through each object in data
  for (const obj of data) {
    // Get the first key (e.g., "01_start")
    const key = Object.keys(obj)[0];
    if (!key || !obj[key] || !Array.isArray(obj[key].items)) {
      console.warn(`Warning: Invalid structure for object, missing key or items array:`, obj);
      continue;
    }

    // Iterate through each item in the items array
    for (const item of obj[key].items) {
      if (typeof item !== 'object' || item === null) {
        console.warn(`Warning: Invalid item, not an object:`, item);
        continue;
      }

      // Get keys and filter out excluded fields
      for (const itemKey of Object.keys(item)) {
        if (!EXCLUDED_FIELDS.includes(itemKey)) {
          uniqueKeys.add(itemKey);
        }
      }
    }
  }

  return Array.from(uniqueKeys);
}
  console.log("unique names?", getUniqueFieldNamesExcluding(tablesData))

  const charts: ChartType[] = $derived([
    {
      chartTitle: "Orders Count",
      chartData: trash_pounds,
      Chart: BarChartTb,
    },
    {
      chartTitle: "Orders Dollars",
      chartData: tires,
      Chart: BarChartTb,
    },
 ])

const cardData: CardDataType[] = $derived(programs.map((program: ProgramType)=> {
    return {program, charts}
  }))

$inspect(cardData)

</script>

{#if data.post}
  <CardBody cardNames={cardNames} cardData={cardData} direction={routedFromLeft} adwork={true}/>
{:else}
  <div>Loading...</div>
  
{/if}
