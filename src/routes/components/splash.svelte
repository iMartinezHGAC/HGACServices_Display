<script lang="ts">
import logo from "$lib/assets/HGAC_logo.svg"
import county_logo from "$lib/assets/harris_county.svg"
	import { jurisState } from "jurisStore";
import Tabs from "./tabs.svelte";

let {chosenTab, jurisdiction, dashboard_groups}: {chosenTab: string, jurisdiction: string, dashboard_groups: string[]} = $props()

let human_readable = $derived(jurisdiction
  .split("_")
  .map(word=> word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() )
  .join(" "))


function toSnakeCase(tabName: string) {
  return tabName.split(' ').join('_')
}

function getEndOfPath(tabName: string) {
  const segments = tabName.split('/').filter(segment => segment !== '')
  return segments[segments.length - 1] || ''
}

function handleSetChosen(tabName: string) {
  chosenTab = toSnakeCase(getEndOfPath(tabName).toLowerCase())
}


const jurisId = jurisState()

</script>

{#snippet tabSnippet(path: string, tabText: string, color: string)}
      {#if chosenTab === path}
        <Tabs tabText={tabText} path={path} color="chosen" setChosen={handleSetChosen} uuid={jurisId.uuid}/>
      {:else}
        <Tabs tabText={tabText} path={path} color={color} setChosen={handleSetChosen} uuid={jurisId.uuid}/>
      {/if}
{/snippet}

<div class="flex h-24 w-screen bg-slate-800 shadow-lg shadow-slate-500">
  <div class="flex justify-start items-center flex-none">
    <img src={county_logo} alt="harris" class="h-24 p-2">
    <p class="px-6 text-2xl w-3/4 font-extrabold font-[Metropolis] small-caps text-slate-200 select-none">{human_readable}</p>
  </div>
  <div class="flex-grow"></div>
  <div class="flex items-end justify-start flex-wrap overflow-y-auto">
    {#each dashboard_groups as dash }
      {@render tabSnippet(dash, "Overview", "gray")}
    {/each}
      {@render tabSnippet("community", "Community Planning", "blue")}
      {@render tabSnippet("emergency", "Emergency Preparedness", "red")}
      {@render tabSnippet("economic_development", "Economic Development", "orange")}
      {@render tabSnippet("environmental", "Environmental", "green")}
      {@render tabSnippet("public_safety", "Public Safety", "dblue")}
      {@render tabSnippet("transportation", "Transportation", "purple")}
      {@render tabSnippet("aging", "Aging", "pink")}
      {@render tabSnippet("buy", "Business Services", "biznis")}
  </div>
  <div class="flex-grow"></div>
  <img src={logo} alt="HGAC" class="h-24 right-4">
</div>
