<script lang="ts">
	import BarChart from "../charts/BarChart.svelte";
	import FilledAreaChart from "../charts/FilledAreaChart.svelte";
	import LinePlot from "../charts/LinePlot.svelte";
	import StackedBarChart from "../charts/StackedBarChart.svelte";

  import clock from "$lib/assets/clock.svg";
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

  let timeline = "Current"
  let accordianFlag = false;
  let accordionText = $derived.by(() => {
    accordianFlag === false ? "Show more metrics.." : "Show fewer metrics"
  })
</script>

<style>
.card-style {
  @apply
  flexy bg-white rounded-lg
}
</style>

<div class="fixed top-28 flex flex-col items-center justify-center w-screen h-screen overflow-auto pt-[136%] pb-[100%]">
  <div class="flex-col w-10/12 items-center justify-center bg-white px-8 border-2 border-slate-700">
      <h1 class="flex font-metropolis text-5xl font-[900] py-10 bg-slate-700 text-white items-start justify-start text-start ">
        Trash Bash
        <div class="flex flex-grow"></div>
        <button class="flex items-center justify-center text-center px-12" onclick={()=> timeline === "Current" ? timeline = "Historical" : timeline = "Current"}>
          <img src={clock} alt="clock">
          <p class="text-xl font-metropolis px-8 w-12 text-white ">
          {timeline}
          </p>
        </button>
      </h1>
    <p class="flex justify-start text-white font-metropolis text-3xl font-semibold pb-6 pl-12">
      lorem epso facto whateverso
    </p>
      <div class="grid grid-cols-2 gap-4 items-center justify-center">
        <div class="card-style">
        <StackedBarChart data={stackbar_data}/>
        </div>
        <!-- bar: tires count-->
        <div class="card-style">
        <BarChart data={bar_data} width={800} height={580} yLabel="Tire Count"/>
        </div>
      {#if accordianFlag}
        <!-- bar: volunteer count-->
        <div class="card-style">
        <BarChart data={bar_data} yLabel="Count"/>
        </div>
        <!-- bar: shoreline miles-->
        <div class="card-style">
        <BarChart data={bar_data} yLabel="Total Miles"/>
        </div>
        <!-- bar: cleanup sites-->
        <div class="card-style">
        <BarChart data={bar_data} yLabel="Cleanup Sites"/>
        </div>
      {/if}

      </div> 
    <button class="h-12 w-full bg-slate-700 text-white" onclick={()=> {
      accordianFlag = !accordianFlag

    }>
      {accordionText}
    </button>  
    </div>
  <div>
 <div class="flex-col w-10/12 items-center justify-center bg-slate-500">
      <h1 class="flex font-metropolis text-5xl font-[900] p-10 text-white items-center justify-center text-center">
        Livable Centers
        <button  class="flexy px-12" onclick={()=> timeline === "Current" ? timeline = "Historical" : timeline = "Current"}>
          <img src={clock} alt="clock">
          <p class="text-xl font-metropolis px-8 w-12">
          {timeline}
          </p>
        </button>
      </h1>
      <div class="grid grid-cols-2 gap-4 items-center justify-center">
        <div class="card-style">
         <BarChart data={bar_data} yLabel="Count"/>
        </div>
        <!-- line: funding dollars-->
        <div class="card-style">
        <LinePlot yLabel="Funding Dollars ($)" marginLeft={40}  yLabelMargin={70}/>
        </div>
        <!-- stacked area: studies adopted count-->
        <div class="card-style">
        <FilledAreaChart data={area_data}/>
        </div>
        <!-- stacked area: recommendations implemented count-->
        <div class="card-style">
        <FilledAreaChart data={area_data}/>
        </div>
        <!-- stacked area: legacy studies-->
        <div class="card-style">
        <FilledAreaChart data={area_data}/>
        </div>
        <!-- stacked area: maturing studies-->
        <div class="card-style">
        <FilledAreaChart data={area_data}/>
        </div>
        <!-- bar: new studies count-->
        <div class="card-style">
        <BarChart data={bar_data} yLabel="count"/>
        </div>
        <!-- bar: vmt reduction-->
        <div class="card-style">
        <BarChart data={bar_data} yLabel="count"/>
        </div>
      </div> 
    </div>
  </div>
 <div class="flex-col w-10/12 items-center justify-center bg-slate-700">
      <h1 class="flex font-metropolis text-5xl font-[900] p-10 text-white items-center justify-center text-center">
        Regional Conservation
        <button  class="flexy px-12" onclick={()=> timeline === "Current" ? timeline = "Historical" : timeline = "Current"}>
          <img src={clock} alt="clock">
          <p class="text-xl font-metropolis px-8 w-12">
          {timeline}
          </p>
        </button>
      </h1>
      <div class="grid grid-cols-2 gap-4 items-center justify-center">
        <div class="card-style">
    <!-- bar: priority projects count -->
    <BarChart data={bar_data} yLabel="Project Count"/>
      </div> 
        <div class="card-style">
    <!-- bar: tech assistance -->
    <BarChart data={bar_data} yLabel="Assistance Given"/>
      </div> 
        <div class="card-style">
    <!-- bar: meetings count -->
    <BarChart data={bar_data} yLabel="# Meetings"/>
      </div> 
        <div class="card-style">
    <!-- bar: meeting hours count -->
    <BarChart data={bar_data} yLabel="Meeting hours"/>
      </div> 
        <div class="card-style">
    <!-- line: pp_funding collars -->
    <LinePlot yLabel="Funding Dollars ($)" marginLeft={40} yLabelMargin={70}/>
      </div> 
        <div class="card-style">
    <!-- stacked area: data request hours-->
    <FilledAreaChart data={area_data}/>
      </div> 
        <div class="card-style">
    <!-- line: funding dollars lev-->
    <LinePlot yLabel="Funding Dollars lev" marginLeft={40} yLabelMargin={70}/>
      </div> 
     </div>
    </div>
 <div class="flex-col w-10/12 items-center justify-center bg-slate-500">
      <h1 class="flex font-metropolis text-5xl font-[900] p-10 text-white items-center justify-center text-center">
        Solid Waste
        <button  class="flexy px-12" onclick={()=> timeline === "Current" ? timeline = "Historical" : timeline = "Current"}>
          <img src={clock} alt="clock">
          <p class="text-xl font-metropolis px-8 w-12">
          {timeline}
          </p>
        </button>
      </h1>
      <div class="grid grid-cols-2 gap-4 items-center justify-center">
        <div class="card-style">
      <!-- bar: workshop attendees -->
        <BarChart data={bar_data} yLabel="# Attendees" width={800} height={500}/>
      </div> 
        <div class="card-style">
      <!-- bar: tech assistance -->
        <BarChart data={bar_data} yLabel="Assistance Given"/>
      </div> 
        <div class="card-style">
      <!-- line: grant dollars -->
      <LinePlot yLabel="Dollars"/>
      </div> 
    </div> 
  </div>
  </div>

