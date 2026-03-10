<script lang="ts">
	import { makeActualProgramsBar, makeDrilldownMultPie, makeProjectCountDrilldownPie, splitTableData } from '../../helpers/chartFormatters';
	import RenderEchart from '../../components/renderEchart.svelte';
	import type { ChartType, PB_Record_Type, UtilizationType} from '../../../ambient';
	import Indicator from '../../components/indicator.svelte';

	const { data }: { data: {
    pbData: PB_Record_Type[],
    utilization: UtilizationType | null,
  }} = $props();

  $inspect(data.utilization)

  const pbData = $derived(data.pbData)
const subCollectionsByTable = $derived(
	Object.fromEntries(
		(pbData ?? []).map((entry) => [entry.collection, entry.subCollections ?? {}])
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
				if (section && Array.isArray(section)) {
					section.forEach((item: any) => {
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
			RTP: rtpSubs['35_rtp_rtp_projects'] ??  [] ,
			'10_Year_Plan': rtpSubs['35_rtp_yr10_projects'] ??  [] 
		},
		{
			TIP: tipSubs['36_transportation_improvement_plan_tip'] ??  [] ,
			LET: tipSubs['36_transportation_improvement_plan_let'] ??   [] 
		}
	]);
	// Safe LET data – splitTableData now returns [] if missing
	const letData = $derived(splitTableData(tipSubs, '36_transportation_improvement_plan_let'));

  $inspect('RTP', combinedProjectData)
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

  /*
  function mapToFullActualData(raw: any): FullTabData {
    const record = Array.isArray(raw) ? (raw[0] ?? {}) : (raw ?? {});

    return Object.fromEntries(
      Object.entries(tabCodeMap).map(([code, category]) => {
        const programsField = `${category}_programs` as keyof typeof record;
        const rawPrograms = record[programsField] ?? [];

        // Handles your exact data format: array of comma-strings
        const programs = Array.isArray(rawPrograms)
          ? rawPrograms.flatMap((item: any) => {
              if (typeof item === 'string') {
                return item.split(',').map((s) => s.trim()).filter(Boolean);
              }
              return [];
            })
          : [];

        return [
          code as TabCode,
          {
            count: Number(record[category as keyof typeof record] ?? 0),
            programs,
          },
        ];
      })
    ) as FullTabData;
  }

  let fullActualData = $derived(mapToFullActualData(data.dash_count));

  */
   const actualProgramsChart = $derived(
    makeActualProgramsBar(
      data.utilization,
      "Utilized Programs by Category"
    )
  );

  const tabCodeMap = {
    "41": "workforce",
    "64": "environmental",
    "71": "enterprise_solutions",
    "55": "economic_development",
    "07": "aging_disability",
    "92": "community_services",
    "74": "public_safety",
    "76": "transportation"
  } as const;

  type TabCode = keyof typeof tabCodeMap;

  type FullTabData = Record<TabCode, { count: number; programs: string[] }>;
</script>

<div class="fixed top-24 flex h-screen w-11/12 flex-col overflow-auto">
	<div class="sticky h-screen w-auto flex-col items-center justify-center bg-slate-700 pt-4 pb-2">
		<!-- Total Funding Indicator -->
      {#if fundingIndicator.indicator?.indicatorVal}
		<div class="flex h-[18rem] w-full items-center justify-center bg-slate-700">
			<Indicator
				above={true}
				below={false}
				aboveText={fundingIndicator.indicator.indicatorName}
				belowText={''}
				numericValue={fundingIndicator.indicator.indicatorVal as number}
        symbol_pre={fundingIndicator.indicator?.indicatorSymPre}
			/>
		</div>
      {/if}

		<!-- Charts Row -->
		<div class="flex gap-12 justify-center pt-8 w-full pb-24">

			<div class="flex h-[38rem] w-[48rem] items-center justify-center rounded bg-slate-100">
				<RenderEchart chart={actualProgramsChart.chart?.charts!} />
			</div>

			<!-- Project Count Drilldown (RTP + 10-Year + TIP + LET) -->
			<div class="flex h-[38rem] w-[48rem] items-center justify-center rounded bg-slate-100">
				<RenderEchart chart={chartA.chart.charts} onDrilldown={chartA.chart.onDrilldown} />
			</div>

			<!-- LET Funding Multi-Drilldown -->
      <!--
			<div class="flex h-[36rem] w-[44rem] items-center justify-center rounded bg-slate-100">
				<RenderEchart chart={chartB.chart.charts} onDrilldown={chartB.chart.onDrilldown} />
			</div>
      -->
		</div>
	</div>
</div>
