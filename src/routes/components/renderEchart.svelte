<script lang="ts">
  import * as echarts from "echarts"
  import { untrack } from "svelte"
  import { printState } from "../../state/printState.svelte"
  import { graphsState } from "../charts/graphVectors.svelte"
  import { legendNames } from "../helpers/printPairing"
  import { CHART_COLORS, sideLegendFormatter, sideLegendWidths, styleChart } from "../helpers/chartStyle"

  const print = printState()

  // Registers each chart container so the PDF exporter can find it
  const graphState = graphsState()

  interface Props {
    chart: echarts.EChartsOption | null
    onDrilldown?: (params: any, chartInstance: echarts.ECharts) => boolean | void  
    /** Printed at half the page width, beside another chart (see printPairing.ts) */
    printHalf?: boolean
  }

  const { chart, onDrilldown, printHalf = false }: Props = $props()

  // Brand palette and Civic Light chart styling (see helpers/chartStyle.ts)
  const customColors = CHART_COLORS

  // Helper to merge custom colors into the provided option (top-level color palette)
  function getOptionWithColors(option: echarts.EChartsOption | null): echarts.EChartsOption {
    // Charts mounted for printing must render fully formed, not mid-animation.
    // untrack: reading print mode here must not re-run the chart effects.
    const printing = untrack(() => print.active)
    const noAnimation = printing ? { animation: false } : {}
    if (!option) return { color: [...customColors], ...noAnimation }
    return {
      ...option,
      color: [...customColors],   // This overrides any user-provided color palette (styling: see `to`)
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
  // Donuts sit left of their legend on screen (chartStyle.ts); with the legend moved below on
  // paper they go back to the middle
  let savedPieCenters: unknown[] | null = null
  // The last whole chart sent to ECharts, as styled (its side legend, if any, is refitted on resize)
  let styledOption: echarts.EChartsOption | null = null

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
        // the printed legend has room for full names
        const full = sideLegendFormatter(styledOption, null)
        if (full) instance.setOption({ legend: { formatter: full } })
        printLegend = readLegend(instance)
        savedLegendShow = legends.map((l) => l.show)
        if (legends.length) instance.setOption({ legend: legends.map(() => ({ show: false })) })
        const series = ((instance.getOption() as any).series ?? []) as { type?: string; center?: unknown }[]
        savedPieCenters = series.map((s) => (s.type === 'pie' ? s.center : undefined))
        instance.setOption({ series: series.map((s) => (s.type === 'pie' ? { center: ['50%', '50%'] } : {})) })
      } else if (savedLegendShow) {
        instance.setOption({ legend: savedLegendShow.map((show) => ({ show: show ?? true })) })
        const fitted = sideLegendFormatter(styledOption, instance.getWidth())
        if (fitted) instance.setOption({ legend: { formatter: fitted } })
        if (savedPieCenters) instance.setOption({ series: savedPieCenters.map((center) => (center ? { center } : {})) })
        savedLegendShow = null
        savedPieCenters = null
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
    // Drilldown handlers call setOption on the instance directly: style those options too. Only
    // whole charts (series with a type); partial updates, such as hiding the legend for print,
    // must merge into what is there untouched.
    const rawSetOption = chartInstance.setOption.bind(chartInstance)
    const isWholeChart = (o: any) => [o?.series ?? []].flat().some((s: any) => s?.type)
    chartInstance.setOption = ((option: echarts.EChartsOption, ...rest: any[]) => {
      if (!isWholeChart(option)) return (rawSetOption as any)(option, ...rest)
      styledOption = styleChart(option, element.clientWidth)
      return (rawSetOption as any)(styledOption, ...rest)
    }) as typeof chartInstance.setOption
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

    // Charts fill their box's width, so they follow its resizes (cards, sidebar, window); a
    // legend beside a donut, and the title, re-fit their text to the new width
    const resizeObserver = new ResizeObserver(() => {
      refit()
      const formatter = sideLegendFormatter(styledOption, element.clientWidth)
      if (formatter && !untrack(() => print.active) && element.clientWidth > 0) {
        rawSetOption({ legend: { formatter }, title: { textStyle: { width: sideLegendWidths(element.clientWidth).title } } })
      }
    })
    resizeObserver.observe(element)

    // Attachment cleanup: runs when the chart is removed from the DOM
    return () => {
      printQuery.removeEventListener('change', refit)
      resizeObserver.disconnect()
      graphState.remove(element)
      chartInstance?.dispose()
      chartInstance = null
    }
  }
</script>

<div data-echart-wrap class="flex w-full flex-col items-center justify-center">
  <div 
    data-echart
    data-print-half={compact ? "" : undefined}
    class="{compact ? 'w-[460px] h-[380px]' : 'w-full h-[450px]'} scale-100"
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
      class="mb-1 cursor-pointer rounded-lg border border-[#E1E6E9] bg-white px-4 py-1.5 font-[Metropolis] text-sm font-semibold text-[#025773] hover:bg-[#F4F6F7] focus:outline-none focus:ring-2 focus:ring-[#025773]/30 print:hidden"
      type="button"
    >
      ← Back
    </button>
  {/if}
</div>

