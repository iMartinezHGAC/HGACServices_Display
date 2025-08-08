<script lang="ts">
	import CardBlurbTb from "../fragments/cardBlurbTB.svelte";
	import AdditionalWork from "./additionalWork.svelte";
	import Printer from "$lib/assets/printer.svelte";
	import Indicator from "./indicator.svelte";

  import exportChartToPDF from "$lib/scripts/convertSVGtoPDF"
	import { graphsState } from "../charts/graphVectors.svelte";
	import RenderEchart from "./renderEchart.svelte";

interface CustomEchartType {
  parent_table: string,
  echarts_data: echarts.EChartsOption,
  chartType?: string,
  indicatorVal?: string | number,
  indicatorName?: string
}

interface CardDataType {
  program: ProgramType,
  echarts: CustomEchartType[]
}

interface cardProps {
  project: ProgramType,
  charts: CustomEchartType[]
  additionalWork: boolean
}

  const {project, charts, additionalWork = false}: cardProps = $props()
  const graphState = graphsState()


  function toGraph(vector: HTMLDivElement) {
    graphState.clear()
    graphState.add(vector as HTMLDivElement)
  }

  function toGraphWork(workVector: HTMLDivElement) {
    if(workVector) graphState.add(workVector)
  }

  function handleExportClick() {
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


</script>


<div class="flex-col w-full items-center justify-center bg-white border-2 border-slate-700 mb-4 rounded-b-md" {@attach toGraph}>
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
    <span class="flex-grow"></span>
    <button onclick={handleExportClick} id="printerIcon" class="group mr-8 bg-slate-700 bg-none font-[Staatliches] pt-8 flex items-start justify-start font-medium active:bg-slate-800 cursor-pointer">
      <Printer id="printerIcon"/>
    </button>
  </div>
  <div class="grid grid-cols-2 gap-1 items-center justify-center px-12 py-8 w-full">
    {#each charts as chart}
      {#if chart.chartType && chart.chartType === "indicator"}
        <Indicator above={true} below={false} aboveText={chart.indicatorName!} belowText={""} numericValue={chart.indicatorVal! as number}/>
      {:else}
        {console.log(chart)}
          <RenderEchart chart={chart.echarts_data} />
      {/if}
    {/each}
    <!--
    {#if accordionFlag}
    {/if}
    -->
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
  <div class="flexy" {@attach toGraphWork}>
    <AdditionalWork 
      bodyText={"The workshop featured leading experts in urban planning, community development, and social innovation who provided insight on how communities can encourage, embrace, and develop inclusive spaces where people spend time between home, work, and school. We explored the transformative impact of third places—vibrant multigenerational hubs such as cafes, parks, libraries, and other unique gathering spaces where community connections flourish, and gained insights on the relevance of third places post COVID-19, including physical and mental health benefits. Participants learned why these spaces are critical to fostering social connections and well-being in urban settings. "} 
      projectName={"Between Home and Work: How Third Places Help Build Inclusive Communities"} 
      funding={40} 
      projectTimeframe={""} 
    />
  </div>
  {/if}
</div>
