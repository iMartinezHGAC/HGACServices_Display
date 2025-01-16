<script lang="ts">
	import type { PageData} from "../$types";
	import StackedBarChartTb from "../charts/StackedBarChartTB.svelte";
	import Indicator from "../components/indicator.svelte";
  import StatDisplay from "../components/statDisplay.svelte";
  import {fly} from "svelte/transition"
  const {data}: {data: PageData } = $props() 

  $inspect(data)



  function doesGroupExist(objectArray: serviceType[], group: string) {
    return objectArray.find(item => item.Group === group)
  }

  function calculateCategoryTotal(objectArray: serviceType[], group: string, category: serviceKey) {
    const total = objectArray
      .filter((item: serviceType) => item.Group===group)
      .reduce((totalValue: number, currentItem: serviceType) => {
        return totalValue += currentItem[category] as number
    }, 0)
    return total
  }

  function getGroupTotal(objectArray: serviceType[], group: string, category: serviceKey) {
    if(!doesGroupExist(objectArray, group)) return -1;
    return calculateCategoryTotal(objectArray, group, category)
  }

  function donutGetCurrentFunds(objectArray: serviceType[], group: string, category: serviceKey) {
    return {
      name: group,
      value: getGroupTotal(objectArray, group, category)
    }
  }

  function convertAllToDonut(objectArray: serviceType[], groups: string[], category: serviceKey) {
    let newObjectArray: donutType[] = []
    groups.forEach((group: string) => {
      newObjectArray.push(donutGetCurrentFunds(objectArray, group, category))
    })
    return newObjectArray
  }

type stackedTrash = {
  juris: string,
  historical_funds: number,
  current_funds: number,
}
  const CurrentFunding = convertAllToDonut(data.fakeData, ["Transportation","Environmental", "Workforce", "Public_Safety","Community"], "Current_Funds")
  const Services = convertAllToDonut(data.fakeData, ["Transportation","Environmental", "Workforce", "Public_Safety","Community"], "Current_Services")
  const Participation = convertAllToDonut(data.fakeData, ["Transportation","Environmental", "Workforce","Public_Safety","Community"], "Current_Total_Participation")

  console.log(CurrentFunding)
const stackbar_data: stackedTrash[] = [
    { juris: 'Justice', historical_funds: 1000, current_funds: 900 },
    { juris: 'Transportation', historical_funds: 1000, current_funds: 1200 },
    { juris: 'Workforce', historical_funds: 1000, current_funds: 800 },
    { juris: 'Environment', historical_funds: 800, current_funds: 1100 },
    { juris: 'Public Safety', historical_funds: 1000, current_funds: 1000 },
    // More data entries...
  ]
  ;const stackbar_services: stackedTrash[] = [
    { juris: 'Justice', historical_services: 7, current_services: 15 },
    { juris: 'Transportation', historical_services: 11, current_services: 10 },
    { juris: 'Workforce', historical_services: 10, current_services: 8 },
    { juris: 'Environment', historical_services: 8, current_services: 13 },
    { juris: 'Public Safety', historical_services: 12, current_services: 12 },
    // More data entries...
  ];

  const groupColors = ["#025773", "#7AB66F", "#B4B4B4", "#FEF9C3", "#F1F5F9"]
</script>

<div in:fly={{x:300}} out:fly={{x:-400}} class="flexy flex-col fixed top-28 h-fit w-full z-10">
  <div class="w-11/12 h-12 flexy bg-slate-700 text-slate-200 flex rounded-t-lg">
    <p class="font-poppins font-medium py-4 w-3/4 flexy">
      Blurb, if any, for communications (will probably only be here for large jurisdictions)
    </p>
  </div>
  <div class="w-11/12 h-96 flexy flex-row">
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
    <div class="bg-slate-700 flexy h-full w-1/4 pr-10">
      <Indicator above={true} below={false} aboveText="Transportation Projects" belowText={""} numericValue={7}/>
    </div>
  </div>
  <div class="w-11/12 bg-hgac-slate text-slate-200 px-6 flex items-center justify-start">
    <div class="transform scale-75 mb-96 w-1/2">
      <StackedBarChartTb data={stackbar_data} yLabel="Historic & Current Funds" colorSet={["blue", "skyblue"]}/>
    </div>
    <div class="transform scale-75 mb-96 w-1/2">
      <StackedBarChartTb data={stackbar_services} yLabel="Historic & Curent Services" colorSet={groupColors}/>
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
</div>
