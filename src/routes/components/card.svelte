<script lang="ts">
  import CardHeader from "../fragments/cardHeader.svelte";
	import CardBlurbTb from "../fragments/cardBlurbTB.svelte";
	import AdditionalWork from "./additionalWork.svelte";
	import Printer from "$lib/assets/printer.svelte";

  import exportChartToPDF from "$lib/scripts/convertSVGtoPDF"
	import { graphsState } from "../charts/graphVectors.svelte";
	import Indicator from "./indicator.svelte";
  import {snakeToHuman} from "$routes/helpers/caseConversion"
  
  interface cardProps {
    project: ProgramType,
    charts: ChartType[]
    additionalWork: boolean
  }

  let vector: HTMLDivElement
  let adWorkVector: HTMLDivElement | null = $state(null)

  const {project, charts, additionalWork = false}: cardProps = $props()

  const graphState = graphsState()

  function handleExportClick() {
    graphState.clear()
    graphState.add(vector)
    if(adWorkVector) graphState.add(adWorkVector)
    console.log(graphState.graph)
    exportChartToPDF(graphState.graph, project.program_name + " - Harris County")
  }

  let accordionFlag = $state(false);
  let accordionText = $derived.by(() => {
    if(accordionFlag === false)
      return "Show more metrics.." 
    return "Show fewer metrics"
  })

  let linkUrls = $derived.by(()=> {
    if(project.expand && project.expand.links) {
      return project.expand.links.map(({display_text, url_string}:{display_text: string, url_string: string}) => (
        {
          display_text,
          url_string
        })
      )
    } else return []
  })

  let blurb = $derived.by(() => {
    if(project.expand && project.expand.blurb) {
      return project.expand.blurb.program_blurb
    } else return ""
  })

  $inspect(linkUrls)
</script>

{#snippet renderChart(chartTitle: string, chartData: object|number, chartType: string, Chart: Component, i: number)}
  <div class="card-style">
    {#if chartType === "indicator"}
      <Indicator above={true} below={false} aboveText={chartTitle} belowText={""} numericValue={chartData as number}/>
    {:else}
      <Chart data={chartData} width={800} height={580} yLabel={snakeToHuman(chartTitle)}/>
    {/if}
  </div>
{/snippet}

{#snippet renderAllCharts(charts: ChartType[])}
      {#each charts as {chartTitle, chartData, chartType, Chart},i}
        {#if i<2}
          {@render renderChart(chartTitle, chartData, chartType, Chart,i)}
        {:else if i>=2 && accordionFlag}
          {@render renderChart(chartTitle, chartData, chartType, Chart,i)}
        {/if}
    {/each}
{/snippet}

<div class="flex-col w-10/12 items-center justify-center bg-white border-2 border-slate-700 mb-4 rounded-b-md" >
  <div  bind:this={vector}>
  <div class="flex bg-slate-700 w-full">
  <div class="flex flex-col w-1/3">
    <h1 class={"flex font-[Metropolis] text-[clamp(1rem,8vw+0.5rem,2rem)] font-extrabold pt-6 pb-4 pl-10 bg-slate-700 text-white justify-start small-caps"}>
      {project.program_name}
      <div class="flex flex-grow"></div>
    </h1>
    {#if linkUrls}
      <div class="flex-col flex pl-10 pb-4">
      {#each linkUrls as link }
        <a href={link.url_string} id="programLink" aria-label="link" class="text-white font-[Metropolis] font-medium">{link.display_text}</a>
      {/each}
      </div>
    {/if}
  </div>
    <CardBlurbTb text={blurb}/>
    <button onclick={handleExportClick} id="printerIcon" class="group px-2 bg-slate-700 bg-none font-[Staatliches] pt-8 flex items-start justify-start font-medium active:bg-slate-800 cursor-pointer">
      <Printer id="printerIcon"/>
    </button>
  </div>
  <div class="grid grid-cols-2 gap-1 items-center justify-center px-12 mt-8">
      {@render renderAllCharts(charts)}
    {#if accordionFlag}
      <!-- bar: volunteer count-->
    {/if}
  </div>  
</div>
    {#if charts.length > 2}
      <button class="flex h-12 w-11/12 bg-slate-700 text-white mx-auto items-center justify-center" 
          onclick={()=> {accordionFlag = !accordionFlag}}>
        {accordionText}
      </button>  
    {:else}
      <span></span>
    {/if}
  {#if additionalWork}
  <div class="flexy" bind:this={adWorkVector}>
    <AdditionalWork 
      bodyText={"Lorem Ipsum"} 
      projectName={"Dog Poop Pickup"} 
      funding={40} 
      projectTimeframe={""} 
    />
  </div>
  {/if}
</div>
