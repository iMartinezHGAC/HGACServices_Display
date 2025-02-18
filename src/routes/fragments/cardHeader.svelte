<script lang="ts">


  type headerProps = {
    projectName: string,
    color: string
    links?: string[]
  }

  let {projectName, links, color="dark"}: headerProps = $props()
  let colorStyle = $derived.by(()=> {
    if(color === "dark") return "flex font-[Metropolis] text-5xl font-[900] pt-4 pb-6 pl-2 bg-slate-700 text-white justify-start"
    else return "flex font-[Metropolis] text-5xl font-[900] pt-8 pb-6 pl-2 bg-slate-500 text-white justify-start"
  })
</script>

<div class="flex flex-col w-2/3">
    <h1 class={colorStyle}>
      {projectName}
      <div class="flex flex-grow"></div>
    </h1>
  {#if links}
    <div class="flex-col flex pl-10 pb-4">
    {#each links as link }
      <a href={link} aria-label="link" class="text-white font-[Metropolis] font-medium">{link}</a>
    {/each}
    </div>
  {/if}
</div>
