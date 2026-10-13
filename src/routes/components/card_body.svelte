<script lang="ts">
	import { fly } from 'svelte/transition';
	import { toCamelCase } from '../helpers/caseConversion';
	import type { ProgramType, AdworkType, ChartType } from '../../ambient';
	import Card from './card.svelte';
	import { shouldRenderCard } from '../helpers/chartFormatters';

	interface CardDataType {
		program: ProgramType;
		echarts: ChartType[];
	}

	interface cardProps {
		cardNames: string[];
		cardData: CardDataType[];
		direction: boolean;
		adwork: AdworkType[] | undefined;
	}

	let { cardNames, cardData, direction, adwork }: cardProps = $props();

	// Special case: move "34_gc_tow_and_go" to top (unchanged)
	const processed = $derived.by(() => {
		let data = [...cardData];
		let names = [...cardNames];

		const targetIndex = data.findIndex(
			(item) => item.program?.parent_table === '34_gc_tow_and_go'
		);

		if (targetIndex !== -1) {
			const [targetData] = data.splice(targetIndex, 1);
			const [targetName] = names.splice(targetIndex, 1);
			data.unshift(targetData);
			names.unshift(targetName);
		}
		return { data, names };
	});

	// NEW: only keep cards that have charts OR adwork
	let visibleCardData = $derived(
		processed.data.filter((card) =>
			shouldRenderCard(card.echarts, adwork, card.program)
		)
	);

	let visibleCardNames = $derived(
		processed.names.filter((_, i) => {
			const card = processed.data[i];
			return shouldRenderCard(card.echarts, adwork, card.program);
		})
	);

	let flyValue = $state(direction ? -400 : 400);
</script>

{#snippet formattedEntryText(cardName: string)}
	<div class="flex font-[Metropolis] font-medium text-slate-200">
		<a
			href={toCamelCase(cardName)}
			class="w-56 rounded bg-slate-600 px-6 py-4 text-slate-200 hover:bg-slate-700 hover:text-white focus:bg-slate-800"
			>{cardName}</a
		>
	</div>
{/snippet}

<div class="w-screen" data-print-reset>
	<div
		class="fixed top-24 left-0 z-20 flex h-full w-56 transform flex-col items-start justify-start bg-slate-600 pt-4 text-xl print:hidden"
	>
		{#each visibleCardNames as cardName}
			{@render formattedEntryText(cardName)}
		{/each}
	</div>
	<div
		data-print-reset
		class="z-10 ml-56 flex h-screen w-[calc(100%-14rem)] flex-col items-center justify-start overflow-auto scroll-smooth pt-[0%] pb-[6%]"
		transition:fly={{ x: flyValue, duration: 300 }}
	>
		<div class="flex flex-col w-full">
			{#each visibleCardData as card}
				<div class="flex w-full" id={card.program.program_name.split(' ').join('')}>
					<Card project={card.program} charts={card.echarts} additionalWork={adwork} />
				</div>
			{/each}
		</div>
	</div>
</div>
