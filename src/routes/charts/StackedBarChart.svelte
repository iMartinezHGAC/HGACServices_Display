<script>
  import { onMount } from 'svelte';
  import * as d3 from 'd3';

  let {data = [], yLabel = ""} = $props(); // Data passed as a prop

  // Chart dimensions
  let width = 928;
  let height = 500;
  const marginTop = 10;
  const marginRight = 20;
  const marginBottom = 20;
  const marginLeft = 50;
  const legendMargin = 50;
  const legendItemHeight = 20;

  let vector;
  let tooltip;
 onMount(() => {
    // Group the data by 'juris' and extract the unique 'age' categories
    const groups = d3.groups(data, d => d.juris);

    // Extract unique age categories using a Set (JavaScript native)
    const ageKeys = Array.from(new Set(data.map(d => d.age)));

    console.log('Age keys:', ageKeys); // Debugging output

    if (ageKeys.length === 0) {
      console.error("No age categories found in data!");
      return;
    }
    // Stack the data
    const series = d3.stack()
      .keys(ageKeys) // unique 'age' categories
      .value(([, D], key) => D.get(key).population) // get value for each key and stack
    (d3.index(data, d => d.juris, d => d.age)); // group by 'juris' and 'age'

    // Prepare the scales for positional and color encodings
    const x = d3.scaleBand()
      .domain(d3.groupSort(data, D => -d3.sum(D, d => d.population), d => d.juris))
      .range([marginLeft, width - marginRight - legendMargin])
      .padding(0.1);

    const y = d3.scaleLinear()
      .domain([0, d3.max(series, d => d3.max(d, d => d[1]))])
      .rangeRound([height - marginBottom, marginTop]);

    // Check if color range is being set correctly
    console.log('Color range:', d3.schemeSpectral[ageKeys.length]); // Debugging output

    const color = d3.scaleOrdinal()
      .domain(ageKeys)
      .range(d3.schemeSpectral[ageKeys.length] || d3.schemeCategory10) // Fall back to Category10 if needed
      .unknown("#ccc");

    // A function to format the value in the tooltip.
    const formatValue = x => isNaN(x) ? "N/A" : x.toLocaleString("en");

    // Append a group for each series, and a rect for each element in the series
     d3.select(vector)
      .append('g')
      .selectAll()
      .data(series)
      .join('g')
      .attr('fill', d => color(d.key))
      .selectAll('rect')
      .data(D => D.map(d => (d.key = D.key, d)))
      .join('rect')
      .attr('x', d => x(d.data[0]))
      .attr('y', d => y(d[1]))
      .attr('height', d => y(d[0]) - y(d[1]))
      .attr('width', x.bandwidth())
      .on('mouseenter', function(event, d) {
        const mousePos = d3.pointer(event);
        tooltip
          .style('visibility', 'visible')
          .style('top', `${mousePos[1] + 10}px`)  // Position below the bar
          .style('left', `${mousePos[0] + 10}px`) // Position to the right of the bar
      })
      .on('mouseleave', function() {
        tooltip.style('visibility', 'hidden');
      })
      .append('title')
      .text(d => `Age: ${d.key}\nPopulation: ${formatValue(d.data[1].get(d.key).population)}`);

    // Append the horizontal axis
    d3.select(vector)
      .append('g')
      .attr('transform', `translate(0,${height - marginBottom})`)
      .call(d3.axisBottom(x).tickSizeOuter(0))
      .call(g => g.selectAll('.domain').remove());

    // Append the vertical axis
    d3.select(vector)
      .append('g')
      .attr('transform', `translate(${marginLeft},0)`)
      .call(d3.axisLeft(y).ticks(null, "s"))
      .call(g => g.selectAll('.domain').remove());

    // Y-LABEL
    d3.select(vector)
      .append('text')
      .attr('x', -(height / 2)) // Rotate and place the label
      .attr('y', marginLeft - 35) // Vertical position
      .attr('transform', 'rotate(-90)') // Rotate the label to align vertically
      .attr('text-anchor', 'middle')
      .attr('font-size', '0.9rem')
      .attr('font-weight', '700')
      .attr('font-family', 'Metropolis')
      .attr('fill', 'currentColor')
      .text(yLabel);

     // Add the color legend
    const legend = d3.select(vector).append('g')
      .attr('transform', `translate(${width - marginRight - legendMargin}, ${marginTop})`);

    // Add color swatches and labels
    legend.selectAll('rect')
      .data(ageKeys)
      .join('rect')
      .attr('x', 0)
      .attr('y', (d, i) => i * (legendItemHeight + 5)) // Vertical spacing between legend items
      .attr('width', 20)
      .attr('height', legendItemHeight)
      .attr('fill', d => color(d));

    legend.selectAll('text')
      .data(ageKeys)
      .join('text')
      .attr('x', 30)
      .attr('y', (d, i) => i * (legendItemHeight + 5) + legendItemHeight / 2)
      .attr('dy', '0.35em')
      .attr('font-size', 12)
      .attr('fill', 'white')
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
</script>

<svg width={width}
      height={height}
      viewBox={`0, 0, ${width}, ${height}`}
      class={'flex-initial mb-20 w-max-full'}
      bind:this={vector}
></svg>

<style>
  .tooltip {
    @apply
    absolute invisible bg-black text-white px-2 py-1 rounded text-sm
  }
</style>

