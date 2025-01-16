<script lang="ts">
	import type { PageData} from "../$types";
	import StackedBarChartTb from "../charts/StackedBarChartTB.svelte";
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
  const CurrentFunding = convertAllToDonut(data.fakeData, ["Transportation","Environmental", "Workforce", "Community","Public_Safety"], "Current_Funds")
  const Services = convertAllToDonut(data.fakeData, ["Transportation","Environmental", "Workforce", "Community","Public_Safety"], "Current_Services")
  const Participation = convertAllToDonut(data.fakeData, ["Transportation","Environmental", "Workforce","Community", "Public_Safety"], "Current_Total_Participation")

  console.log(CurrentFunding)
const stackbar_data: stackedTrash[] = [
    { juris: 'Justice', historical_funds: 1000, current_funds: 1000 },
    { juris: 'Justice', historical_funds: 2400, current_funds: 1500 },
    { juris: 'Justice', historical_funds: 3700, current_funds: 2700 },
    { juris: 'Justice', historical_funds: 4900, current_funds: 1200 },
    { juris: 'Workforce', historical_funds: 1000, current_funds: 800 },
    { juris: 'Workforce', historical_funds: 2000, current_funds: 1200 },
    { juris: 'Workforce', historical_funds: 3000, current_funds: 1700 },
    { juris: 'Workforce', historical_funds: 4000, current_funds: 1000 },
    { juris: 'Environment', historical_funds: 100, current_funds: 1100 },
    { juris: 'Environment', historical_funds: 200, current_funds: 1500 },
    { juris: 'Environment', historical_funds: 300, current_funds: 1300 },
    { juris: 'Environment', historical_funds: 400, current_funds: 1100 },
    { juris: 'Criminal Justice', historical_funds: 100, current_funds: 800 },
    { juris: 'Criminal Justice', historical_funds: 200, current_funds: 1800 },
    { juris: 'Criminal Justice', historical_funds: 300, current_funds: 2200 },
    { juris: 'Criminal Justice', historical_funds: 400, current_funds: 900 },
    // More data entries...
  ];

  const groupColors = ["#025773", "#7AB66F", "#B4B4B4", "#EF9021", "#25B5AF"]
</script>

<div in:fly={{x:300}} out:fly={{x:-400}} class="flexy flex-col fixed top-28 h-fit w-full z-10">
  <div class="w-11/12 h-12 flexy bg-slate-700 text-slate-200 flex rounded-t-lg">
    <p class="font-poppins font-medium py-4 w-3/4 flexy">
      Blurb, if any, for jurisdiction form communications (will probably only be here for large jurisdictions)
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
  </div>
  <div class="w-11/12 h-3/6 bg-hgac-slate text-slate-200 px-6 grid grid-cols-2">
    <StackedBarChartTb data={stackbar_data} yLabel="Historic Funds Received"/>
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
