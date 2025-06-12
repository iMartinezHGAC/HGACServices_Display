<script lang="ts">

  type headerProps = {
    projectName: string,
    color: string
    links?: object[]
  }

  let {projectName, links, color="dark"}: headerProps = $props()
</script>

<div class="flex flex-col w-1/3">
  <h1 class={"flex font-[Metropolis] text-[clamp(1rem,8vw+0.5rem,2rem)] font-extrabold pt-6 pb-4 pl-10 bg-slate-700 text-white justify-start small-caps"}>
    {projectName}
    <div class="flex flex-grow"></div>
  </h1>
  {#if links}
    <div class="flex-col flex pl-10 pb-4">
    {#each links as link }
      <a href={link.url_string} id="programLink" aria-label="link" class="text-white font-[Metropolis] font-medium">{link.display_text}</a>
    {/each}
    </div>
  {/if}
</div>
