<script lang="ts">
	import logo from '$lib/assets/HGAC_logo.svg';
  import help from "$lib/assets/feedback.svg"
	import type { DashboardType, TabCountType, UtilizationBodyType, UtilizationType } from '../../ambient';
	import { jurisState } from '../../state/jurisState.svelte';
	import Tabs from './tabs.svelte';
	import Printer from '$lib/assets/printer.svelte';
	import { printPage, printState } from '../../state/printState.svelte';
	import { navigating } from '$app/stores'; // Reliable legacy store (works perfectly in Svelte 5)
	import tippy from 'tippy.js';

	interface props {
		chosenTab: string;
		jurisdiction: string;
    logo_url: string | null;
		dashboard_groups: DashboardType[];
    utilization: UtilizationType | null
	}

	let { chosenTab, jurisdiction, logo_url, dashboard_groups, utilization }: props = $props();

  // Filter out tabs where ALL programs have hasData: false
  const activeGroups = $derived(utilization?.groups.filter(group =>
    (group.programs ?? []).some(p => p.hasData)
  ))
  $inspect('utilization in layout', utilization)
  $inspect('not null utilization', activeGroups)

  const hasTab = ( (tab: string) =>
    activeGroups?.some((group: UtilizationBodyType) => group.tab === tab)
  )


	function toEverettCase(tabName: string) {
		return tabName.split(' ').join('%20');
	}

	function getEndOfPath(tabName: string) {
		const segments = tabName.split('/').filter((segment) => segment !== '');
		return segments[segments.length - 1] || '';
	}

	function handleSetChosen(tabName: string) {
		chosenTab = getEndOfPath(tabName);
	}

	$inspect('chosen tab', chosenTab);

	const dynamicFontSize = $derived.by(() => {
		if (jurisdiction.length > 21) return 'text-xl';
		if (jurisdiction.length > 13) return 'text-lg';
		return 'text-2xl';
	});

	const jurisId = jurisState();
	const print = printState();

	// Re-evaluated whenever print mode toggles, so the printed date is never stale
	// "transportation" / "public_safety" / "economic%20development" -> words, shown under the jurisdiction on paper
	const tabLabel = $derived(chosenTab.replace(/%20|_/g, ' ').trim());

	const printedOn = $derived.by(() => {
		void print.active;
		return new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
	});

	// --- Reliable delayed spinner (no loops, hides immediately, shows only on slow loads) ---
	let showSpinner = $state(false);

	$effect(() => {
		// Reset spinner on every navigation state change
		showSpinner = false;

		// If not navigating, nothing more to do
		if (!$navigating) return;

		// Schedule show after 300ms (cancels if navigation ends early)
		const timeoutId = setTimeout(() => {
			showSpinner = true;
		}, 300);

		// Cleanup: cancel timeout if navigation finishes before delay
		return () => clearTimeout(timeoutId);
	});

  const overview: DashboardType = {
    id: '00',
    tab_name: "overview",
    sort_order: 0,
    tab_color: '#f8fafc',
    tab_text_lightmode: false,
    collectionId: 'pbc_575699702',
    collectionName: 'dashboard_tabs',
  }

  //$inspect('coded tabs', codedTabs)

  function toTippy(element: HTMLElement) {
    tippy(element, {
      content: "Submit feedback",
      placement: "right-start",
      theme: 'slateful',
    })
  }
  
</script>

{#snippet tabSnippet(dash: DashboardType)}
	{#if chosenTab === toEverettCase(dash.tab_name).toLowerCase()}
		<Tabs
			tabText={dash.tab_name}
			path={dash.tab_name}
			color="#f8fafc"
			setChosen={handleSetChosen}
			uuid={jurisId.uuid}
			textLight={false}
		/>
	{:else}
		<Tabs
			tabText={dash.tab_name}
			path={dash.tab_name}
			color={dash.tab_color}
			setChosen={handleSetChosen}
			uuid={jurisId.uuid}
			textLight={dash.tab_text_light_mode}
		/>
	{/if}
{/snippet}

<!-- Print-only masthead (the interactive header below is hidden on paper) -->
<div class="mb-3 hidden items-center justify-between border-b-2 border-slate-700 pb-3 print:flex">
	<div class="flex items-center gap-4">
		{#if logo_url}
			<img src={logo_url} alt="" class="h-14" />
		{/if}
		<div class="flex flex-col">
			<p class="small-caps font-[Metropolis] text-2xl font-extrabold leading-tight text-slate-800">{jurisdiction}</p>
			{#if tabLabel}
				<p class="font-[Metropolis] text-sm font-semibold tracking-wide text-slate-500 uppercase">{tabLabel}</p>
			{/if}
		</div>
	</div>
	<div class="flex items-center gap-4">
		<p class="font-[Metropolis] text-sm text-slate-600">{printedOn}</p>
		<img src={logo} alt="HGAC" class="h-14" />
	</div>
</div>

<div class="flex h-24 w-screen bg-slate-800 shadow-lg shadow-slate-500 print:hidden">
	<div class="flex flex-none items-center justify-start">
    {#if logo_url}
      <img src={logo_url} alt="harris" class="h-24 p-2" />
    {/if}
		<p
			class="px-6 {dynamicFontSize} small-caps w-3/4 font-[Metropolis] font-extrabold text-slate-200 select-none"
		>
			{jurisdiction}
		</p>
	</div>
	<div class="flex-grow"></div>
	<div class="flex flex-wrap items-end justify-start overflow-y-auto">
    {@render tabSnippet(overview)}
		{#each dashboard_groups as dash}
      {#if hasTab(dash.tab_name)}
        {@render tabSnippet(dash)}
      {/if}
		{/each}
	</div>
  <div class="flex items-end justify-center ml-20">
  <a href="https://forms.office.com/Pages/ResponsePage.aspx?id=fPNoopchv0O7u6demUrZYrnQoMQ0L-dMuGbD5f-c8VtUNVlCMFk5RFhXVUFIQ1BMN0E3VUZMM05VMC4u" class="h-12 w-12 bg-amber-50 rounded" {@attach toTippy}>
    <img src={help} alt="sumbit help form"/>
  </a>
  </div>
  <div class="ml-4 flex items-end justify-center">
    <button
      type="button"
      onclick={printPage}
      aria-label="Print or save this page as PDF"
      title="Print / Save as PDF"
      class="flex h-12 w-12 cursor-pointer items-center justify-center rounded hover:bg-slate-700"
    >
      <Printer />
    </button>
  </div>
	<div class="flex-grow-[1]"></div>
	<img src={logo} alt="HGAC" class="right-4 h-24" />
</div>

{#if showSpinner}
	<!-- Full-screen loading overlay -->
	<div class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/70 backdrop-blur-sm">
		<svg class="animate-spin h-16 w-16 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
			<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
			<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
		</svg>
	</div>
{/if}
