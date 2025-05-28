<script lang="ts">
	import StatDisplay from "./statDisplay.svelte";

interface propTypes {
  above: boolean,
  below: boolean,
  aboveText: string,
  belowText: string,
  numericValue: number,
  symbol_pre?: string,
  symbol_post?: string, 
}

let {
  above = false,
  below = false,
  aboveText = "",
  belowText = "",
  numericValue = 15,
  symbol_pre = "",
  symbol_post = "",
}: propTypes = $props()

  $inspect("Above text: ", aboveText)

</script>

<div class="flex items-center justify-start flex-col h-full pr-24 pb-8">
  <div class="w-72 h-64 flexy flex-col text-center rounded-xl font-metropolis bg-gradient-to-b from-slate-700 to-slate-600 text-slate-100 pt-0 border-2 border-slate-950 shadow-lg shadow-slate-950">
    {#if above}
      <p class="font-[Metropolis] text-[clamp(1rem,8vw,2.2rem)] small-caps font-extrabold text-slate-100 w-full flexy pb-4">
        {aboveText}
      </p>
    {/if}
    <div class="flexy flex-row font-bold text-center">
      <div class="flexy text-[clamp(1rem,4vw,4rem)]">
        <p class="items-end text-[7rem]">{symbol_pre}</p>
        <p class="font-[Metropolis]">{numericValue} </p>
        <p class="items-end text-[8rem]">{symbol_post}</p>
      </div>
    </div>
    {#if below}
      <div>
        {belowText}
      </div>
    {/if}
  </div>
</div>
