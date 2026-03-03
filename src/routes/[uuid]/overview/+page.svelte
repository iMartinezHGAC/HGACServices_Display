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

  const dataPotential: Record<string, number> = data.potential_tabs.reduce((acc, item) => {
    acc[item.id] = item.tab_project_count;
    return acc;
  }, {} as Record<string, number>);

	//$inspect('data potential raw', data.potential_tabs);
	//$inspect('data potential', dataPotential);


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

  // 🔥 ONE mapper for everything (PocketBase array or object)
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

  // Derived data (Svelte 5 runes)
  let fullActualData = $derived(mapToFullActualData(data.dash_count));

  // Your chart call (no other changes needed)
  const actualPotentialChart = $derived(
    makeActualPotentialStackedBar(
      fullActualData,
      dataPotential,
      "Actual vs Potential Programs by Category"
    )
  );

  



  //////*******************************************/////////////
// In your chart utils (TypeScript)
export function makeActualPotentialStackedBar(
  fullActualData: FullTabData | null | undefined,
  dataPotential: Record<string, number> | null | undefined,
  title: string
): ChartType {
  if (!fullActualData || !dataPotential) {
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

  const sortedKeys = Object.keys(tabCodeMap).sort((a, b) => Number(a) - Number(b));

  const categories = sortedKeys.map((code) => keyToName[code] ?? code);

  // Attach programs directly to each bar data point
  const actualData = sortedKeys.map((code) => ({
    value: fullActualData[code as TabCode].count,
    programs: fullActualData[code as TabCode].programs,
  }));

  const actualValues = actualData.map((d) => d.value);
  const potentialValues = sortedKeys.map((code) => dataPotential[code] ?? 0);
  const gapValues = potentialValues.map((p, i) => Math.max(0, p - actualValues[i]));

  const gapData = gapValues.map((gap, i) => ({
    value: gap,
    total: potentialValues[i],
  }));

  const option: echarts.EChartsOption = {
    backgroundColor: '#f1f5f9',
    title: {
      text: title,
      left: "center",
      textStyle: { fontWeight: "normal", fontSize: 18, fontFamily: 'Metropolis' },
    },
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      formatter: (params: any[]) => {
        const idx = params[0]?.dataIndex ?? 0;
        const categoryName = categories[idx];
        const actualItem = actualData[idx];
        const actual = actualItem.value;
        const gap = gapValues[idx];
        const total = potentialValues[idx];

        let html = `<b style="font-size:14px;">${categoryName}</b><br/>`;
        html += `Actual: <strong>${actual}</strong><br/>`;

        if (actualItem.programs.length > 0) {
          html += `<br/><b>Programs (${actualItem.programs.length}):</b><br/>`;
          html += actualItem.programs.map((p) => `• ${p}`).join('<br/>');
          html += '<br/><br/>';
        }

        html += `Remaining: ${gap}<br/>`;
        html += `<strong style="color:#5470c6">Potential: ${total}</strong>`;

        return html;
      },
    },
    legend: {
      data: ["Actual", "Available Programs"],
      top: 30,
    },
    grid: {
      left: 70,
      right: 50,
      bottom: 10,
      top: 100,
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
          formatter: (p: any) => (p.data.value > 0 ? p.data.value : ""),
        },
      },
      {
        name: "Available Programs",
        type: "bar",
        stack: "total",
        barWidth: "60px",
        data: gapData,
        itemStyle: { color: "#cccccc", opacity: 0.5 },
        emphasis: { focus: "series" },
        label: {
          show: true,
          position: "top",
          fontWeight: "bold",
          formatter: (p: any) => (p.data.total > 0 ? p.data.total : ""),
        },
      },
    ],
  };

  return {
    chart: { charts: option },
    chartType: "stackedbarchart",
  };
}
</script>

<div class="fixed top-24 flex h-screen w-11/12 flex-col overflow-auto">
	<div class="sticky min-h-screen w-auto flex-col items-center justify-center bg-slate-700 pt-4 pb-2">
		<!-- Total Funding Indicator -->
      {#if fundingIndicator.indicator.indicatorVal}
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
		<div class="flex gap-12 justify-center pt-8 w-full">

			<div class="flex h-[38rem] w-[48rem] items-center justify-center rounded bg-slate-100">
				<RenderEchart chart={actualPotentialChart.chart?.charts!} />
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
