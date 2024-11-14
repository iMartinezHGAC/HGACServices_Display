<script lang="ts">
interface propTypes {
  above: boolean,
  below: boolean,
  aboveText: string,
  belowText: string,
  numericValue: number,
  symbol_pre: string,
  symbol_post: string, 
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

<div class="w-1/4 flexy flex-col h-1/4 bg-sky-900 rounded-xl font-metropolis text-slate-100 font-bold">
  {#if above}
    <div>
      {aboveText}
    </div>
  {/if}
  <div class="flexy flex-row">
    <div class="flexy text-[8rem]">
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
