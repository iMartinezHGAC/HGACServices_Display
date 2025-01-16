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
    colors: string[],
    index?: number,
    spectrum?: boolean,
    spectrumColor?: string,
    preSymbol?: string
    postSymbol?: string
  }

  let {
    data = [], 
    width=400, 
    height=400, 
    preSymbol="", 
    postSymbol="",
    colors = ["#FF0000", "#FFFF00", "#00FF00", "#0000FF", "#800080"],
    spectrum=false,
  }: Props = $props() // Expecting the data to be passed in

  // total value
  function formatValue(num) {
    let value = num
    if(postSymbol === "K") {
       value = (num/1000).toPrecision(4)
    }
    return value
  }
  let total = $derived(formatValue(d3.sum(data, (d: donutType) => d.value)))
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

  if(spectrum) {let colorSpectrum = d3.scaleSequential(d3.interpolateBlues)}

  // Create a linear scale for the color interpolation
  const colorScale = d3.scaleLinear([0,1,2,3,4], colors);

  let arcs = $derived(pie(data))
  let labels = $derived(arcs.map((d)=> arc.centroid(d)))
  // Add labels
 </script>

<svg width={width} height={height} viewBox={`-${width/2}, -${height/2}, ${width}, ${height}`} class="w-full h-auto">
  <!-- Slices of the donut -->
  <g>
    {#each arcs as arcData}
      <path
        fill={colorScale(arcData.index)}
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
          {preSymbol + formatValue(arcData.data.value) + postSymbol}
          <tspan x="-0.4rem" y="0em" class="absolute text-5xl font-semibold fill-white stroke-none">
            {preSymbol + formatValue(arcData.data.value) + postSymbol}
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

