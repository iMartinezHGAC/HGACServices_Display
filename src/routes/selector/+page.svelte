<script lang="ts">
	import { jurisState } from 'jurisStore';
	import type { JurisdictionType } from '../ambient';
	import { redirect } from '@sveltejs/kit';
	import { goto } from '$app/navigation';
	import { sortDescending } from '$lib/scripts/callbackFunctions.svelte';
  import logo from "$lib/assets/HGAC_logo.svg"

	interface props {
		data: {
			data: JurisdictionType[];
		};
	}

	let { data }: props = $props();
	let jurisstate = jurisState();

	//$inspect('main page data', data);

	function escapeRegex(str: string): string {
		return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	}

	function fuzzySearch(searchTerm: string): (item: string) => boolean {
		if (!searchTerm.trim()) {
			return () => true; // Return all items if search term is empty or whitespace
		}
		const escaped = escapeRegex(searchTerm.trim());
		const pattern = escaped.split('').join('.*');
		const regex = new RegExp(pattern, 'i');
		return (item: string) => regex.test(item);
	}

	// New function to handle filtering by property
	function filterByProperty<T extends Record<string, any>>(
		prop: keyof T,
		searchTerm: string
	): (item: T) => boolean {
		const stringFilter = fuzzySearch(searchTerm);
		return (item: T) => stringFilter(item[prop] as string);
	}

	let filteredList: JurisdictionType[] = $state(data.data);

	let searchTerm: string = '';

	function handleInput(event: Event) {
		const input = event.target as HTMLInputElement;
		searchTerm = input.value;
		const filterCallback = filterByProperty<JurisdictionType>('name', searchTerm);
		filteredList = data.data.filter(filterCallback).sort(sortDescending);
	}

	async function handleClick(jurisdiction: JurisdictionType) {
		jurisstate.setJurisdiction(jurisdiction);
		await goto(`/${jurisdiction.id}/overview`);
	}
</script>

<!------------------------ PSEUDO SPLASH -------------------------------------------------------------->
<div class="flex h-20 w-screen bg-slate-800 shadow-lg shadow-slate-500 items-center justify-center">
  <span class="flex-grow"></span>
  <div class="p-4 font-bold text-3xl all-small-caps font-[Metropolis] text-slate-100">
    <p>Select a jurisdiction</p>
  </div>
  <span class="flex-grow"></span>
  <img src={logo} alt="HGAC" class="h-20">
</div>

<!------------------------ PSEUDO SPLASH -------------------------------------------------------------->

<div class="flex flex-col w-full items-center justify-center pt-8">
  <div class="border border-slate-800 bg-slate-100 px-2 py-1 w-1/3 ">
    <input type="text" oninput={handleInput} placeholder="Search..." class="w-full" />
  </div>
  <div class="flex h-screen w-1/3 flex-col items-center justify-start overflow-auto bg-slate-100">
    {#each filteredList as jurisdiction}
      <button class="h-12 w-full hover:bg-emerald-300" onclick={() => handleClick(jurisdiction)}>
        {jurisdiction.name}
      </button>
    {/each}
  </div>
</div>
