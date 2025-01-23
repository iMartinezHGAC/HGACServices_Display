<script lang="ts">
	import { fly } from "svelte/transition";
  import BarChartTB from "../charts/BarChartTB.svelte";
	import StackedBarChart from "../charts/StackedBarChart.svelte";
	import StackedBarChartTB from "../charts/StackedBarChart.svelte";
	import Card from "../components/card.svelte";
  import type { Component } from "svelte"

	import type { PageData } from './$types';
	import BarChartTb from "../charts/BarChartTB.svelte";

	let { data}: { data: PageData } = $props();

  let tb = $derived(data.post[4])
  let wqmp = $derived(data.post[2])
  let sw = $derived(data.post[0])
  let cr = $derived(data.post[1])

  type chartType = {
    chartTitle: string,
    chartData: object,
    Chart: Component,
  }

  type tbKey = keyof Trashbash

  function makeBarData(dataset: Trashbash[], key: tbKey) {
    if(dataset) {
    return dataset.map((item: Trashbash) => ({
        juris: item.expand.collection_site_id.site_name,
        value: item[key]
      }))    }
  }

  /*
  function makeStackedBarData(dataset: Trashbash[], key1: tbKey, key2: tbKey) {
    if(dataset) {
    return dataset.map((item: Trashbash) => ({
        juris: item.expand.collection_site_id.site_name,
        recycled_pounds: item[key2],
        trash_pounds: item[key1],
      })).filter((item: any) => item.trash_pounds !== 0)
    }
  }
  */


  let trash_pounds = $derived(makeBarData(data.trashbash as Trashbash[], "trash_pounds"))
  let tires  = $derived(makeBarData(data.trashbash as Trashbash[], "tires"))
  let recycled_pounds = $derived(makeBarData(data.trashbash as Trashbash[], "recycled_pounds" as tbKey))
  let tot_volunteer_count = $derived(makeBarData(data.trashbash as Trashbash[], "tot_volunteer_count" as tbKey))
  let vol_under_18= $derived(makeBarData(data.trashbash as Trashbash[], "vol_under_18" as tbKey))
  let vol_scouts= $derived(makeBarData(data.trashbash as Trashbash[], "vol_scouts" as tbKey))
  let miles_cleaned = $derived(makeBarData(data.trashbash as Trashbash[], "miles_cleaned" as tbKey))

  const cardTB: chartType[] = $derived([
    {
      chartTitle: "Trash Pounds",
      chartData: trash_pounds,
      Chart: BarChartTb,
    },
    {
      chartTitle: "Tire Count",
      chartData: tires,
      Chart: BarChartTb,
    },
    {
      chartTitle: "Miles Cleaned",
      chartData: miles_cleaned,
      Chart: BarChartTb,
    },
    {
      chartTitle: "Recycled Pounds",
      chartData: recycled_pounds,
      Chart: BarChartTb,
    },
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
 ])

</script>

<div  in:fly={{x:300}} out:fly={{x:-400}}  class="fixed top-28 flex flex-col items-center justify-start w-screen h-screen h-max-screen overflow-auto pt-[0%] pb-[6%] z-10">
  <div class="flexy flex-col">
    <div class="flexy">
      <Card 
        project={tb} 
        charts={cardTB}
      />   
    </div>
  </div>
</div>
