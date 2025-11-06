<script lang="ts">
	import { jurisState } from 'jurisStore';
	import type { JurisdictionType } from '../ambient';
	import { redirect } from '@sveltejs/kit';
	import { goto } from '$app/navigation';
	import type { FormEventHandler } from 'svelte/elements';
	import { onMount } from 'svelte';

	interface props {
    data: { data: JurisdictionType[] };
	}

	let { data }: props = $props();
	let jurisstate = jurisState();

	//$inspect('main page data', data);
  let jurisdictions = $derived(data.data)

	async function handleClick(jurisdiction: JurisdictionType) {
		jurisstate.setJurisdiction(jurisdiction);
		await goto(`/${jurisdiction.id}/overview`);
	}


  export function fuzzySearch(query: string, item: string) {
        const queryLower = query.toLowerCase()
        const itemLower = item.toLowerCase()
        let queryIndex = 0
        for (let char of itemLower) {
          if(char === queryLower[queryIndex]) {
            queryIndex++
            if (queryIndex === queryLower.length) return true
          }
        }
        return false
      }

  function handleSearch(event: Event & { currentTarget: EventTarget & HTMLInputElement }) {
    jurisdictions = jurisdictions.filter((juris: JurisdictionType) => fuzzySearch(event.currentTarget.value, juris.name))
  }

</script>

Select a jurisdiction
  <input type="text" oninput={handleSearch}>
<div class="flex h-screen w-1/3 flex-col items-center justify-center bg-slate-100 overflow-auto">
	{#each jurisdictions as jurisdiction}
		<button class="h-full w-full hover:bg-emerald-300" onclick={() => handleClick(jurisdiction)}>
			{jurisdiction.name}
		</button>
	{/each}
</div>
