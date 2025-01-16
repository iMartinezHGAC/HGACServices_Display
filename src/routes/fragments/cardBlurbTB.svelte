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
<div>
  <p class="prose-md text-white font-metropolis font-semibold py-8 px-6">
    {plainText}
  </p>

</div>
