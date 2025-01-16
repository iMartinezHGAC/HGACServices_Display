<script lang="ts">
	import CardBlurb from "../fragments/cardBlurb.svelte";
  import CardHeader from "../fragments/cardHeader.svelte";
  import { page } from "$app/state";
	import CardBlurbTb from "../fragments/cardBlurbTB.svelte";
	import StackedBarChartTb from "../charts/StackedBarChartTB.svelte";
	import AdditionalWork from "./additionalWork.svelte";
	import type { RecordModel } from "pocketbase";

  let tb_for_key: Trashbash
  type tbKey = keyof typeof tb_for_key

  function makeBarData(dataset: Trashbash[], key: tbKey) {
    if(dataset) {
    return dataset.map((item: Trashbash) => ({
        juris: item.expand.collection_site_id.site_name,
        value: item[key]
      }))    }
  }

  function makeStackedBarData(dataset: Trashbash[], key1: tbKey, key2: tbKey) {
    if(dataset) {
    return dataset.map((item: Trashbash) => ({
        juris: item.expand.collection_site_id.site_name,
        recycled_pounds: item[key2],
        trash_pounds: item[key1],
      })).filter((item: any) => item.trash_pounds !== 0)
    }
  }

  let trash_pounds = $derived(makeBarData(page.data.trashbash, "trash_pounds" as tbKey))
  let tires  = $derived(makeBarData(page.data.trashbash, "tires" as tbKey))
  let recycled_pounds = $derived(makeBarData(page.data.trashbash, "recycled_pounds" as tbKey))
  let tot_volunteer_count = $derived(makeBarData(page.data.trashbash, "tot_volunteer_count" as tbKey))
  let vol_under_18= $derived(makeBarData(page.data.trashbash, "vol_under_18" as tbKey))
  let vol_scouts= $derived(makeBarData(page.data.trashbash, "vol_scouts" as tbKey))
  let miles_cleaned = $derived(makeBarData(page.data.trashbash, "miles_cleaned" as tbKey))

  interface cardProps {
    project: RecordModel,
    chart1: any
    chartTitle1: string
    chart2?: any
    chartTitle2?: string
    chart3?: any
    chartTitle3?: string
    chart4?: any
    chartTitle4?: string
    chart5?: any
    chartTitle5?: string
  }

  const props: cardProps = $props()


  let accordionFlag = $state(false);
  let accordionText = $derived.by(() => {
    if(accordionFlag === false)
      return "Show more metrics.." 
    return "Show fewer metrics"
  })

  let timeFlag = $state(false)
  function toggleTime(timeline: boolean) {
    timeFlag = timeline
  }

  //$inspect(props.projectLinks)
  let linkUrls = $derived(props.project.expand!.links.map(
    (item: any) => item.url_string)
  )

  let blurb = $derived(props.project.expand!.blurb.program_blurb)

  //$inspect(linkUrls)
</script>

{#if trash_pounds }
<div class="flex-col w-10/12 items-center justify-center bg-white border-2 border-slate-700 mb-4 rounded-b-md">
  <div class="flex bg-slate-700">
    <CardHeader projectName={props.project.program_name}  links={linkUrls} color="dark"/>
    <CardBlurbTb text={blurb}/>
  </div>
  <div class="grid grid-cols-2 gap-2 items-center justify-center px-12 mt-8">
        <!-- bar: tires count -->
      <div class="card-style">
        <props.chart2 data={trash_pounds} width={800} height={580} yLabel={"Trash Pounds"}/>
      </div>
      <!-- bar: shoreline miles-->
      <div class="card-style">
        <props.chart4 data={recycled_pounds} yLabel={"Recycled Pounds"}/>
      </div>
    {#if accordionFlag}
      <!-- bar: volunteer count-->
      <div class="card-style">
        <props.chart3 data={tires} yLabel={"Tires"}/>
      </div>
      <!-- bar: cleanup sites-->
      <div class="card-style">
        <props.chart5 data={tot_volunteer_count} yLabel={"Total Volunteer Count"}/>
      </div>
      <div class="card-style">
        <props.chart5 data={miles_cleaned} yLabel={"Miles Cleaned"}/>
      </div>
      <div class="card-style">
        <props.chart5 data={vol_scouts} yLabel={"Volunteer Scouts Count"}/>
      </div>      
      <div class="card-style">
        <props.chart5 data={vol_under_18} yLabel={"Volunteer Under-18 Count"}/>
      </div>
    {/if}
  </div>  
  <button class="flex h-12 w-11/12 bg-slate-700 text-white mx-auto items-center justify-center" 
      onclick={()=> {accordionFlag = !accordionFlag}}>
    {accordionText}
  </button>  
  <div class="flexy">
    <AdditionalWork 
      bodyText={"Lorem Ipsum"} 
      projectName={"Dog Poop Pickup"} 
      funding={40} 
      projectTimeframe={""} 
    />
  </div>

</div>
  {/if}
