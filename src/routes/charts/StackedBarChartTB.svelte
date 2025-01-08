<script lang="ts">
  import { onMount } from 'svelte';
  import * as d3 from 'd3';

class IterableStackedTrash {
  private data: stackedTrash[];

  constructor(data: stackedTrash[]) {
    this.data = data
  }
   
  [Symbol.iterator]() {
    let index = 0
    const data = this.data

    return {
      next(): IteratorResult<stackedTrash> {
        if (index < data.length) {
          return {value: data[index++], done: false }
        } else {
          return {done: true, value: undefined };
        }
      }
    }
  }
}


  let {data = [], yLabel = ""}: {data: stackedTrash[], yLabel: string} = $props(); // Data passed as a prop
  let iterableData = new IterableStackedTrash(data)

  // Chart dimensions
  let width = 928;
  let height = 600;
  const marginTop = 10;
  const marginRight = 20;
  const marginBottom = 20;
  const marginLeft = 70;
  const yLabelMargin = 50;
  const legendMargin = 30;
  const legendItemHeight = 20;
  const legendItemWidth = 20;

  // get unique data categories
  const uniqueCats = new Set(data.map((d) => d.trash_pounds))
  const intraLegendSpacing = width/(uniqueCats.size)-marginRight;

  let vector;
  let tooltip;
  const keys = Object.keys(Object.values(data)[0]).slice(1)  
  const stack = d3.stack()
    .keys(["trash_pounds", "recycled_pounds"])
  const stackedData = stack(data )
  console.log(keys)
  console.log(stackedData)
  /*
 onMount(() => {
  
 
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

    tooltip = d3.select('body')
      .append('div')
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('pointer-events', 'none');
    // Return the color scale as part of the chart's properties (for the legend).
    return { scales: { color } };
  });
    */
</script>

<svg width={width}
      height={height}
      viewBox={`0, 0, ${width}, ${height}`}
      class={'my-4'}
      bind:this={vector}
>
</svg>

<style>
  .tooltip {
    @apply
    absolute invisible bg-black text-white px-2 py-1 rounded text-sm
  }
</style>

