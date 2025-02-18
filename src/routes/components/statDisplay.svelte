<script lang="ts">
	import DonutChart from "../charts/DonutChart.svelte";

  type donutDisplayType = {
    header: string,
    data: {name: string, value:number}[],
    index: number,
    colors: string[],
    preSymbol?: string,
    postSymbol?: string,
  }

let {header, data, index, preSymbol="", postSymbol="", colors}: donutDisplayType = $props()

</script>


<div class="flexy flex-col h-full bg-slate-700 p-0 pt-0">
  <p class="font-[Staatliches] text-2xl text-slate-200 mb-4">
    {header}
  </p>
  <DonutChart data={data} width={800} height={800} index={index} preSymbol={preSymbol} postSymbol={postSymbol} colors={colors}/>
</div>
