<script lang="ts">
	import CardBlurbTb from '../fragments/cardBlurbTB.svelte';
	import Printer from '$lib/assets/printer.svelte';

	import exportChartToPDF from '$lib/scripts/convertSVGtoPDF';
	import { graphsState } from '../charts/graphVectors.svelte';
	import type { AdworkType, ChartType, ProgramType } from '../../ambient';
	import CardGraph from './card_graph.svelte';
	import { shouldRenderCard } from '../helpers/chartFormatters';

	interface cardProps {
		project: ProgramType;
		charts: ChartType[];
		additionalWork: AdworkType[] | undefined;
	}

	const { project, charts, additionalWork }: cardProps = $props();

	let linkUrls = $derived.by(() => {
		if (project.expand && project.expand.links) {
			return project.expand.links.map(
				({ display_text, url_string }: { display_text: string; url_string: string }) => ({
					display_text,
					url_string
				})
			);
		}
		return [];
	});

	let blurb = $derived.by(() => {
		if (project.expand && project.expand.blurb) {
			return project.expand.blurb.program_blurb;
		}
		return '';
	});

	const graphState = graphsState();

	function handleExportClick() {
		exportChartToPDF(graphState.graph, project.program_name + ' - Harris County');
	}

	function toGraph(vector: HTMLDivElement) {
		graphState.clear();
		graphState.add(vector as HTMLDivElement);
	}
</script>

{#if shouldRenderCard(charts, additionalWork, project)}
	<div
		class="mb-4 w-full flex-col items-center justify-center rounded-b-md border-2 border-slate-700 bg-white"
	>
		<div class="flex w-full bg-slate-700">
			<div class="flex w-full flex-col">
				<h1
					class="small-caps flex justify-start bg-slate-700 pt-6 pb-4 pl-10 font-[Metropolis] text-[clamp(1rem,8vw+0.5rem,2rem)] font-extrabold text-white"
				>
					{project.program_name}
					<div class="flex flex-grow"></div>
				</h1>
				{#if linkUrls.length > 0}
					<div class="flex flex-col pb-4 pl-10">
						{#each linkUrls as link}
							<a
								href={link.url_string}
								id="programLink"
								aria-label="link"
								class="font-[Metropolis] font-medium text-white"
							>
								{link.display_text}
							</a>
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
				<!--<Printer id="printerIcon" />-->
			</button>
		</div>
		<CardGraph {project} {charts} {additionalWork} />
	</div>
{/if}
