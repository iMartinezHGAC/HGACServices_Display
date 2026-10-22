<script lang="ts">
	import tippy from 'tippy.js';
	import { DEFAULT_QUARTERS, GetDataRangeText } from '../helpers/apiHelpers';

	// Must match the `quarters` the card's data was loaded with (GenerateFilter -> GetQuarters)
	let { quarters = DEFAULT_QUARTERS }: { quarters?: number } = $props();

	const dataRange = $derived(GetDataRangeText(quarters));

	function toDateRangeTippy(element: HTMLElement) {
		const instance = tippy(element, {
			content: dataRange,
			placement: 'left',
			theme: 'slateful'
		});
		return () => instance.destroy();
	}
</script>

<button
	type="button"
	aria-label={dataRange}
	class="flex h-10 w-10 cursor-help items-center justify-center rounded text-slate-200 hover:bg-slate-600 print:hidden"
	{@attach toDateRangeTippy}
>
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-7 w-7">
		<circle cx="12" cy="12" r="10" />
		<line x1="12" y1="16" x2="12" y2="12" />
		<line x1="12" y1="8" x2="12.01" y2="8" />
	</svg>
</button>
