<script lang="ts">
	import StatDisplay from "./statDisplay.svelte";
  import transit from "$lib/assets/transit.svg"

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

  let postScript = ""

  //const fromColor = "#69ABDE"
  //const toColor = "#379ED0"


  function truncateYAxisValue(value: number) {
    if(value > 999999999) {
      postScript = "B"
      return value/1000000000
    }
    else if(value > 999999) {
      postScript = "M"
      return value/1000000
    }
    else if (value > 1000) {
      postScript = "K"
      return value/1000
    }
    else return value
  }

</script>

<div class="flex items-center justify-start flex-col h-full pr-24 pb-8">
  <div class="w-72 h-64 flexy flex-col text-center rounded-xl font-metropolis bg-gradient-to-b from-sky-500 to-[#69ABDE] text-slate-100 pt-0 border-2 border-slate-950 shadow-lg shadow-slate-950">
    {#if above}
      <p class="font-[Staatliches] text-3xl small-caps font-extrabold text-slate-100 w-full flexy pb-4 text-shadow text-shadow-sm">
        {aboveText}
      </p>
    {/if}
    <div class="flexy flex-row font-bold text-center">
      <div class="flexy text-[clamp(1rem,4vw,4rem)]">
        <p class="font-[Metropolis] text-[4rem] font-bold">{symbol_pre}{truncateYAxisValue(numericValue)} {postScript} </p>
        <p class="items-end text-[8rem]">{symbol_post}</p>
      </div>
    </div>
    {#if belowText}
      <div class="font-[Staatliches] text-lg flex flex-row items-center justify-center">
        {belowText}
      </div>
    {/if}
  </div>
</div>
