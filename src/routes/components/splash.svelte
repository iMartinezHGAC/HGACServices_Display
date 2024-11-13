<script lang="ts">
let {jurisdiction}: {jurisdiction: string} = $props()
import logo from "$lib/assets/HGAC_logo.svg"
import county_logo from "$lib/assets/harris_county.svg"
import Tabs from "./tabs.svelte";

let human_readable = $derived(jurisdiction
  .split("_")
  .map(word=> word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() )
  .join(" "))

</script>

<div class="fixed flexy h-28 w-screen top-0 bg-gradient-to-l from-hgac-red from-10% via-amber-300 via-25% to-amber-100 shadow-lg shadow-slate-500">
  <p class="fixed left-36 text-2xl font-semibold font-yeseva small-caps text-slate-700">{human_readable}</p>
  <img src={county_logo} alt="harris" class="fixed h-24 left-4">
  <img src={logo} alt="HGAC" class="fixed h-24 right-4">
<div class="fixed flexy top-16">
  <Tabs tabText="Overview" color="gray"/>
  <Tabs tabText="Transportation" color="red"/>
  <Tabs tabText="Environmental" color="orange"/>
  <Tabs tabText="Workforce" color="green"/>
  <Tabs tabText="Criminal Justice" color="blue"/>
</div>
</div>
