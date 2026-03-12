<script lang="ts">
	import { goto } from '$app/navigation';
	import { sortDescending } from '$lib/scripts/callbackFunctions.svelte';
  import logo from "$lib/assets/HGAC_logo.svg"
	import type { JurisdictionType } from '../../ambient';
	import { jurisState } from '$stores/jurisState.svelte';

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

export const jurisdictionComparator = (
  a: JurisdictionType,
  b: JurisdictionType
): number => {
  const getOrder = (id: string): number => {
    const upper = id.toUpperCase().trim();
    if (upper.startsWith('CNTY')) return 0;
    if (upper.startsWith('CCP'))  return 1;
    if (upper.startsWith('CITY')) return 2;
    if (upper.startsWith('ISD'))  return 3;
    return 99;
  };

  const orderA = getOrder(a.jurisdiction_id);
  const orderB = getOrder(b.jurisdiction_id);

  // Primary: CNTY → CCP → CITY → ISD
  if (orderA !== orderB) return orderA - orderB;

  // Secondary: alphabetical by name (stable & clean for Tailwind tables)
  return a.name.localeCompare(b.name);
};

let filteredList: JurisdictionType[] = $derived(
  [...data.data].sort(jurisdictionComparator))

	let searchTerm: string = '';

	function handleInput(event: Event) {
		const input = event.target as HTMLInputElement;
		searchTerm = input.value;
		const filterCallback = filterByProperty<JurisdictionType>('name', searchTerm);
		filteredList = data.data.filter(filterCallback).sort(jurisdictionComparator);
	}

	// Loading state for the clicked jurisdiction (spinner + disable all buttons while navigating)
	let loadingId: JurisdictionType['id'] | null = $state(null);

	async function handleClick(jurisdiction: JurisdictionType) {
		loadingId = jurisdiction.id;

		try {
			jurisstate.clearUUID();
			jurisstate.setJurisdiction(jurisdiction);
			jurisstate.setJurisLogo(await fetchImage(jurisdiction));
			await goto(`/${jurisdiction.id}/overview`);
			// On successful navigation, the page unmounts → spinner disappears automatically
		} catch (err) {
			console.error('Failed to navigate or fetch logo:', err);
			loadingId = null; // Re-enable list on error
		}
	}

  /***********************  IMAGE FETCH ************************/

  let loading = false;

	async function fetchImage(juris: JurisdictionType) {
    let jurisId = juris.id;
    loading = true;

    // Note: `location` is undefined here — this guard may be a leftover bug.
    // If it was meant to check something, replace with proper logic. Removed effect for now.
    // if (!location) return null;

    let thumbnailUrl: string | null = null;
    let fullUrl: string | null = null;
    let filename: string | null = null;
    let errorMsg: string | null = null;

    try {
      const params = new URLSearchParams({ jurisdiction: jurisId });
      const res = await fetch(`/api/download?${params}`);

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to load image');
      }
      const data = await res.json();
      thumbnailUrl = data.thumbnailUrl;
      fullUrl = data.fullUrl;
      filename = data.filename;
    } catch (err: any) {
      errorMsg = err.message || 'Unknown error';
      console.error(err);
    } finally {
      loading = false;
      return fullUrl ?? null;
    }
  }

  $inspect('juris list',filteredList)
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

<!------------------------ MAIN CONTENT -------------------------------------------------------------->

<div class="flex flex-col w-full items-center justify-center pt-8">
  <div class="border border-slate-800 bg-slate-100 px-2 py-1 w-1/3">
    <input type="text" oninput={handleInput} placeholder="Search..." class="w-full" />
  </div>

  <div class="flex h-screen w-1/3 flex-col items-center justify-start overflow-y-auto bg-slate-100 mt-4">
    {#each filteredList as jurisdiction}
      <button
        disabled={loadingId !== null}
        class="h-12 w-full flex items-center cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 {loadingId === jurisdiction.id ? 'bg-emerald-300' : 'hover:bg-emerald-300'}"
        onclick={() => handleClick(jurisdiction)}
      >
        <span class="ml-6 flex-1 text-left">{jurisdiction.name}</span>

        {#if loadingId === jurisdiction.id}
          <span class="mr-6">
            <div class="animate-spin rounded-full h-6 w-6 border-4 border-emerald-600 border-t-transparent"></div>
          </span>
        {/if}
      </button>
    {/each}
  </div>
</div>
