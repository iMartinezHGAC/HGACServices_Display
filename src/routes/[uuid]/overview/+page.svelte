<script lang="ts">
	import type { PageData } from '../../$types';
	import { makeDrilldownMultPie, makeDrilldownPie, makeTableDrilldownPie, makeValueCountPie, splitTableData } from '../../helpers/chartFormatters';
	import RenderEchart from '../../components/renderEchart.svelte';
	import type { ChartType } from '../../../ambient';
	import Indicator from '../../components/indicator.svelte';

	const { data }: { data: PageData } = $props();

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
function renameFields(data: any[]): any[] {
  return data.map((obj, index) => {
    if (index === 0) {
      return {
        RTP: obj['35_rtp_rtp_projects'],
        '10_year': obj['35_rtp_yr10_projects']
      };
    } else if (index === 1) {
      return {
        TIP: obj['36_transportation_improvement_plan_tip'],
        LET: obj['36_transportation_improvement_plan_let']
      };
    }
    // Fallback to preserve other objects if any
    return obj;
  });
}

// Usage example:
let combinedA = renameFields([ pbData[1], pbData[2] ]);

const data_let = splitTableData(pbData[2],"36_transportation_improvement_plan_let")

	$inspect('pb data', pbData);
	$inspect('data A', combinedA);

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
      indicatorName: "Total Estimated Funding Received",
      indicatorSymPre: '$'
    },
    chartType: 'indicator'
  }
</script>


<div class="fixed top-24 flex h-screen w-11/12 flex-col overflow-auto">
	<div
		class="px-auto sticky min-h-screen w-auto flex-col place-items-center bg-slate-700 pt-4 pb-2 items-center justify-center"
	>
    <div class="flex items-center w-full h-[18rem] justify-center bg-slate-700">
				<Indicator
					above={true}
					below={false}
					aboveText={fundingIndicator.indicator.indicatorName}
					belowText={''}
					numericValue={fundingIndicator.indicator.indicatorVal as number}
				/>
    </div>   
    <div class="flex gap-12 justify-center pt-8 w-full">
      <div class="flex items-center h-[36rem] w-[44rem] justify-center bg-slate-100 rounded">
        <RenderEchart chart={chartA.chart.charts} onDrilldown={chartA.chart.onDrilldown} />
      </div>   
      <div class="flex items-center h-[36rem] w-[44rem] justify-center bg-slate-100 rounded">
        <RenderEchart chart={chartB.chart.charts} onDrilldown={chartB.chart.onDrilldown} />
      </div>
    </div>
	</div>
</div>
