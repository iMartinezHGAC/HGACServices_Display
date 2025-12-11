<script lang="ts">
	import { fly } from 'svelte/transition';
	import { toCamelCase } from '../helpers/caseConversion';
	import exportChartToPDF from '$lib/scripts/convertSVGtoPDF';
	import type { ProgramType, CustomEchartType } from '../../ambient';
	import Card from './card.svelte';

	interface CardDataType {
		program: ProgramType;
		echarts: CustomEchartType[];
	}

	interface cardProps {
		cardNames: any[];
		cardData: CardDataType[];
		direction: boolean;
		adwork: Object[] | undefined;
	}

	const { cardNames, cardData, direction, adwork }: cardProps = $props();

	const targetIndex = cardData.findIndex(
		(item) => item.program?.parent_table === '34_gc_tow_and_go'
	);
	if (targetIndex !== -1) {
		const [targetData] = cardData.splice(targetIndex, 1);
		cardData.unshift(targetData);

		// Do the same for cardNames, assuming it's parallel to cardData
		const [targetName] = cardNames.splice(targetIndex, 1);
		cardNames.unshift(targetName);
	}

	let flyValue = $state(direction ? -400 : 400);

	//$inspect('card data', cardData);
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

<div class="flex w-screen">
	<div
		class="top-24 left-0 z-20 flex h-full w-56 transform flex-col items-start justify-start bg-slate-600 pt-4 text-xl"
		transition:fly={{ y: 200, duration: 300 }}
	>
		{#each cardNames as cardName}
			{@render formattedEntryText(cardName)}
		{/each}
	</div>
	<div
		class="h-max-screen z-10 flex h-screen w-11/12 flex-col items-center justify-start overflow-auto scroll-smooth pt-[0%] pb-[6%]"
		transition:fly={{ x: flyValue, duration: 300 }}
	>
		<div class="flexy flex-col">
			{#each cardData as card, i}
				<div class="flexy" id={card.program.program_name.split(' ').join('')}>
					<Card project={card.program} charts={card.echarts} additionalWork={adwork} />
				</div>
			{/each}
		</div>
	</div>
</div>
