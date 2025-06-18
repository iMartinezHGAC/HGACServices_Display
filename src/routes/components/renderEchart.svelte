<script lang="ts">
  import * as echarts from "echarts"
  interface props {
    chart: echarts.EChartsOption
  }

  const {chart}: props = $props()

  function to(element: HTMLElement) {
    const myChart = echarts.init(element)
    myChart.setOption(chart);
  }

</script>


<div style="width: 600px; height: 400px;" class="scale-100 px-8" {@attach to}>
</div>  
