<script lang="ts">
	import exportChartToPDF from '$lib/scripts/convertSVGtoPDF';
	import type { AdworkType, ChartType, CustomEchartType, ProgramType } from '../../ambient';
	import { graphsState } from '../charts/graphVectors.svelte';
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

	let accordionFlag = $state(false);
	let accordionText = $derived.by(() => {
		if (accordionFlag === false) return 'Show more metrics..';
		return 'Show fewer metrics';
	});

	let expanded = $state(false);

	let itemsToShow = $derived(expanded ? additionalWork : additionalWork.slice(0, 3));

	function toggleExpanded() {
		expanded = !expanded;
	}

	const graphState = graphsState();

	function toGraphWork(workVector: HTMLDivElement) {
		if (workVector) graphState.add(workVector);
	}

function getNonEmptyChartCount(charts: ChartType[]): number {
  return charts.filter(chart => !isAllComponentsEmptyOrZero(chart)).length;
}

let displayedCharts = $derived(
    getNonEmptyChartCount(charts) <= 2 || accordionFlag
      ? charts
      : charts.slice(0, 2)
  );
</script>

<div>
	{#if subtitle}
		<div class="font-[Metropolis]">
			{subtitle}
		</div>
	{/if}

<div class="flex w-full flex-wrap items-start justify-center gap-6 px-12 py-8">
  {#each displayedCharts as chart}
    {@const isFullWidth = chart.fullWidth ?? (chart.table !== undefined)}

    {#if chart.indicator && !isIndicatorEmptyOrZero(chart.indicator)}
      <div class="{isFullWidth ? 'w-full' : 'w-full md:w-1/2 min-w-0'} overflow-x-auto">
        <Indicator
          above={true}
          below={false}
          aboveText={chart.indicator.indicatorName}
          belowText={''}
          numericValue={Number(chart.indicator.indicatorVal)}
          symbol_pre={chart.indicator.indicatorSymPre}
        />
      </div>

    {:else if chart.table && !isTableEmptyOrAllZero(chart.table)}
      <div class="{isFullWidth ? 'w-full' : 'w-full md:w-1/2 min-w-0'} overflow-x-auto">
        {console.log('table render', chart.table)}

        <Table data={chart.table} />
      </div>

    {:else if chart.chart && !isChartEmptyOrAllZero(chart)}
      <div class="{isFullWidth ? 'w-full' : 'w-full md:w-1/2 min-w-0'} overflow-x-auto">
        {console.log(chart)}

        <RenderEchart
          chart={chart.chart.charts}
          onDrilldown={chart.chart.onDrilldown}
        />
      </div>

    {:else}
      <div class="{isFullWidth ? 'w-full' : 'w-full md:w-1/2 min-w-0'} overflow-x-auto">
        <div class="flex h-32 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-gray-500">
          No data
        </div>
      </div>
    {/if}
  {/each}
</div>
	{#if getNonEmptyChartCount(charts) > 2}
		<button
			class="mx-auto flex h-12 w-11/12 items-center justify-center bg-slate-700 text-white"
			onclick={() => {
				accordionFlag = !accordionFlag;
			}}
		>
			{accordionText}
		</button>
	{:else}
		<span></span>
	{/if}
	{#if additionalWork}
		<div class="flexy flex-col" {@attach toGraphWork}>
			{#if project.program_name === 'Livable Centers'}
				{#each itemsToShow as adWork}
					<AdditionalWork
						bodyText={adWork.project_description}
						projectName={adWork.project_name}
						funding={adWork.budget}
						start_date={adWork.start_date}
						end_date={adWork.end_date}
					/>
				{/each}
				{#if additionalWork.length > 3}
					<div class="expand-toggle">
						<button onclick={toggleExpanded}>
							{expanded ? 'Show Fewer' : `Show All (${additionalWork.length - 3} more)`}
						</button>
					</div>
				{/if}
			{:else}
        <!--
				<AdditionalWork
					bodyText={'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'}
					projectName={'Ieacta Est'}
					funding={0}
				/>
        -->
			{/if}
		</div>
	{/if}
</div>
