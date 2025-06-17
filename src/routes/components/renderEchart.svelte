<script lang="ts">

  interface props {
    chart: echarts.EChartsOption
  }

  const {chart}: props = $props()
  let vector = $state<HTMLElement>()

  import * as echarts from "echarts"
  $effect (()=> {
    const myChart = echarts.init(vector)
    myChart.setOption(chart);
  })

</script>


<div id="graphBody" bind:this={vector} style="width: 600px; height: 400px;" class="scale-100 px-8">
</div>  
