<script lang="ts">
import logo from "$lib/assets/HGAC_logo.svg"
import county_logo from "$lib/assets/harris_county.svg"
import { jurisState } from "jurisStore";

import { snakeToHuman } from "$routes/helpers/caseConversion"
import Tabs from "./tabs.svelte";

interface props {
  chosenTab: string,
  jurisdiction: string,
  dashboard_groups: DashboardType[]
}

let {chosenTab, jurisdiction, dashboard_groups}: props = $props()

let human_readable = $derived(snakeToHuman(jurisdiction))

function toSnakeCase(tabName: string) {
  return tabName.split(' ').join('_')
}

function toEverettCase(tabName: string) {
  return tabName.split(' ').join('%20')
}

function getEndOfPath(tabName: string) {
  const segments = tabName.split('/').filter(segment => segment !== '')
  return segments[segments.length - 1] || ''
}

function handleSetChosen(tabName: string) {
  chosenTab = getEndOfPath(tabName)
}

$inspect("chosen tab", chosenTab)


const jurisId = jurisState()

</script>

{#snippet tabSnippet(dash: DashboardType)}
      {#if chosenTab === toEverettCase(dash.tab_name).toLowerCase()}
        <Tabs tabText={dash.tab_name} path={dash.tab_name} color="#334155" setChosen={handleSetChosen} uuid={jurisId.uuid} textLight={dash.tab_text_light_mode}/>
      {:else}
        <Tabs tabText={dash.tab_name} path={dash.tab_name} color={dash.tab_color} setChosen={handleSetChosen} uuid={jurisId.uuid} textLight={dash.tab_text_light_mode}/>
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
      {@render tabSnippet(dash)}
    {/each}
  </div>
  <div class="flex-grow"></div>
  <img src={logo} alt="HGAC" class="h-24 right-4">
</div>
