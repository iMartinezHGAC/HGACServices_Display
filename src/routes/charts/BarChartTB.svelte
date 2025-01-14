<script>
  import * as d3 from 'd3';
	import Tabs from '../components/tabs.svelte';


  // Props
  let {data = [],
    width = 928, 
    height = 500, 
    yLabel = ""
    } = $props();
  const marginTop = 20;
  const marginRight = 100;
  const marginBottom = 140;
  const marginLeft = 65;
  const yLabelMargin = 80;

  // Reactive variables
  const barColors = ["#ffffff","#fff9d8"]

  // Set up the scales and axis on mount
    // Horizontal scale (band scale)
  let x = $derived(d3.scaleBand()
      .domain(data.map(d => d.juris))
      .range([marginLeft, width - marginRight])
      .padding(0.1));

    // Vertical scale (linear scale)
  let y = $derived(d3.scaleLinear()
      .domain([0, d3.max(data, d => d.value)]).nice()
      .range([height - marginBottom, marginTop]));

    // Axis for x
  let xAxis = $derived(d3.axisBottom(x).tickSizeOuter(0));

    // Axis for y
  let yAxis = $derived(d3.axisLeft(y).ticks(5));

  // Zoom function for handling the zooming behavior
  function zoomed(event) {
    x.range([marginLeft, width - marginRight].map(d => event.transform.applyX(d)));
  }
</script>

<svg id="zoomable-bar-chart" 
     width={width} 
     height={height} 
     viewBox={`0 0 ${width} ${height}`} 
      class="w-fill"
     on:wheel|passive={zoomed}>

  <!-- x-axis -->
  <g transform={`translate(${marginLeft+0}, ${height - marginBottom})`} class="x-axis">
    {#each x.domain() as d}
      <g transform={`translate(${x(d) -marginLeft/3},0) rotate(45 0 0)`}>
        <text class="font-metropolis text-lg transform translate-y-6" text-anchor="start">{d}</text>
      </g>
    {/each}
  </g>

 <!-- Y-axis group -->
  <g transform={`translate(${marginLeft},0)`} class="y-axis">
    <text 
      x={`${(0)}`} 
      y={`${0}`} 
      text-anchor="left"
      class="text-3xl font-bold font-metropolis text-start items-start fill-slate-700"
    >
      {yLabel}
    </text>

    {#each y.ticks(5) as tick}
      <g transform={`translate(0,${y(tick)})`}>
        <line x2={width - marginRight - marginLeft} stroke="black" />
        <text x={-10} dy=".32em" text-anchor="middle">{tick}</text>
      </g>
    {/each}
  </g> 
  <!-- Bars -->
  {#each data as d}
    <rect x={x(d.juris)} 
          y={y(d.value)} 
          width={x.bandwidth()} 
          height={y(0) - y(d.value)} 
          fill="forestgreen" />
  {/each}
</svg>

<style>
  svg {
    @apply
    w-full
  }
</style>

