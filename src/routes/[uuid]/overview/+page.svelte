<script lang="ts">
	import type { PageData } from '../../$types';
	import { makeDrilldownMultPie, makeProjectCountDrilldownPie, splitTableData } from '../../helpers/chartFormatters';
	import RenderEchart from '../../components/renderEchart.svelte';
	import type { ChartType } from '../../../ambient';
	import Indicator from '../../components/indicator.svelte';

	const { data }: { data: PageData } = $props();

	// Map subCollections by collection name – avoids any index-shifting bugs if a collection fetch fails/skips
	const subCollectionsByTable = $derived(
		Object.fromEntries(
			data.pbData.map((entry) => [entry.collection, entry.subCollections ?? {}])
		)
	);

	// Explicit, safe access – missing collections become empty objects
	const towSubs = subCollectionsByTable['34_gc_tow_and_go'] ?? {};
	const rtpSubs = subCollectionsByTable['35_rtp'] ?? {};
	const tipSubs = subCollectionsByTable['36_transportation_improvement_plan'] ?? {};

	// Accumulate funding across ALL available collections
	function accumulateFunding(subCollectionsMap: Record<string, any>) {
		let total = 0;

		Object.values(subCollectionsMap).forEach((group) => {
			Object.values(group).forEach((section: any) => {
				if (section?.items && Array.isArray(section.items)) {
					section.items.forEach((item: any) => {
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

	const totalFunding = $derived(accumulateFunding(subCollectionsByTable));

	// Safe combined data for project count pie – missing subtables treated as empty
	const combinedProjectData = $derived([
		{
			RTP: rtpSubs['35_rtp_rtp_projects'] ?? { items: [] },
			'10_year': rtpSubs['35_rtp_yr10_projects'] ?? { items: [] }
		},
		{
			TIP: tipSubs['36_transportation_improvement_plan_tip'] ?? { items: [] },
			LET: tipSubs['36_transportation_improvement_plan_let'] ?? { items: [] }
		}
	]);

	// Safe LET data – splitTableData now returns [] if missing
	const letData = $derived(splitTableData(tipSubs, '36_transportation_improvement_plan_let'));

	// Charts (derived for reactivity)
	const chartA = $derived(
		makeProjectCountDrilldownPie('35_rtp', combinedProjectData, 'Transportation Projects')
	);

	const chartB = $derived(
		makeDrilldownMultPie(
			'35_rtp',
			letData,
			[
				'funding',
				'project_type',
				'project_category',
				'project_subcategory',
				'project_subcategory2'
			],
			'LET Transportation Projects'
		)
	);

	const fundingIndicator: ChartType = $derived({
		parent_table: 'overview',
		indicator: {
			indicatorVal: totalFunding,
			indicatorName: 'Total Estimated Funding Received',
			indicatorSymPre: '$'
		},
		chartType: 'indicator'
	});

  //$inspect('pbData', data)
</script>

<div class="fixed top-24 flex h-screen w-11/12 flex-col overflow-auto">
	<div class="sticky min-h-screen w-auto flex-col items-center justify-center bg-slate-700 pt-4 pb-2">
		<!-- Total Funding Indicator -->
		<div class="flex h-[18rem] w-full items-center justify-center bg-slate-700">
			<Indicator
				above={true}
				below={false}
				aboveText={fundingIndicator.indicator.indicatorName}
				belowText={''}
				numericValue={fundingIndicator.indicator.indicatorVal as number}
			/>
		</div>

		<!-- Charts Row -->
		<div class="flex gap-12 justify-center pt-8 w-full">
			<!-- Project Count Drilldown (RTP + 10-Year + TIP + LET) -->
			<div class="flex h-[36rem] w-[44rem] items-center justify-center rounded bg-slate-100">
				<RenderEchart chart={chartA.chart.charts} onDrilldown={chartA.chart.onDrilldown} />
			</div>

			<!-- LET Funding Multi-Drilldown -->
			<div class="flex h-[36rem] w-[44rem] items-center justify-center rounded bg-slate-100">
				<RenderEchart chart={chartB.chart.charts} onDrilldown={chartB.chart.onDrilldown} />
			</div>
		</div>
	</div>
</div>
