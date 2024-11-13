<script lang="ts">

let {header}: {header: string} = $props()

</script>


<div class="flexy flex-col w-1/4 h-full bg-gradient-to-b from-hgac-gray to-gray-600">
  <p class="font-staatliches text-lg">
  {header}
  </p>
  <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="100" r="90" stroke="black" stroke-width='10' fill="#bbbbbb00" />
    <text x="100" y="100" 
      text-anchor="middle"  dominant-baseline="middle" 
      class="font-staatliches text-5xl">25</text>
  </svg>
</div>
