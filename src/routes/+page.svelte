<script lang="ts">
	import { jurisState } from 'jurisStore';
	import type { JurisdictionType } from '../ambient';
	import { redirect } from '@sveltejs/kit';
	import { goto } from '$app/navigation';

	interface props {
		data: JurisdictionType[];
	}

	let { data }: props = $props();
	let jurisstate = jurisState();

	$inspect('main page data', data);

	async function handleClick(jurisdiction: JurisdictionType) {
		jurisstate.setJurisdiction(jurisdiction);
		await goto(`/${jurisdiction.id}/overview`);
	}
</script>

Select a jurisdiction
<div class="flex h-screen w-1/3 flex-col items-center justify-center bg-slate-100">
	{#each data.data as jurisdiction}
		<button class="h-full w-full hover:bg-emerald-300" onclick={() => handleClick(jurisdiction)}>
			{jurisdiction.name}
		</button>
	{/each}
</div>
