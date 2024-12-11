<script>
  import * as d3 from 'd3';

  // Props
  let {data = [], width = 928, height = 500, yLabel = ""} = $props();
  const marginTop = 20;
  const marginRight = 0;
  const marginBottom = 30;
  const marginLeft = 50;

  // Reactive variables

  // Set up the scales and axis on mount
    // Horizontal scale (band scale)
  let x = $derived(d3.scaleBand()
      .domain(data.map(d => d.juris))
      .range([marginLeft, width - marginRight])
      .padding(0.1));

    // Vertical scale (linear scale)
  let y = $derived(d3.scaleLinear()
      .domain([0, d3.max(data, d => d.frequency)]).nice()
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
      <g transform={`translate(${x(d)},0)`}>
        <text dy="0.71em" text-anchor="middle" y="10">{d}</text>
      </g>
    {/each}
  </g>

 <!-- Y-axis group -->
  <g transform={`translate(${marginLeft},0)`} class="y-axis">
    {#each y.ticks(5) as tick}
      <g transform={`translate(0,${y(tick)})`}>
        <line x2={width - marginRight} stroke="black" />
        <text x={-10} dy=".32em" text-anchor="middle">{tick}</text>
      </g>
    {/each}
  </g>

  <!-- Bars -->
  {#each data as d}
    <rect x={x(d.juris)} 
          y={y(d.frequency)} 
          width={x.bandwidth()} 
          height={y(0) - y(d.frequency)} 
          fill="steelblue" />
  {/each}
</svg>

<style>
  svg {
    @apply
    w-1/2
  }
</style>

