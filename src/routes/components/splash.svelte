<script lang="ts">
	import logo from '$lib/assets/HGAC_logo.svg';
	import type { DashboardType, TabCountType, UtilizationBodyType, UtilizationType } from '../../ambient';
	import { printState } from '../../state/printState.svelte';
	import { navigating } from '$app/stores'; // Reliable legacy store (works perfectly in Svelte 5)
	import { GetDataRangeText } from '../helpers/apiHelpers';
	import { snakeToHuman } from '../helpers/caseConversion';
	import CivicNav from './chrome/civicNav.svelte';
	import type { NavTab } from './chrome/types';

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

  const feedbackUrl = "https://forms.office.com/Pages/ResponsePage.aspx?id=fPNoopchv0O7u6demUrZYrnQoMQ0L-dMuGbD5f-c8VtUNVlCMFk5RFhXVUFIQ1BMN0E3VUZMM05VMC4u";

  // Service-area tabs for the sidebar: Overview, then each group with data for this jurisdiction
  const navTabs: NavTab[] = $derived(
    [overview, ...(Array.isArray(dashboard_groups) ? dashboard_groups : []).filter((dash) => hasTab(dash.tab_name))].map(
      (dash) => ({
        name: dash.tab_name,
        label: snakeToHuman(dash.tab_name),
        color: dash.id === overview.id ? '#B4B4B4' : dash.tab_color,
        active: chosenTab === toEverettCase(dash.tab_name).toLowerCase()
      })
    )
  );

</script>

<!-- Print-only masthead (the sidebar navigation is hidden on paper) -->
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

<CivicNav tabs={navTabs} {jurisdiction} {logo_url} {feedbackUrl} dataRange={GetDataRangeText()} onSelect={handleSetChosen} />

{#if showSpinner}
	<!-- Full-screen loading overlay -->
	<div class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/70 backdrop-blur-sm">
		<svg class="animate-spin h-16 w-16 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
			<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
			<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
		</svg>
	</div>
{/if}
