<script lang="ts">
	import type { AdworkType, ChartType, CustomEchartType, ProgramType } from '../../ambient';
	import { graphsState } from '../charts/graphVectors.svelte';
	import { printState } from '../../state/printState.svelte';
	import { isAllComponentsEmptyOrZero, isChartEmptyOrAllZero, isIndicatorEmptyOrZero, isTableEmptyOrAllZero } from '../helpers/chartFormatters';
	import AdditionalWork from './additionalWork.svelte';
	import Indicator from './indicator.svelte';
	import RenderEchart from './renderEchart.svelte';
	import Table from './table.svelte';

	interface props {
		project: ProgramType;
		charts: ChartType[];
		additionalWork: AdworkType[] | undefined;
		subtitle?: string;
	}
	const { project, charts, additionalWork, subtitle }: props = $props();

	const print = printState();

	let accordionFlag = $state(false);
	let accordionText = $derived.by(() => {
		if (accordionFlag === false) return 'Show more metrics..';
		return 'Show fewer metrics';
	});

	let expanded = $state(false);

	// ────── PER-PROJECT FILTER (fixes the duplicated "Show All (32 more)" bug) ──────
	let projectAdditionalWorks = $derived.by((): AdworkType[] => {
		if (!additionalWork) return [];
		return additionalWork.filter((adwork: AdworkType) => 
			adwork.expand?.program?.parent_table === project.parent_table
		);
	});

	let itemsToShow = $derived.by((): AdworkType[] => {
		if (expanded || print.active) return projectAdditionalWorks;
		return projectAdditionalWorks.slice(0, 3);
	});

	let hasAdditionalWork = $derived(projectAdditionalWorks.length > 0);
	let showExpandButton = $derived(projectAdditionalWorks.length > 3);
	// ───────────────────────────────────────────────────────────────────────────────

	function toggleExpanded() {
		expanded = !expanded;
	}

	const graphState = graphsState();

	function toGraphWork(workVector: HTMLDivElement) {
		graphState.add(workVector);
		return () => graphState.remove(workVector);
	}

	function getNonEmptyChartCount(charts: ChartType[]): number {
		return charts.filter(chart => !isAllComponentsEmptyOrZero(chart)).length;
	}
  let filteredCharts = $derived(
    charts.filter(chart => !isAllComponentsEmptyOrZero(chart))
  )
	let displayedCharts = $derived(
		filteredCharts.length <= 2 || accordionFlag || print.active
			? filteredCharts
			: filteredCharts.slice(0, 2)
	);


</script>

<div>
	{#if subtitle}
		<div class="font-[Metropolis]">
			{subtitle}
		</div>
	{/if}

	<div data-print-grid class="grid w-full grid-cols-1 md:grid-cols-2 gap-6 px-12 py-8">
		{#each displayedCharts as chart}
			{@const isFullWidth = chart.fullWidth === true}
			{@const kind =
				chart.indicator && !isIndicatorEmptyOrZero(chart.indicator)
					? 'indicator'
					: chart.table
						? 'table'
						: 'chart'}
			<div
				data-print-kind={kind}
				data-print-avoid={kind === 'table' ? undefined : ''}
				class="{isFullWidth ? 'md:col-span-2' : ''} w-full overflow-x-auto"
			>
				{#if chart.indicator && !isIndicatorEmptyOrZero(chart.indicator)}
					<Indicator
						above={true}
						below={false}
						aboveText={chart.indicator.indicatorName}
						belowText={''}
						numericValue={chart.indicator.indicatorVal as number}
						symbol_pre={chart.indicator.indicatorSymPre}
					/>

				{:else if chart.table}
				<!--	{console.log("Table in Card_Graph", chart)}-->
					<Table data={chart.table} columns={chart.columns} title={chart.title} fields={chart.fields} />

				{:else if chart.chart && !isChartEmptyOrAllZero(chart)}

					{console.log(chart)}
					<RenderEchart
						chart={chart.chart.charts}
						onDrilldown={chart.chart.onDrilldown}
					/>

				{:else}
					<!-- Empty state (uncomment if needed) -->
				{/if}
			</div>
		{/each}
	</div>

	{#if getNonEmptyChartCount(charts) > 2}
		<button
			class="mx-auto flex h-12 w-11/12 items-center justify-center bg-slate-700 text-white hover:bg-slate-800 transition-colors print:hidden"
			onclick={() => {
				accordionFlag = !accordionFlag;
			}}
		>
			{accordionText}
		</button>
	{:else}
		<span></span>
	{/if}

	{#if hasAdditionalWork}
		<div class="flexy flex-col" {@attach toGraphWork}>
    {#if getNonEmptyChartCount(charts) > 0}
			<h1 class="text-2xl font-extrabold pt-8 print:pt-3 print:pb-1 print:pl-4 print:text-[13pt]">Additional Work</h1>
    {/if}

			{#each itemsToShow as adWork}
				<AdditionalWork adwork={adWork} />
			{/each}

			{#if showExpandButton}
				<div class="expand-toggle mt-6 flex justify-center print:hidden">
					<button
						onclick={toggleExpanded}
						class="bg-[#7AB66F] hover:bg-[#7AB66F] active:bg-[#7AB66F] px-8 py-3 rounded-lg font-medium text-slate-900 transition-all active:scale-[0.97]"
					>
						{expanded ? 'Show Fewer' : `Show All (${projectAdditionalWorks.length - 3} more)`}
					</button>
				</div>
			{/if}
		</div>
	{/if}
</div>
