<script lang="ts">
	import { makeDrilldownMultPie, makeProjectCountDrilldownPie, splitTableData } from '../../helpers/chartFormatters';
	import RenderEchart from '../../components/renderEchart.svelte';
	import type { ChartType, PB_Record_Type, ProgramType, TabCountType } from '../../../ambient';
	import Indicator from '../../components/indicator.svelte';
	import StackedEchartBar from '../../charts/StackedEchartBar.svelte';

	const { data }: { data: {
    pbData: PB_Record_Type[],
  }} = $props();

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
			'10_year': rtpSubs['35_rtp_yr10_projects'] ??  [] 
		},
		{
			TIP: tipSubs['36_transportation_improvement_plan_tip'] ??  [] ,
			LET: tipSubs['36_transportation_improvement_plan_let'] ??   [] 
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

type CodedTabCounts = {
  [K in keyof typeof tabCodeMap as typeof tabCodeMap[K]]: number;
};

function mapToCodedTabs(data: TabCountType): CodedTabCounts {
  return {
    "41": data.has_workforce,
    "64": data.has_environmental,
    "71": data.has_enterprise_solutions,
    "55": data.has_economic_development,
    "07": data.has_aging_disability,
    "92": data.has_community_services,
    "74": data.has_public_safety,
    "76": data.has_transportation,
  };
}

  let dataActual = $derived(mapToCodedTabs(data.dash_count[0]))

  //$inspect('pbData', data)
  //$inspect('tip subtables', tipSubs)
  //$inspect('rtp subtables', rtpSubs)
  //$inspect('combined', combinedProjectData)
  //$inspect('let data', letData)
	$inspect('data actual', dataActual);


  const dataPotential: Record<string, number> = data.potential_tabs.reduce((acc, item) => {
    acc[item.id] = item.tab_project_count;
    return acc;
  }, {} as Record<string, number>);

	$inspect('data potential', dataPotential);


export function makeActualPotentialStackedBar(
  dataActual: Record<string, number> | null | undefined,
  dataPotential: Record<string, number> | null | undefined,
  title: string
): ChartType {
  // Handle no data case
  if (
    !dataActual ||
    !dataPotential ||
    (Object.keys(dataActual).length === 0 && Object.keys(dataPotential).length === 0)
  ) {
    return {
      chart: { charts: getNoDataOption(title) },
      chartType: "stackedbarchart",
    };
  }

	const keyToName: Record<string, string> = {
		'07': 'Aging Disability',
		'41': 'Workforce',
		'55': 'Economic Development',
		'64': 'Environmental',
		'71': 'Enterprise Solutions',
		'74': 'Public Safety',
		'76': 'Transportation',
		'92': 'Community Services'
	};
  // Union of keys, sorted numerically by code
  const allKeys = Array.from(
    new Set([...Object.keys(dataActual ?? {}), ...Object.keys(dataPotential ?? {})])
  );
  const sortedKeys = allKeys.sort((a, b) => Number(a) - Number(b));

  const categories = sortedKeys.map((code) => keyToName[code] ?? code);

  const actualValues = sortedKeys.map((code) => dataActual?.[code] ?? 0);
  const potentialValues = sortedKeys.map((code) => dataPotential?.[code] ?? 0);
  const gapValues = potentialValues.map((p, i) => Math.max(0, p - actualValues[i]));

  // Bake totals into data objects to safely access in formatter (no reactivity issues)
  const actualData = actualValues.map((value) => ({ value }));
  const gapData = gapValues.map((gap, i) => ({
    value: gap,
    total: potentialValues[i],
  }));

const option: echarts.EChartsOption = {
    backgroundColor: "#fff",
    title: {
      text: title,
      left: "center",
      textStyle: { fontWeight: "normal", fontSize: 18 },
    },
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      formatter: (params: any) => {
        const actualParam = params.find((p: any) => p.seriesName === "Actual");
        const gapParam = params.find((p: any) => p.seriesName === "Remaining to Potential");
        const actual = actualParam?.value ?? 0;
        const gap = gapParam?.value ?? 0;
        const total = actual + gap;
        return `${params[0].name}<br/>Actual: ${actual}<br/>Remaining: ${gap}<br/><strong>Potential: ${total}</strong>`;
      },
    },
    legend: {
      data: ["Actual", "Remaining to Potential"],
      top: 30,
    },
grid: {
      left: 70,
      right: 50,
      bottom: 20,   // More room for rotated labels
      top: 100,      // More top space to push bars down and give vertical breathing room
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: categories,
      axisLabel: {
        rotate: 45,
        interval: 0,
        fontSize: 12,
      },
    },
    yAxis: {
      type: "value",
      axisLabel: { fontSize: 12 },
    },
    series: [
      {
        name: "Actual",
        type: "bar",
        stack: "total",
        barWidth: "60px",
        data: actualData,
        itemStyle: { color: "#5470c6" },
        emphasis: { focus: "series" },
        label: {
          show: true,
          position: "inside",
          fontWeight: "bold",
          color: "#fff",
          formatter: (params: any) => (params.data.value > 0 ? params.data.value : ""),
        },
      },
      {
        name: "Remaining to Potential",
        type: "bar",
        stack: "total",
        barWidth: "60px",
        data: gapData,
        itemStyle: { color: "#91cc75" },
        emphasis: { focus: "series" },
        label: {
          show: true,
          position: "top",
          fontWeight: "bold",
          formatter: (params: any) =>
            params.data.total > 0 ? params.data.total : "",
        },
      },
    ],
  };

  return {
    parent_table: "irrelevant",
    chart: { charts: option },
    chartType: "stackedbarchart",
  };
}

  let plapChart = makeActualPotentialStackedBar(dataActual, dataPotential, "In use vs Potential")

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

			<div class="flex h-[36rem] w-[44rem] items-center justify-center rounded bg-slate-100">
				<RenderEchart chart={plapChart.chart?.charts!} />
			</div>

			<!-- Project Count Drilldown (RTP + 10-Year + TIP + LET) -->
			<div class="flex h-[36rem] w-[44rem] items-center justify-center rounded bg-slate-100">
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
