<script>
  import { onMount } from 'svelte';
  import * as d3 from 'd3';

  let {data = []} = $props(); // Data passed as a prop

  // Chart dimensions
  let width = 928;
  let height = 500;
  const marginTop = 10;
  const marginRight = 20;
  const marginBottom = 20;
  const marginLeft = 40;
  const legendMargin = 50;

 onMount(() => {
    // Group the data by 'state' and extract the unique 'age' categories
    const groups = d3.groups(data, d => d.state);

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
    (d3.index(data, d => d.state, d => d.age)); // group by 'state' and 'age'

    // Prepare the scales for positional and color encodings
    const x = d3.scaleBand()
      .domain(d3.groupSort(data, D => -d3.sum(D, d => d.population), d => d.state))
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

    // Create the SVG container
    const svg = d3.select('#stacked-bar-chart')
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height])
      .attr('style', 'max-width: 100%; height: auto;');

    // Append a group for each series, and a rect for each element in the series
    svg.append('g')
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
      .append('title')
      .text(d => `${d.data[0]} ${d.key}\n${formatValue(d.data[1].get(d.key).population)}`);

    // Append the horizontal axis
    svg.append('g')
      .attr('transform', `translate(0,${height - marginBottom})`)
      .call(d3.axisBottom(x).tickSizeOuter(0))
      .call(g => g.selectAll('.domain').remove());

    // Append the vertical axis
    svg.append('g')
      .attr('transform', `translate(${marginLeft},0)`)
      .call(d3.axisLeft(y).ticks(null, "s"))
      .call(g => g.selectAll('.domain').remove());

     // Add the color legend
    const legend = svg.append('g')
      .attr('transform', `translate(${width - marginRight - legendMargin}, ${marginTop})`);

    const legendItemHeight = 20;

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
      .text(d => d); // Use the age category name as the label

    // Return the color scale as part of the chart's properties (for the legend).
    return { scales: { color } };
  });
</script>

<svg id="stacked-bar-chart"></svg>

<style>
  svg {
    @apply
    w-1/2 h-auto
  }
</style>

