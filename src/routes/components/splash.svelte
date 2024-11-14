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

<div class="fixed flexy h-28 w-screen top-0 bg-hgac-slate shadow-lg shadow-slate-500">
  <p class="fixed left-36 text-2xl font-medium font-metropolis small-caps text-slate-200 select-none">{human_readable}</p>

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
