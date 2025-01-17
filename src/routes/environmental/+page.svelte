<script lang="ts">
	import { fly } from "svelte/transition";
  import BarChartTB from "../charts/BarChartTB.svelte";
	import StackedBarChart from "../charts/StackedBarChart.svelte";
	import StackedBarChartTB from "../charts/StackedBarChart.svelte";
	import Card from "../components/card.svelte";

	import type { PageData } from './$types';

	let { data}: { data: PageData } = $props();

  let tb = $derived(data.post[4])
  let wqmp = $derived(data.post[2])
  let sw = $derived(data.post[0])
  let cr = $derived(data.post[1])
</script>

<svelte:boundary>
  <div  in:fly={{x:300}} out:fly={{x:-400}}  class="fixed top-28 flex flex-col items-center justify-start w-screen h-screen h-max-screen overflow-auto pt-[0%] pb-[6%] z-10">
    <div class="flexy flex-col">
      <div class="flexy">
        <Card 
          project={tb} 
          chart1={StackedBarChart} 
          chartTitle1={"Trash & Recycyling tonnage"}
          chart2={BarChartTB}
          chartTitle2={"Tire Count"}
          chart3={BarChartTB}
          chartTitle3={"Count"}
          chart4={BarChartTB}
          chartTitle4={"Total Miles"}
          chart5={BarChartTB}
          chartTitle5={"Cleanup Sites"}
        />   
      </div>
    </div>
  </div>
  {#snippet failed(error: Error, reset )}
      <button onclick={reset}>Something went wrong</button>
  {/snippet}
</svelte:boundary>
