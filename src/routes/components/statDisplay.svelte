<script lang="ts">
	import DonutChart from "../charts/DonutChart.svelte";
  type DonutType = {
    name: string,
    value: number,
  }
  type donutDisplayType = {
    header: string,
    data: DonutType[],
    colors: string[],
    preSymbol?: string,
    postSymbol?: string,
  }

let {header, data, preSymbol="", postSymbol="", colors}: donutDisplayType = $props()

</script>

<div class="flex items-center flex-col h-full w-1/4 bg-slate-700 p-0 pt-0">
  <p class="font-[Staatliches] text-2xl text-slate-200 mb-4">
    {header}
  </p>
  <span class="scale-100">
    <DonutChart 
      data={data}
      width={300}
      height={300}
    />
  </span>
</div>

