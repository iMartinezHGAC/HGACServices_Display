<script lang="ts">
	import { onMount } from 'svelte';

	interface Props {
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
	}: Props = $props();

	let paragraph: HTMLElement;
	let clamped = $state(false);

	const maxLines = 6;
	const lineHeight = 24;
	const clampedHeight = maxLines * lineHeight; // 144px

	onMount(() => {
		requestAnimationFrame(() => {
			if (paragraph.scrollHeight > clampedHeight) {
				clamped = true;
			}
		});
	});

	function convertDateString(dateString: string): string {
		const [mStr, dStr, yStr] = dateString.split('-');
		const m = Number(mStr);
		const d = Number(dStr);
		const y = Number(yStr);

		if (isNaN(m) || isNaN(d) || isNaN(y)) return 'Invalid date';

		const year = y < 100 ? 2000 + y : y;
		const date = new Date(year, m - 1, d);

		// Basic invalid date check
		if (
			date.getMonth() !== m - 1 ||
			date.getDate() !== d ||
			date.getFullYear() !== year
		) {
			return 'Invalid date';
		}

		return date.toLocaleDateString('en-US', {
			month: 'long',
			day: 'numeric',
			year: 'numeric'
		});
	}
</script>

<div class="flex flex-col items-start justify-center border-b-2 border-slate-700 py-4">
	<p class="text-xl font-semibold">{projectName}</p>

	<div class="flex w-full items-center justify-start">
		<p class="font-[Metropolis] text-xl font-medium">{location}</p>

		{#if funding !== undefined}
			<p class="pl-8 font-[Metropolis] text-xl font-medium">
				Funding: ${funding.toLocaleString()}
			</p>
		{/if}

		<span class="flex-grow"></span>

		{#if dates.length > 1}
			<p class="text-xl font-medium">
				{convertDateString(dates[0])} - {convertDateString(dates[1])}
			</p>
		{:else}
			<p class="text-xl font-medium">{convertDateString(dates[0])}</p>
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
			class={`w-full font-[Metropolis] transition-all duration-300 ease-in-out
				${clamped && !expanded ? 'max-h-[144px] overflow-hidden mask-gradient-fade opacity-80' : 'max-h-[2000px] opacity-100'}
				${!clamped ? '' : ''}`}
		>
			{@html bodyText}
		</p>

		{#if clamped}
			<button
				class="small-caps font-gothic cursor-pointer rounded p-2 text-center text-xl font-extrabold select-none
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
