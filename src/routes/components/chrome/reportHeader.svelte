<script lang="ts">
	// Annual Report (ui-alternatives 03): editorial masthead; service areas read as a table of contents.
	import logo from '$lib/assets/HGAC_logo.svg';
	import { printPage } from '../../../state/printState.svelte';
	import OptionsMenu from '../optionsMenu.svelte';
	import type { ChromeProps } from './types';

	let { tabs, jurisdiction, logo_url, feedbackUrl, dataRange, onSelect }: ChromeProps = $props();
</script>

<header
	class="flex h-24 w-screen flex-none items-center gap-8 border-b-2 border-[#002F47] bg-[#FAFAF8] px-10 font-[Metropolis] print:hidden"
>
	<div class="flex flex-none items-center gap-4">
		{#if logo_url}
			<img src={logo_url} alt="" class="h-12 w-12 object-contain" />
		{/if}
		<div class="flex flex-col">
			<span class="text-[0.65rem] font-bold tracking-[0.25em] text-[#C6093B] uppercase">H-GAC Services Report</span>
			<span class="font-[Fraunces_Variable] text-3xl leading-tight font-semibold text-[#002F47]">{jurisdiction}</span>
		</div>
	</div>

	<nav class="flex min-w-0 flex-grow flex-wrap content-center gap-x-5 gap-y-1" aria-label="Sections">
		{#each tabs as tab, i}
			<a
				href={tab.name}
				onclick={() => onSelect(tab.name)}
				aria-current={tab.active ? 'page' : undefined}
				class="text-[0.8rem] whitespace-nowrap {tab.active
					? 'font-bold text-[#002F47] underline decoration-[#C6093B] decoration-2 underline-offset-4'
					: 'font-medium text-[#4F6673] hover:text-[#002F47]'}"
			>
				{i === 0 ? tab.label : `${String(i).padStart(2, '0')} ${tab.label}`}
			</a>
		{/each}
	</nav>

	<div class="flex flex-none flex-col items-end gap-1">
		<span class="text-xs text-[#4F6673]">Reporting period · {dataRange}</span>
		<div class="flex gap-4 text-sm font-semibold text-[#025773]">
			<button type="button" onclick={printPage} class="cursor-pointer underline underline-offset-2">Download PDF</button>
			<a href={feedbackUrl} class="underline underline-offset-2">Feedback</a>
		</div>
	</div>
	<OptionsMenu tone="light" />
	<img src={logo} alt="HGAC" class="h-16 w-16 flex-none" />
</header>
