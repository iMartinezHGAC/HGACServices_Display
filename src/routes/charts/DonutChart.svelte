<script lang="ts">
  import * as d3 from 'd3';

  type DonutType = {
    name: string,
    value: number,
  }

  interface Props {
    data: DonutType[], 
    width?: number,
    height?: number
    colors?: string[],
    preSymbol?: string
    postSymbol?: string
  }

  let {
    data = [], 
    width = 400, 
    height = 400, 
    preSymbol = "", 
    postSymbol = "",
    colors = ["#4A90E2", "#50E3C2", "#F5A623", "#B8E986", "#BD10E0"]
  }: Props = $props()

  // Format value function with more comprehensive formatting
  function formatValue(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M"
    }
    if (num >= 10000) {
      return (num / 1000).toFixed(1) + "K"
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(2) + "K"
    }
    return num.toLocaleString()
  }

  // Calculate total
  let total = $derived(formatValue(d3.sum(data, (d: DonutType) => d.value)))
  
  // Donut chart parameters
  const radius = Math.min(width, height) / 2;
  
  // Set up the arc and pie chart generator
  const arc = d3.arc<d3.PieArcDatum<DonutType>>()
    .innerRadius(radius * 0.45)
    .outerRadius(radius);

  const pie = d3.pie<DonutType>()
    .padAngle(1 / radius)
    .sort(null)
    .value((d: DonutType) => d.value);

  // Create a linear scale for the color interpolation
  const colorScale = d3.scaleOrdinal(colors);

  let arcs = $derived(pie(data))
</script>

<div class="relative w-full h-full">
  <svg 
    width={width} 
    height={height} 
    viewBox={`-${width/2}, -${height/2}, ${width}, ${height}`} 
    class="w-full h-auto"
  >
    <!-- Slices of the donut -->
    <g>
      {#each arcs as arcData, i}
        <path
          fill={colorScale(i.toString())}
          d={arc(arcData)}
          class="transition-all duration-200 hover:opacity-80 cursor-pointer"
        >
          <title>{arcData.data.name}: {preSymbol + formatValue(arcData.data.value)}</title>
        </path>
      {/each}
    </g>

    <!-- labels for the slices -->
    <g class="font-metropolis text-sm" text-anchor="middle">
      {#each arcs as arcData}
        <text 
          transform={`translate(${arc.centroid(arcData)})`}
          class="pointer-events-none"
        >
          <tspan 
            x="0" 
            y="1.2em" 
            class="text-lg font-bold fill-black"
          >
            {preSymbol + formatValue(arcData.data.value)}
          </tspan>
        </text>
      {/each}
    </g>

    <!-- total value of the data -->
    <g>
      <text 
        x="0" 
        y="0" 
        text-anchor="middle" 
        class="font-metropolis text-2xl font-extrabold fill-gray-100"
      >
        {preSymbol + total}
      </text>
    </g>
  </svg>
</div>

<style>
  /* Tooltip styling */
  path title {
    @apply hidden;
  }

  path:hover + title {
    @apply block;
  }
</style>
