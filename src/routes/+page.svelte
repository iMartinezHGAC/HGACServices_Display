<script lang="ts">
	import { jurisState } from 'jurisStore';
	import type { JurisdictionType } from '../ambient';
	import { redirect } from '@sveltejs/kit';
	import { goto } from '$app/navigation';

	interface props {
		data: {
			data: JurisdictionType[];
		};
	}

	let { data }: props = $props();
	let jurisstate = jurisState();

	//	$inspect('main page data', data);

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
		filteredList = data.data.filter(filterCallback);
	}

	async function handleClick(jurisdiction: JurisdictionType) {
		jurisstate.setJurisdiction(jurisdiction);
		await goto(`/${jurisdiction.id}/overview`);
	}
</script>

<div class="p-4">
	<p>Select a jurisdiction</p>
</div>

<div>
	<input type="text" oninput={handleInput} placeholder="Search..." />
</div>
<div class="flex h-screen w-1/3 flex-col items-center justify-center overflow-auto bg-slate-100">
	{#each filteredList as jurisdiction}
		<button class="h-full w-full hover:bg-emerald-300" onclick={() => handleClick(jurisdiction)}>
			{jurisdiction.name}
		</button>
	{/each}
</div>
