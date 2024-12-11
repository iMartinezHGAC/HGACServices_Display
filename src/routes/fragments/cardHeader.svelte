<script lang="ts">
  import clock from "$lib/assets/clock.svg"
  let timelineFlag = $state(false);
  let timelineText = $derived.by(()=> {
    if(timelineFlag === false) return "Current"
    return "Historical"
  })

  type headerProps = {
    projectName: string,
    toggleTime: (timeline: boolean) => void
    color: string
  }

  let {projectName, toggleTime, color="dark"}: headerProps = $props()
  function toggleTimeline() {
    timelineFlag = !timelineFlag
    toggleTime(timelineFlag)
  }
</script>

<style>
.dark {
  @apply
  flex font-metropolis text-5xl font-[900] pt-8 pb-6 pl-2 bg-slate-700 text-white justify-start
}
.light {
  @apply
  flex font-metropolis text-5xl font-[900] pt-8 pb-6 pl-2 bg-slate-500 text-white justify-start
}
</style>
      <h1 class={color}>
        {projectName}
        <div class="flex flex-grow"></div>
        <button class="flex items-center justify-center text-center px-14" onclick={toggleTimeline}>
          <img src={clock} alt="clock">
          <p class="text-xl font-metropolis pr-10 pl-2 w-12 text-white ">
            {timelineText}
          </p>
        </button>
      </h1>
