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

</script>

{#snippet tabSnippet(path: string, tabText: string, color: string)}
      {#if chosenTab === path}
        <Tabs tabText={tabText} color="chosen" setChosen={handleSetChosen}/>
      {:else}
        <Tabs tabText={tabText} color={color} setChosen={handleSetChosen}/>
      {/if}
{/snippet}

<div class="fixed flexy h-28 w-screen top-0 bg-hgac-slate shadow-lg shadow-slate-500">
  <p class="fixed left-36 text-4xl font-extrabold font-metropolis small-caps text-slate-200 select-none">{human_readable}</p>
  <img src={county_logo} alt="harris" class="fixed h-24 left-4">
  <img src={logo} alt="HGAC" class="fixed h-24 right-4">
  <div class="fixed flexy top-16">
      {@render tabSnippet("/overview", "Overview", "gray")}
      {@render tabSnippet("/transportation", "Transportation", "blue")}
      {@render tabSnippet("/environmental", "Environmental", "green")}
      {@render tabSnippet("/workforce", "Workforce", "purple")}
      {@render tabSnippet("/crimjust", "Public Safety", "yellow")}
      {@render tabSnippet("/community", "Community", "gray")}
      {@render tabSnippet("/aging", "Aging", "gray")}
  </div>
</div>
