<script lang="ts">
	import { UI_THEMES, setUiTheme, useUiTheme } from '../../state/uiTheme.svelte';

	interface Props {
		/** Button colours: "dark" for dark headers, "light" for light ones */
		tone?: 'dark' | 'light';
		/** Where the panel opens: below the button aligned right, or above it aligned left */
		placement?: 'bottom-end' | 'top-start';
		/** Show the word "Options" beside the gear */
		label?: boolean;
	}

	let { tone = 'dark', placement = 'bottom-end', label = false }: Props = $props();

	const theme = useUiTheme();
	let open = $state(false);
	let root = $state<HTMLElement>();

	function onWindowClick(event: MouseEvent) {
		if (open && root && !root.contains(event.target as Node)) open = false;
	}

	function onKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') open = false;
	}
</script>

<svelte:window onclick={onWindowClick} onkeydown={onKeydown} />

<div bind:this={root} class="relative print:hidden" data-ui-options>
	<button
		type="button"
		aria-label="Options"
		aria-haspopup="true"
		aria-expanded={open}
		title="Options"
		onclick={() => (open = !open)}
		class="flex h-12 cursor-pointer items-center justify-center gap-2 rounded {label ? 'px-3' : 'w-12'} {tone === 'dark'
			? 'text-slate-200 hover:bg-slate-700'
			: 'text-slate-600 hover:bg-slate-200'}"
	>
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-7 w-7">
			<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
			<circle cx="12" cy="12" r="3" />
		</svg>
		{#if label}<span class="font-[Metropolis] text-sm font-semibold">Options</span>{/if}
	</button>

	{#if open}
		<div
			role="dialog"
			aria-label="Options"
			class="absolute z-50 w-80 rounded-xl border border-slate-200 bg-white p-4 text-left text-slate-800 shadow-xl shadow-slate-900/20 {placement === 'bottom-end'
				? 'top-full right-0 mt-2'
				: 'bottom-full left-0 mb-2'}"
		>
			<p class="mb-1 font-[Metropolis] text-xs font-bold tracking-widest text-slate-500 uppercase">Interface</p>
			<p class="mb-3 font-[Metropolis] text-xs text-slate-500">Changes how the dashboard looks on screen. Printing is not affected.</p>
			<fieldset class="flex flex-col gap-1">
				<legend class="sr-only">Interface theme</legend>
				{#each UI_THEMES as t}
					<label
						class="flex cursor-pointer items-start gap-3 rounded-lg px-3 py-2 hover:bg-slate-100 {theme.id === t.id ? 'bg-slate-100' : ''}"
					>
						<input
							type="radio"
							name="ui-theme"
							value={t.id}
							checked={theme.id === t.id}
							onchange={() => setUiTheme(t.id)}
							class="mt-1 text-[#C6093B] focus:ring-[#C6093B]"
						/>
						<span class="flex flex-col">
							<span class="font-[Metropolis] text-sm font-bold">{t.name}</span>
							<span class="font-[Metropolis] text-xs text-slate-500">{t.description}</span>
						</span>
					</label>
				{/each}
			</fieldset>
		</div>
	{/if}
</div>
