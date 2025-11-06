<script lang="ts">
	import { onMount } from 'svelte';

	interface props {
		projectName: string;
		expanded: boolean;
		bodyText: string;
		location: string;
		dates: string[];
		funding?: number;
		customMetrics?: CustomMetric[];
	}

	let {
		projectName,
		expanded = false,
		bodyText,
		location,
		dates,
		funding,
		customMetrics
	}: props = $props();
	let paragraph: HTMLElement;
	let clamped = $state(false);
	const lineHeight = 24;

	onMount(() => {
		requestAnimationFrame(() => {
			const lineCount = paragraph.clientHeight / lineHeight;
			if (lineCount > 4) clamped = true;
		});
	});

	function convertDateString(dateString: string): string | null {
		const months = [
			'January',
			'February',
			'March',
			'April',
			'May',
			'June',
			'July',
			'August',
			'September',
			'October',
			'November',
			'December'
		];

		// Split the input string into parts
		const [month, day, year] = dateString.split('-');

		// Parse the parts and validate
		const monthNumber = parseInt(month, 10);
		const dayNumber = parseInt(day, 10);
		const yearNumber = parseInt(year, 10);

		if (monthNumber >= 1 && monthNumber <= 12 && dayNumber >= 1 && dayNumber <= 31) {
			const monthName = months[monthNumber - 1];
			const fullYear = yearNumber < 100 ? 2000 + yearNumber : yearNumber;
			return `${monthName} ${dayNumber}, ${fullYear}`;
		} else {
			return null; // Invalid date
		}
	}
</script>

<div class="flex flex-col items-start justify-center border-b-2 border-slate-700 py-4">
	<p class="flex text-xl font-semibold">
		{projectName}
	</p>
	<div class="flex w-full items-center justify-start">
		<p class="font-[Metropolis] text-xl font-medium">
			{location}
		</p>
		{#if funding}
			<p class="flex pl-8 font-[Metropolis] text-xl font-medium">
				Funding: ${funding}
			</p>
		{/if}
		<span class="flex-grow"></span>
		{#if dates.length > 1}
			<p class=" text-xl font-medium">
				{convertDateString(dates[0]) as string} - {convertDateString(dates[1]) as string}
			</p>
		{:else}
			<p class=" text-xl font-medium">
				{convertDateString(dates[0]) as string}
			</p>
		{/if}
	</div>
	{#if customMetrics}
		{#each customMetrics as customMetric}
			<p class="text-xl font-medium">
				{customMetric.metricName}: {customMetric.metricValue}
			</p>
		{/each}
	{/if}
	<div>
		<p
			bind:this={paragraph}
			class={`w-full overflow-hidden font-[Metropolis] transition-opacity duration-300 ease-in-out  ${clamped && !expanded ? 'mask-gradient-fade line-clamp-2 opacity-80' : ''}`}
		>
			{@html bodyText}
		</p>
		<button
			class="small-caps font-gothic cursor-pointer rounded p-2 text-center text-xl font-extrabold {expanded
				? 'rounded bg-slate-700 text-slate-100'
				: ''} select-none"
			onclick={() => (expanded = !expanded)}
		>
			{expanded ? 'Show less' : clamped ? 'Show more' : ''}
		</button>
	</div>
</div>

<style>
	.mask-gradient-fade {
		mask-image: linear-gradient(to bottom, black 60%, transparent 100%);
		-webkit-mask-image: linear-gradient(to bottom, black 60%, transparent 100%);
		mask-size: 100% 100%;
		mask-repeat: no-repeat;
	}
</style>
