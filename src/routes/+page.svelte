<script lang="ts">
	import StatDisplay from "./components/statDisplay.svelte";
  import {fly} from "svelte/transition"
</script>

<div  in:fly={{x:300}} out:fly={{x:-400}} class="flexy flex-col fixed top-28 h-screen w-5/6">
  <div class="w-3/4 h-1/6 flexy rounded-b-lg bg-hgac-gray flex">
    <p class="font-poppins font-medium py-4 w-1/2">
      Blurb, if any, for jurisdiction form communications (will probably only be here for large jurisdictions)
    </p>
  </div>
  <div class="w-5/6 h-4/6 flexy flex-row">
    <StatDisplay />
    <StatDisplay />
    <StatDisplay />
    <StatDisplay />
  </div>
  <div class="h-1/6 bg-gray-400">
    Stuf
  </div>
</div>
