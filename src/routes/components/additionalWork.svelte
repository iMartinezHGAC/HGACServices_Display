<script lang="ts">
import arrow from "$lib/assets/arrow.svg"

interface addWorkProps {
  bodyText: string
}

let {bodyText}: addWorkProps = $props()

let toggle=$state(false)

function toggleArrow() {
  toggle = !toggle
}
</script>

{#if toggle}
    <button onclick={toggleArrow}>
    <img src={arrow} alt="Additional work" class="transform rotate-180">
  </button>
<div class="relative flex flex-col w-64 h-2/3 pl-8 overflow-auto">
  <h1 class="font-extrabold text-2xl">
    Additional Work
  </h1>
  <p class="flex font-medium text-xl">
    Date: 12-31-2024
  </p>
  <p class="prose font-metropolis">
    {bodyText}
  </p>
  <p class="flex font-medium text-xl">
    Date: 12-31-2024
  </p>
  <p class="prose font-metropolis">
    {bodyText}
  </p>
  <p class="flex font-medium text-xl">
    Date: 12-31-2024
  </p>
  <p class="prose font-metropolis">
    {bodyText}
  </p>
</div>
{:else}
  <button onclick={toggleArrow}>
    <img src={arrow} alt="Additional work">
  </button>
{/if}
