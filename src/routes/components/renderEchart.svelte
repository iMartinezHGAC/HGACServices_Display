<script lang="ts">
  import * as echarts from "echarts"
  import { untrack } from "svelte"
  import { printState } from "../../state/printState.svelte"
  import { graphsState } from "../charts/graphVectors.svelte"

  const print = printState()

  // Registers each chart container so the PDF exporter can find it
  const graphState = graphsState()

  interface Props {
    chart: echarts.EChartsOption | null
    onDrilldown?: (params: any, chartInstance: echarts.ECharts) => void  
  }

  const { chart, onDrilldown }: Props = $props()

  // Custom color palette
  const customColors = [
    '#7AB66F',
    '#EF9021',
    '#25B5AF',
    '#C6093B',
    '#002F47',
    '#025773',
    '#56B4E9', // light sky blue  
    '#F0E442', // bright yellow 
    '#0072B2', // medium blue
    '#CC79A7', // reddish purple
  ] as const

  // Helper to merge custom colors into the provided option (top-level color palette)
  function getOptionWithColors(option: echarts.EChartsOption | null): echarts.EChartsOption {
    // Charts mounted for printing must render fully formed, not mid-animation.
    // untrack: reading print mode here must not re-run the chart effects.
    const printing = untrack(() => print.active)
    const noAnimation = printing ? { animation: false } : {}
    if (!option) return { color: [...customColors], ...noAnimation }
    return {
      ...option,
      color: [...customColors],   // This overrides any user-provided color palette (copy: the const tuple is readonly)
      ...noAnimation
    }
  }

  // Local state
  let currentChartOption: echarts.EChartsOption | null = chart
  let chartInstance: echarts.ECharts | null = null
  let isDrilledDown = $state(false)

  $effect(() => {
    if (chartInstance && chart) {
console.log("RenderEchart received option →", {
  title: chart?.title?.text,
  xLength: chart?.xAxis?.data?.length,
  yLength: chart?.series?.[0]?.data?.length,
  sampleX: chart?.xAxis?.data?.slice(0, 3),
  sampleY: chart?.series?.[0]?.data?.slice(0, 3),
});
      chartInstance.setOption(getOptionWithColors(chart), true)
      currentChartOption = chart
      isDrilledDown = false
    }
  })

  function restoreRootChart() {
    if (chartInstance && chart) {
      chartInstance.setOption(getOptionWithColors(chart), true)
      isDrilledDown = false
    }
  }

  function to(element: HTMLElement) {
    // SVG renderer: output is vector (sharp, selectable text) in print / Save as PDF
    chartInstance = echarts.init(element, null, { renderer: 'svg' })
    if (chart) {
      chartInstance.setOption(getOptionWithColors(chart))
    }

    if (onDrilldown) {
      chartInstance.on('click', (params) => {
        // Prevent any further drilldown once we have already drilled once
        if (isDrilledDown) return;

        isDrilledDown = true;
        onDrilldown(params, chartInstance!);
      })
    }

    // ECharts draws at a fixed pixel size. Giving the SVG a matching viewBox is invisible on
    // screen (identity transform) but lets print CSS scale the whole chart to fit its box with
    // no JavaScript at print time: browsers print a static snapshot, so a resize on
    // `beforeprint` / print media change cannot be relied on (Firefox ignores it).
    const syncViewBox = () => {
      const svg = element.querySelector('svg')
      if (!svg || !chartInstance) return
      svg.setAttribute('viewBox', `0 0 ${chartInstance.getWidth()} ${chartInstance.getHeight()}`)
    }
    chartInstance.on('finished', syncViewBox)
    syncViewBox()

    graphState.add(element)

    // Where it does fire (Chromium), re-lay the chart out at its print size for sharper text
    const printQuery = window.matchMedia('print')
    const refit = () => requestAnimationFrame(() => chartInstance?.resize())
    printQuery.addEventListener('change', refit)

    // Attachment cleanup: runs when the chart is removed from the DOM
    return () => {
      printQuery.removeEventListener('change', refit)
      graphState.remove(element)
      chartInstance?.dispose()
      chartInstance = null
    }
  }
</script>

<div class="flex flex-col items-center justify-center">
  <div 
    data-echart
    class="w-[700px] h-[450px] px-8 scale-100"
    {@attach to}>
  </div>  

  {#if isDrilledDown}
    <button 
      onclick={restoreRootChart}
      class="mb-0 px-0 py-2 w-20 rounded bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 transition"
      type="button"
    >
      ⬅️ Back
    </button>
  {/if}
</div>

