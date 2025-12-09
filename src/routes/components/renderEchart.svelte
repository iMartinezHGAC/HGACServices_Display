<script lang="ts">
  import * as echarts from "echarts"
  interface props {
    chart: echarts.EChartsOption
    onDrilldown?: (params: any, chartInstance: echarts.ECharts) => void  
  }

  const {chart, onDrilldown}: props = $props()

  function to(element: HTMLElement) {
    const myChart = echarts.init(element)
    myChart.setOption(chart);
    if(onDrilldown) {
      myChart.on('click', (params) => onDrilldown(params, myChart))
    }
  }

</script>


<div style="width: 600px; height: 400px;" class="scale-100 px-8" {@attach to}>
</div>  
