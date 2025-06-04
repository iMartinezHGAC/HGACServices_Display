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
  const tablesData = data.tablesData
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

  let trash_pounds = $derived(makeBar(tablesData[programNames[0]].items, "from_date" ,"orders_count"))
  let tires = $derived(makeBar(tablesData[programNames[0]].items, "from_date", "orders_dollars"))


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
  <CardBody cardNames={cardNames} cardData={cardData} direction={routedFromLeft} adwork={false}/>
{:else}
  <div>Loading...</div>
  
{/if}
