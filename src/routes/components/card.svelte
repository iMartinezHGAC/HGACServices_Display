<script lang="ts">
	import CardBlurb from "../fragments/cardBlurb.svelte";
  import CardHeader from "../fragments/cardHeader.svelte";
  import { page } from "$app/state";
	import CardBlurbTb from "../fragments/cardBlurbTB.svelte";
	import StackedBarChartTb from "../charts/StackedBarChartTB.svelte";
	import AdditionalWork from "./additionalWork.svelte";

  let tb_for_key: Trashbash
  type tbKey = keyof typeof tb_for_key

  function makeBarData(dataset: Trashbash[], key: tbKey) {
    if(dataset) {
    return dataset.map((item: Trashbash) => ({
        juris: item.expand.collection_site_id.site_name,
        value: item[key]
      }))    }
  }

  function makeStackedBarData(dataset: Trashbash[], key1: tbKey, key2: tbKey) {
    if(dataset) {
    return dataset.map((item: Trashbash) => ({
        juris: item.expand.collection_site_id.site_name,
        recycled_pounds: item[key2],
        trash_pounds: item[key1],
      })).filter((item: any) => item.trash_pounds !== 0)
    }
  }

  let stackedTrash = $derived(makeStackedBarData(page.data.trashbash, "trash_pounds" as tbKey, "recycled_pounds" as tbKey))
  $inspect(stackedTrash)
  let trash_pounds = $derived(makeBarData(page.data.trashbash, "trash_pounds" as tbKey))
  let tires  = $derived(makeBarData(page.data.trashbash, "tires" as tbKey))
  let recycled_pounds = $derived(makeBarData(page.data.trashbash, "recycled_pounds" as tbKey))
  let tot_volunteer_count = $derived(makeBarData(page.data.trashbash, "tot_volunteer_count" as tbKey))
  let vol_under_18= $derived(makeBarData(page.data.trashbash, "vol_under_18" as tbKey))
  let vol_scouts= $derived(makeBarData(page.data.trashbash, "vol_scouts" as tbKey))
  let miles_cleaned = $derived(makeBarData(page.data.trashbash, "miles_cleaned" as tbKey))

  interface cardProps {
    projectName: string,
    projectBlurb: string,
    projectLinks: string[],
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
  const bar_data_TB = [
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

  $inspect(props.projectLinks)
  let linkUrls = $derived(props.projectLinks.map(
    (item: any) => item.url_string)
  )

  $inspect(linkUrls)
</script>

<div class="flex-col w-10/12 items-center justify-center bg-white border-2 border-slate-700 mb-4 rounded-b-md">
  <div class="flex flex-col bg-slate-700">
    <CardHeader projectName={props.projectName} {toggleTime} color="dark"/>
    <CardBlurbTb text={props.projectBlurb} links={linkUrls}/>
  </div>
  <div class="grid grid-cols-2 gap-2 items-center justify-center px-12">
    {#if trash_pounds }
      <div class="card-style">
        <StackedBarChartTb data={stackedTrash} yLabel={"Trash and Recycled Pounds"}/>
      </div>
        <!-- bar: tires count -->
      <div class="card-style">
        <props.chart2 data={trash_pounds} width={800} height={580} yLabel={"Trash Pounds"}/>
      </div>
    {/if}
    {#if accordionFlag}
      <!-- bar: volunteer count-->
      <div class="card-style">
        <props.chart3 data={tires} yLabel={"Tires"}/>
      </div>
      <!-- bar: shoreline miles-->
      <div class="card-style">
        <props.chart4 data={recycled_pounds} yLabel={"Recycled Pounds"}/>
      </div>
      <!-- bar: cleanup sites-->
      <div class="card-style">
        <props.chart5 data={tot_volunteer_count} yLabel={"Total Volunteer Count"}/>
      </div>
      <div class="card-style">
        <props.chart5 data={miles_cleaned} yLabel={"Miles Cleaned"}/>
      </div>
      <div class="card-style">
        <props.chart5 data={vol_scouts} yLabel={"Volunteer Scouts Count"}/>
      </div>      
      <div class="card-style">
        <props.chart5 data={vol_under_18} yLabel={"Volunteer Under-18 Count"}/>
      </div>
    {/if}
  </div> 
  <div class="flexy">
    <AdditionalWork 
      bodyText={"Lorem Ipsum"} 
      projectName={"Dog Poop Pickup"} 
      funding={40} 
      projectTimeframe={""} 
    />
  </div>
  <button class="h-12 w-full bg-slate-700 text-white" 
      onclick={()=> {accordionFlag = !accordionFlag}}>
    {accordionText}
  </button>  
</div>

