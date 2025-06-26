
<script lang="ts">
interface CustomEchartType {
  parent_table: string,
  echarts_data: echarts.EChartsOption,
}

interface CardDataType {
  program: ProgramType,
  echarts: CustomEchartType[]
}

	import type { PageData } from './$types';
  import {page} from "$app/stores"
  import {navigating} from '$app/state'

  const routedFrom = navigating.from?.route.id?.split('/')[2]
  const routedTo = navigating.to?.route.id?.split('/')[2]
  const routedFromLeft = checkRouteDirection(routedFrom, routedTo)

	import CardBody from "$routes/components/card_body.svelte";
	import { checkRouteDirection } from '$routes/helpers/flyAnimationDirection';
	import { makeBar } from '$routes/helpers/chartFormatters';

	let { data}: { data: PageData } = $props();
  $inspect("transport data", data)

  const programs: ProgramType[] = data.post
  const tablesData = data.tablesData
  const cardNames=$derived(programs.map(program => program.program_name))
  const programNames=$derived(
    programs
    .map(program => program.parent_table)
    .filter(str => str !== '')
  )

  const charts: CustomEchartType[] = []
  const exclusions = ['collectionId', 'collectionName', 'id', 'jurisdiction', 'from_date', 'to_date']

  const keys = Object.keys(tablesData[programNames[1]][0])
  const usefulKeys = keys.filter(key => !exclusions.includes(key))
  //programNames.forEach(name => console.log(`For ${name}`,tablesData[name][0].map()))


/*
  let trash_pounds = $derived(makeBar(tablesData["33_hgac_coop_purchasing"].items, "from_date" ,"orders_count"))
  let tires = $derived(makeBar(tablesData["33_hgac_coop_purchasing"].items, "from_date", "orders_dollars"))
*/


  charts.push(makeBar(programNames[0], tablesData[programNames[0]], "from_date" ,"orders_count"))
  charts.push(makeBar(programNames[0], tablesData[programNames[0]], "from_date", "orders_dollars"))
  charts.push(makeBar(programNames[1], tablesData[programNames[1]], "from_date" ,"accounts_count"))

const cardData: CardDataType[] = $derived(programs.map((program: ProgramType)=> {
    const eCharts = charts.filter(chart => chart.parent_table == program.parent_table)
    const data: CardDataType = {program: program, echarts: eCharts}
    return data
  }))

$inspect("card data",cardData)

</script>

{#if data.post}
  <CardBody cardNames={cardNames} cardData={cardData} direction={routedFromLeft} adwork={false}/>
{:else}
  <div>Loading...</div>
  
{/if}


