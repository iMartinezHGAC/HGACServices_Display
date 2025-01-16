<script lang="ts">


  type headerProps = {
    projectName: string,
    color: string
    links?: string[]
  }

  let {projectName, links, color="dark"}: headerProps = $props()

</script>

<style>
.dark {
  @apply
  flex font-metropolis text-5xl font-[900] pt-4 pb-6 pl-2 bg-slate-700 text-white justify-start
}
.light {
  @apply
  flex font-metropolis text-5xl font-[900] pt-8 pb-6 pl-2 bg-slate-500 text-white justify-start
}
</style>
<div class="flex flex-col w-2/3">
    <h1 class={color}>
      {projectName}
      <div class="flex flex-grow"></div>
    </h1>
  {#if links}
    <div class="flex-col flex pl-10 pb-4">
    {#each links as link }
      <a href={link} aria-label="link" class="text-white font-metropolis font-medium">{link}</a>
    {/each}
    </div>
  {/if}
</div>
