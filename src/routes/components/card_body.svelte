<script lang="ts">
	import { fly } from "svelte/transition";
  import {toCamelCase} from "../helpers/caseConversion"
	import Card from "$routes/components/card.svelte";

  interface cardProps {
    cardNames: any[],
    cardData: CardDataType[],
    direction: boolean,
    adwork: boolean,
    charts: echarts.EChartsOption[],
  }

  const {cardNames, cardData, direction, adwork=false, charts}: cardProps = $props()
  let flyValue = $state(direction ? -400 : 400)
</script>


{#snippet formattedEntryText(cardName: string)}
  <div class="flex text-slate-200 font-[Metropolis] font-medium">
    <a href={toCamelCase(cardName)} class="px-6 py-4 rounded w-56 bg-slate-600 text-slate-200 focus:bg-slate-800 hover:bg-slate-700 hover:text-white ">{cardName}</a>
  </div>
{/snippet}


<div class="flex w-screen">
  <div class="left-0 top-24 w-56 h-full bg-slate-600 flex flex-col justify-start items-start pt-4 text-xl transform z-20" transition:fly={{y:200, duration: 300}}>
    {#each cardNames as cardName}
      {@render formattedEntryText(cardName)}
    {/each}
  </div>
  <div class="flex flex-col items-center justify-start w-11/12 h-screen h-max-screen overflow-auto pt-[0%] pb-[6%] z-10 scroll-smooth" transition:fly={{x:flyValue, duration:300 }}>
    <div class="flexy flex-col">
      {#each cardData as card, i}
        <div class="flexy" id={card.program.program_name.split(' ').join('')}>
          <Card 
            project={card.program} 
            charts={card.charts}
            additionalWork={adwork}
            echartsList={charts}
          />
        </div>      
      {/each}
    </div>
  </div>
</div>
