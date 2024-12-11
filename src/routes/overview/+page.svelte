<script lang="ts">
	import BarChart from "../charts/BarChart.svelte";
	import DonutChart from "../charts/DonutChart.svelte";
	import FilledAreaChart from "../charts/FilledAreaChart.svelte";
	import StackedBarChart from "../charts/StackedBarChart.svelte";
	import Indicator from "../components/indicator.svelte";
import StatDisplay from "../components/statDisplay.svelte";
  import {fly} from "svelte/transition"

const donut_data = [
    {name: 'Harris', value: 100}, {name: 'Fort Bend', value: 200}, {name: 'Waller', value: 300}]
const donut_data2 = [{name: 'Harris', value: 200}, {name: 'Fort Bend', value: 300}, {name: 'Waller', value: 350}]
const donut_data3 = [
    {name: 'Fort Bend', value: 127}, 
    {name: 'Harris', value: 270}, 
    {name: 'Waller', value: 188},
    {name: 'Montgomery', value: 72}
  ]
const donut_data4 = [
    {name: 'Waller', value: 198},
    {name: 'Harris', value: 370}, 
    {name: 'Fort Bend', value: 427}, 
    {name: 'Montgomery', value: 272}
  ]
const bar_data = [
    { juris: 'A', frequency: 25 },
    { juris: 'Montgomery', frequency: 30 },
    { juris: 'Waller', frequency: 55 },
    { juris: 'Fort Bend', frequency: 65 },
    { juris: 'C', frequency: 15 },
    { juris: 'Galveston', frequency: 40 },
    { juris: 'B', frequency: 20 },
    { juris: 'Harris', frequency: 90 }
  ];

const area_data  = [
    { date: new Date('2021-01-01'), juris: 'Harris County', unemployed: 500 },
    { date: new Date('2021-01-01'), juris: 'Fort Bend County', unemployed: 300 },
    { date: new Date('2021-01-01'), juris: 'Tarrant County', unemployed: 700 },
    { date: new Date('2021-02-01'), juris: 'Harris County', unemployed: 450 },
    { date: new Date('2021-02-01'), juris: 'Fort Bend County', unemployed: 350 },
    { date: new Date('2021-02-01'), juris: 'Tarrant County', unemployed: 200 },
    { date: new Date('2021-03-01'), juris: 'Harris County', unemployed: 600 },
    { date: new Date('2021-03-01'), juris: 'Fort Bend County', unemployed: 200 },
    { date: new Date('2021-03-01'), juris: 'Tarrant County', unemployed: 500 },
    // Add more data points...
  ];

const stackbar_data = [
    { juris: 'Harris', age: '18-24', population: 1000 },
    { juris: 'Harris', age: '25-34', population: 1500 },
    { juris: 'Harris', age: '35-44', population: 2700 },
    { juris: 'Harris', age: '45-54', population: 1200 },
    { juris: 'Fort Bend', age: '18-24', population: 800 },
    { juris: 'Fort Bend', age: '25-34', population: 1200 },
    { juris: 'Fort Bend', age: '35-44', population: 1700 },
    { juris: 'Fort Bend', age: '45-54', population: 1000 },
    { juris: 'Waller', age: '18-24', population: 1100 },
    { juris: 'Waller', age: '25-34', population: 1500 },
    { juris: 'Waller', age: '35-44', population: 1300 },
    { juris: 'Waller', age: '45-54', population: 1100 },
    // More data entries...
  ];
</script>

<div in:fly={{x:300}} out:fly={{x:-400}} class="flexy flex-col fixed top-16 h-screen w-full -z-10">
  <div class="w-5/6 h-1/12 flexy  bg-slate-600 text-slate-200 flex rounded-t-lg">
    <p class="font-poppins font-medium py-4 w-3/4 flexy">
      Blurb, if any, for jurisdiction form communications (will probably only be here for large jurisdictions)
    </p>
  </div>
  <div class="w-5/6 h-2/6 flexy flex-row">
    <StatDisplay header="Total Funds Received" data={donut_data}/>
    <StatDisplay header="Services Received" data={donut_data2}/>
    <StatDisplay header="Total Participation" data={donut_data3}/>
    <StatDisplay header="Transportation Projects" data={donut_data4}/>
  </div>
  <div class="w-5/6 h-3/6 bg-hgac-slate text-slate-200 px-6 grid grid-cols-2">
    <div class="transform scale-[70%] -translate-y-20">
    <StackedBarChart data={stackbar_data} yLabel="Historic Funds Received"/>
    </div>
    <div class="transform scale-[70%] -translate-y-20">
    <StackedBarChart data={stackbar_data} yLabel="Historic Services Received"/>
    </div>
  </div>
</div>
