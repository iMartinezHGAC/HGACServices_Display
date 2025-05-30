<script lang="ts">
	import type { PageData } from './$types';
  import {navigating} from '$app/state'

  const routedFrom = navigating.from?.route.id?.split('/')[2]
  const routedTo = navigating.to?.route.id?.split('/')[2]
  const routedFromLeft = checkRouteDirection(routedFrom, routedTo)

  console.log("page state",routedFromLeft)

	import Indicator from "$routes/components/indicator.svelte";
	import StackedBarChart from "$routes/charts/StackedBarChart.svelte";
	import BarChartTb from "$routes/charts/BarChartTB.svelte";
	import { makeBarData } from "$routes/helpers/chartFormatters";
	import CardBody from "$routes/components/card_body.svelte";
	import { checkRouteDirection } from '$routes/helpers/flyAnimationDirection';

	let { data}: { data: PageData } = $props();


  const desiredIndices: number[] = [21,22,23,24]
  const programs = desiredIndices.map((index: number) => data.post[index])
  console.log(programs.map(program => program.program_name.split(' ').join('')))

  const cardNames=$derived(programs.map(program => program.program_name))
  let calls = data.emergency[0].calls_count
  let texts = data.emergency[0].texts_count
  type tbKey = keyof Trashbash

  let trash_pounds = $derived(makeBarData(data.trashbash as Trashbash[], "trash_pounds"))
  let tires  = $derived(makeBarData(data.trashbash as Trashbash[], "tires"))
  let recycled_pounds = $derived(makeBarData(data.trashbash as Trashbash[], "recycled_pounds" as tbKey))
  let tot_volunteer_count = $derived(makeBarData(data.trashbash as Trashbash[], "tot_volunteer_count" as tbKey))
  let vol_under_18= $derived(makeBarData(data.trashbash as Trashbash[], "vol_under_18" as tbKey))
  let vol_scouts= $derived(makeBarData(data.trashbash as Trashbash[], "vol_scouts" as tbKey))
  let miles_cleaned = $derived(makeBarData(data.trashbash as Trashbash[], "miles_cleaned" as tbKey))

  const volunteers_stack = tot_volunteer_count.map((item, index)=> ({
    juris: item.juris,
    u18: vol_under_18[index].value,
    scouts: vol_scouts[index].value,
    adults: item.value - vol_under_18[index].value - vol_scouts[index].value < 0 ? 0 : item.value - vol_under_18[index].value - vol_scouts[index].value 
  }))

  const charts: ChartType[] = $derived([
    {
      chartTitle: "Calls",
      chartData: calls,
      Chart: Indicator,
      chartType: "indicator"
    },
    {
      chartTitle: "Texts",
      chartData: texts,
      Chart: Indicator,
      chartType: "indicator"
    },
    /*
    {
      chartTitle: "Under 18 Volunteers",
      chartData: vol_under_18,
      Chart: BarChartTb,
    },
    {
      chartTitle: "Scouts Volunteers",
      chartData: vol_scouts,
      Chart: BarChartTb,
    },
    {
      chartTitle: "Total Volunteers",
      chartData: tot_volunteer_count,
      Chart: BarChartTb,
    }
    */
 ])


  const cardWQ: chartType[] = $derived([
    {
      chartTitle: "Permitted OSSF Count",
      chartData: trash_pounds,
      Chart: BarChartTb,
    },
    {
      chartTitle: "Unpermitted OSSF Count",
      chartData: tires,
      Chart: BarChartTb,
    },
    {
      chartTitle: "SAB Count",
      chartData: miles_cleaned,
      Chart: BarChartTb,
    },
    {
      chartTitle: "WWTF Count",
      chartData: recycled_pounds,
      Chart: BarChartTb,
    },
    {
      chartTitle: "SEB Complete Count",
      chartData: volunteers_stack,
      Chart: StackedBarChart,
    },
    {
      chartTitle: "SEB Complete Cost",
      chartData: volunteers_stack,
      Chart: StackedBarChart,
    },
    {
      chartTitle: "SEB Waitlist Count",
      chartData: volunteers_stack,
      Chart: StackedBarChart,
    },
    {
      chartTitle: "SEB Active Count",
      chartData: volunteers_stack,
      Chart: StackedBarChart,
    },

    /*
    {
      chartTitle: "Under 18 Volunteers",
      chartData: vol_under_18,
      Chart: BarChartTb,
    },
    {
      chartTitle: "Scouts Volunteers",
      chartData: vol_scouts,
      Chart: BarChartTb,
    },
    {
      chartTitle: "Total Volunteers",
      chartData: tot_volunteer_count,
      Chart: BarChartTb,
    }
    */
 ])

const cardData: CardDataType[] = programs.map((program: ProgramType)=> {
    return {program, charts}
  })

</script>

<CardBody cardNames={cardNames} cardData={cardData} direction={routedFromLeft}/>
