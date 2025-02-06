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


</script>

<div class="flex items-center justify-start flex-col h-full bg-slate-700 pr-24 pt-0">
  {#if above}
  <p class="font-staatliches text-2xl text-slate-200 w-full flexy pb-12">
    {aboveText}
  </p>
  {/if}
  <div class="w-64 h-64 flexy flex-col text-center rounded-xl font-metropolis text-slate-100 pt-4 border-2 border-slate-950 shadow-md shadow-slate-950">

    <div class="flexy flex-row font-bold text-center">
      <div class="flexy text-[5rem]">
        <p class="items-end text-[7rem]">{symbol_pre}</p>
        {numericValue}
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
