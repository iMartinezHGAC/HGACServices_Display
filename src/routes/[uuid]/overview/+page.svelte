<script lang="ts">
	import type { PageData} from "../../$types"
	import StackedBarChart from "$routes/charts/StackedBarChart.svelte";
	import Indicator from "$routes/components/indicator.svelte";
  import StatDisplay from "$routes/components/statDisplay.svelte";
  import {convertAllToDonut} from "$lib/scripts/convertPBtoD3.svelte"
  const {data}: {data: PageData } = $props() 

  $inspect(data)

type stackedTrash = {
  juris: string,
  historical_funds: number,
  current_funds: number,
}
  const CurrentFunding = convertAllToDonut(data.fakeData, ["Transportation","Environmental", "Workforce", "Public_Safety","Community"], "Current_Funds")
  const Services = convertAllToDonut(data.fakeData, ["Transportation","Environmental", "Workforce", "Public_Safety","Community"], "Current_Services")
  const Participation = convertAllToDonut(data.fakeData, ["Transportation","Environmental", "Workforce","Public_Safety","Community"], "Current_Total_Participation")

const stackbar_data: stackedTrash[] = [
    { juris: 'Justice', historical_funds: 1000, current_funds: 900 },
    { juris: 'Transportation', historical_funds: 1000, current_funds: 1200 },
    { juris: 'Workforce', historical_funds: 1000, current_funds: 800 },
    { juris: 'Environment', historical_funds: 800, current_funds: 1100 },
    { juris: 'Public Safety', historical_funds: 1000, current_funds: 1000 },
    // More data entries...
  ];
  const stackbar_services: stackedTrash[] = [
    { juris: 'Justice', historical_services: 7, current_services: 5 },
    { juris: 'Transportation', historical_services: 11, current_services: 10 },
    { juris: 'Workforce', historical_services: 10, current_services: 8 },
    { juris: 'Environment', historical_services: 3, current_services: 7 },
    { juris: 'Public Safety', historical_services: 16, current_services: 16 },
    // More data entries...
  ];

  const groupColors = ["#025773", "#7AB66F", "#B4B4B4", "#FEF9C3", "#F1F5F9"]
  const blurb = "Blurb, if any, for communications (will probably only be here for large jurisdictions)"
</script>

<div class="flex-col w-11/12 h-full z-10 overflow-y-auto">
  <div class="bg-slate-700 z-20">
    {#if blurb}
      <p class="font-poppins font-medium flexy text-slate-200 h-20">
        {blurb}
      </p>
    {/if}
  </div>
  <div class="w-fill h-96 flexy flex-row">
    <StatDisplay 
      header="Current Funding" 
      data={CurrentFunding} 
      index={0} 
      preSymbol="$" 
      postSymbol="K"
      colors={groupColors}
    />
    <StatDisplay header="Services" data={Services} index={0} preSymbol="" postSymbol="" colors={groupColors}/>
    <StatDisplay header="Participation" data={Participation} index={0} preSymbol="" postSymbol="" colors={groupColors}/>
    <div class="bg-slate-700 flexy h-full w-1/4">
      <Indicator above={true} below={false} aboveText="Transportation Projects" belowText={""} numericValue={7}/>
    </div>
  </div>
  <div class="w-full h-auto bg-slate-700 text-slate-200 flex items-center justify-center rounded-b-xl">
    <div class="grid grid-cols-2">
      <div class="transform scale-90 bg-slate-200 pt-6 pb-4 rounded-lg">
        <StackedBarChart data={stackbar_data} yLabel="Historic & Current Funds" colorSet={["blue", "skyblue"]}/>
      </div>
      <div class="transform scale-90 bg-slate-200 pt-6 pb-4 rounded-lg">
        <StackedBarChart data={stackbar_services} yLabel="Historic & Curent Services" colorSet={groupColors}/>
      </div>
    </div>
  </div>
</div>
<!--
  Current 2024
  Historical 2023
  One bar for each group
  Color
    Green for environmental
      From saturated to desaturated
        Current to Historical
          Split historical funding by percenthistorical_funds to fake 2022, 2021, 2020 data
  
-->
