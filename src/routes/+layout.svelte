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

	let { data, children }: { data: LayoutData; children: Snippet } = $props();

	const jurisId = jurisState();

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
</script>

<main
	class="fixed flex h-screen w-screen flex-col items-center justify-start bg-slate-200 bg-cover"
>
	{#if data.uuid}
		<Splash chosenTab={routePath} {jurisdiction} {logo_url} dashboard_groups={data.dashboard_groups as DashboardType[]} utilization={data.utilization} />
	{/if}
	{@render children()}
</main>
