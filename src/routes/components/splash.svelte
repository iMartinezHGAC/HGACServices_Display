<script lang="ts">
	import logo from '$lib/assets/HGAC_logo.svg';
  import help from "$lib/assets/help.svg"
	import type { DashboardType, TabCountType } from '../../ambient';
	import { jurisState } from '../../state/jurisState.svelte';
	import Tabs from './tabs.svelte';
	import { navigating } from '$app/stores'; // Reliable legacy store (works perfectly in Svelte 5)

	interface props {
		chosenTab: string;
		jurisdiction: string;
    logo_url: string | null;
		dashboard_groups: DashboardType[];
    dash_count: TabCountType[]
	}

	let { chosenTab, jurisdiction, logo_url, dashboard_groups, dash_count }: props = $props();

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

  /**
 * Checks if a dashboard tab has any active programs (i.e., programs with non-empty parent tables)
 * 
 * @param dashboardTabsCounts - The filtered counts object where keys are dashboard tab IDs
 *                            and values are the number of active programs for that tab
 * @param dash_id - The dashboard tab ID to check (as string)
 * @returns true if the tab exists in the counts (meaning it has at least one active program),
 *          false otherwise
 */
export function hasActiveTab(
  coded_tabs: CodedTabCounts,
  dash_id: keyof CodedTabCounts
): boolean {
  return coded_tabs[dash_id] > 0
}

  const tabCodeMap = {
  workforce: "41",
  environmental: "64",
  has_enterprise_solutions: "71",
  economic_development: "55",
  aging_disability: "07",
  community_services: "92",
  public_safety: "74",
  transportation: "76",
} as const;

type CodedTabCounts = {
  [K in keyof typeof tabCodeMap as typeof tabCodeMap[K]]: number;
};

function mapToCodedTabs(data: TabCountType): CodedTabCounts {
  return {
    "41": data.has_workforce,
    "64": data.has_environmental,
    "71": data.has_enterprise_solutions,
    "55": data.has_economic_development,
    "07": data.has_aging_disability,
    "92": data.has_community_services,
    "74": data.has_public_safety,
    "76": data.has_transportation,
  };
}

  let codedTabs = $derived(mapToCodedTabs(dash_count[0]))
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

<div class="flex h-24 w-screen bg-slate-800 shadow-lg shadow-slate-500">
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
      {#if hasActiveTab(codedTabs, dash.id as keyof CodedTabCounts)}
        {@render tabSnippet(dash)}
      {/if}
		{/each}
	</div>
  <div class="flex items-end justify-center ml-20">
  <a href="https://forms.office.com/Pages/ResponsePage.aspx?id=fPNoopchv0O7u6demUrZYrnQoMQ0L-dMuGbD5f-c8VtUNVlCMFk5RFhXVUFIQ1BMN0E3VUZMM05VMC4u" class="h-12 w-12 bg-amber-50 rounded">
    <img src={help} alt="sumbit help form"/>
  </a>
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
