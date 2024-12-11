<script lang="ts">
	import DonutChart from "../charts/DonutChart.svelte";


let {header, data}: {header: string, data: {name: string, value: number}[]} = $props()

</script>


<div class="flexy flex-col h-full bg-slate-700 p-0 pt-0">
  <p class="font-staatliches text-2xl text-slate-200 mb-4">
    {header}
  </p>
  <DonutChart data={data} width={800} height={800}/>
</div>
