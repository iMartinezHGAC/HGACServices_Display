<script lang="ts">
	import CardBlurbTb from '../fragments/cardBlurbTB.svelte';
	import type { AdworkType, ChartType, ProgramType } from '../../ambient';
	import CardGraph from './card_graph.svelte';
	import DataRangeInfo from './dataRangeInfo.svelte';
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

</script>

{#if shouldRenderCard(charts, additionalWork, project)}
	<div
		data-print-card
		class="mb-4 w-full h-full flex-col items-center justify-center rounded-b-md border-2 border-slate-700 bg-white"
	>
		<div class="relative flex w-full bg-slate-700 print:items-start" data-print-card-header>
			<div class="absolute top-4 right-4 print:hidden">
				<DataRangeInfo />
			</div>
			<div class="flex w-full flex-col print:w-[30%] print:flex-none">
				<h1
					class="small-caps flex justify-start bg-slate-700 pt-6 pb-4 pl-10 font-[Metropolis] text-[clamp(1rem,8vw+0.5rem,2rem)] font-extrabold text-white print:pt-3 print:pb-1 print:pl-4 print:text-[14pt] print:leading-tight"
				>
					{project.program_name}
					<div class="flex flex-grow"></div>
				</h1>
				{#if linkUrls.length > 0}
					<div class="flex flex-col pb-4 ml-10 w-1/4 print:ml-4 print:w-full print:pb-2">
						{#each linkUrls as link}
							<a
								href={link.url_string}
								aria-label="link"
								class="font-[Metropolis] font-medium text-white w-auto print:text-[8pt]"
							>
								{link.display_text}
							</a>
						{/each}
					</div>
				{/if}
			</div>
      <div class="flex w-3/4 mr-40 print:w-[70%] print:flex-none print:mr-0 print:pr-4">
        <CardBlurbTb text={blurb} />
      </div>
      <div class="flex-grow"></div>
		</div>
		<CardGraph {project} {charts} {additionalWork} />
	</div>
{/if}
