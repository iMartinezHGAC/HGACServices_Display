<script lang="ts">
	import { goto } from '$app/navigation';
	import logo from '$lib/assets/HGAC_logo.svg';
	import type { JurisdictionType } from '../../ambient';
	import { jurisState } from '$stores/jurisState.svelte';
	import Sigil from '../components/sigil.svelte';

	interface props {
		data: {
			data: JurisdictionType[];
			sigils: Record<string, string>;
		};
	}

	let { data }: props = $props();
	let jurisstate = jurisState();

	/*********************** TYPES ************************/

	type Kind = 'county' | 'precinct' | 'city' | 'isd' | 'other';

	const KINDS: { kind: Kind; label: string; tag: string }[] = [
		{ kind: 'county', label: 'Counties', tag: 'County' },
		{ kind: 'precinct', label: 'Precincts', tag: 'Commissioner precinct' },
		{ kind: 'city', label: 'Cities', tag: 'City' },
		{ kind: 'isd', label: 'School districts', tag: 'School district' }
	];

	function kindOf(j: JurisdictionType): Kind {
		const upper = j.jurisdiction_id.toUpperCase().trim();
		if (upper.startsWith('CNTY')) return 'county';
		if (upper.startsWith('CCP')) return 'precinct';
		if (upper.startsWith('CITY')) return 'city';
		if (upper.startsWith('ISD')) return 'isd';
		return 'other';
	}

	const KIND_ORDER: Kind[] = ['county', 'precinct', 'city', 'isd', 'other'];

	// CNTY → CCP → CITY → ISD, then alphabetical
	function jurisdictionComparator(a: JurisdictionType, b: JurisdictionType): number {
		const order = KIND_ORDER.indexOf(kindOf(a)) - KIND_ORDER.indexOf(kindOf(b));
		return order !== 0 ? order : a.name.localeCompare(b.name);
	}

	/*********************** SEARCH ************************/

	function escapeRegex(str: string): string {
		return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	}

	// Letters in order, anything between ("hcp" finds "Harris County Precinct")
	function fuzzyRegex(term: string): RegExp {
		return new RegExp(escapeRegex(term).split('').join('.*'), 'i');
	}

	// Names that start with the search come first, then ones containing it, then fuzzy matches
	function matchRank(name: string, term: string): number {
		const n = name.toLowerCase();
		const t = term.toLowerCase();
		if (n.startsWith(t)) return 0;
		if (n.includes(t)) return 1;
		return 2;
	}

	let searchTerm = $state('');
	let activeKind: Kind | 'all' = $state('all');

	// `?? []`: while goto() leaves this page, it briefly receives the next route's data (no `data` list).
	// Throwing here aborts SvelteKit's navigation, leaving `navigating` set and the splash spinner up for good.
	const all = $derived([...(data.data ?? [])].sort(jurisdictionComparator));

	const kindCounts = $derived.by(() => {
		const counts: Record<string, number> = {};
		for (const j of all) counts[kindOf(j)] = (counts[kindOf(j)] ?? 0) + 1;
		return counts;
	});

	const filteredList = $derived.by(() => {
		const term = searchTerm.trim();
		let list = activeKind === 'all' ? all : all.filter((j) => kindOf(j) === activeKind);
		if (!term) return list;
		const regex = fuzzyRegex(term);
		return list
			.filter((j) => regex.test(j.name))
			.sort((a, b) => matchRank(a.name, term) - matchRank(b.name, term) || jurisdictionComparator(a, b));
	});

	/*********************** KEYBOARD ************************/

	let activeIndex = $state(0);
	let listEl: HTMLUListElement | undefined = $state();

	// A new search or filter starts back at the top
	$effect(() => {
		void searchTerm;
		void activeKind;
		activeIndex = 0;
	});

	function scrollActiveIntoView() {
		listEl?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`)?.scrollIntoView({ block: 'nearest' });
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'ArrowDown') {
			event.preventDefault();
			activeIndex = Math.min(activeIndex + 1, filteredList.length - 1);
			scrollActiveIntoView();
		} else if (event.key === 'ArrowUp') {
			event.preventDefault();
			activeIndex = Math.max(activeIndex - 1, 0);
			scrollActiveIntoView();
		} else if (event.key === 'Enter') {
			const target = filteredList[activeIndex];
			if (target) handleClick(target);
		} else if (event.key === 'Escape') {
			searchTerm = '';
		}
	}

	/*********************** RECENTLY VIEWED ************************/

	const RECENT_KEY = 'selector_recent';
	const RECENT_MAX = 3;

	function readRecentIds(): string[] {
		try {
			const parsed = JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]');
			return Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : [];
		} catch {
			return [];
		}
	}

	let recentIds: string[] = $state([]);
	$effect(() => {
		recentIds = readRecentIds();
	});

	// Only ones still in the list (a jurisdiction may since have been removed)
	const recent = $derived(
		recentIds.map((id) => all.find((j) => j.id === id)).filter((j): j is JurisdictionType => !!j)
	);

	function rememberRecent(j: JurisdictionType) {
		const ids = [j.id, ...readRecentIds().filter((id) => id !== j.id)].slice(0, RECENT_MAX);
		try {
			localStorage.setItem(RECENT_KEY, JSON.stringify(ids));
		} catch {
			// private window or blocked storage: the list just isn't remembered
		}
	}

	/*********************** OPEN ************************/

	// Loading state for the clicked jurisdiction (spinner + disable all buttons while navigating)
	let loadingId: JurisdictionType['id'] | null = $state(null);

	async function handleClick(jurisdiction: JurisdictionType) {
		if (loadingId !== null) return;
		loadingId = jurisdiction.id;
		rememberRecent(jurisdiction);

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

	// The full-size logo for the pages' header (the list only has thumbnails)
	async function fetchImage(juris: JurisdictionType): Promise<string | null> {
		try {
			const params = new URLSearchParams({ jurisdiction: juris.id });
			const res = await fetch(`/api/download?${params}`);
			if (!res.ok) {
				const body = await res.json().catch(() => ({}));
				throw new Error(body.message || 'Failed to load image');
			}
			const body = await res.json();
			return body.fullUrl ?? null;
		} catch (err) {
			console.error(err);
			return null;
		}
	}

	const tagFor = (j: JurisdictionType) => KINDS.find((k) => k.kind === kindOf(j))?.tag ?? 'Jurisdiction';
	const sigilFor = (j: JurisdictionType) => data.sigils?.[j.id] ?? null;
</script>

<div class="h-screen w-screen overflow-y-auto bg-[#f4f6f7] font-[Metropolis] text-[#002f47]">
	<!------------------------ HEADER -------------------------------------------------------------->
	<header class="flex h-[72px] items-center gap-4 border-b border-[#e1e6e9] bg-white px-6 md:px-10">
		<img src={logo} alt="H-GAC" class="h-12 w-12" />
		<div class="leading-tight">
			<p class="text-base font-extrabold">Services in Your Community</p>
			<p class="text-xs font-medium text-[#8a9aa3]">Houston-Galveston Area Council</p>
		</div>
	</header>

	<!------------------------ MAIN CONTENT -------------------------------------------------------------->
	<div class="mx-auto flex w-full max-w-[50rem] flex-col px-4 pt-14 pb-16">
		<h1 class="text-center text-4xl font-extrabold md:text-[2.5rem]">Find your community</h1>
		<p class="mt-3 text-center text-[1.05rem] text-[#4f6673]">
			See the H-GAC services, funding and results for a county, city, precinct or school district.
		</p>

		<div class="relative mt-8 rounded-2xl ring-4 ring-[#e3eef2]">
			<svg viewBox="0 0 24 24" aria-hidden="true" class="pointer-events-none absolute top-1/2 left-6 h-5 w-5 -translate-y-1/2 fill-none stroke-[#025773] stroke-2">
				<circle cx="10.5" cy="10.5" r="6.5" />
				<path d="m15.5 15.5 5 5" stroke-linecap="round" />
			</svg>
			<input
				type="text"
				bind:value={searchTerm}
				onkeydown={handleKeydown}
				placeholder="Search by name"
				autocomplete="off"
				role="combobox"
				aria-label="Search jurisdictions"
				aria-expanded="true"
				aria-controls="jurisdiction-list"
				aria-activedescendant={filteredList[activeIndex] ? `juris-${filteredList[activeIndex].id}` : undefined}
				class="h-16 w-full rounded-2xl border-2 border-[#025773] bg-white pr-32 pl-16 text-xl font-medium text-[#002f47] placeholder:text-[#8a9aa3] focus:border-[#025773] focus:ring-0 focus:outline-none"
			/>
			{#if searchTerm}
				<span class="pointer-events-none absolute top-1/2 right-6 hidden -translate-y-1/2 text-xs font-medium text-[#8a9aa3] sm:block">Esc to clear</span>
			{/if}
		</div>

		<div class="mt-5 flex flex-wrap gap-2.5" role="group" aria-label="Jurisdiction type">
			{#each [{ kind: 'all' as const, label: 'All' }, ...KINDS] as chip}
				{@const on = activeKind === chip.kind}
				{@const count = chip.kind === 'all' ? null : (kindCounts[chip.kind] ?? 0)}
				{#if count !== 0}
					<button
						type="button"
						aria-pressed={on}
						onclick={() => (activeKind = chip.kind)}
						class="flex h-9 items-center gap-2.5 rounded-full border px-4 text-sm font-semibold transition-colors {on
							? 'border-[#002f47] bg-[#002f47] text-white'
							: 'border-[#e1e6e9] bg-white text-[#002f47] hover:border-[#025773]'}"
					>
						{chip.label}
						{#if count !== null}
							<span class="text-xs {on ? 'text-[#a9c7d3]' : 'text-[#8a9aa3]'}">{count}</span>
						{/if}
					</button>
				{/if}
			{/each}
		</div>

		<div class="mt-5 rounded-2xl border border-[#e1e6e9] bg-white">
			<p class="px-6 pt-5 pb-2 text-[11px] font-bold tracking-wider text-[#8a9aa3] uppercase">
				{#if searchTerm.trim()}
					{filteredList.length} {filteredList.length === 1 ? 'match' : 'matches'}
				{:else}
					{filteredList.length} jurisdictions
				{/if}
			</p>

			{#if filteredList.length === 0}
				<p class="px-6 pt-2 pb-8 text-[#4f6673]">
					No jurisdictions match “{searchTerm.trim()}”{activeKind !== 'all' ? ' in this type' : ''}.
				</p>
			{:else}
				<ul
					bind:this={listEl}
					id="jurisdiction-list"
					role="listbox"
					aria-label="Jurisdictions"
					class="max-h-[30rem] overflow-y-auto px-2 pb-2"
				>
					{#each filteredList as jurisdiction, i (jurisdiction.id)}
						{@const active = i === activeIndex}
						{@const loading = loadingId === jurisdiction.id}
						<!-- keyboard users choose from the search box (arrows + Enter), as a combobox does -->
						<!-- svelte-ignore a11y_click_events_have_key_events -->
						<li
							id="juris-{jurisdiction.id}"
							data-index={i}
							role="option"
							aria-selected={active}
							aria-disabled={loadingId !== null}
							onclick={() => handleClick(jurisdiction)}
							onmouseenter={() => (activeIndex = i)}
							class="flex h-[68px] items-center gap-4 rounded-xl px-4 {loadingId !== null
								? 'cursor-not-allowed'
								: 'cursor-pointer'} {active || loading ? 'bg-[#e3eef2]' : ''} {loadingId !== null && !loading ? 'opacity-60' : ''}"
						>
							<Sigil src={sigilFor(jurisdiction)} size={44} />
							<span class="min-w-0 flex-1 truncate text-[1.05rem] font-bold">{jurisdiction.name}</span>
							<span
								class="hidden shrink-0 rounded-full border border-[#e1e6e9] px-3 py-0.5 text-xs font-semibold text-[#4f6673] sm:inline {active
									? 'bg-white'
									: 'bg-[#f4f6f7]'}"
							>
								{tagFor(jurisdiction)}
							</span>
							{#if loading}
								<span class="h-5 w-5 shrink-0 animate-spin rounded-full border-[3px] border-[#025773] border-t-transparent"></span>
							{:else}
								<svg viewBox="0 0 24 24" aria-hidden="true" class="h-5 w-5 shrink-0 fill-none stroke-2 {active ? 'stroke-[#025773]' : 'stroke-[#8a9aa3]'}">
									<path d="m9 6 6 6-6 6" stroke-linecap="round" stroke-linejoin="round" />
								</svg>
							{/if}
						</li>
					{/each}
				</ul>
				<p class="hidden px-6 pt-1 pb-4 text-xs font-medium text-[#8a9aa3] md:block">Up / Down to move · Enter to open</p>
			{/if}
		</div>

		{#if recent.length > 0}
			<p class="mt-10 text-[11px] font-bold tracking-wider text-[#8a9aa3] uppercase">Recently viewed</p>
			<div class="mt-3 flex flex-wrap gap-3">
				{#each recent as jurisdiction (jurisdiction.id)}
					<button
						type="button"
						disabled={loadingId !== null}
						onclick={() => handleClick(jurisdiction)}
						class="flex h-11 items-center gap-2.5 rounded-full border border-[#e1e6e9] bg-white pr-5 pl-2 text-sm font-semibold hover:border-[#025773] disabled:cursor-not-allowed disabled:opacity-60"
					>
						<Sigil src={sigilFor(jurisdiction)} size={28} />
						{jurisdiction.name}
					</button>
				{/each}
			</div>
		{/if}
	</div>
</div>
