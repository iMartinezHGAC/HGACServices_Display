<svelte:head>
    <!-- Development -->
  <script src="https://unpkg.com/@popperjs/core@2/dist/umd/popper.min.js"></script>
  <script src="https://unpkg.com/tippy.js@6/dist/tippy-bundle.umd.js"></script>

</svelte:head>

<script lang="ts">
  import tippy from "tippy.js";

  const data = [
    {
      name: "Transportation Demand Modeling",
      value: 2100,
    },
    {
      name: "Transportation Planning Studies",
      value: 1100,
    },
    {
      name: "Gulf Coast Regional Tow and Go",
      value: 2800,
    },
    {
      name: "Transporation Improvement Plan",
      value: 3100,
    },
    {
      name: "Regional Transporation Plan",
      value: 2800,
    },
    {
      name: "Clean Vehicles Program",
      value: 8800,
    },
  ]

  const dataNames = data.map(item => item.name)
  const dataSumOfValues = data
    .map(item => item.value)
    .reduce((accumulator, currentValue) => accumulator + currentValue, 0)

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
    numericValue,
    symbol_pre = "",
    symbol_post = "",
  }: propTypes = $props()

  $inspect("Above text: ", aboveText)
  let postScript = ""
  const PRECISION = 3

  function truncateYAxisValue(value: number) {
    if(value > 999999999) {
      postScript = "B"
      return (value/1000000000).toPrecision(PRECISION).toLocaleString();
    }
    else if(value > 999999) {
      postScript = "M"
      return (value/1000000).toPrecision(PRECISION).toLocaleString();
    }
    else if (value > 10000) {
      postScript = "K"
      return (value/10000).toPrecision(PRECISION).toLocaleString();
    }
    else return value
  }

  let dataTable = $state<HTMLElement>()
import 'tippy.js/themes/translucent.css';
	import UseHart from "./useHART.svelte";
  function toTippy(element: HTMLElement) {
    tippy(element, {
      content: dataTable,
      placement: "right-start",
      theme: 'slateful',
    })
  }


</script>

<style> 
:global(.tippy-box[data-theme~='slateful']) {
  color: #F1F5F9;
  background-color: oklch(27.9% 0.041 260.031);
  font-family: Metropolis;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
  font-size: 1rem;
  padding: 0.5rem 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

:global(.tippy-box[data-theme='custom'] .tippy-arrow) {
  background-color: oklch(37.2% 0.044 257.287);
}
</style>
 <!-- Hidden Table -->
<!--
  <div class="opacity-0 scale-0">
    <div bind:this={dataTable}>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {#each data as {name, value}}
            <tr>
              <td>{name}</td>
              <td class="px-4">${value}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
-->

<!-- Indicator Card -->
  <div class="w-full max-w-[24rem] h-64 px-2 mx-auto my-8 flex flex-col items-center justify-center text-center rounded-xl font-metropolis bg-slate-800 text-slate-100 border-2 border-slate-950 shadow-md shadow-slate-950">
  {#if numericValue === null || numericValue === 0}
   <UseHart/>
  {:else}
    {#if above}
      <p class="font-arial text-3xl font-extrabold text-slate-100 w-full pb-4 text-shadow text-shadow-sm">
        {aboveText}
      </p>
    {/if}
    <div class="flex flex-row items-center justify-center font-bold">
      <div class="flex items-center text-[clamp(1rem,4vw,4rem)]">
        {#if numericValue && numericValue !== 0}
          <p class="font-[Metropolis] text-[4rem] font-bold">{symbol_pre}{truncateYAxisValue(numericValue)} {postScript}</p>
        {:else}
          <p class="font-[Metropolis] text-[4rem] font-bold">{symbol_pre}{truncateYAxisValue(dataSumOfValues)} {postScript}</p>
        {/if}
        <p class="text-[4rem]">{symbol_post}</p>
      </div>
    </div>
    {#if belowText}
      <div class="font-[Staatliches] text-lg flex flex-row items-center justify-center">
        Projects: {data.length}
      </div>
    {/if}

  {/if}
  </div>
