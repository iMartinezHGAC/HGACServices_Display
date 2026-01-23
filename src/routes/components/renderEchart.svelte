<script lang="ts">
  import * as echarts from "echarts"

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
    '#B4B4B4',
  ] as const

  // Helper to merge custom colors into the provided option (top-level color palette)
  function getOptionWithColors(option: echarts.EChartsOption | null): echarts.EChartsOption {
    if (!option) return { color: customColors }
    return {
      ...option,
      color: customColors   // This overrides any user-provided color palette
    }
  }

  // Local state
  let currentChartOption: echarts.EChartsOption | null = chart
  let chartInstance: echarts.ECharts | null = null
  let isDrilledDown = $state(false)

  $effect(() => {
    if (chartInstance && chart) {
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
    chartInstance = echarts.init(element)
    if (chart) {
      chartInstance.setOption(getOptionWithColors(chart))
    }

    if (onDrilldown) {
      chartInstance.on('click', (params) => {
        isDrilledDown = true
        onDrilldown(params, chartInstance!)
      })
    }
  }
</script>

<div class="flex flex-col items-center justify-center">
  <div 
    class="w-[700px] h-[400px] px-8 scale-100"
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
