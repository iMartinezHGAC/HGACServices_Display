<script lang="ts">
	import { fly } from "svelte/transition";
	import Card from "$routes/components/card.svelte";
  import { type Component } from "svelte"
	import type { PageData } from './$types';
	import type { RecordModel } from "pocketbase";

	import StackedBarChart from "$routes/charts/StackedBarChart.svelte";
	import BarChartTb from "$routes/charts/BarChartTB.svelte";

	let { data}: { data: PageData } = $props();

  let tb = $derived.by(()=> {
    if(data)
       return data.post[13]
    return {} as RecordModel 
  }
  )
  let wqmp = $derived(data.post[14])
  let sw = $derived(data.post[15])
  let cr = $derived(data.post[16])

  type chartType = {
    chartTitle: string,
    chartData: object,
    Chart: Component,
  }

  type tbKey = keyof Trashbash

  function makeBarData(dataset: Trashbash[], key: tbKey) {
    if(dataset) {
    return dataset.map((item: Trashbash) => ({
        juris: item.expand.collection_site_id.site_name,
        value: item[key]
      }))    }
  }

  let trash_pounds = $derived(makeBarData(data.trashbash as Trashbash[], "trash_pounds"))
  let tires  = $derived(makeBarData(data.trashbash as Trashbash[], "tires"))
  let recycled_pounds = $derived(makeBarData(data.trashbash as Trashbash[], "recycled_pounds" as tbKey))
  let tot_volunteer_count = $derived(makeBarData(data.trashbash as Trashbash[], "tot_volunteer_count" as tbKey))
  let vol_under_18= $derived(makeBarData(data.trashbash as Trashbash[], "vol_under_18" as tbKey))
  let vol_scouts= $derived(makeBarData(data.trashbash as Trashbash[], "vol_scouts" as tbKey))
  let miles_cleaned = $derived(makeBarData(data.trashbash as Trashbash[], "miles_cleaned" as tbKey))

  const volunteers_stack = tot_volunteer_count.map((item, index)=> ({
    juris: item.juris,
    u18: vol_under_18[index].value,
    scouts: vol_scouts[index].value,
    adults: item.value - vol_under_18[index].value - vol_scouts[index].value < 0 ? 0 : item.value - vol_under_18[index].value - vol_scouts[index].value 
  }))


  const cardTB: chartType[] = $derived([
    {
      chartTitle: "Trash Pounds",
      chartData: trash_pounds,
      Chart: BarChartTb,
    },
    {
      chartTitle: "Tire Count",
      chartData: tires,
      Chart: BarChartTb,
    },
    {
      chartTitle: "Miles Cleaned",
      chartData: miles_cleaned,
      Chart: BarChartTb,
    },
    {
      chartTitle: "Recycled Pounds",
      chartData: recycled_pounds,
      Chart: BarChartTb,
    },
    {
      chartTitle: "Volunteers",
      chartData: volunteers_stack,
      Chart: StackedBarChart,
    }
    /*
    {
      chartTitle: "Under 18 Volunteers",
      chartData: vol_under_18,
      Chart: BarChartTb,
    },
    {
      chartTitle: "Scouts Volunteers",
      chartData: vol_scouts,
      Chart: BarChartTb,
    },
    {
      chartTitle: "Total Volunteers",
      chartData: tot_volunteer_count,
      Chart: BarChartTb,
    }
    */
 ])


  const cardWQ: chartType[] = $derived([
    {
      chartTitle: "Permitted OSSF Count",
      chartData: trash_pounds,
      Chart: BarChartTb,
    },
    {
      chartTitle: "Unpermitted OSSF Count",
      chartData: tires,
      Chart: BarChartTb,
    },
    {
      chartTitle: "SAB Count",
      chartData: miles_cleaned,
      Chart: BarChartTb,
    },
    {
      chartTitle: "WWTF Count",
      chartData: recycled_pounds,
      Chart: BarChartTb,
    },
    {
      chartTitle: "SEB Complete Count",
      chartData: volunteers_stack,
      Chart: StackedBarChart,
    },
    {
      chartTitle: "SEB Complete Cost",
      chartData: volunteers_stack,
      Chart: StackedBarChart,
    },
    {
      chartTitle: "SEB Waitlist Count",
      chartData: volunteers_stack,
      Chart: StackedBarChart,
    },
    {
      chartTitle: "SEB Active Count",
      chartData: volunteers_stack,
      Chart: StackedBarChart,
    },

    /*
    {
      chartTitle: "Under 18 Volunteers",
      chartData: vol_under_18,
      Chart: BarChartTb,
    },
    {
      chartTitle: "Scouts Volunteers",
      chartData: vol_scouts,
      Chart: BarChartTb,
    },
    {
      chartTitle: "Total Volunteers",
      chartData: tot_volunteer_count,
      Chart: BarChartTb,
    }
    */
 ])

function convertToCamelCase(input: string): string {
    // Split the string by space, then map over the words
    const words = input.split(' ');

    // Convert the first word to lowercase and the rest to lowercase as well
    const formattedWords = words.map((word, index) => {
        if (index === 0) {
            return word.toLowerCase(); // First word becomes lowercase
        }
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(); // Capitalize subsequent words
    });

    // Join all words together to form a single string
    return "#" +formattedWords.join('');
}


const cardNames=$derived([tb.program_name, wqmp.program_name, sw.program_name, cr.program_name])

function toCamelCase(input: string): string {
  return input
    .trim()                           // Remove leading/trailing spaces
    .split(/\s+/)                     // Split on any whitespace
    .filter(word => word.length > 0)  // Remove empty strings
    .map((word, index) => 
      index === 0 
        ? word.toLowerCase() 
        : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    )
    .join('');
}

</script>

{#snippet formattedEntryText(cardName: string)}
  <div class="flex text-slate-200 font-[Metropolis] font-medium">
    <a href={convertToCamelCase(cardName)} class="px-6 py-4 rounded w-56 bg-slate-600 text-slate-200 focus:bg-slate-800 hover:bg-slate-700 hover:text-white ">{cardName}</a>
  </div>
{/snippet}

<div class="flex w-screen">
  <div class="left-0 top-24 w-56 h-full bg-slate-600 flex flex-col justify-start items-start pt-4 text-xl transform z-20" transition:fly={{y:200, duration: 300}}>
    {#each cardNames as cardName}
      {@render formattedEntryText(cardName)}
    {/each}
  </div>
  <div class="flex flex-col items-center justify-start w-11/12 h-screen h-max-screen overflow-auto pt-[0%] pb-[6%] z-10 scroll-smooth" transition:fly={{x:400, duration:300 }}>
    <div class="flexy flex-col">
      <div class="flexy" id={toCamelCase(tb.program_name)}>
        <Card 
          project={tb} 
          charts={cardTB}
        />   
      </div>      
      <div class="flexy" id={toCamelCase(wqmp.program_name)}>
        <Card 
          project={wqmp} 
          charts={cardWQ}
        />   
      </div>
      <div class="flexy" id={toCamelCase(sw.program_name)}>
        <Card 
          project={sw} 
          charts={cardTB}
        />   
      </div>      
      <div class="flexy" id={toCamelCase(cr.program_name)}>
        <Card 
          project={cr} 
          charts={cardTB}
        />   
      </div>
    </div>
  </div>
</div>
