<script lang="ts">
	import CardBlurbTb from '../fragments/cardBlurbTB.svelte';
	import AdditionalWork from './additionalWork.svelte';
	import Printer from '$lib/assets/printer.svelte';
	import Indicator from './indicator.svelte';

	import exportChartToPDF from '$lib/scripts/convertSVGtoPDF';
	import { graphsState } from '../charts/graphVectors.svelte';
	import RenderEchart from './renderEchart.svelte';
	import type { AdworkType } from '../../ambient';

	interface CustomEchartType {
		parent_table: string;
		echarts_data: echarts.EChartsOption;
		chartType?: string;
		indicatorVal?: string | number;
		indicatorName?: string;
	}

	interface CardDataType {
		program: ProgramType;
		echarts: CustomEchartType[];
	}

	interface cardProps {
		project: ProgramType;
		charts: CustomEchartType[];
		additionalWork: AdworkType[];
	}

	const { project, charts, additionalWork }: cardProps = $props();
	const graphState = graphsState();

	function toGraph(vector: HTMLDivElement) {
		graphState.clear();
		graphState.add(vector as HTMLDivElement);
	}

	function toGraphWork(workVector: HTMLDivElement) {
		if (workVector) graphState.add(workVector);
	}

	function handleExportClick() {
		console.log(graphState.graph);
		exportChartToPDF(graphState.graph, project.program_name + ' - Harris County');
	}

	let accordionFlag = $state(false);
	let accordionText = $derived.by(() => {
		if (accordionFlag === false) return 'Show more metrics..';
		return 'Show fewer metrics';
	});

	let linkUrls = $derived.by(() => {
		if (project.expand && project.expand.links) {
			return project.expand.links.map(
				({ display_text, url_string }: { display_text: string; url_string: string }) => ({
					display_text,
					url_string
				})
			);
		} else return [];
	});

	let blurb = $derived.by(() => {
		if (project.expand && project.expand.blurb) {
			return project.expand.blurb.program_blurb;
		} else return '';
	});
	// Toggle state for expand/collapse
	let expanded = $state(false);

	// Derived value: items to render
	let itemsToShow = $derived(expanded ? additionalWork : additionalWork.slice(0, 3));

	// Toggle function
	function toggleExpanded() {
		expanded = !expanded;
	}
</script>

<div
	class="mb-4 w-full flex-col items-center justify-center rounded-b-md border-2 border-slate-700 bg-white"
	{@attach toGraph}
>
	<div class="flex w-full bg-slate-700">
		<div class="flex w-1/3 flex-col">
			<h1
				class={'small-caps flex justify-start bg-slate-700 pt-6 pb-4 pl-10 font-[Metropolis] text-[clamp(1rem,8vw+0.5rem,2rem)] font-extrabold text-white'}
			>
				{project.program_name}
				<div class="flex flex-grow"></div>
			</h1>
			{#if linkUrls}
				<div class="flex flex-col pb-4 pl-10">
					{#each linkUrls as link}
						<a
							href={link.url_string}
							id="programLink"
							aria-label="link"
							class="font-[Metropolis] font-medium text-white">{link.display_text}</a
						>
					{/each}
				</div>
			{/if}
		</div>
		<CardBlurbTb text={blurb} />
		<span class="flex-grow"></span>
		<button
			onclick={handleExportClick}
			id="printerIcon"
			class="group mr-8 flex cursor-pointer items-start justify-start bg-slate-700 bg-none pt-8 font-[Staatliches] font-medium active:bg-slate-800"
		>
			<Printer id="printerIcon" />
		</button>
	</div>
	<div class="grid w-full grid-cols-2 items-center justify-center gap-1 px-12 py-8">
		{#each charts as chart}
			{#if chart.chartType && chart.chartType === 'indicator'}
				<Indicator
					above={true}
					below={false}
					aboveText={chart.indicatorName!}
					belowText={''}
					numericValue={chart.indicatorVal! as number}
				/>
			{:else}
				{console.log(chart)}
				<RenderEchart chart={chart.echarts_data} />
			{/if}
		{/each}
		<!--
    {#if accordionFlag}
    {/if}
    -->
	</div>
	{#if charts.length > 2}
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
				<AdditionalWork
					bodyText={'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'}
					projectName={'Ieacta Est'}
					funding={0}
				/>
			{/if}
		</div>
	{/if}
</div>
