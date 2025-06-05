<script lang="ts">
  import * as d3 from 'd3';
  import {shrinkLongNames} from "$lib/scripts/textFormatters.svelte"
  import { graphsState } from './graphVectors.svelte';
  import { snakeToHuman } from "$routes/helpers/caseConversion"
 
  type stackedTrash = {
    juris: string,
    historical_funds: number,
    current_funds: number,
    tab3: number,
  }
 
  // import state
  const graphState = graphsState()
 
  let vector: HTMLDivElement;

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

 
  // when parent Export to PDF button is clicked, add this vector to the array of vectors to be exported
  export function handleAdd() {
    graphState.add(vector)
  }
  
  // Use default empty array and provide type safety
  let {data = [], yLabel = "", colorSet = []}: {
    data?: stackedTrash[], 
    yLabel?: string, 
    colorSet?: string[]
  } = $props();
 
  console.log(data)
  // Chart dimensions
  let width = 1000;
  let height = 700;
  const marginTop = 10;
  const marginRight = 20;
  const marginBottom = 0;
  const marginLeft = 90;
  const yLabelMargin = 45;
  const legendItemHeight = 20;
  const legendItemWidth = 20;
 
  // Safely create color scale
  const colors = d3.scaleLinear(
    Array.from({length: Math.max(colorSet.length, 1)}, (_, i) => i), 
    colorSet.length > 0 ? colorSet : ['#1f77b4']
  );
 
  // Safely get unique categories
  const uniqueCats = $derived(new Set(data?.map((d) => d.juris) ?? []));
 
  // Safely get keys, excluding 'juris'
  const keys = $derived(() => {
    if (!data || data.length === 0) return [];
    return Object.keys(data[0]).filter(key => key !== 'juris');
  });
 
  // Create stacked data with error handling
  const stackedData = $derived(() => {
    if (!data || data.length === 0) return [];
 
    try {
      // Create stack generator
      const stack = d3.stack().keys(keys());
      
      // Generate stacked data
      return stack(data);
    } catch (error) {
      console.error('Error creating stacked data:', error);
      return [];
    }
  });
 
  // Safely get max value
  const maxVal = $derived(() => {
    if (!data || data.length === 0) return 0;
    
    return Math.max(...data.map(item => 
      Object.entries(item)
        .filter(([key]) => key !== 'juris')
        .reduce((sum, [, value]) => sum + (typeof value === 'number' ? value : 0), 0)
    ));
  });
 
  // Scales with error handling
  const x = $derived(d3.scaleBand()
    .domain(Array.from(uniqueCats))
    .range([marginLeft, width - marginRight])
    .padding(0.1)
  );
 
  const y = $derived(d3.scaleLinear()
    .domain([0, maxVal()])
    .rangeRound([height - marginBottom, marginTop])
  );
 
  let tooltip: HTMLDivElement;
 
  // Safely format value
  function formatValue(value: number | undefined): string {
    if (value === undefined || value === null) return 'N/A';
    return typeof value === 'number' ? value.toLocaleString() : 'N/A';
  }
</script>


<style>
  #tooltip {
    position: absolute;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.2s;
    z-index: 100;
  }
</style>
 
<div class="rounded-xl p-16" bind:this={vector}>
  {#if data && data.length > 0}
    <svg 
      width={width}
      height={height*1.5}
      viewBox={`0, ${0}, ${width}, ${height*1.2}`}
      class={'z-10 w-full h-full'}
    >
      <!-- x-axis -->
      <g transform={`translate(${marginLeft+yLabelMargin}, ${height - marginBottom})`} class="x-axis">
        {#each x.domain() as d}
          <g transform={`translate(${x(d) - yLabelMargin},${marginBottom}) rotate(45 0 0)`}>
            <text class="font-[Metropolis] text-lg transform translate-y-6" text-anchor="start">
              {shrinkLongNames(d)}
            </text>
          </g>
        {/each}
      </g>
 
      <!-- Y-axis group -->
      <g transform={`translate(${marginLeft},0)`} class="y-axis">
        <text 
          x={`-${marginLeft}`} 
          y={`-${marginTop+60}`} 
          text-anchor="left"
          class="text-5xl font-bold font-[Metropolis] text-start items-start fill-slate-700 select-none"
        >
          {yLabel}
        </text>
 
        {#each y.ticks(5) as tick}
          <g transform={`translate(0,${y(tick)})`}>
            <line x2={width - marginRight - marginLeft} class="stroke-black stroke-2" stroke-dasharray={4} stroke-opacity={0.8}/>
            <text x={-10} dy=".32em" text-anchor="middle" class={`text-3xl font-[Metropolis] transform -translate-x-8 select-none`}>{tick}</text>
          </g>
        {/each}
      </g> 
      
      <!-- Create stacked bars -->
      <g>
        {#each stackedData() as categoryData, categoryIndex}
          {#each categoryData as barSegment, index}
            {console.log("stacked data",categoryIndex)}
            <rect
              x={x(data[index].juris)}
              y={y(barSegment[1])}
              height={Math.max(0, y(barSegment[0]) - y(barSegment[1]))}
              width={x.bandwidth()}
              fill={getColor(keys()[categoryIndex])}
              on:mouseover={(event) => {
                const segmentValue = barSegment[1] - barSegment[0];
                d3.select(tooltip)
                  .style("opacity", 1)
                  .html(`
                    <strong>Year:</strong> ${data[index].juris}<br>
                    <strong>Category:</strong> ${snakeToHuman(keys()[categoryIndex])}<br>
                    <strong>Value:</strong> ${formatValue(segmentValue)}
                  `)
                  .style("left", (event.pageX + 10) + "px")
                  .style("top", (event.pageY - 10) + "px");
              }}
              on:mouseout={() => {
                d3.select(tooltip)
                  .style("opacity", 0);
              }}
            >
            </rect> 
          {/each}
        {/each}
      </g>
 
      <!-- Legend -->
      <g transform={`translate(${marginLeft/3}, ${1650})`}>
        {#each keys() as key, i}
          {@const rowIndex = Math.floor(i / 3)}
          {@const colIndex = i % 3}
          <rect 
            x={(colIndex * (legendItemHeight + 300))} 
            y={-height-marginTop*8 - (rowIndex * (legendItemHeight + 20))} 
            width={legendItemWidth} 
            height={legendItemHeight} 
            fill={colors(i)}
            class={`stroke-black transform select-none`}
          >
          </rect>
          <text 
            x={(colIndex * (legendItemHeight + 300))} 
            y={-height-marginTop*6 - (rowIndex * (legendItemHeight + 20))} 
            class="font-[Metropolis] text-2xl transform translate-x-8 select-none">
            <tspan>{snakeToHuman(key)}</tspan>
          </text>
        {/each}
      </g>
    </svg>
  {:else}
    <div class="text-center text-slate-100 bg-slate-700">No data available</div>
  {/if}
</div>
 
<!-- Add tooltip div outside of SVG -->
<div 
  bind:this={tooltip} 
  id="tooltip" 
  class="-translate-y-96 bg-slate-700 text-slate-100 p-3 rounded-md shadow-lg border border-slate-600"
>
</div>
