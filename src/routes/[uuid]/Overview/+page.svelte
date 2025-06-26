<script lang="ts">
	import type { PageData} from "../../$types"
	import Indicator from "$routes/components/indicator.svelte";
	import StackedBarChart from "$routes/charts/StackedBarChart.svelte";
  import StatDisplay from "$routes/components/statDisplay.svelte";
  import {convertAllToDonut} from "$lib/scripts/convertPBtoD3.svelte";

  const {data}: {data: PageData } = $props() 


  const cheesedata = [
    {
      name: "Project 1",
      value: 2100,
    },
    {
      name: "Project 2",
      value: 1100,
    },
    {
      name: "Project 3",
      value: 2800,
    },
    {
      name: "Project 4",
      value: 3100,
    },
    {
      name: "Project 5",
      value: 2800,
    },
  ]

  const dataNames = cheesedata.map(item => item.name)
  const dataSumOfValues = cheesedata
    .map(item => item.value)
    .reduce((accumulator, currentValue) => accumulator + currentValue, 0)

  let dataTable = $state<HTMLElement>()


interface GroupData {
  Group: string;
  Current_Funds: number;
  Current_Services: number;
  Current_Total_Participation: number;
  Historical_Funds: {
    [year: string]: number;
  };
  Historical_Services: {
    [year: string]: number;
  };
}

type stackedTrash = {
  juris: string,
  historical_funds: number,
  current_funds: number,
}

  const fakeData: GroupData[] = data.fakeData

const groups = ["Transportation", "Environmental", "Workforce", "Public_Safety", "Community"];

const chartData = {
  CurrentFunding: convertAllToDonut(fakeData, groups, "Current_Funds"),
  Services: convertAllToDonut(fakeData, groups, "Current_Services"),
  Participation: convertAllToDonut(fakeData, groups, "Current_Total_Participation"),
  
    /*
  HistoricalFunds: convertAllToDonut(fakeData, groups, "Historical_Funds"),
  HistoricalServices: convertAllToDonut(fakeData, groups, "Historical_Services")
  */
};

  const tabColors = $derived(Object.values(data.dashboard_groups).map(item=>item.tab_color))
  const tabNames = $derived(Object.values(data.dashboard_groups).map(item=> item.tab_name).filter(tabName=> tabName !== "Overview"))

const stackbar_data: stackedTrash[] = [
  { 
    juris: '2020', 
    ...Object.fromEntries(tabNames.map((name, index) => [name, 700 + index * 50]))
  },
  { 
    juris: '2021', 
    ...Object.fromEntries(tabNames.map((name, index) => [name, 800 + index * 70]))
  },
  { 
    juris: '2022', 
    ...Object.fromEntries(tabNames.map((name, index) => [name, 800 + index * 20]))
  },
  { 
    juris: '2023', 
    ...Object.fromEntries(tabNames.map((name, index) => [name, 800 + index * 10]))
  },
  { 
    juris: '2024', 
    ...Object.fromEntries(tabNames.map((name, index) => [name, 800 + index * 100]))
  }
];


  const stackbar_services: stackedTrash[] = [
  { 
    juris: '2020', 
    ...Object.fromEntries(tabNames.map((name, index) => [name, 7 + index * 1]))
  },
  { 
    juris: '2021', 
    ...Object.fromEntries(tabNames.map((name, index) => [name, 5 + index * 1]))
  },
  { 
    juris: '2022', 
    ...Object.fromEntries(tabNames.map((name, index) => [name, 4 + index * 2]))
  },
  { 
    juris: '2023', 
    ...Object.fromEntries(tabNames.map((name, index) => [name, 8 + index * 1]))
  },
  { 
    juris: '2024', 
    ...Object.fromEntries(tabNames.map((name, index) => [name, 7 + index * 1]))
  }
  ];

  const blurb = ""
</script>

<!--
<div class="flex-col w-11/12 h-full z-10 overflow-y-auto">
  <div class="bg-slate-700 z-20">
    {#if blurb}
      <p class="font-poppins font-medium flexy text-slate-200 h-20">
      {blurb}
      </p>
    {/if}
  </div>
</div>
-->

<div class="fixed flex top-24 w-11/12 h-screen flex-col overflow-auto">
  <div class="grid grid-cols-2 h-screen sticky w-auto bg-slate-700 pt-6 px-auto place-items-center">
    <StatDisplay header="Current Funding" data={chartData.CurrentFunding} colors={tabColors} />
    <StatDisplay header="Services" data={chartData.Services} colors={tabColors} />
    <StatDisplay header="Total Participation" data={chartData.Participation} colors={tabColors} />

    <div class="bg-slate-700 h-full w-1/2 pt-12 flex place-items-center">
      <Indicator above={true} below={false} aboveText="Transportation Projects" belowText={"Projects: 7"} numericValue={1230000000} symbol_pre={"$"}/>
    </div>
  </div>

  <div class="w-full h-auto bg-slate-700 text-slate-200 flex items-center justify-center rounded-b-xl">
    <div class="grid grid-cols-2">
      <div class="transform scale-90 bg-slate-50 pt-8 pb-4 rounded-lg">
        <StackedBarChart data={stackbar_data} yLabel="Historical Funds" colorSet={tabColors}/>
      </div>
      <div class="transform scale-90 bg-slate-50 pt-8 pb-4 rounded-lg">
        <StackedBarChart data={stackbar_services} yLabel="Historical Services" colorSet={tabColors}/>
      </div>
    </div>
  </div>
</div>


<div class="opacity-0 scale-0" >
  <div bind:this={dataTable}>
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Value</th>
        </tr>
      </thead>
      <tbody>
        {#each cheesedata as {name, value}}
          <tr>
            <td>{name}</td>
            <td class="px-4">${value}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>
