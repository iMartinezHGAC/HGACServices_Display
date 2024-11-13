<script lang="ts">
  import { tabState } from "../../state/tabState.svelte"
  let {tabText, color="gray"}: {tabText: string, color: string} = $props()
  let colorBg = $derived("bg-hgac-" + color)
  let tab = tabState()

</script>

{#if color==="gray"}
  <a
    class={`flex items-start justify-center px-5 h-16 py-3 mx-2 rounded-md font-staatliches bg-hgac-gray`}
    href="/overview"
  >
    {tabText}
  </a>
{:else if color==="green"}
  <button
    class={`flex items-start justify-center px-5 h-16 py-3 mx-2 rounded-md font-staatliches bg-hgac-green`}
    onclick={()=> tab.setTab(tabText)}
  >
    {tabText}
  </button>
{:else if color==="red"}
  <a
    class={`flex items-start justify-center px-5 h-16 py-3 mx-2 rounded-md font-staatliches bg-hgac-red`}
    href="/transportation"
  >
    {tabText}
  </a>
{:else if color==="blue"}
  <button
    class={`flex items-start justify-center px-5 h-16 py-3 mx-2 rounded-md font-staatliches bg-hgac-lightblue`}
    onclick={()=> tab.setTab(tabText)}
  >
    {tabText}
  </button>
{:else if color==="orange"}
  <button
    class={`flex items-start justify-center px-5 h-16 py-3 mx-2 rounded-md font-staatliches bg-hgac-orange`}
    onclick={()=> tab.setTab(tabText)}
  >
    {tabText}
  </button>
{/if}
