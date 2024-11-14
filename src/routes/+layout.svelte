<script lang="ts">
	import '../app.css';
  import '@fontsource/staatliches';
  import '@fontsource/poppins';
  import '@fontsource/yeseva-one';
  import '@fontsource-variable/fraunces';
  import '@fontsource/patua-one';
  import '@fontsource/metropolis';
	import Splash from './components/splash.svelte';
	let { children } = $props();
</script>


<main class="fixed flex w-screen h-screen justify-center items-center bg-cover bg-slate-200">
  <Splash jurisdiction="harris_county"/>
  {@render children()}
</main>
