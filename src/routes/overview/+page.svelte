<script lang="ts">
	import StackedBarChart from "../charts/StackedBarChart.svelte";
	import Indicator from "../components/indicator.svelte";
import StatDisplay from "../components/statDisplay.svelte";
  import {fly} from "svelte/transition"
</script>

{#snippet graphDisplay(text: string)}
  <div class="flex items-center justify-center w-1/2 h-full px-12 border-2 border-slate-200">
    {text}
  </div>
{/snippet}


<Indicator above={false} aboveText="Gain YTD" below={true} belowText={"YTD expenditure"} numericValue={15} symbol_pre="$" symbol_post="M"/>
<!--
<div in:fly={{x:300}} out:fly={{x:-400}} class="flexy flex-col fixed top-24 h-screen w-5/6">
  <div class="w-5/6 h-1/6 flexy  bg-slate-600 text-slate-200 flex rounded-t-lg">
    <p class="font-poppins font-medium py-4 w-3/4">
      Blurb, if any, for jurisdiction form communications (will probably only be here for large jurisdictions)
    </p>
  </div>
  <div class="w-5/6 h-2/6 flexy flex-row">
    <StatDisplay header="Total Funds Received"/>
    <StatDisplay header="Services Received"/>
    <StatDisplay header="Total Participation"/>
    <StatDisplay header="Transportation Projects"/>
  </div>
  <div class="w-5/6 h-3/6 bg-hgac-slate text-slate-200 flexy">
    {@render graphDisplay("Historical Funds Received stacked bar chart (X is time, Y is dollar. Bars broken down by category)")}
    <StackedBarChart/>
  </div>
</div>
-->
