<script lang="ts">
	import type { PageData } from './$types';
  import {navigating} from '$app/state'

  const routedFrom = navigating.from?.route.id?.split('/')[2]
  const routedTo = navigating.to?.route.id?.split('/')[2]
  const routedFromLeft = checkRouteDirection(routedFrom, routedTo)

  console.log("page state",routedFromLeft)

	import StackedBarChart from "$routes/charts/StackedBarChart.svelte";
	import BarChartTb from "$routes/charts/BarChartTB.svelte";
	import { makeBarData } from "$routes/helpers/chartFormatters";
	import CardBody from "$routes/components/card_body.svelte";
	import { checkRouteDirection } from '$routes/helpers/flyAnimationDirection';

	let { data}: { data: PageData } = $props();
  $inspect(data)

  const programs: ProgramType[] = data.post
  const tablesData = data.tablesData
  const cardNames=$derived(programs.map(program => program.program_name))

  function makeBar<T = any>(dataset: T[], key1: keyof T, key2: keyof T) {
    if(dataset) {
      return dataset.map((item: T) => ({
          juris: item[key1],
          value: item[key2]
        }))    
    }
  }

  let trash_pounds = $derived(makeBar(tablesData["33_hgac_coop_purchasing"], "from_date" ,"orders_count"))
  let tires = $derived(makeBar(tablesData["33_hgac_coop_purchasing"], "from_date", "orders_dollars"))

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

const cardData: CardDataType[] = programs.map((program: ProgramType)=> {
    return {program, charts}
  })

</script>

<CardBody cardNames={cardNames} cardData={cardData} direction={routedFromLeft} adwork={false}/>
