<script lang="ts">
	// App navigation (ui-alternatives 01, "Civic Light"): left sidebar with the service areas, the
	// current tab's programs nested under it, and a page title bar across the top of the content.
	import logo from '$lib/assets/HGAC_logo.svg';
	import Printer from '$lib/assets/printer.svelte';
	import { printPage } from '../../../state/printState.svelte';
	import { programNav } from '../../../state/programNav.svelte';
	import { toCamelCase } from '../../helpers/caseConversion';
	import type { ChromeProps } from './types';

	let { tabs, jurisdiction, logo_url, feedbackUrl, dataRange, onSelect }: ChromeProps = $props();

	const programs = programNav();
	const activeTab = $derived(tabs.find((t) => t.active));
</script>

<aside
	data-ui-civic-nav
	class="fixed top-0 left-0 z-30 flex h-screen w-[17rem] flex-col gap-5 overflow-y-auto border-r border-[#E1E6E9] bg-white px-4 py-6 font-[Metropolis] print:hidden"
>
	<div class="flex items-center gap-3 px-2">
		<img src={logo} alt="H-GAC" class="h-14 w-14" />
		<p class="text-lg leading-tight font-extrabold text-[#002F47]">Services<br /><span class="text-[#C6093B]">Dashboard</span></p>
	</div>

	<div class="flex items-center gap-3 rounded-xl border border-[#E1E6E9] bg-[#F4F6F7] p-3">
		{#if logo_url}
			<img src={logo_url} alt="" class="h-10 w-10 rounded-full bg-white object-contain" />
		{/if}
		<div class="flex flex-col">
			<span class="text-[0.65rem] font-semibold tracking-widest text-[#8A9AA3] uppercase">Jurisdiction</span>
			<span class="leading-tight font-bold text-[#002F47]">{jurisdiction}</span>
		</div>
	</div>

	<nav class="flex flex-col gap-0.5" aria-label="Service areas">
		<p class="px-2 pb-2 text-[0.7rem] font-semibold tracking-widest text-[#8A9AA3] uppercase">Service areas</p>
		{#each tabs as tab}
			<a
				href={tab.name}
				onclick={() => onSelect(tab.name)}
				aria-current={tab.active ? 'page' : undefined}
				class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm {tab.active
					? 'rounded-l-none border-l-[3px] border-[#C6093B] bg-[#E2EDF1] font-semibold text-[#002F47]'
					: 'font-medium text-[#4F6673] hover:bg-[#F4F6F7]'}"
			>
				<span class="h-2 w-2 flex-none rounded-full" style:background-color={tab.color}></span>
				{tab.label}
			</a>
			{#if tab.active && programs.names.length > 0}
				<div class="mb-1 ml-5 flex flex-col border-l border-[#E1E6E9] py-1">
					{#each programs.names as name}
						<a
							href={toCamelCase(name)}
							class="py-1.5 pr-2 pl-4 text-[0.8rem] leading-snug {programs.active === name
								? '-ml-px border-l-2 border-[#025773] font-semibold text-[#025773]'
								: 'text-[#4F6673] hover:text-[#002F47]'}"
						>
							{name}
						</a>
					{/each}
				</div>
			{/if}
		{/each}
	</nav>

	<div class="flex-grow"></div>

	<div class="flex flex-col gap-1 border-t border-[#E1E6E9] px-2 pt-4">
		<span class="text-xs font-semibold text-[#8A9AA3]">Data coverage</span>
		<span class="text-sm font-medium text-[#4F6673]">{dataRange}</span>
		<a href={feedbackUrl} class="text-sm font-semibold text-[#025773] hover:underline">Submit feedback →</a>
	</div>
</aside>

<!-- Title bar over the content frame -->
<div
	class="fixed top-0 right-0 left-[17rem] z-20 flex h-24 items-end gap-3 bg-[#F4F6F7] px-9 pb-3 font-[Metropolis] print:hidden"
>
	<div class="flex min-w-0 flex-grow flex-col">
		<span class="text-xs font-medium text-[#8A9AA3]">{jurisdiction} / {activeTab?.label ?? ''}</span>
		<h1 class="truncate text-3xl font-bold text-[#002F47]">{activeTab?.label ?? ''}</h1>
	</div>
	<span class="flex items-center gap-2 rounded-full bg-[#E2EDF1] px-3 py-1.5 text-xs font-medium text-[#002F47]">
		<span class="h-2 w-2 rounded-full bg-[#7AB66F]"></span>{dataRange}
	</span>
	<a href={feedbackUrl} class="rounded-lg border border-[#E1E6E9] bg-white px-4 py-2 text-sm font-semibold text-[#4F6673] hover:bg-slate-50">Feedback</a>
	<button
		type="button"
		onclick={printPage}
		data-ui-icon-sm
		class="flex cursor-pointer items-center gap-2 rounded-lg bg-[#002F47] px-4 py-2 text-sm font-semibold text-white hover:bg-[#025773]"
	>
		<Printer /> Print / PDF
	</button>
</div>
