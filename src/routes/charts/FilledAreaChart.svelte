<script>
  import { onMount } from 'svelte';
  import * as d3 from 'd3';

  let {data = []} = $props(); // Data passed as a prop

  // Chart dimensions
  let width = 928;
  let height = 500;
  const marginTop = 10;
  const marginRight = 10;
  const marginBottom = 20;
  const marginLeft = 40;

  onMount(() => {
    // Determine the series that need to be stacked.
    const series = d3.stack()
      .keys(d3.union(data.map(d => d.juris))) // distinct series keys, in input order
      .value(([, D], key) => D.get(key).unemployed) // get value for each series key and stack
    (d3.index(data, d => d.date, d => d.juris)); // group by stack then series key

    // Prepare the scales for positional and color encodings.
    const x = d3.scaleUtc()
      .domain(d3.extent(data, d => d.date))
      .range([marginLeft, width - marginRight]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(series, d => d3.max(d, d => d[1]))])
      .rangeRound([height - marginBottom, marginTop]);

    const color = d3.scaleOrdinal()
      .domain(series.map(d => d.key))
      .range(d3.schemeTableau10);

    // Construct an area shape.
    const area = d3.area()
      .x(d => x(d.data[0]))
      .y0(d => y(d[0]))
      .y1(d => y(d[1]));

    // Select the SVG container.
    const svg = d3.select('#stacked-area-chart')
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height])
      .attr('style', 'max-width: 100%; height: auto;');

    // Add the y-axis, remove the domain line, add grid lines and a label.
    svg.append('g')
      .attr('transform', `translate(${marginLeft},0)`)
      .call(d3.axisLeft(y).ticks(height / 80))
      .call(g => g.select('.domain').remove())
      .call(g => g.selectAll('.tick line').clone()
        .attr('x2', width - marginLeft - marginRight)
        .attr('stroke-opacity', 0.1))
      .call(g => g.append('text')
        .attr('x', -marginLeft)
        .attr('y', 10)
        .attr('fill', 'currentColor')
        .attr('text-anchor', 'start')
        .text('↑ Unemployed persons'));

    // Append a path for each series.
    svg.append('g')
      .selectAll()
      .data(series)
      .join('path')
      .attr('fill', d => color(d.key))
      .attr('d', area)
      .append('title')
      .text(d => d.key);

    // Append the horizontal axis atop the area.
    svg.append('g')
      .attr('transform', `translate(0,${height - marginBottom})`)
      .call(d3.axisBottom(x).tickSizeOuter(0));

    // Return the color scale as part of the chart's properties (for the legend).
    return { scales: { color } };
  });
</script>

<svg id="stacked-area-chart"></svg>

<style>
  svg {
    @apply
    w-1/2 h-auto
  }
</style>

