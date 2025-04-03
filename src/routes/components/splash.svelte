<script lang="ts">
import logo from "$lib/assets/HGAC_logo.svg"
import county_logo from "$lib/assets/harris_county.svg"
import Tabs from "./tabs.svelte";

let {chosenTab, jurisdiction}: {chosenTab: string, jurisdiction: string} = $props()
let humanChosenTab = $derived(chosenTab.slice(1))
//$inspect(humanChosenTab)

let human_readable = $derived(jurisdiction
  .split("_")
  .map(word=> word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() )
  .join(" "))

function handleSetChosen(tabName: string) {
  chosenTab = tabName
}

  console.log(jurisdiction)

</script>

{#snippet tabSnippet(path: string, tabText: string, color: string)}
      {#if chosenTab === path}
        <Tabs tabText={tabText} path={path} color="chosen" setChosen={handleSetChosen}/>
      {:else}
        <Tabs tabText={tabText} path={path} color={color} setChosen={handleSetChosen}/>
      {/if}
{/snippet}

<div class="flexy h-24 w-screen bg-slate-800 shadow-lg shadow-slate-500">
  <div class="flex justify-start items-center w-1/4">
    <img src={county_logo} alt="harris" class="h-24 p-2">
    <p class="px-6 text-2xl w-3/4 font-extrabold font-[Metropolis] small-caps text-slate-200 select-none">{human_readable}</p>
  </div>
  <div class="flexy absolute top-12">
      {@render tabSnippet("overview", "Overview", "gray")}
      {@render tabSnippet("community", "Community Planning", "blue")}
      {@render tabSnippet("emergency", "Emergency Preparedness", "red")}
      {@render tabSnippet("economic_development", "Economic Development", "orange")}
      {@render tabSnippet("environmental", "Environmental", "green")}
      {@render tabSnippet("public_safety", "Public Safety", "dblue")}
      {@render tabSnippet("transportation", "Transportation", "purple")}
      {@render tabSnippet("aging", "Aging", "pink")}
      {@render tabSnippet("workforce", "Workforce", "teal")}
  </div>
  <div class="flex-grow"></div>
  <img src={logo} alt="HGAC" class="h-24 right-4">
</div>
