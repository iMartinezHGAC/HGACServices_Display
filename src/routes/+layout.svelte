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

	import '../app.css'
	import { jurisState } from '../state/jurisState.svelte';

  let {data, children}: {data: LayoutData, children: Snippet} = $props()

  let jurisdiction = $state("Harris County")

  const jurisId = jurisState()
  if(data.uuid !== undefined && data.uuid) {
    console.log("CALLED setUUID", data.uuid)
    jurisId.setUUID(data.uuid)
  }
  if(data.uuid === 'a8se97t2') {
    jurisdiction = "harris_county"
  }

  function toSnakeCase(tabName: string) {
    return tabName.split(' ').join('_')
  }

  function getEndOfPath(tabName: string) {
    const segments = tabName.split('/').filter(segment => segment !== '')
    return segments[segments.length - 1] || ''
  }

  let routePath = $derived(toSnakeCase(getEndOfPath(data.routeID).toLowerCase()))
</script>


<main class="fixed flex flex-col w-screen h-screen justify-start items-center bg-cover bg-slate-200">
  {#if data.uuid}
    <Splash chosenTab={routePath} jurisdiction={jurisdiction} dashboard_groups={data.dashboard_groups}/>
  {/if}
  {@render children()}
</main>
