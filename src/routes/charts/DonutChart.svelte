<script lang="ts">
  import * as d3 from 'd3';

  type donutType = {
    name: string,
    value: number,
  }

  interface Props {
    data: donutType[]
    width: number,
    height: number
    index: number,
    preSymbol?: string
    postSymbol?: string
  }

  let {data = [], width=400, height=400, index, preSymbol="", postSymbol}: Props = $props() // Expecting the data to be passed in

  // total value
  let total = $derived(d3.sum(data, (d: donutType) => d.value))

  // Donut chart parameters
  const radius = Math.min(width, height) /2;
  
  // Set up the arc and pie chart generator
  const arc = d3.arc<d3.PieArcDatum<donutType>>()
    .innerRadius(radius * 0.55)
    .outerRadius(radius );

  const pie = d3.pie<donutType>()
    .padAngle(1 / radius)
    .sort(null)
    .value((d: donutType) => d.value);

  // Set up color scale
  const START=0.5
  const END=0.8
  const increment = 0.12

  /*
  const color = d3.scaleOrdinal()
    .domain(data.map((d: donutType) => d.name))
    .range(d3.quantize(t => d3.interpolateSpectral(incrementedArray(t)), data.length).reverse());
  */
  const color = d3.scaleQuantize([0,4], ["#a6cee3","#b2df8a","#1f78b4", "#33a02c"])

  let arcs = $derived(pie(data))
  let labels = $derived(arcs.map((d)=> arc.centroid(d)))
  // Add labels
 </script>

<svg width={width} height={height} viewBox={`-${width/2}, -${height/2}, ${width}, ${height}`} class="w-full h-auto">
  <!-- Slices of the donut -->
  <g>
    {#each arcs as arcData}
      {console.log(`i: ${arcData.index} c: ${color(arcData.index)}`)}
      <path
        fill={color(arcData.index) as string}
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
        <tspan x="0" y="0em" class="text-5xl font-semibold fill-black stroke-black stroke-[8px]">
          {preSymbol + arcData.data.value.toLocaleString() + postSymbol}
          <tspan x="-0.4rem" y="0em" class="absolute text-5xl font-semibold fill-white stroke-none">
            {preSymbol + arcData.data.value.toLocaleString() + postSymbol}
          </tspan>
        </tspan>
      </text>
    {/each}
  </g>

  <!-- total value of the data -->
  <g>

    <text x="0" y="1rem" text-anchor="middle" class="font-metropolis text-[5.0rem] font-extrabold fill-white transform translate-y-4" >
      {preSymbol + total.toLocaleString() + postSymbol}
    </text>
    <!-- 
    99,999
    100.00k
    999.99k
    $1.00M
    -->
  </g>
</svg>

<style>
  svg {
    @apply
    w-full h-auto m-6
  }
</style>

