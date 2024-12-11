<script lang="ts">
	import CardBlurb from "../fragments/cardBlurb.svelte";
import CardHeader from "../fragments/cardHeader.svelte";

  interface cardProps {
    projectName: string,
    projectBlurb: string,
    chart1: any
    chart2?: any
    chart3?: any
    chart4?: any
    chart5?: any
  }

  const props: cardProps = $props()

  let accordionFlag = $state(false);
  let accordionText = $derived.by(() => {
    if(accordionFlag === false)
      return "Show more metrics.." 
    return "Show fewer metrics"
  })
  const bar_data = [
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
<style>
.card-style {
  @apply
  flexy bg-white rounded-lg
}
</style>
<div class="flex-col w-10/12 items-center justify-center bg-white border-2 border-slate-700">
  <CardHeader projectName={props.projectName}/>
  <CardBlurb text={props.projectBlurb}/>
  <div class="grid grid-cols-2 gap-4 items-center justify-center px-12">
    <div class="card-style">
      <props.chart1 data={stackbar_data}/>
    </div>
      <!-- bar: tires count-->
      <div class="card-style">
        <props.chart2 data={bar_data} width={800} height={580} yLabel="Tire Count"/>
      </div>
    {#if accordionFlag}

      <!-- bar: volunteer count-->
      <div class="card-style">
        <props.chart3 data={bar_data} yLabel="Count"/>
      </div>
      <!-- bar: shoreline miles-->
      <div class="card-style">
        <props.chart4 data={bar_data} yLabel="Total Miles"/>
      </div>
      <!-- bar: cleanup sites-->
      <div class="card-style">
        <props.chart5 data={bar_data} yLabel="Cleanup Sites"/>
      </div>
    {/if}
  </div> 
  <button class="h-12 w-full bg-slate-700 text-white" 
      onclick={()=> {accordionFlag = !accordionFlag}}>
    {accordionText}
  </button>  
</div>

