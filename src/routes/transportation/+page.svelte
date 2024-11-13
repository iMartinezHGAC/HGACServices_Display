<script lang="ts">

import {fly} from "svelte/transition"
let color="red"

</script>

{#snippet infoBlurb(text: string)}
  <p class="font-poppins font-medium">{text}</p>
{/snippet}

<style>
  .red {
  @apply
    bg-gradient-to-b from-hgac-red to-red-500 w-5/6 h-1/6 rounded-b-lg
  }
</style>

<div class={`${color} flexy fixed top-28`} in:fly={{ x:400}} out:fly={{x:-200}}>
  {@render infoBlurb("Possible text describing what kind of projects the specific tab focuses on, with possibly a list of programs they have received services for")}
  {@render infoBlurb("Blurb about Regional Transport Plan")}
  {@render infoBlurb("Optional additional blub from marketing for what Regional Transport Plan does the specific jurisdiction. Possibly hide these blurbs behind Program Information")}
</div>
