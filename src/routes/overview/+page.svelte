<script lang="ts">
	import type { PageData } from "../$types";
  import StackedBarChart from "../charts/StackedBarChart.svelte";
  import StatDisplay from "../components/statDisplay.svelte";
  import {fly} from "svelte/transition"
  const {data}: {data: PageData} = $props() 

  type serviceType = {
    Group: string,
    Program: string,
    Current_Funds: number,
    Current_Services: number,
    Current_Total_Participation: number | null,
    Historical_Funds: number,
  }

  $inspect(data.json)

  const donutGroups = data.json.reduce((acc, item)=> {
    if(!acc[item.Group]) {
      acc[item.Group] = []
    }
    acc[item.Group].push(item)
    return acc
  })

  const donutCommunity = donutGroups.Community.map((item: serviceType) => ({
    name: item.Program,
    value: item.Current_Funds
  }))

  const donutEnvironmental = donutGroups.Environmental.map((item: serviceType) => ({
    name: item.Program,
    value: item.Current_Funds
  }))
  const donutTransportation = donutGroups.Transportation.map((item: serviceType) => ({
    name: item.Program,
    value: item.Current_Funds
  }))
  const donutWorkforce = donutGroups.Workforce.map((item: serviceType) => ({
    name: item.Program,
    value: item.Current_Funds
  }))  
  const donutCriminal = donutGroups.Criminal_Justice.map((item: serviceType) => ({
    name: item.Program,
    value: item.Current_Funds
  }))

  const currentStack = data.json.map((item: serviceType) => ({
    juris: item.Program,
    age: item.Group,
    population: item.Current_Funds,
  }))
  $inspect(currentStack)
  const historyStack = data.json.map((item: serviceType) => ({
    juris: item.Program,
    age: item.Group,
    population: item.Current_Funds,
  }))
  $inspect(historyStack)
const stackbar_data = [
    { juris: 'Justice', age: 'geoma', population: 1000 },
    { juris: 'Justice', age: '25-34', population: 1500 },
    { juris: 'Justice', age: '35-44', population: 2700 },
    { juris: 'Justice', age: '45-54', population: 1200 },
    { juris: 'Workforce', age: 'geoma', population: 800 },
    { juris: 'Workforce', age: '25-34', population: 1200 },
    { juris: 'Workforce', age: '35-44', population: 1700 },
    { juris: 'Workforce', age: '45-54', population: 1000 },
    { juris: 'Environment', age: 'geoma', population: 1100 },
    { juris: 'Environment', age: '25-34', population: 1500 },
    { juris: 'Environment', age: '35-44', population: 1300 },
    { juris: 'Environment', age: '45-54', population: 1100 },
    { juris: 'Criminal Justice', age: 'geoma', population: 800 },
    { juris: 'Criminal Justice', age: '25-34', population: 1800 },
    { juris: 'Criminal Justice', age: '35-44', population: 2200 },
    { juris: 'Criminal Justice', age: '45-54', population: 900 },
    // More data entries...
  ];
</script>

<div in:fly={{x:300}} out:fly={{x:-400}} class="flexy flex-col fixed top-28 h-fit w-full z-10">
  <div class="w-11/12 h-12 flexy bg-slate-700 text-slate-200 flex rounded-t-lg">
    <p class="font-poppins font-medium py-4 w-3/4 flexy">
      Blurb, if any, for jurisdiction form communications (will probably only be here for large jurisdictions)
    </p>
  </div>
  <div class="w-11/12 h-96 flexy flex-row">
    <StatDisplay header="Community" data={donutCommunity} index={0} preSymbol="$" postSymbol="M"/>
    <StatDisplay header="Environmental" data={donutEnvironmental} index={1} postSymbol=""/>
    <StatDisplay header="Transportation" data={donutTransportation} index={2} />
    <StatDisplay header="Workforce" data={donutWorkforce} index={3}/>
    <StatDisplay header="Criminal Justice" data={donutCriminal} index={3}/>
  </div>
  <div class="w-11/12 h-3/6 bg-hgac-slate text-slate-200 px-6 grid grid-cols-2">

    <div class="transform scale-[70%] -translate-y-20">
    <StackedBarChart data={historyStack} yLabel="Historic Funds Received"/>
    </div>
    <div class="transform scale-[70%] -translate-y-20">
    <StackedBarChart data={currentStack} yLabel="Historic Funds Received"/>
    </div>
  </div>
</div>
