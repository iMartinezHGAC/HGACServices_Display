<script lang="ts">
	import type { PageData } from '../../$types';
	import { makeDrilldownMultPie, makeDrilldownPie, makeTableDrilldownPie, makeValueCountPie, splitTableData } from '../../helpers/chartFormatters';
	import RenderEchart from '../../components/renderEchart.svelte';
	import type { ChartType } from '../../../ambient';
	import Indicator from '../../components/indicator.svelte';

	const { data }: { data: PageData } = $props();

	interface PB_Data_Type {}

  $inspect('data', data)
  let pbData = $derived(
			data.pbData.map((entry) => 
			 entry.subCollections,
    )
	);

function accumulateFunding(data) {
  let total = 0;

  data.forEach(group => {
    Object.values(group).forEach(section => {
      if (section && Array.isArray(section.items)) {
        section.items.forEach(item => {
          if (item && typeof item === 'object' && 'funding' in item) {
            const value = Number(item.funding);
            if (!isNaN(value)) {
              total += value;
            }
          }
        });
      }
    });
  });

  return total;
}

  console.log('total funds', accumulateFunding(pbData))

// Usage example (replace 'yourArray' with your actual array variable):
// const totalFunding = accumulateFunding(yourArray);
// console.log('Total funding:', totalFunding);
let combinedA = [ pbData[1], pbData[2] ];
let combinedB = [ pbData[2] ]

// Extract the specific object's items array by searching for the group containing the key
const data_let = splitTableData(pbData[2],"36_transportation_improvement_plan_let")

	$inspect('pb data', pbData);
	$inspect('data A', data_let);

	const tabColors = $derived(Object.values(data.dashboard_groups).map((item) => item.tab_color));
	const tabNames = $derived(
		Object.values(data.dashboard_groups)
			.map((item) => item.tab_name)
			.filter((tabName) => tabName !== 'Overview')
	);
  let chartA = makeTableDrilldownPie(
			'35_rtp',
		  combinedA,
      "RTP and TIP"
		)
  let chartB = makeDrilldownMultPie(
			'35_rtp',
		  data_let,
      [
      'funding',
      'project_type',
      'project_category',
      'project_subcategory',
      'project_subcategory2',
    ],
      "Let Transportation Projects"
		)
  let fundingIndicator: ChartType = {
    parent_table: 'wtvr',
    indicator: {
      indicatorVal: accumulateFunding(pbData),
      indicatorName: "Total Funding"
    },
    chartType: 'indicator'
  }
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

    <div class="flex items-center w-2/3 h-[27rem] justify-center bg-slate-100">
				<Indicator
					above={true}
					below={false}
					aboveText={fundingIndicator.indicator.indicatorName}
					belowText={''}
					numericValue={fundingIndicator.indicator.indicatorVal as number}
				/>
    </div>   
    <div class="flex items-center h-[27rem] justify-center bg-slate-100">
      <RenderEchart chart={chartA.chart.charts} onDrilldown={chartA.chart.onDrilldown} />
    </div>   
    <div class="flex items-center h-[27rem] justify-center bg-slate-100">
      <RenderEchart chart={chartB.chart.charts} onDrilldown={chartB.chart.onDrilldown} />
    </div>
	</div>
</div>
