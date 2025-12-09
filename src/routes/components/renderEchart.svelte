<script lang="ts">
  import * as echarts from "echarts"
  interface props {
    chart: echarts.EChartsOption
    onDrilldown?: (params: any, chartInstance: echarts.ECharts) => void  
  }

  const {chart, onDrilldown}: props = $props()

   // Local state
  let currentChartOption: echarts.EChartsOption = chart;
  let chartInstance: echarts.ECharts | null = null;
  let isDrilledDown = $state(false);

  $effect(() => {
    if (chartInstance && chart) {
      chartInstance.setOption(chart, true);
      currentChartOption = chart;
      isDrilledDown = false;
    }
  });
 
  function restoreRootChart() {
    if (chartInstance) {
      chartInstance.setOption(chart, true);
      isDrilledDown = false;
    }
  }

  function to(element: HTMLElement) {
    chartInstance = echarts.init(element)
    chartInstance.setOption(chart)

    if(onDrilldown) {
      chartInstance.on('click', (params) => {
        isDrilledDown = true
        onDrilldown(params, chartInstance!)
      })
    }
  }

</script>



<div class="flex flex-col items-center justify-center">
<div 
  class="w-[600px] h-[400px] px-8 scale-100"
 {@attach to}>

</div>  
    {#if isDrilledDown}
      <button onclick={restoreRootChart}
        class="mb-0 px-0 py-2 w-20 rounded bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 transition"
        type="button"
      >
      ⬅️ Back
      </button>
    {/if}
</div>
