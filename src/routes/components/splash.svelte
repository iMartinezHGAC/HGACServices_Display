<script lang="ts">
let {jurisdiction}: {jurisdiction: string} = $props()
import logo from "$lib/assets/HGAC_logo.svg"
import county_logo from "$lib/assets/harris_county.svg"
import Tabs from "./tabs.svelte";

let human_readable = $derived(jurisdiction
  .split("_")
  .map(word=> word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() )
  .join(" "))

let chosenTab = $state("Overview")

function handleSetChosen(tabName: string) {
  chosenTab = tabName
}

</script>

<div class="fixed flexy h-28 w-screen top-0 bg-hgac-slate shadow-lg shadow-slate-500">
  <p class="fixed left-36 text-4xl font-extrabold font-metropolis small-caps text-slate-200 select-none">{human_readable}</p>
  <img src={county_logo} alt="harris" class="fixed h-24 left-4">
  <img src={logo} alt="HGAC" class="fixed h-24 right-4">
  <div class="fixed flexy top-16">
      {#if chosenTab === "Overview"}
        <Tabs tabText="Overview" color="chosen" setChosen={handleSetChosen}/>
      {:else}
        <Tabs tabText="Overview" color="gray" setChosen={handleSetChosen}/>
      {/if}

      {#if chosenTab === "Transportation"}
        <Tabs tabText="Transportation" color="chosen" setChosen={handleSetChosen}/>
      {:else}
        <Tabs tabText="Transportation" color="blue" setChosen={handleSetChosen}/>
      {/if}

      {#if chosenTab === "Environmental"}
        <Tabs tabText="Environmental" color="chosen" setChosen={handleSetChosen}/>
      {:else}
        <Tabs tabText="Environmental" color="green" setChosen={handleSetChosen}/>
      {/if}    

      {#if chosenTab === "Workforce"}
        <Tabs tabText="Workforce" color="chosen" setChosen={handleSetChosen}/>
      {:else}
        <Tabs tabText="Workforce" color="purple" setChosen={handleSetChosen}/>
      {/if}   

      {#if chosenTab === "Crimjust"}
        <Tabs tabText="Criminal Justice" color="chosen" setChosen={handleSetChosen}/>
      {:else}
        <Tabs tabText="Criminal Justice" color="yellow" setChosen={handleSetChosen}/>
      {/if}
        <Tabs tabText="Community" color="gray" setChosen={handleSetChosen}/>
  </div>
</div>
