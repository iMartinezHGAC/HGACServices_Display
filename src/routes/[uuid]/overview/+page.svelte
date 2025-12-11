<script lang="ts">
	import type { PageData } from '../../$types';
	import { convertAllToDonut } from '$lib/scripts/convertPBtoD3.svelte';
	import type { CollectionWSubType, DonutType } from '../../../ambient';
	import StatDisplay from '../../components/statDisplay.svelte';

	const { data }: { data: PageData } = $props();

	interface PB_Data_Type {}

	let donutData = $derived<DonutType[]>(
		data.pbData.map((entry: CollectionWSubType) => {
			return {
				name: entry.subCollections.table_name,
				value: entry.subCollections.table_data.items.length
			};
		})
	);

	$inspect('donut data', donutData);

	/*
type stackedTrash = {
  juris: string,
  historical_funds: number,
  current_funds: number,
}

const fakeData: GroupData[] = data.fakeData
  $inspect('fake data', fakeData)

const groups = ["Economic Development", "Environmental", "Transportation", "Community Services", "Public Safety", "Business Services", "Workforce", ];

const chartData = {
  CurrentFunding: convertAllToDonut(fakeData, groups, "Current_Funds"),
  Services: convertAllToDonut(fakeData, groups, "Current_Services"),
  Participation: convertAllToDonut(fakeData, groups, "Current_Total_Participation"),
  
  HistoricalFunds: convertAllToDonut(fakeData, groups, "Historical_Funds"),
  HistoricalServices: convertAllToDonut(fakeData, groups, "Historical_Services")
};

  */
	const tabColors = $derived(Object.values(data.dashboard_groups).map((item) => item.tab_color));
	const tabNames = $derived(
		Object.values(data.dashboard_groups)
			.map((item) => item.tab_name)
			.filter((tabName) => tabName !== 'Overview')
	);

	const blurb = '';
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

<div class="fixed top-24 flex h-screen w-11/12 flex-col overflow-auto">
	<div
		class="px-auto sticky grid min-h-screen w-auto grid-cols-2 place-items-center bg-slate-700 pt-4 pb-12"
	>
		<StatDisplay header="Number of Projects" data={donutData} colors={tabColors} preSymbol="" />
		<!--
    <StatDisplay header="Services" data={chartData.Services} colors={tabColors} />
    <StatDisplay header="Total Participation" data={chartData.Participation} colors={tabColors} />
    <div class="bg-slate-700 h-auto w-1/2 pt-12 flex justify-center pl-24">
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
  -->
	</div>
</div>
