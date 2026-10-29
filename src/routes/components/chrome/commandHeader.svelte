<script lang="ts">
	// Command Center (ui-alternatives 02): dark two-row top bar, service areas as underlined text tabs.
	import logo from '$lib/assets/HGAC_logo.svg';
	import help from '$lib/assets/feedback.svg';
	import Printer from '$lib/assets/printer.svelte';
	import { printPage } from '../../../state/printState.svelte';
	import DataRangeInfo from '../dataRangeInfo.svelte';
	import OptionsMenu from '../optionsMenu.svelte';
	import type { ChromeProps } from './types';

	let { tabs, jurisdiction, logo_url, feedbackUrl, dataRange, onSelect }: ChromeProps = $props();

	// hgac-blue / hgac-slate tab colours vanish on the slate bar; lighter stand-ins for the dots
	const onDark = (c: string) => (/^#?002f47$/i.test(c) ? '#C9D6DC' : /^#?025773$/i.test(c) ? '#3E93B3' : c);
</script>

<header
	class="flex h-24 w-screen flex-none flex-col border-t-4 border-[#C6093B] bg-[#002F47] px-8 font-[Metropolis] text-[#E4EEF2] shadow-lg shadow-black/30 print:hidden"
>
	<div class="flex h-14 items-center gap-4">
		{#if logo_url}
			<img src={logo_url} alt="" class="h-10 w-10 rounded-full bg-white object-contain" />
		{/if}
		<div class="flex min-w-0 flex-col">
			<p class="truncate text-xl leading-tight font-extrabold tracking-wide text-white uppercase">{jurisdiction}</p>
			<p class="text-xs text-[#8FB0BF]">H-GAC services at a glance</p>
		</div>
		<div class="flex-grow"></div>
		<span class="hidden items-center gap-2 rounded-full bg-[#00192A] px-3 py-1 text-xs xl:flex">
			<span class="h-2 w-2 rounded-full bg-[#7AB66F]"></span>{dataRange}
		</span>
		<DataRangeInfo text={dataRange} placement="bottom" />
		<a href={feedbackUrl} title="Submit feedback" class="flex h-10 w-10 items-center justify-center rounded bg-[#0B3F59] p-2 hover:bg-[#124A64]">
			<img src={help} alt="Submit feedback" class="h-6 w-6 invert" />
		</a>
		<button
			type="button"
			onclick={printPage}
			aria-label="Print or save this page as PDF"
			title="Print / Save as PDF"
			data-ui-icon-sm
			class="flex h-10 w-10 cursor-pointer items-center justify-center rounded bg-[#0B3F59] hover:bg-[#124A64]"
		>
			<Printer />
		</button>
		<OptionsMenu tone="dark" />
		<img src={logo} alt="HGAC" class="h-12 w-12" />
	</div>
	<nav class="flex h-[2.25rem] items-end gap-1 overflow-x-auto" aria-label="Service areas">
		{#each tabs as tab}
			<a
				href={tab.name}
				onclick={() => onSelect(tab.name)}
				aria-current={tab.active ? 'page' : undefined}
				class="flex flex-none items-center gap-2 border-b-[3px] px-2.5 pb-2 text-[0.8rem] whitespace-nowrap {tab.active
					? 'border-[#25B5AF] font-bold text-white'
					: 'border-transparent font-medium text-[#8FB0BF] hover:text-white'}"
			>
				{#if !tab.active}<span class="h-1.5 w-1.5 rounded-full" style:background-color={onDark(tab.color)}></span>{/if}
				{tab.label}
			</a>
		{/each}
	</nav>
</header>
