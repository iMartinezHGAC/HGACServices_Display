<script>
  import { onMount } from 'svelte';
  import * as d3 from 'd3';

  let {data = []} = $props(); // Data passed as a prop

  // Chart dimensions
  let width = 928;
  let height = 500;
  const marginTop = 20;
  const marginRight = 0;
  const marginBottom = 30;
  const marginLeft = 40;

  onMount(() => {
    // Create the horizontal scale and axis
    const x = d3.scaleBand()
      .domain(d3.sort(data, d => -d.frequency).map(d => d.letter))
      .range([marginLeft, width - marginRight])
      .padding(0.1);

    const xAxis = d3.axisBottom(x).tickSizeOuter(0);

    // Create the vertical scale
    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.frequency)]).nice()
      .range([height - marginBottom, marginTop]);

    // Select the SVG container
    const svg = d3.select('#zoomable-bar-chart')
      .attr('viewBox', [0, 0, width, height])
      .attr('width', width)
      .attr('height', height)
      .attr('style', 'max-width: 100%; height: auto;')
      .call(zoom);

    // Append bars
    svg.append('g')
      .attr('class', 'bars')
      .attr('fill', 'steelblue')
      .selectAll('rect')
      .data(data)
      .join('rect')
      .attr('x', d => x(d.letter))
      .attr('y', d => y(d.frequency))
      .attr('height', d => y(0) - y(d.frequency))
      .attr('width', x.bandwidth());

    // Append axes
    svg.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${height - marginBottom})`)
      .call(xAxis);

    svg.append('g')
      .attr('class', 'y-axis')
      .attr('transform', `translate(${marginLeft},0)`)
      .call(d3.axisLeft(y))
      .call(g => g.select('.domain').remove());

    // Zoom function
    function zoom(svg) {
      const extent = [
        [marginLeft, marginTop], 
        [width - marginRight, height - marginTop]
      ];

      svg.call(d3.zoom()
        .scaleExtent([1, 8])
        .translateExtent(extent)
        .extent(extent)
        .on('zoom', zoomed));

      function zoomed(event) {
        x.range([marginLeft, width - marginRight].map(d => event.transform.applyX(d)));
        svg.selectAll('.bars rect')
          .attr('x', d => x(d.letter))
          .attr('width', x.bandwidth());
        svg.selectAll('.x-axis')
          .call(xAxis);
      }
    }
  });
</script>

<svg id="zoomable-bar-chart"></svg>

<style>
  svg {
    @apply
    w-1/2
  }
</style>

