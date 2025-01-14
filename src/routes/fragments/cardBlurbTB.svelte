<script lang="ts">
	import { onMount } from "svelte";

  let {text, links}: {text: string, links?: string[]} = $props()
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
  <p class="prose-md text-white font-metropolis font-semibold pb-4 px-6">
    {plainText}
  </p>
  {#if links}
    <div class="flex-col flex pl-6">
    {#each links as link }
      <a href={link} aria-label="link" class="text-white font-metropolis font-medium">{link}</a>
    {/each}
    </div>
  {/if}
</div>
