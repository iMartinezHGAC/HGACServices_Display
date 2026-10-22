<script lang="ts">
	import '@fontsource/staatliches';
	import '@fontsource/poppins';
	import '@fontsource/yeseva-one';
	import '@fontsource-variable/fraunces';
	import '@fontsource/patua-one';
	import '@fontsource/metropolis';
	import Splash from './components/splash.svelte';
	import type { LayoutData } from './$types';
	import type { Snippet } from 'svelte';

	import '../app.css';
	import { jurisState } from '../state/jurisState.svelte';
	import { installPrintListeners, setPrintTitleParts, printState } from '../state/printState.svelte';
	import { GetDataRangeText } from './helpers/apiHelpers';

	let { data, children }: { data: LayoutData; children: Snippet } = $props();

	const jurisId = jurisState();

	// Ctrl/Cmd+P and the browser menu: switch components to their print version
	$effect(() => installPrintListeners());

	let jurisdiction = $derived.by(() => {
		if (jurisId.jurisdiction) return jurisId.jurisdiction.name;
    else return '';
	});

  let logo_url = $derived.by(()=>{
    if(jurisId.logo_url) return jurisId.logo_url
    else return null
  })

	function toSnakeCase(tabName: string) {
		return tabName.split(' ').join('_');
	}

	function getEndOfPath(tabName: string) {
		const segments = tabName.split('/').filter((segment) => segment !== '');
		return segments[segments.length - 1] || '';
	}

	let routePath = $derived(toSnakeCase(getEndOfPath(data.routeID).toLowerCase()));

	// Names the PDF when saving from the print dialog: "<Jurisdiction> - <Tab> - <date>"
	$effect(() => {
		const tab = routePath
			.replace(/%20|_/g, ' ')
			.trim()
			.replace(/\b\w/g, (c) => c.toUpperCase());
		setPrintTitleParts([jurisdiction, tab]);
	});

	// Printed footer (bottom-left of every page, beside the page numbers in app.css). @page margin
	// boxes only take static CSS, so the rule is generated here. Re-evaluated on each print so the
	// end date is never stale.
	const print = printState();
	const dataRangeFooterCss = $derived.by(() => {
		void print.active;
		return `<style>@page { @bottom-left { content: "${GetDataRangeText()}"; font: 8pt Arial, sans-serif; color: #555; } }</style>`;
	});
</script>

<svelte:head>
	{@html dataRangeFooterCss}
</svelte:head>

<main
	data-print-reset
	class="fixed flex h-screen w-screen flex-col items-center justify-start bg-slate-200 bg-cover"
>
	{#if data.uuid}
		<Splash chosenTab={routePath} {jurisdiction} {logo_url} dashboard_groups={data.dashboard_groups as DashboardType[]} utilization={data.utilization} />
	{/if}
	{@render children()}
</main>
