<script lang="ts">
	import StackedBarChart from "./charts/StackedBarChart.svelte";
  import StatDisplay from "./components/statDisplay.svelte";
  import {fly} from "svelte/transition"

  const stackbar_data = [
      { state: 'Harris', age: '18-24', population: 1000 },
      { state: 'Harris', age: '25-34', population: 1500 },
      { state: 'Harris', age: '35-44', population: 2700 },
      { state: 'Harris', age: '45-54', population: 1200 },
      { state: 'Fort Bend', age: '18-24', population: 800 },
      { state: 'Fort Bend', age: '25-34', population: 1200 },
      { state: 'Fort Bend', age: '35-44', population: 1700 },
      { state: 'Fort Bend', age: '45-54', population: 1000 },
      { state: 'Waller', age: '18-24', population: 1100 },
      { state: 'Waller', age: '25-34', population: 1500 },
      { state: 'Waller', age: '35-44', population: 1300 },
      { state: 'Waller', age: '45-54', population: 1100 },
      { state: 'Montgomery', age: '18-24', population: 400 },
      { state: 'Montgomery', age: '25-34', population: 500 },
      { state: 'Montgomery', age: '35-44', population: 700 },
      { state: 'Montgomery', age: '45-54', population: 300 },
  ];
</script>

<div  in:fly={{x:300}} out:fly={{x:-400}} class="flexy flex-col fixed top-28 h-screen w-5/6">
  <StackedBarChart data={stackbar_data} yLabel="Population"/>
</div>
