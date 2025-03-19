<script lang="ts">
  import '@fontsource/staatliches';
  import '@fontsource/poppins';
  import '@fontsource/yeseva-one';
  import '@fontsource-variable/fraunces';
  import '@fontsource/patua-one';
  import '@fontsource/metropolis';
	import Splash from './components/splash.svelte';
	import type { LayoutData } from './$types';
	import type { Snippet } from 'svelte';

	import '../app.css';
  let {data, children}: {data: LayoutData, children: Snippet} = $props()
  let jurisdiction = $state("null")
  if(data.routeID === '/a8se97t2') {
    jurisdiction = "harris_county"
  }
  console.log(data.routeID)
</script>


<main class="fixed flex flex-col w-screen h-screen justify-start items-center bg-cover bg-slate-200">
  <Splash chosenTab={data.routeID} jurisdiction={jurisdiction}/>
  {@render children()}
</main>
