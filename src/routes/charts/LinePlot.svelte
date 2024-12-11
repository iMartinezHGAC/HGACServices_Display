<script lang="ts">

  interface lineProps {
    data: number[],
    width: number,
    height: number,
    marginTop: number,
    marginRight: number,
    marginBottom: number,
    marginLeft: number
    yLabel: string,
    yLabelMargin: number
  }

  let {
    data = [1,2,4,8,16], 
    width = 640, 
    height = 400, 
    marginTop = 20, 
    marginRight = 20,
    marginLeft = 60, 
    marginBottom = 20,
    yLabel = "",
    yLabelMargin = 90,
  }: lineProps = $props()
  let gy: any
  let gx: any

  import * as d3 from "d3";
  let x = $derived(d3.scaleLinear([0, data.length - 1], [marginLeft, (width-marginRight)]))
  let y = $derived(d3.scaleLinear(d3.extent(data), [height - marginBottom, marginTop]))
  let line = $derived(d3.line((d: any,i: any) => x(i), y))
  $effect(()=> {
    // Grid lines
    d3.select(gy)
      .selectAll('.grid-line')
      .data(y.ticks())
      .enter()
      .append('line')
      .attr('class', 'grid-line')
      .attr('x1', 0)
      .attr('y1', (d: any)=> y(d))
      .attr('x2', width - marginLeft - marginRight)
      .attr('y2', (d:any) => y(d))
      .attr('stroke', '#ccc')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '2,2')
    // Y axis tick marks
    d3.select(gy)
      .call(d3.axisLeft(y))
    d3.select(gy)
      .append('text')
      .attr('x', -(height / 2)) // Rotate and place the label
      .attr('y', marginLeft - yLabelMargin) // Vertical position
      .attr('transform', 'rotate(-90)') // Rotate the label to align vertically
      .attr('text-anchor', 'middle')
      .attr('font-size', '1.3rem')
      .attr('font-weight', '700')
      .attr('font-family', 'Metropolis')
      .attr('fill', 'currentColor')
      .text(yLabel);
  })
  $effect(()=> {
    d3.select(gx).call(d3.axisBottom(x))
  })
</script>

<svg width={width} height={height} class="px-2">
  <path fill="none" stroke="currentColor" stroke-width="1.5" d={line(data)} />
  <g bind:this={gx} transform="translate(0, {height - marginBottom})" />
  <g bind:this={gy} transform="translate({marginLeft}, 0)" />
  <g fill="white" stroke="currentColor" stroke-width="1.5">
    {#each data as d,i  }
      <circle cx={x(i)} cy={y(d)} r="2.5" fill="orange" stroke="orange"/>
    {/each}
  </g>
</svg>
