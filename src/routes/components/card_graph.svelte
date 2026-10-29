<script lang="ts">
	import type { AdworkType, ChartType, CustomEchartType, ProgramType } from '../../ambient';
	import { graphsState } from '../charts/graphVectors.svelte';
	import { printState } from '../../state/printState.svelte';
	import { isAllComponentsEmptyOrZero, isChartEmptyOrAllZero, isIndicatorEmptyOrZero, isTableEmptyOrAllZero } from '../helpers/chartFormatters';
	import AdditionalWork from './additionalWork.svelte';
	import Indicator from './indicator.svelte';
	import RenderEchart from './renderEchart.svelte';
	import Table from './table.svelte';
	import { aloneInRow, fitsHalfWidth, pairForPrint } from '../helpers/printPairing';

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

	function cellKind(chart: ChartType): 'indicator' | 'table' | 'chart' {
		if (chart.indicator && !isIndicatorEmptyOrZero(chart.indicator)) return 'indicator';
		return chart.table ? 'table' : 'chart';
	}

	/** Stays readable at half the page width, with its legend printed below it */
	function canHalf(chart: ChartType): boolean {
		return (
			cellKind(chart) === 'chart' &&
			chart.fullWidth !== true &&
			!!chart.chart?.charts &&
			!isChartEmptyOrAllZero(chart) &&
			fitsHalfWidth(chart.chart.charts)
		);
	}

	// On paper, consecutive half-width charts share a row; one without a partner is centred alone
	let printRows = $derived(pairForPrint(displayedCharts, canHalf));

	// On screen, a cell (chart, KPI tile or table) left alone in its grid row spans the row so it
	// sits centred rather than in the left-hand column
	let screenAlone = $derived.by(() => {
		const alone = aloneInRow(displayedCharts, (chart) => chart.fullWidth === true);
		return new Set(displayedCharts.filter((_, i) => alone[i]));
	});


</script>

<div>
	{#if subtitle}
		<div class="font-[Metropolis]">
			{subtitle}
		</div>
	{/if}

	{#snippet cell(chart: ChartType, paired: boolean)}
		{@const isFullWidth = chart.fullWidth === true}
		{@const kind = cellKind(chart)}
		{@const printHalf = canHalf(chart)}
		<div
			data-print-kind={kind}
			data-print-avoid={kind === 'table' ? undefined : ''}
			data-print-single={printHalf && !paired ? '' : undefined}
			class="{isFullWidth || screenAlone.has(chart) ? 'md:col-span-2' : ''} w-full overflow-x-auto"
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
					{printHalf}
				/>

			{:else}
				<!-- Empty state (uncomment if needed) -->
			{/if}
		</div>
	{/snippet}

	<div data-print-grid class="grid w-full grid-cols-1 md:grid-cols-2 gap-6 px-12 py-8">
		{#each printRows as row}
			{#if row.length === 2}
				<!-- `contents` on screen (the grid lays the cells out); a two-column row on paper -->
				<div data-print-pair class="contents">
					{@render cell(row[0], true)}
					{@render cell(row[1], true)}
				</div>
			{:else}
				{@render cell(row[0], false)}
			{/if}
		{/each}
	</div>

	{#if getNonEmptyChartCount(charts) > 2}
		<button
			data-ui-more
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
			<h1 data-ui-section-title class="text-2xl font-extrabold pt-8 print:pt-3 print:pb-1 print:pl-4 print:text-[13pt]">Additional Work</h1>
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
