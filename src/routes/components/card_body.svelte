<script lang="ts">
	import { fly } from 'svelte/transition';
	import { toCamelCase } from '../helpers/caseConversion';
	import exportChartToPDF from '$lib/scripts/convertSVGtoPDF';
	import type { ProgramType, CustomEchartType, AdworkType, ChartType } from '../../ambient';
	import Card from './card.svelte';
	import { areAllChartsEmptyOrZero } from '../helpers/chartFormatters';

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

$inspect('card names', cardNames)


  cardData.forEach(card => {
    if(areAllChartsEmptyOrZero(card.echarts)) {
      cardNames = cardNames.filter(cardName => cardName !== card.program.program_name)
    }
  })

	$inspect('card data', cardData);
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

<div class="w-screen">
	<div
		class="fixed top-24 left-0 z-20 flex h-full w-56 transform flex-col items-start justify-start bg-slate-600 pt-4 text-xl"
	>
		{#each cardNames as cardName}
			{@render formattedEntryText(cardName)}
		{/each}
	</div>
	<div
		class="z-10 ml-56 flex h-screen w-[calc(100%-14rem)] flex-col items-center justify-start overflow-auto scroll-smooth pt-[0%] pb-[6%]"
		transition:fly={{ x: flyValue, duration: 300 }}
	>
		<div class="flex flex-col w-full">
			{#each cardData as card, i}
				<div class="flex w-full" id={card.program.program_name.split(' ').join('')}>
					<Card project={card.program} charts={card.echarts} additionalWork={adwork} />
				</div>
			{/each}
		</div>
	</div>
</div>
