<script lang="ts">
	import type { PageData } from '../../$types';
	import { convertAllToDonut } from '$lib/scripts/convertPBtoD3.svelte';
	import type { CollectionWSubType, DonutType } from '../../../ambient';
	import StatDisplay from '../../components/statDisplay.svelte';
	import { makeDrilldownPie, makeTableDrilldownPie } from '../../helpers/chartFormatters';
	import RenderEchart from '../../components/renderEchart.svelte';

	const { data }: { data: PageData } = $props();

	interface PB_Data_Type {}

  $inspect('data', data)
  let pbData = $derived(
			data.pbData.map((entry) => 
			 entry.subCollections,
    )
	);

let combinedA = [ pbData[0], pbData[1] ];
let combinedB = [pbData[2]] 


	$inspect('pb data', pbData);
	$inspect('data A', combinedA);



	const tabColors = $derived(Object.values(data.dashboard_groups).map((item) => item.tab_color));
	const tabNames = $derived(
		Object.values(data.dashboard_groups)
			.map((item) => item.tab_name)
			.filter((tabName) => tabName !== 'Overview')
	);
  let chartA = makeTableDrilldownPie(
			'35_rtp',
		  combinedA,
      "T&G and RTP"
		)

  let chartB = makeTableDrilldownPie(
			'35_rtp',
		  combinedB,
      "TIP"
		)


  /*
  */
</script>

<!--
<div class="flex-col w-11/12 h-full z-10 overflow-y-auto">
  <div class="bg-slate-700 z-20">
    {#if blurb}
      <p class="font-poppins font-medium flexy text-slate-200 h-20">
      {blurb}
      </p>
    {/if}
  </div>
</div>
-->

<div class="fixed top-24 flex h-screen w-11/12 flex-col overflow-auto">
	<div
		class="px-auto sticky grid min-h-screen w-auto grid-cols-2 place-items-center bg-slate-700 pt-4 pb-12"
	>
    <div class="flex items-center justify-center bg-slate-100">
      <RenderEchart chart={chartA.charts} onDrilldown={chartA.onDrilldown} />
    </div>   
    <div class="flex items-center justify-center bg-slate-100">
      <RenderEchart chart={chartB.charts} onDrilldown={chartB.onDrilldown} />
    </div>

	</div>
</div>
