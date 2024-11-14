<script lang="ts">

let {header}: {header: string} = $props()

</script>


<div class="flexy flex-col w-1/4 h-full bg-slate-600 ">
  <p class="font-staatliches text-lg text-slate-200 mb-4">
  {header}
  </p>
  <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="100" r="90" stroke="#e2e8f0" stroke-width='10' fill="#00000000" />
    <text x="100" y="100"  fill="#e2e8f0"
      text-anchor="middle"  dominant-baseline="middle" 
      class="font-staatliches text-5xl">25</text>
  </svg>
</div>
