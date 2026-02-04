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


	let itemsToShow = $derived.by(()=> {
    if(expanded && additionalWork) return additionalWork.filter((adwork: AdworkType) => adwork.expand?.program.parent_table === project.parent_table) 
    else if (!expanded && additionalWork) return additionalWork
      .filter((adwork: AdworkType) => adwork.expand?.program.parent_table === project.parent_table)
      .slice(0, 3)
    else return []
  }
  );

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

<div class="grid w-full grid-cols-1 md:grid-cols-2 gap-6 px-12 py-8">
  {#each displayedCharts as chart}
    {@const isFullWidth = chart.fullWidth === true}
    <div class="{isFullWidth ? 'md:col-span-2' : ''} w-full overflow-x-auto">
      {#if chart.indicator && !isIndicatorEmptyOrZero(chart.indicator)}
        <Indicator
          above={true}
          below={false}
          aboveText={chart.indicator.indicatorName}
          belowText={''}
          numericValue={Number(chart.indicator.indicatorVal)}
          symbol_pre={chart.indicator.indicatorSymPre}
        />

      {:else if chart.table && !isTableEmptyOrAllZero(chart.table)}

        <Table data={chart.table} />

      {:else if chart.chart && !isChartEmptyOrAllZero(chart)}
        {console.log(chart)}

        <RenderEchart
          chart={chart.chart.charts}
          onDrilldown={chart.chart.onDrilldown}
        />

      {:else}
          <!--
        <div class="flex h-32 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-gray-500">
          No data. Consider using HART to manage you data
        </div>
          -->
      {/if}
    </div>
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
	{#if itemsToShow.length > 0}
		<div class="flexy flex-col" {@attach toGraphWork}>
        <h1 class="text-2xl font-extrabold pt-8">Additional Work</h1>
				{#each itemsToShow as adWork}
          {#if adWork.expand?.program.parent_table === project.parent_table}
        {console.log(adWork.expand?.program.parent_table, 'project', project.parent_table)}
            <AdditionalWork
              adwork={adWork}
            />
        {/if}
				{/each}
				{#if itemsToShow.length > 3}
					<div class="expand-toggle">
						<button onclick={toggleExpanded}>
							{expanded ? 'Show Fewer' : `Show All (${itemsToShow.length - 3} more)`}
						</button>
					</div>
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
