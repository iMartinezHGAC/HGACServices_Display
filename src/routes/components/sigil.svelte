<script lang="ts">
	// A jurisdiction's seal in a white circle, whole (never cropped). While the image loads a dashed
	// ring holds its place; with no sigil (or one that fails to load) a neutral civic badge stands in.
	interface props {
		src?: string | null;
		size?: number;
	}
	let { src = null, size = 44 }: props = $props();

	// Kept per source, so a new src starts out loading without an effect racing the image's events
	let loadedSrc: string | null = $state(null);
	let failedSrc: string | null = $state(null);
	const status = $derived(src === loadedSrc ? 'loaded' : src === failedSrc ? 'failed' : 'loading');

	function settle(img: HTMLImageElement) {
		if (img.naturalWidth > 0) loadedSrc = src;
		else failedSrc = src;
	}

	// An image already in the cache can finish before Svelte attaches onload
	function checkComplete(img: HTMLImageElement) {
		if (img.complete) settle(img);
	}
</script>

<span
	aria-hidden="true"
	class="relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#e1e6e9] bg-white"
	style:width="{size}px"
	style:height="{size}px"
>
	{#if src && status !== 'failed'}
		{#if status === 'loading'}
			<span class="absolute inset-[3px] rounded-full border-[1.5px] border-dashed border-[#b9ccd4] bg-[#eef3f5]"></span>
		{/if}
		<img
			{src}
			alt=""
			loading="lazy"
			decoding="async"
			class="h-full w-full object-contain transition-opacity duration-200 {status === 'loaded' ? 'opacity-100' : 'opacity-0'}"
			onload={(e) => settle(e.currentTarget as HTMLImageElement)}
			onerror={() => (failedSrc = src)}
			{@attach checkComplete}
		/>
	{:else}
		<span class="flex h-full w-full items-center justify-center bg-[#f4f6f7]">
			<svg viewBox="0 0 24 24" class="h-1/2 w-1/2 fill-[#8a9aa3]">
				<path d="M12 3 2 8h20L12 3Z" />
				<rect x="4.5" y="9.5" width="2.5" height="8" />
				<rect x="10.75" y="9.5" width="2.5" height="8" />
				<rect x="17" y="9.5" width="2.5" height="8" />
				<rect x="2" y="19" width="20" height="2.5" />
			</svg>
		</span>
	{/if}
</span>
