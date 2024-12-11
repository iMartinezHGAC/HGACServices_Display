<script lang="ts">
	import CardBlurb from "../fragments/cardBlurb.svelte";
import CardHeader from "../fragments/cardHeader.svelte";

  interface cardProps {
    projectName: string,
    projectBlurb: string,
    chart1: any
    chartTitle1: string
    chart2?: any
    chartTitle2?: string
    chart3?: any
    chartTitle3?: string
    chart4?: any
    chartTitle4?: string
    chart5?: any
    chartTitle5?: string
  }

  const props: cardProps = $props()

  let accordionFlag = $state(false);
  let accordionText = $derived.by(() => {
    if(accordionFlag === false)
      return "Show more metrics.." 
    return "Show fewer metrics"
  })
  const bar_data = [
      { juris: 'Travis', frequency: 55 },
      { juris: 'Montgomery', frequency: 36 },
      { juris: 'Waller', frequency: 25 },
      { juris: 'Fort Bend', frequency: 75 },
      { juris: 'Tarrant', frequency: 40 },
      { juris: 'Galveston', frequency: 35 },
      { juris: 'Bexar', frequency: 40 },
      { juris: 'Harris', frequency: 90 }
    ];
  const bar_data_hist = [
      { juris: 'Travis', frequency: 25 },
      { juris: 'Montgomery', frequency: 30 },
      { juris: 'Waller', frequency: 55 },
      { juris: 'Fort Bend', frequency: 65 },
      { juris: 'Tarrant', frequency: 15 },
      { juris: 'Galveston', frequency: 40 },
      { juris: 'Bexar', frequency: 20 },
      { juris: 'Harris', frequency: 90 }
    ];
  const stackbar_data = [
      { juris: 'Harris', age: '18-24', population: 2800 },
      { juris: 'Harris', age: '25-34', population: 2200 },
      { juris: 'Harris', age: '35-44', population: 1700 },
      { juris: 'Harris', age: '45-54', population: 1300 },
      { juris: 'Harris', age: '55-64', population: 1200 },
      { juris: 'Fort Bend', age: '18-24', population: 1200 },
      { juris: 'Fort Bend', age: '25-34', population: 1600 },
      { juris: 'Fort Bend', age: '35-44', population: 1200 },
      { juris: 'Fort Bend', age: '45-54', population: 700 },
      { juris: 'Fort Bend', age: '55-64', population: 1100 },
      { juris: 'Waller', age: '18-24', population: 2100 },
      { juris: 'Waller', age: '25-34', population: 2500 },
      { juris: 'Waller', age: '35-44', population: 1100 },
      { juris: 'Waller', age: '45-54', population: 900 },
      { juris: 'Waller', age: '55-64', population: 1400 },
      // More data entries...
    ];
  const stackbar_data_hist = [
      { juris: 'Harris', age: '18-24', population: 1000 },
      { juris: 'Harris', age: '25-34', population: 1500 },
      { juris: 'Harris', age: '35-44', population: 2700 },
      { juris: 'Harris', age: '45-54', population: 1200 },
      { juris: 'Harris', age: '55-64', population: 1800 },
      { juris: 'Fort Bend', age: '18-24', population: 800 },
      { juris: 'Fort Bend', age: '25-34', population: 1200 },
      { juris: 'Fort Bend', age: '35-44', population: 1700 },
      { juris: 'Fort Bend', age: '45-54', population: 1000 },
      { juris: 'Fort Bend', age: '55-64', population: 1800 },
      { juris: 'Waller', age: '18-24', population: 1100 },
      { juris: 'Waller', age: '25-34', population: 1500 },
      { juris: 'Waller', age: '35-44', population: 1300 },
      { juris: 'Waller', age: '45-54', population: 1100 },
      { juris: 'Waller', age: '55-64', population: 1800 },
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

  let timeFlag = $state(false)
  function toggleTime(timeline: boolean) {
    timeFlag = timeline
  }

</script>
<style>
  .card-style {
    @apply
    flexy bg-white rounded-lg
  }
</style>
<div class="flex-col w-10/12 items-center justify-center bg-white border-2 border-slate-700">
  <div class="flex flex-col bg-slate-500">
    <CardHeader projectName={props.projectName} {toggleTime} color="light"/>
    <CardBlurb text={props.projectBlurb}/>
  </div>
  <div class="grid grid-cols-2 gap-4 items-center justify-center px-12">
    {#if timeFlag}
    <div class="card-style">
      <props.chart1 data={bar_data_hist} yLabel={props.chartTitle1}/>
    </div>
      <!-- bar: tires count-->
      <div class="card-style">
        <props.chart2 data={bar_data_hist} yLabel={props.chartTitle2}/>
      </div>
    {:else} 
    <div class="card-style">
      <props.chart1 data={bar_data} yLabel={props.chartTitle1}/>
    </div>
      <div class="card-style">
        <props.chart2 data={bar_data} yLabel={props.chartTitle2}/>
      </div>
    {/if}
    {#if accordionFlag}
      <div class="card-style">
        <props.chart3 data={[7,18,20,11,24]} yLabel={props.chartTitle3}/>
      </div>
    {/if}
  </div> 
  <button class="h-12 w-full bg-slate-500 text-white" 
      onclick={()=> {accordionFlag = !accordionFlag}}>
    {accordionText}
  </button>  
</div>

