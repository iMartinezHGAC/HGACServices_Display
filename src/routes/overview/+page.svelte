<script lang="ts">
	import BarChart from "../charts/BarChart.svelte";
	import DonutChart from "../charts/DonutChart.svelte";
	import FilledAreaChart from "../charts/FilledAreaChart.svelte";
	import StackedBarChart from "../charts/StackedBarChart.svelte";
	import Indicator from "../components/indicator.svelte";
import StatDisplay from "../components/statDisplay.svelte";
  import {fly} from "svelte/transition"

const donut_data = [{name: 'Harris', value: 100}, {name: 'Fort Bend', value: 200}, {name: 'Waller', value: 300}]
const donut_data2 = [{name: 'Harris', value: 200}, {name: 'Fort Bend', value: 300}, {name: 'Waller', value: 350}]
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
    { state: 'Harris', age: '18-24', population: 1000 },
    { state: 'Harris', age: '25-34', population: 1500 },
    { state: 'Harris', age: '35-44', population: 2700 },
    { state: 'Harris', age: '45-54', population: 1200 },
    { state: 'Fort Bend', age: '18-24', population: 800 },
    { state: 'Fort Bend', age: '25-34', population: 1200 },
    { state: 'Fort Bend', age: '35-44', population: 1700 },
    { state: 'Fort Bend', age: '45-54', population: 1000 },
    { state: 'Waller', age: '18-24', population: 1100 },
    { state: 'Waller', age: '25-34', population: 1500 },
    { state: 'Waller', age: '35-44', population: 1300 },
    { state: 'Waller', age: '45-54', population: 1100 },
    // More data entries...
  ];
</script>

{#snippet graphDisplay(text: string)}
  <div class="flex items-center justify-center w-1/2 h-full px-12 border-2 border-slate-200">
    {text}
  </div>
{/snippet}


<div in:fly={{x:300}} out:fly={{x:-400}} class="flexy flex-col fixed top-28 h-screen w-5/6">
  <div class="w-5/6 h-1/6 flexy  bg-slate-600 text-slate-200 flex rounded-t-lg">
    <p class="font-poppins font-medium py-4 w-3/4">
      Blurb, if any, for jurisdiction form communications (will probably only be here for large jurisdictions)
    </p>
  </div>
  <div class="w-5/6 h-2/6 flexy flex-row">
    <StatDisplay header="Total Funds Received" data={donut_data}/>
    <StatDisplay header="Services Received" data={donut_data2}/>
    <StatDisplay header="Total Participation" data={donut_data}/>
    <StatDisplay header="Transportation Projects" data={donut_data}/>
  </div>
  <div class="w-5/6 h-3/6 bg-hgac-slate text-slate-200 flexy">
    <StackedBarChart data={stackbar_data} yLabel="Population"/>
    <StackedBarChart data={stackbar_data} yLabel="Population"/>
  </div>
</div>
