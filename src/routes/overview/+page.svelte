<script lang="ts">
	import BarChart from "../charts/BarChart.svelte";
	import DonutChart from "../charts/DonutChart.svelte";
	import FilledAreaChart from "../charts/FilledAreaChart.svelte";
	import StackedBarChart from "../charts/StackedBarChart.svelte";
	import Indicator from "../components/indicator.svelte";
import StatDisplay from "../components/statDisplay.svelte";
  import {fly} from "svelte/transition"

const donut_data = [{name: 'Harris', value: 100}, {name: 'Fort Bend', value: 200}, {name: 'Waller', value: 300}]
const bar_data = [
    { letter: 'A', frequency: 25 },
    { letter: 'Montgomery', frequency: 30 },
    { letter: 'Waller', frequency: 55 },
    { letter: 'Fort Bend', frequency: 65 },
    { letter: 'C', frequency: 15 },
    { letter: 'Galveston', frequency: 40 },
    { letter: 'B', frequency: 20 },
    { letter: 'Harris', frequency: 90 }
  ];

const area_data  = [
    { date: new Date('2021-01-01'), industry: 'Industry A', unemployed: 500 },
    { date: new Date('2021-01-01'), industry: 'Industry B', unemployed: 300 },
    { date: new Date('2021-01-01'), industry: 'Industry C', unemployed: 700 },
    { date: new Date('2021-02-01'), industry: 'Industry A', unemployed: 450 },
    { date: new Date('2021-02-01'), industry: 'Industry B', unemployed: 350 },
    { date: new Date('2021-02-01'), industry: 'Industry C', unemployed: 200 },
    { date: new Date('2021-03-01'), industry: 'Industry A', unemployed: 600 },
    { date: new Date('2021-03-01'), industry: 'Industry B', unemployed: 200 },
    { date: new Date('2021-03-01'), industry: 'Industry C', unemployed: 500 },
    // Add more data points...
  ];

const stackbar_data = [
    { state: 'California', age: '18-24', population: 1000 },
    { state: 'California', age: '25-34', population: 1500 },
    { state: 'California', age: '35-44', population: 1700 },
    { state: 'Texas', age: '18-24', population: 800 },
    { state: 'Texas', age: '25-34', population: 1200 },
    { state: 'Texas', age: '35-44', population: 1700 },
    { state: 'New York', age: '18-24', population: 1100 },
    { state: 'New York', age: '25-34', population: 1300 },
    { state: 'New York', age: '35-44', population: 1700 },
    // More data entries...
  ];
</script>

{#snippet graphDisplay(text: string)}
  <div class="flex items-center justify-center w-1/2 h-full px-12 border-2 border-slate-200">
    {text}
  </div>
{/snippet}


<StackedBarChart data={stackbar_data}/>

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
