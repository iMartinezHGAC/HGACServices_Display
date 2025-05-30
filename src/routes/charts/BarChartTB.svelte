<script lang="ts">
  import * as d3 from 'd3';
	import { graphsState } from './graphVectors.svelte';
  import {shrinkLongNames} from "$lib/scripts/textFormatters.svelte"

  let vector: HTMLDivElement
  // Props
  let {data = [],
    width = 928, 
    height = 500, 
    yLabel = ""
    } = $props();
  const marginTop = 30;
  const marginRight = 100;
  const marginBottom = 140;
  const marginLeft = 65;
  const yLabelMargin = 80;

  // Reactive variables
  const barColors = ["#ffffff","#fff9d8"]

  // import state
  const graphState = graphsState()

  let postScript = ''


  // when parent Export to PDF button is clicked, add this vector to the array of vectors to be exported
  export function handleAdd() {
    graphState.add(vector)
  }


  ///////////////  GRAPH FUNCTIONS /////////////////////

  // Set up the scales and axis on mount
    // Horizontal scale (band scale)
  let x = $state(d3.scaleBand()
      .domain(data.map(d => d.juris))
      .range([marginLeft, width - marginRight])
      .padding(0.1));

    // Vertical scale (linear scale)
  let y = $state(d3.scaleLinear()
      .domain([0, d3.max(data, d => d.value)]).nice()
      .range([height - marginBottom, marginTop]));

    // Axis for x
  let xAxis = $derived(d3.axisBottom(x).tickSizeOuter(0));

    // Axis for y
  let yAxis = $derived(d3.axisLeft(y).ticks(5));

  let transform = d3.zoomIdentity

  function roundToTenth(value: number) {
    return Math.round(value*10) / 10
  }


  ///////////////// Zoom functions ////////////////////

  function handleWheel(event: WheelEvent) {
    event.preventDefault()
    const scaleFactor = event.deltaY < 0 ? 1.1 : 0.9; // zoom in or out based on mouse input
    const [xPos, yPos] = d3.pointer(event, event.currentTarget as SVGSVGElement) // get mouse position relative to SVG
    const newScale = transform.k * scaleFactor
    const offsetX = roundToTenth((xPos - transform.applyX(xPos)) / transform.k)
    const offsetY = roundToTenth((yPos - transform.applyX(yPos)) / transform.k)
    transform = d3.zoomIdentity
      .translate(transform.x + offsetX * (1-scaleFactor),transform.y + offsetY * (1-scaleFactor))
      .scale(newScale)

    const newX = d3.scaleBand()
      .domain(data.map(d => d.juris))
      .range([marginLeft, width - marginRight].map(d => transform.applyX(d)))
      .padding(0.1);

    const newY = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.value)!]).nice()
      .range([height - marginBottom, marginTop].map(d=> transform.applyY(d)));

    x = newX
    //y = newY
  }

  /////////////////////// custom SVG bar ////////////////////
  /*
  const svg = d3.select("#chart")
    .append("svg")
    .attr("width", 500)
    .attr("height", 300)

  import tire from "$lib/assets/tire.svg"
  d3.xml(tire).then(function(svgData) {
    //generate tire pattern
    const pattern = svg.append("defs")
      .append("pattern")
      .attr("id", "tire-pattern")
      .attr("patternUnits", "userSpaceOnUse")
      .attr("width", 40)
      .attr("height", 10)
      .append("g")
      .html(svgData.documentElement.outerHTML)
  })
  */

  function truncateYAxisValue(value: number) {
    if(value > 999999) {
      postScript = "M"
      return value/1000000
    }
    else if (value > 1000) {
      postScript = "K"
      return value/1000
    }
    else return value

  }

</script>
<div 
      class="flexy"
      bind:this={vector}
>
  <svg id="zoomable-bar-chart" 
       width={width} 
       height={height} 
       viewBox={`0 0 ${width} ${height}`} 
       class="w-fill"
  >

    <!-- x-axis -->
    <g transform={`translate(${marginLeft+0}, ${height - marginBottom})`} class="x-axis">
      {#each x.domain() as d}
        <g transform={`translate(${x(d) -marginLeft/3},0) rotate(45 0 0)`}>
        <text class="font-[Metropolis] text-[0.8rem] transform translate-y-6" text-anchor="start">{shrinkLongNames(d)}</text>
        </g>
      {/each}
    </g>

   <!-- Y-axis group -->
    <g transform={`translate(${marginLeft},0)`} class="y-axis">
      <text 
        x={`${(0)}`} 
        y={`${0}`} 
        text-anchor="left"
        class="text-3xl font-bold font-[Metropolis] text-start items-start fill-slate-700"
      >
        {yLabel}
      </text>

      {#each y.ticks(5) as tick}
        <g transform={`translate(0,${y(tick)})`}>
          <line x2={width - marginRight - marginLeft} stroke="black" stroke-width={1.4} stroke-dasharray={2.5} transform="translate(20,0)"/>
          <text x={-10} dy=".32em" text-anchor="middle">{truncateYAxisValue(tick)} {postScript}</text>
        </g>
      {/each}
    </g> 
    <!-- Bars -->
    {#each data as d}
      <rect x={x(d.juris)} 
            y={y(d.value)} 
            width={x.bandwidth()} 
            height={y(0) - y(d.value)} 
            transform="translate(20,0)"
            fill="forestgreen" />
    {/each}
  </svg>
</div>

