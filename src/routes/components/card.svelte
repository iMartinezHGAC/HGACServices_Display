<script lang="ts">
  import CardHeader from "../fragments/cardHeader.svelte";
  import { setContext, type Component } from "svelte"
	import CardBlurbTb from "../fragments/cardBlurbTB.svelte";
	import AdditionalWork from "./additionalWork.svelte";
	import type { RecordModel } from "pocketbase";

  
  type chartType = {
    chartTitle: string,
    chartData: object,
    Chart: Component,
  }
  interface cardProps {
    project: RecordModel,
    charts: chartType[]
  }

  const {project, charts}: cardProps = $props()

  const graphState = graphsState()

  let graphVectors: HTMLDivElement[]
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
  let linkUrls = $derived(project.expand!.links.map(
    (item: any) => item.url_string)
  )

  let blurb = $derived(project.expand!.blurb.program_blurb)

  import exportChartToPDF from "$lib/scripts/convertSVGtoPDF"
	import { graphsState } from "../charts/graphVectors.svelte";
  //$inspect(linkUrls)
</script>

<div class="flex-col w-10/12 items-center justify-center bg-white border-2 border-slate-700 mb-4 rounded-b-md">
  <div class="flex bg-slate-700">
    <CardHeader projectName={project.program_name}  links={linkUrls} color="dark"/>
    <CardBlurbTb text={blurb}/>
    <button onclick={handleExportClick} class="px-2 bg-green-200 font-staatliches font-medium active:bg-green-300">Export to PDF</button>
  </div>
  <div class="grid grid-cols-2 gap-2 items-center justify-center px-12 mt-8">
      {#each charts as {chartTitle, chartData, Chart},i}
        {#if i<2}
          <div class="card-style">
            <Chart data={chartData} width={800} height={580} yLabel={chartTitle} bind:this={cardInstances[i]}/>
          </div>
        {:else if i>=2 && accordionFlag}
          <div class="card-style">
            <Chart data={chartData} width={800} height={580} yLabel={chartTitle} bind:this={cardInstances[i]}/>
          </div>
        {/if}
      {/each}
    {#if accordionFlag}
      <!-- bar: volunteer count-->

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
