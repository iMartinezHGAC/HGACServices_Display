<script lang="ts">

  console.log("Hello from navbar")

  interface props {
    cardNames: string[]
  }

  const {cardNames}: props = $props()
  $inspect(cardNames)

</script>

{#snippet formattedEntryText(cardName: string)}
  <div class="text-slate-200 font-[Metropolis] font-medium">
    {cardName}
  </div>
{/snippet}

<div class="fixed left-0 w-44 h-full bg-slate-600 flex justify-center items-start pt-4 text-xl">
  {#each cardNames as cardName}
    {@render formattedEntryText(cardName)}
  {/each}
</div>

