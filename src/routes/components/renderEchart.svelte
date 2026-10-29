<script lang="ts">
  import * as echarts from "echarts"
  import { untrack } from "svelte"
  import { printState } from "../../state/printState.svelte"
  import { graphsState } from "../charts/graphVectors.svelte"
  import { legendNames } from "../helpers/printPairing"

  const print = printState()

  // Registers each chart container so the PDF exporter can find it
  const graphState = graphsState()

  interface Props {
    chart: echarts.EChartsOption | null
    onDrilldown?: (params: any, chartInstance: echarts.ECharts) => boolean | void  
    /** Printed at half the page width, beside another chart (see printPairing.ts) */
    printHalf?: boolean
    /** On screen, fill the container's width (and follow its resizes) instead of a fixed 700px */
    fluid?: boolean
  }

  const { chart, onDrilldown, printHalf = false, fluid = false }: Props = $props()

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

  // ── Half-width print ──
  // Scaled down to half the page, the in-chart legend would print at ~5pt. Instead the chart is
  // laid out at a smaller pixel size (so its own text shrinks less), its legend is hidden and
  // re-drawn as plain text just below it, where it wraps to the column at a readable size.
  const compact = $derived(print.active && printHalf)
  let printLegend = $state<{ name: string; label: string; color: string }[]>([])
  let savedLegendShow: (boolean | undefined)[] | null = null

  /** The legend as currently shown, colours taken from the rendered chart (follows drilldowns). */
  function readLegend(instance: echarts.ECharts) {
    const option = instance.getOption() as echarts.EChartsOption
    const names = new Set(legendNames(option))
    // the legend's own formatter decides the text (e.g. "LET" -> "Let for Construction")
    const formatter = ((option.legend ?? []) as any[]).find((l) => l?.formatter)?.formatter
    const label = (name: string) =>
      typeof formatter === "function" ? String(formatter(name)) :
      typeof formatter === "string" ? formatter.replace(/\{name\}/g, name) : name
    const items: { name: string; label: string; color: string }[] = []
    const seen = new Set<string>()
    ;((option.series ?? []) as any[]).forEach((s, seriesIndex) => {
      const entries: [unknown, number | undefined][] =
        s?.type === "pie" || s?.type === "funnel"
          ? (s.data ?? []).map((d: any, dataIndex: number) => [d?.name, dataIndex])
          : [[s?.name, undefined]]
      for (const [raw, dataIndex] of entries) {
        const name = raw == null ? "" : String(raw)
        if (!names.has(name) || seen.has(name)) continue
        seen.add(name)
        const color = instance.getVisual({ seriesIndex, dataIndex }, "color")
        items.push({ name, label: label(name), color: typeof color === "string" ? color : "#94a3b8" })
      }
    })
    // keep the legend's own order
    const order = [...names]
    return items.sort((a, b) => order.indexOf(a.name) - order.indexOf(b.name))
  }

  function relayout(instance: echarts.ECharts) {
    instance.resize({ animation: { duration: 0 } })
    // resize() paints on the next frame; Ctrl+P snapshots the page before that, so paint now
    instance.getZr().flush()
    instance.getDom().querySelector("svg")?.setAttribute("viewBox", `0 0 ${instance.getWidth()} ${instance.getHeight()}`)
  }

  $effect(() => {
    const on = compact
    untrack(() => {
      if (!chartInstance || (!on && !savedLegendShow)) return
      const instance = chartInstance
      const legends = ((instance.getOption() as any).legend ?? []) as { show?: boolean }[]
      if (on) {
        printLegend = readLegend(instance)
        savedLegendShow = legends.map((l) => l.show)
        if (legends.length) instance.setOption({ legend: legends.map(() => ({ show: false })) })
      } else if (savedLegendShow) {
        instance.setOption({ legend: savedLegendShow.map((show) => ({ show: show ?? true })) })
        savedLegendShow = null
        printLegend = []
      }
      // the container's size class has already been swapped by the time effects run
      relayout(instance)
    })
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

        // a handler returns false when the click didn't change the chart (no Back button then)
        if (onDrilldown(params, chartInstance!) !== false) isDrilledDown = true;
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
    // (not for half-width charts: they keep the layout sized for them in `compact`)
    // (never at zero width: a chart laid out into a collapsed box stays blank on paper)
    const refit = () => requestAnimationFrame(() => {
      if (!compact && element.clientWidth > 0 && element.clientHeight > 0) chartInstance?.resize()
    })
    printQuery.addEventListener('change', refit)

    // A fluid chart is laid out at whatever width its box has, so it follows the box's resizes
    const resizeObserver = fluid ? new ResizeObserver(refit) : null
    resizeObserver?.observe(element)

    // Attachment cleanup: runs when the chart is removed from the DOM
    return () => {
      printQuery.removeEventListener('change', refit)
      resizeObserver?.disconnect()
      graphState.remove(element)
      chartInstance?.dispose()
      chartInstance = null
    }
  }
</script>

<div data-echart-wrap class="flex flex-col items-center justify-center {fluid ? 'w-full' : ''}">
  <div 
    data-echart
    data-print-half={compact ? "" : undefined}
    class="{compact ? 'w-[460px] h-[380px]' : fluid ? 'w-full h-[450px]' : 'w-[700px] h-[450px] px-8'} scale-100"
    {@attach to}>
  </div>  

  {#if compact && printLegend.length > 0}
    <ul data-print-legend>
      {#each printLegend as item}
        <li><span style:background-color={item.color}></span>{item.label}</li>
      {/each}
    </ul>
  {/if}

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

