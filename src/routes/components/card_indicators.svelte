<script lang="ts">
  import CardHeader from "../fragments/cardHeader.svelte";
  import { type Component } from "svelte"
	import CardBlurbTb from "../fragments/cardBlurbTB.svelte";
	import AdditionalWork from "./additionalWork.svelte";
	import type { RecordModel } from "pocketbase";
	import Printer from "$lib/assets/printer.svelte";

  
  type chartType = {
    chartTitle: string,
    chartData: number,
    Chart: Component,
  }
  interface cardProps {
    project: RecordModel,
    charts: chartType[]
  }

  const {project, charts}: cardProps = $props()
  $inspect("indicator data", charts)

  const graphState = graphsState()

  //let graphVectors: HTMLDivElement[]
  let cardInstances = $state([])

  function handleExportClick() {
    graphState.clear()
    cardInstances.forEach((instance, i) => {
      instance.handleAdd()}
    )
    exportChartToPDF(graphState.graph)
  }

  let accordionFlag = $state(false);
  let accordionText = $derived.by(() => {
    if(accordionFlag === false)
      return "Show more metrics.." 
    return "Show fewer metrics"
  })

  /*
  let timeFlag = $state(false)
  function toggleTime(timeline: boolean) {
    timeFlag = timeline
  }
  */

  //$inspect(props.projectLinks)
  let linkUrls = $derived.by(()=> {
    if(project.expand && project.expand.links) {
    return project.expand.links.map(
      (item: any) => item.url_string)
    } else return [""]
  }
  )

  let blurb = $derived.by(() => {
    if(project.expand && project.expand.blurb) {
      return project.expand.blurb.program_blurb
    } else return ""
  })

  import exportChartToPDF from "$lib/scripts/convertSVGtoPDF"
	import { graphsState } from "../charts/graphVectors.svelte";
	import Indicator from "./indicator.svelte";
  //$inspect(linkUrls)
  const groupColors = ["#025773", "#7AB66F", "#B4B4B4", "#FEF9C3", "#F1F5F9"]
</script>

<div class="flex-col w-10/12 items-center justify-center bg-white border-2 border-slate-700 mb-4 rounded-b-md">
  <div class="flex bg-slate-700">
    <CardHeader projectName={project.program_name}  links={linkUrls} color="dark"/>
    <CardBlurbTb text={blurb}/>
    <button onclick={handleExportClick} class="group px-2 bg-slate-700 bg-none font-[Staatliches] pt-8 flex items-start justify-start font-medium active:bg-green-300 cursor-pointer">
      <Printer classStyle="stroke-white fill-white w-12 h-8 opacity-50 group-hover:opacity-100"/>
    </button>
  </div>
  <div class="grid grid-cols-2 gap-1 items-center justify-center px-12 mt-8">
      {#each charts as {chartTitle, chartData, Chart},i}
        {#if i<2}
          <div class="card-style">
            <Indicator above={true} below={false} aboveText={chartTitle} belowText={""} numericValue={chartData}/>
          </div>
        {:else if i>=2 && accordionFlag}
          <div class="card-style">
            <Chart data={chartData} width={800} height={580} yLabel={chartTitle} bind:this={cardInstances[i]}  colorSet={groupColors}/>
          </div>
        {/if}
      {/each}
    {#if accordionFlag}
      <!-- bar: volunteer count-->

    {/if}
  </div>  
  {#if charts.length > 2}
    <button class="flex h-12 w-11/12 bg-slate-700 text-white mx-auto items-center justify-center" 
        onclick={()=> {accordionFlag = !accordionFlag}}>
      {accordionText}
    </button>  
  {/if}
  <div class="flexy">
    <AdditionalWork 
      bodyText={"Lorem Ipsum"} 
      projectName={"Dog Poop Pickup"} 
      funding={40} 
      projectTimeframe={""} 
    />
  </div>
</div>
