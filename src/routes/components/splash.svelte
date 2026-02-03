<script lang="ts">
	import logo from '$lib/assets/HGAC_logo.svg';
	import county_logo from '$lib/assets/harris_county.svg';
	import type { DashboardType } from '../../ambient';
	import { jurisState } from '../../state/jurisState.svelte';
	import Tabs from './tabs.svelte';

	interface props {
		chosenTab: string;
		jurisdiction: string;
    logo_url: string | null;
		dashboard_groups: DashboardType[];
	}

	let { chosenTab, jurisdiction, logo_url, dashboard_groups }: props = $props();

	function toSnakeCase(tabName: string) {
		return tabName.split(' ').join('_');
	}

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
		if (jurisdiction.length > 13) return 'text-xl';
		if (jurisdiction.length > 21) return 'text-lg';
		return 'text-2xl';
	});

	const jurisId = jurisState();
</script>

{#snippet tabSnippet(dash: DashboardType)}
	{#if chosenTab === toEverettCase(dash.tab_name).toLowerCase()}
		<Tabs
			tabText={dash.tab_name}
			path={dash.tab_name}
			color="#334155"
			setChosen={handleSetChosen}
			uuid={jurisId.uuid}
			textLight={dash.tab_text_light_mode}
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
    {#if jurisId.logo_url}
      <img src={jurisId.logo_url} alt="harris" class="h-24 p-2" />
    {/if}
		<p
			class="px-6 {dynamicFontSize} small-caps w-3/4 font-[Metropolis] font-extrabold text-slate-200 select-none"
		>
			{jurisdiction}
		</p>
	</div>
	<div class="flex-grow"></div>
	<div class="flex flex-wrap items-end justify-start overflow-y-auto">
		{#each dashboard_groups as dash}
			{@render tabSnippet(dash)}
		{/each}
	</div>
	<div class="flex-grow"></div>
	<img src={logo} alt="HGAC" class="right-4 h-24" />
</div>
