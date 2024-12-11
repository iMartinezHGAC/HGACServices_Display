<script lang="ts">
	import BarChart from '../../charts/BarChart.svelte';
	import FilledAreaChart from '../../charts/FilledAreaChart.svelte';
  import LinePlot from '../../charts/LinePlot.svelte';
	import StackedBarChart from '../../charts/StackedBarChart.svelte';
  import type { PageData } from './$types'

let { data }: { data: PageData } = $props();

let projectName = $derived(data.projectName)

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
</script>

  
{#if projectName === "trash_bash"}
  <!-- stacked bar: trash tons & recycling tons -->
  <StackedBarChart data={stackbar_data}/>
  <!-- bar: tires count-->
  <BarChart data={bar_data} yLabel="Tire Count"/>
  <!-- bar: volunteer count-->
  <BarChart data={bar_data} yLabel="Count"/>
  <!-- bar: shoreline miles-->
  <BarChart data={bar_data} yLabel="Total Miles"/>
  <!-- bar: cleanup sites-->
  <BarChart data={bar_data} yLabel="Cleanup Sites"/>

{:else if projectName=== "livable_centers"}
  <!-- bar: projects count-->
  <BarChart data={bar_data} yLabel="Count"/>
  <!-- line: funding dollars-->
  <LinePlot yLabel="Funding Dollars ($)" marginLeft={40} yLabelMargin={70}/>
  <!-- stacked area: studies adopted count-->
  <FilledAreaChart data={area_data}/>
  <!-- stacked area: recommendations implemented count-->
  <FilledAreaChart data={area_data}/>
  <!-- stacked area: legacy studies-->
  <FilledAreaChart data={area_data}/>
  <!-- stacked area: maturing studies-->
  <FilledAreaChart data={area_data}/>
  <!-- bar: new studies count-->
  <BarChart data={bar_data} yLabel="count"/>
  <!-- bar: vmt reduction-->
  <BarChart data={bar_data} yLabel="count"/>

{:else if projectName === "regional_conservation"}
  <div class="grid gap-4 h-full mt-96 pb-32 flex-wrap overflow-auto">
    <!-- bar: priority projects count -->
    <BarChart data={bar_data} yLabel="Project Count"/>
    <!-- bar: tech assistance -->
    <BarChart data={bar_data} yLabel="Assistance Given"/>
    <!-- bar: meetings count -->
    <BarChart data={bar_data} yLabel="# Meetings"/>
    <!-- bar: meeting hours count -->
    <BarChart data={bar_data} yLabel="Meeting hours"/>
    <!-- line: pp_funding collars -->
    <LinePlot yLabel="Funding Dollars ($)" marginLeft={40} yLabelMargin={70}/>
    <!-- stacked area: data request hours-->
    <FilledAreaChart data={area_data}/>
    <!-- line: funding dollars lev-->
    <LinePlot yLabel="Funding Dollars lev" marginLeft={40} yLabelMargin={70}/>
  </div>
{:else if projectName === "solid_waste"}
<div class="flexy flex-col h-full overflow-auto pt-40">
  <h1>{projectName}</h1>
  <div class="flexy flex-wrap h-full pt-10 pb-40 overflow-auto">
    <!-- bar: workshop attendees -->
      <BarChart data={bar_data} yLabel="# Attendees" width={800} height={500}/>
    <!-- bar: tech assistance -->
      <BarChart data={bar_data} yLabel="Assistance Given"/>
    <!-- line: grant dollars -->
    <LinePlot yLabel="Dollars"/>
  </div>
</div>
{/if}
