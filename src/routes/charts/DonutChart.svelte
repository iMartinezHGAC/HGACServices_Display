<script lang="ts">
  import * as d3 from 'd3';

  type donutType = {
    name: string,
    value: number
  }

  interface Props {
    data: donutType[]
    width: number,
    height: number
  }

  let {data = [], width=400, height=400}: Props = $props() // Expecting the data to be passed in

  // total value
  let total = $derived(d3.sum(data, (d: donutType) => d.value))

  // Donut chart parameters
  const radius = Math.min(width, height) /2;
  
  // Set up the arc and pie chart generator
  const arc = d3.arc<d3.PieArcDatum<donutType>>()
    .innerRadius(radius * 0.45)
    .outerRadius(radius - 1);

  const pie = d3.pie<donutType>()
    .padAngle(1 / radius)
    .sort(null)
    .value((d: donutType) => d.value);

  // Set up color scale
  const color = d3.scaleOrdinal()
    .domain(data.map((d: donutType) => d.name))
    .range(d3.quantize(t => d3.interpolateSpectral(t * 0.8 + 0.1), data.length).reverse());

  let arcs = $derived(pie(data))
  let labels = $derived(arcs.map((d)=> arc.centroid(d)))
  // Add labels
 </script>

<svg width={width} height={height} viewBox={`-${width/2}, -${height/2}, ${width}, ${height}`} class="w-full h-auto">
  <!-- Slices of the donut -->
  <g>
    {#each arcs as arcData}
      <path
        fill={color(arcData.data.name) as string}
        d={arc(arcData)}
      >
        <title>{arcData.data.name}: {arcData.data.value.toLocaleString()}</title>
      </path>
    {/each}
  </g>

  <!-- labels for the slices -->
  <g class="font-metropolis text-sm" text-anchor="middle">
    {#each arcs as arcData}
      <text transform={`translate(${arc.centroid(arcData)})`}>
        <tspan x="0.15em" y="0.3rem" class="font-staatliches text-4xl">{arcData.data.name}</tspan>
        <tspan x="0" y="0" class="font-staatliches text-4xl fill-white">{arcData.data.name}</tspan>
        <tspan x="0.12em" y="1.1em" class="text-5xl font-semibold">
          {arcData.data.value.toLocaleString()}
        </tspan>
        <tspan x="0" y="1em" class="text-5xl font-semibold fill-white">
          {arcData.data.value.toLocaleString()}
        </tspan>
      </text>
    {/each}
  </g>

  <!-- total value of the data -->
  <text x="0" y="0" text-anchor="middle" class="font-metropolis text-7xl font-extrabold fill-slate-100 transform translate-y-4" >
    {total.toLocaleString()}
  </text>
</svg>

<style>
  svg {
    @apply
    w-full h-auto m-6
  }
</style>

