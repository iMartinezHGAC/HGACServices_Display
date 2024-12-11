<script lang="ts">
  import clock from "$lib/assets/clock.svg"
  let timelineFlag = $state(false);
  let timelineText = $derived.by(()=> {
    if(timelineFlag === false) return "Current"
    return "Historical"
  })

  let {projectName}: {projectName: string} = $props()
</script>
      <h1 class="flex font-metropolis text-5xl font-[900] py-8 bg-slate-700 text-white justify-start">
        {projectName}
        <div class="flex flex-grow"></div>
        <button class="flex items-center justify-center text-center px-12" onclick={()=> timelineFlag = !timelineFlag}>
          <img src={clock} alt="clock">
          <p class="text-xl font-metropolis pr-10 pl-2 w-12 text-white ">
            {timelineText}
          </p>
        </button>
      </h1>
