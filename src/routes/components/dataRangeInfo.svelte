<script lang="ts">
	import tippy from 'tippy.js';
	import type { Placement } from 'tippy.js';

	// Tooltip text: a card's data-driven range (GetRecordsDateRangeText) or the page window (GetDataRangeText)
	let { text, placement = 'left' }: { text: string; placement?: Placement } = $props();

	function toDateRangeTippy(element: HTMLElement) {
		const instance = tippy(element, {
			content: text,
			placement,
			theme: 'slateful'
		});
		return () => instance.destroy();
	}
</script>

<button
	type="button"
	aria-label={text}
	class="flex h-10 w-10 cursor-help items-center justify-center rounded text-slate-200 hover:bg-slate-600 print:hidden"
	{@attach toDateRangeTippy}
>
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-7 w-7">
		<circle cx="12" cy="12" r="10" />
		<line x1="12" y1="16" x2="12" y2="12" />
		<line x1="12" y1="8" x2="12.01" y2="8" />
	</svg>
</button>
