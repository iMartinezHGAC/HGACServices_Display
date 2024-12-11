<script lang="ts">

import {fly} from "svelte/transition"
	import LinePlot from "../charts/LinePlot.svelte";
  let color="red"
</script>

{#snippet infoBlurb(text: string)}
  <p class="font-poppins font-medium text-lg px-12 text-slate-100" in:fly={{x:400}}>{text}</p>
{/snippet}

{#snippet LineGraph(text: string, data:number[])}
  <div class="w-1/2 flex items-center flex-col bg-slate-700">
    <div class="w-fit h-fit bg-white p-12 rounded-xl">
      <p class="font-staatliches text-2xl text-slate-700">{text}</p>
      <LinePlot data={data}/>
    </div>
  </div>
{/snippet}

<style>
  .red {
  @apply
    w-5/6 h-1/6 rounded-t-lg
  }
</style>
<div in:fly={{x:300}} out:fly={{x:-400}} class="flexy flex-col fixed top-28 h-screen w-screen">
  <div class={`${color} flexy bg-slate-700 h-1/6`}>
    {@render infoBlurb("Possible text describing what kind of projects the specific tab focuses on, with possibly a list of programs they have received services for")}
    {@render infoBlurb("Blurb about Regional Transport Plan")}
    {@render infoBlurb("Optional additional blub from marketing for what Regional Transport Plan does the specific jurisdiction. Possibly hide these blurbs behind Program Information")}
    <!--
    -->
  </div>

  <div class="flex w-5/6 h-5/6">
    {@render LineGraph("Total Projects", [1,2,3,5,8,13,3,8,21])}
    {@render LineGraph("Total Cost ($1000)", [21, 34, 50])}
  </div>
</div>
