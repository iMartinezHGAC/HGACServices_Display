<script lang="ts">
	import { onMount } from 'svelte';
	import type { AdworkType } from '../../ambient';
	import { printState } from '../../state/printState.svelte';

	interface Props {
		expanded: boolean;
    adwork: AdworkType
	}

	let {
		expanded = false,
    adwork,
	}: Props = $props();

	const print = printState();
	let paragraph: HTMLElement;
	let clamped = $state(false);

	const maxLines = 6;
	const lineHeight = 24;
	const clampedHeight = maxLines * lineHeight; // 144px

  //$inspect('if funding', adwork.budget)

	onMount(() => {
		requestAnimationFrame(() => {
			if (paragraph.scrollHeight > clampedHeight) {
				clamped = true;
			}
		});
	});

function formatDate(input: string | Date | null | undefined): string {
	if (!input) {
		return 'Invalid date';
	}

	let date: Date;

	if (typeof input === 'string') {
		date = new Date(input);
	} else if (input instanceof Date) {
		date = input;
	} else {
		return 'Invalid date';
	}

	if (isNaN(date.getTime())) {
		return 'Invalid date';
	}

	return date.toLocaleDateString('en-US', {
		month: 'long',
		day: 'numeric',
		year: 'numeric',
		timeZone: 'UTC'  // Ensures the date is shown as the UTC calendar date (e.g., "January 1, 2012")
	});
}

</script>

<div data-print-avoid class="flex flex-col items-start justify-center border-b-2 border-slate-700 py-4 print:py-2">
	<p class="text-xl font-semibold print:text-[11pt]">{adwork.project_name}</p>

	<div class="flex w-full items-center justify-start">

		{#if adwork.budget !== undefined || adwork.budget !== 0}
			<p class="pl-8 font-[Metropolis] text-xl font-medium print:pl-3 print:text-[9pt]">
				Budget: ${adwork.budget.toLocaleString()}
			</p>
		{/if}

		<span class="flex-grow"></span>

		{#if adwork.start_date && adwork.end_date}
			<p class="text-xl font-medium print:text-[9pt]">
				{formatDate(adwork.start_date)} - {formatDate(adwork.end_date)}
			</p>
		{:else}
			<p class="text-xl font-medium print:text-[9pt]">{formatDate(adwork.start_date)}</p>
		{/if}
	</div>

	{#if adwork.custom_metrics}
		{#each adwork.custom_metrics as customMetric}
			<p class="text-xl font-medium print:text-[9pt]">
				{customMetric.metric_name}: {customMetric.metric_value}
			</p>
		{/each}
	{/if}

	<div>
		<p
			bind:this={paragraph}
			class={`w-full font-[Metropolis] print:text-[9pt] print:leading-snug transition-all duration-300 ease-in-out
				${clamped && !expanded && !print.active ? 'max-h-[144px] overflow-hidden mask-gradient-fade opacity-80' : 'max-h-[2000px] opacity-100'}
				${!clamped ? '' : ''}`}
		>
			{@html adwork.project_description}
		</p>

		{#if clamped}
			<button
				class="small-caps font-gothic cursor-pointer rounded p-2 text-center text-xl font-extrabold select-none print:hidden
					{expanded ? 'bg-slate-700 text-slate-100' : ''}"
				onclick={() => (expanded = !expanded)}
			>
				{expanded ? 'Show less' : 'Show more'}
			</button>
		{/if}
	</div>
</div>

<style>
	.mask-gradient-fade {
		mask-image: linear-gradient(to bottom, black 85%, transparent 100%);
		-webkit-mask-image: linear-gradient(to bottom, black 85%, transparent 100%);
	}
</style>
