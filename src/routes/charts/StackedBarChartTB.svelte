<script lang="ts">
  import { onMount } from 'svelte';
  import * as d3 from 'd3';
	import LinePlot from './LinePlot.svelte';

  type stackedTrash = {
    juris: string,
    historical_funds: number,
    current_funds: number,
  }

  let {data = [], yLabel = "", colorSet}: {data: stackedTrash[], yLabel: string, colorSet: string[]} = $props(); // Data passed as a prop

  // Chart dimensions
  let width = 1200;
  let height = 600;
  const marginTop = 10;
  const marginRight = 20;
  const marginBottom = 20;
  const marginLeft = 70;
  const yLabelMargin = 50;
  const legendMargin = 30;
  const legendItemHeight = 20;
  const legendItemWidth = 20;

  //const colors = d3.scaleSequential([0.5,0.5], d3.interpolateBlues)
  const colors = d3.scaleLinear([0,1,2,3,4], colorSet);
  // get unique data categories
  const uniqueCats = new Set(data.map((d) => d.juris))
  const intraLegendSpacing = width/(uniqueCats.size)-marginRight;

  let vector;
  //let tooltip;
  const rawKeys = Object.keys(Object.values(data)[0])
  const keys =  rawKeys.slice(1)  
  const jurisdictions = rawKeys[0]
  const stack = d3.stack()
    .keys(keys)
  const stackedData = stack(data)

  const maxValueInStack = $derived(stackedData[1].reduce((max, item) => 
    Math.max(max, item[1]), Number.MIN_SAFE_INTEGER
  ))

  $inspect("Stacked: ", stackedData)
  /*
 onMount(() => {
    tooltip = d3.select('body')
      .append('div')
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('pointer-events', 'none');
    // Return the color scale as part of the chart's properties (for the legend).
    return { scales: { color } };
  });
   // Add the color legend
    const legend = d3.select(vector).append('g')
      .attr('transform', `translate(${marginLeft}, ${height})`);

    // Add color swatches and labels
    legend.selectAll('rect')
      .data(ageKeys)
      .join('rect')
      .attr('x', (d,i) => i * (legendItemHeight+intraLegendSpacing))
      .attr('y', 20) // Vertical spacing between legend items
      .attr('width', legendItemWidth)
      .attr('height', legendItemHeight)
      .attr('fill', d => color(d))
      .attr('transform', `translate(${legendMargin})`);

    legend.selectAll('text')
      .data(ageKeys)
      .join('text')
      .attr('transform', `translate(${legendMargin*2})`)
      .attr('x', (d,i) => i * (legendItemWidth+intraLegendSpacing))
      .attr('y', legendItemHeight * 1.56) // Vertical spacing between legend items
      .attr('dy', '0.35em')
      .attr('font-size', '1rem')
      .attr('font-weight', '600')
      .attr('font-family', 'Metropolis')
      .attr('fill', 'black')
      .text(d => d); // Use the age category name as the label

    */


const x = $derived(d3.scaleBand()
      .domain(uniqueCats)
      .range([marginLeft, width - marginRight])
      .padding(0.1)
  )


const y = $derived(d3.scaleLinear()
    .domain([0, maxValueInStack])
    .rangeRound([height - marginBottom, marginTop])
  )

onMount(()=> {
  d3.select(vector)
    .append('g')
    .attr('transform', `translate(0,${height - marginBottom})`)
    .call(d3.axisBottom(x).tickSizeOuter(0))
    .call(g => g.selectAll('.domain').remove())
    .selectAll('text')
    .attr('font-weight', '500')
    .attr('font-family', 'Metropolis')
    .attr('font-size', '1.2rem')
    .attr('fill', 'black')

  // Append the vertical axis
  d3.select(vector)
    .append('g')
    .attr('transform', `translate(${marginLeft},0)`)
    .call(d3.axisLeft(y).ticks(null, "s"))
    .call(g => g.selectAll('.domain').remove())
    .selectAll('text')
    .attr('font-family', 'Metropolis')
    .attr('fill', 'black')
    .attr('font-size', '1.3rem');

  // Y-LABEL
  d3.select(vector)
    .append('text')
    .attr('x', yLabel.length) // Rotate and place the label
    .attr('y', -40) // Vertical position
    .attr('text-anchor', 'start')
    .attr('font-size', '1.8rem')
    .attr('font-weight', '700')
    .attr('font-family', 'Metropolis')
    .attr('fill', 'currentColor')
    .attr('fill', 'black')
    .text(yLabel);
})
</script>

<div class="bg-white flex items-center justify-center rounded-lg">
  <svg 
        width={width}
        height={height}
        viewBox={`0, 0, ${width}, ${height}`}
        class={'z-10'}
        bind:this={vector}
  >
    <g>
      {#each stackedData[1] as data,i}
        <rect
          x={x(data.data.juris)}
          y={y(data[0])}
          transform="translate(0,0)"
          height={-y(data[1])}
          width={x.bandwidth()}
          fill={colors(i/data.length)}
        >
        </rect>       
        <rect
          x={x(data.data.juris)}
          y={y(data[1])-y(data[0])}
            transform="translate(0,580)"
          height={-(y(data[1])-y(data[0]))}
          width={x.bandwidth()}
          fill={colors(i/data.length)}
        >
        </rect>
      {/each}
    </g>
    <g transform={`translate(${marginLeft}, ${height-10})`}>
      {#each keys as key,i}
        {console.log("Key: ", key, i, colors(i/keys.length))}
        <rect 
          x={i*(legendItemHeight+intraLegendSpacing)} 
          y={20} 
          width={legendItemWidth} 
          height={legendItemHeight} 
          fill={colors(i/keys.length)}
          stroke={"black"}
          transform={`translate(${legendMargin})`}
        >
        </rect>
        <text x={i*(legendItemHeight+intraLegendSpacing)} y={legendItemHeight*1.65} transform={`translate(${legendMargin*2})`}>
          <tspan>
              {key}
          </tspan>
        </text>
      {/each}
    </g>
      // Append the horizontal axis
  </svg>
</div>
<!--
<style>
  .tooltip {
    @apply
    absolute invisible bg-black text-white px-2 py-1 rounded text-sm
  }
</style>

-->

