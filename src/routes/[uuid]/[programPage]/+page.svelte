<script lang="ts">
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

  const programs: ProgramType[] = data.post
  const tablesData = data.tablesData
  const cardNames=$derived(programs.map(program => program.program_name))
  const programNames=$derived(
    programs
    .map(program => program.parent_table)
    .filter(str => str !== '')
  )
  $inspect("debug tablesData ", programNames)

  const charts: echarts.EChartsOption[] = []
  const exclusions = ['collectionId', 'collectionName', 'id', 'jurisdiction', 'from_date', 'to_date']

  const keys = Object.keys(tablesData[programNames[0]][0])
  const usefulKeys = keys.filter(key => !exclusions.includes(key))
  console.log(usefulKeys)
  //programNames.forEach(name => console.log(`For ${name}`,tablesData[name][0].map()))

  charts.push(makeBar(tablesData[programNames[0]], "from_date" ,"orders_count"))
  charts.push(makeBar(tablesData[programNames[0]], "from_date", "orders_dollars"))


const cardData: CardDataType[] = $derived(programs.map((program: ProgramType)=> {
    return {program, charts}
  }))

$inspect(cardData)

</script>

{#if data.post}
  <CardBody cardNames={cardNames} cardData={cardData} direction={routedFromLeft} adwork={false} charts={charts}/>
{:else}
  <div>Loading...</div>
  
{/if}
