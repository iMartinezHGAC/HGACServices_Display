<svelte:head>
    <!-- Development -->
  <script src="https://unpkg.com/@popperjs/core@2/dist/umd/popper.min.js"></script>
  <script src="https://unpkg.com/tippy.js@6/dist/tippy-bundle.umd.js"></script>

</svelte:head>

<script lang="ts">
  import { truncateNumber } from '$routes/helpers/chartFormatters';
import * as d3 from 'd3';
	import tippy from 'tippy.js';

  type DonutType = {
    name: string,
    value: number,
  }

  interface Props {
    data: DonutType[], 
    width?: number,
    height?: number,
    colors?: string[],
    preSymbol?: string,
    postSymbol?: string
  }

  let {
    data = [], 
    width = 400, 
    height = 400, 
    preSymbol = "", 
    postSymbol = "",
    colors = ["#4A90E2", "#50E3C2", "#F5A623", "#B8E986", "#BD10E0"]
  }: Props = $props();

  console.log("donut data",data)

const colorMap: Record<string, string> = {
  'workforce': '#0A5A51',
  'public safety': '#4480C0',
  'emergency preparedness': '#B26363',
  'business services': '#6D2E3E',
  'community services': '#8B459F',
  'transportation': '#69ABDE',
  'environmental': '#628464',
  'economic development': '#CC9917'
};

  const cheesedata = data


  const dataNames = cheesedata.map(item => item.name)
  const dataSumOfValues = cheesedata
    .map(item => item.value)
    .reduce((accumulator, currentValue) => accumulator + currentValue, 0)

  let dataTable = $state<HTMLElement>()


// Color selection function
function getColor(key: string): string {
  // Convert snake_case to lowercase for matching
  const normalizedKey = key.toLowerCase();
  
  // Check for exact match
  if (colorMap[normalizedKey]) {
    return colorMap[normalizedKey];
  }
  
  // Optional: Try partial matching
  const matchedKey = Object.keys(colorMap).find(k => 
    normalizedKey.includes(k) || k.includes(normalizedKey)
  );
  
  // Return matched color or a default
  return matchedKey ? colorMap[matchedKey] : '#CCCCCC';
}

  // Format value function
  function formatValue(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    }
    if (num >= 10000) {
      return (num / 1000).toFixed(1) + "K";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(2) + "K";
    }
    return num.toLocaleString();
  }

  // Calculate total
  let total = $derived(formatValue(d3.sum(data, (d: DonutType) => d.value)));

  // Donut chart parameters
  const radius = Math.min(width, height) / 2;

  // Track hovered arc index
  let hoveredIndex: number | null = null;

  // Reactive arc generator
  let arc = $derived(
    d3.arc<d3.PieArcDatum<DonutType>>()
      .innerRadius(radius * 0.45)
      .outerRadius((d, i) => hoveredIndex === i ? radius * 1.1 : radius)
  );

  const pie = d3.pie<DonutType>()
    .padAngle(1 / radius)
    .sort(null)
    .value((d: DonutType) => d.value);

  // Create color scale
  const colorScale = d3.scaleOrdinal()
    .domain(data.map(d => d.name))
    .range(data.map(d => getColor(d.name)));

  // Reactive arcs
  let arcs = $derived(pie(data));

  function toTippy(element: HTMLElement) {
    tippy(element, {
      content: dataTable,
      placement: "right-start",
      theme: "slateful",
    })
  }
</script>


<div class="transform opacity-0 scale-0 w-0 h-0" >
  <div bind:this={dataTable}>
    <table>
      <tbody>
        {#each cheesedata as {name, value}}
          <tr>
            <td>{name}</td>
            <td class="px-4">{preSymbol}{formatValue(value)}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>

<div class="w-full h-full" {@attach toTippy}>
  <svg 
    {width} 
    {height} 
    viewBox={`-${width/2 *1.2}, -${height/2 *1.2}, ${width*1.2}, ${height*1.2}`} 
    class="w-full h-auto"
  >
    <!-- Slices of the donut -->
    <g>
      {#each arcs as arcData, i(arcData.data.name)}
        <a href={`/a8se97t2/${arcData.data.name}`} aria-label="project-link" >
          <path
            role="button"
            aria-label="{arcData.data.name}: {preSymbol + formatValue(arcData.data.value)}"
            fill={colorScale(i.toString())}
            d={arc(arcData)}
            class="transition-all duration-200 hover:brightness-150 hover:scale-105 cursor-pointer"
            onmouseenter={()=>hoveredIndex = i}
            onmouseleave={()=>hoveredIndex = null}
          >
          </path>
        </a>
      {/each}
    </g>

    <!-- Labels for the slices -->
    <g class="font-metropolis text-sm" text-anchor="middle">
      {#each arcs as arcData (arcData.data.name)}
        <text 
          transform={`translate(${arc.centroid(arcData)})`}
          class="pointer-events-none"
        >
          <tspan 
            x="0" 
            y="1.2em" 
            class="text-lg font-bold fill-black"
          >
            {""}
          </tspan>
        </text>
      {/each}
    </g>

    <!-- Total value of the data -->
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


