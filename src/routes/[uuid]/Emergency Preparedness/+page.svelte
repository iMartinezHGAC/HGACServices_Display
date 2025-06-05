<script lang="ts">
	import type { PageData } from './$types';
  import {navigating} from '$app/state'

  const routedFrom = navigating.from?.route.id?.split('/')[2]
  const routedTo = navigating.to?.route.id?.split('/')[2]
  const routedFromLeft = checkRouteDirection(routedFrom, routedTo)

	import BarChartTb from "$routes/charts/BarChartTB.svelte";
	import CardBody from "$routes/components/card_body.svelte";
	import { checkRouteDirection } from '$routes/helpers/flyAnimationDirection';
  import {snakeToHuman} from "$routes/helpers/caseConversion"

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

const EXCLUDED_FIELDS = [
  "collectionId",
  "collectionName",
  "from_date",
  "id",
  "jurisdiction",
  "to_date",
];
// Function to get unique field names, excluding specified fields
const getColumnNames = (data) => {
  const columnNamesByCollection = {};
 
  Object.keys(data).forEach(collectionName => {
    // Check if items exist and is not empty
    if (data[collectionName].items && data[collectionName].items.length > 0) {
      // Get columns from the first item, filtering out excluded fields
      const columns = Object.keys(data[collectionName].items[0])
        .filter(field => !EXCLUDED_FIELDS.includes(field));
      
      columnNamesByCollection[collectionName] = columns;
    }
  });
 
  return columnNamesByCollection;
};

const getExtendedCharts = (columnNames, trash_pounds, tires) => {
  const extendedCharts = [];
 
  Object.entries(columnNames).forEach(([collection, columns]) => {
    columns.forEach((column, index) => {
      const chartData = index % 2 === 0 ? trash_pounds : tires;
      
      extendedCharts.push({
        chartTitle: column,
        chartData: chartData,
        Chart: BarChartTb,
      });
    });
  });
 
  return extendedCharts;
};
  // Usage
const columnNames = getColumnNames(tablesData);
const charts = $derived(
  getExtendedCharts(columnNames, trash_pounds, tires)
);

$inspect("charts", charts)

const cardData: CardDataType[] = $derived(
  programs.map((program: ProgramType) => {
    // Find the collection that matches the program's active_directory_group
    const matchingCollection = Object.keys(columnNames).find(
      collection => collection.toLowerCase().includes(program.active_directory_group)
    );
 
    // Get charts for this collection's columns
    const programCharts = matchingCollection 
      ? charts.filter(chart => 
          columnNames[matchingCollection].includes(chart.chartTitle)
        )
      : charts;
 
    return {
      program,
      charts: programCharts
    };
  })
);

$inspect("card data", cardData)

</script>

{#if data.post}
  <CardBody cardNames={cardNames} cardData={cardData} direction={routedFromLeft} adwork={true}/>
{:else}
  <div>Loading...</div>
  
{/if}
