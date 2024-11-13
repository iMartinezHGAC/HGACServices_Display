<script lang="ts">

import {fly} from "svelte/transition"
let color="red"

</script>

<style>
  .red {
  @apply
    bg-hgac-red w-5/6 h-1/6 rounded-b-lg
  }
</style>

<div class={`${color} flexy flex-col`} in:fly={{ x:400}} out:fly={{x:-200}}>
  <p class="w-1/2 text-lg">
  Possible text describing what kind of projects the specific tab focuses on, with possibly a list of programs they have received services for
  </p>
  <p>
    Blurb about Regional Transport Plan
  </p>
  <p>
    Optional additional blub from marketing for what Regional Transport Plan does the specific jurisdiction. Possibly hide these blurbs behind Program Information
  </p>
</div>
