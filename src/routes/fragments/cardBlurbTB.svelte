<script lang="ts">
	import { onMount } from "svelte";

  let {text}: {text: string} = $props()
  function htmlToPlaintext(html: string) {
    const doc = new DOMParser().parseFromString(html, 'text/html')
    return doc.body.textContent || doc.body.innerText ||''
  }

  let plainText: string = $state("")
  onMount(()=> {
    plainText = htmlToPlaintext(text)
  })
  //$inspect(links)
</script>

<div class="prose-md flex w-full  text-white font-[Metropolis] font-semibold py-8">
  {plainText}
</div>
