<script lang="ts">
	import { sortDescending } from '$lib/scripts/callbackFunctions.svelte';
  import * as d3 from 'd3'

  interface propType {
    width: number,
    data: HierarchyDatum
  }

  const {width=928, data}: propType = $props()
  const height = width; // ¯\_(ツ)_/¯
  const radius = $derived(width/6)
  const color = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, data.children!.length+1))

  interface HierarchyDatum {
    name: string,
    value?: number,
    children?: HierarchyDatum[]
    [key: string]: any // account for additional properties
  }

  interface CustomHierarchyRectangularNode extends d3.HierarchyRectangularNode<HierarchyDatum> {
    current: CustomHierarchyRectangularNode;
    target?: {
      x0: number,
      x1: number,
      y0: number,
      y1: number,
    }
  }
  // Compute layout
  const hierarchy = d3.hierarchy<HierarchyDatum>(data)
    .sum((d:any) => d.value)
    .sort((a,b)=>sortDescending(a.value,b.value))
  const root = d3.partition<HierarchyDatum>()
    .size([2*Math.PI, hierarchy.height + 1])(hierarchy) as CustomHierarchyRectangularNode

  root.each(d => d.current = d)


  // Create the arcGenerator data
  const arcGenerator = $derived(d3.arc<CustomHierarchyRectangularNode>()
    .startAngle(d => d.x0)
    .endAngle(d=> d.x1)
    .padAngle(d => Math.min((d.x1 - d.x0)/2, 0.005))
    .padRadius(radius * 1.5)
    .innerRadius(d=> d.y0 * radius)
    .outerRadius(d => Math.max(d.y0 * radius, d.y1 * radius - 1))
  )

  // Check if the arc should exist
  const arcVisible = (d: CustomHierarchyRectangularNode): boolean => {
    return d.y1 <= 3 && d.y0 >= 1 && d.x1 > d.x0
  }

  // check if the label should exist 
  const labelVisible = (d: CustomHierarchyRectangularNode): boolean => {
    return d.y1 <= 3 && d.y0 >= 1 && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.03
  }

  // Rotate and translate the position of the label
  const labelTransform = (d: CustomHierarchyRectangularNode): string => {
    const x = (d.x0 + d.x1) / 2 * 180/Math.PI // center of the total x value, converted to degrees
    const y = (d.y0 + d.y1) / 2 * radius      // center of the total y value, converted to arclength 
    return `rotate(${x-90}) translate(${y},0) rotate(${x<180 ? 0 : 180})`
  }

  // handle zoom
  function handleClick(event: MouseEvent, p:CustomHierarchyRectangularNode) {
    console.log("clicked")
    root.each(d=> {
        d.current.x0 = Math.max(0, Math.min(1, (d.x0 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI
        d.current.x1 = Math.max(0, Math.min(1, (d.x1 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI
        d.current.y0 = Math.max(0, d.y0 - p.depth)
        d.current.y1 = Math.max(0, d.y1 - p.depth)
    })
    descendants = root.descendants().slice(1)
  }

  let transitionActive = $state(false)

  // Get descendants for rendering
  let descendants = $state(root.descendants().slice(1))
  $inspect(descendants)
  let vector: HTMLDivElement
</script>

<div bind:this={vector}>
  <svg height={height} width={width} viewBox={`-${width/2} -${height/2} ${width} ${width}`}>
    {#if root.children !== undefined}
    <g>
    {#each descendants as d}
      <path 
            role="presentation"
            aria-label="button"
            fill={(()=> {
              let node = d
              while (node.depth > 1) node = node.parent!
              return color(node.data.name)?.toString() ||'black'
            })()}
            fill-opacity={arcVisible(d.current) ? (d.children ? 0.6 : 0.4) : 0}
            pointer-events={arcVisible(d.current) ? 'auto' : 'none'}
            d={arcGenerator(d.current) || ''}
            onclick={(event: MouseEvent)=> handleClick(event, d)}
            style:cursor={d.children ? 'pointer' : 'default'}
      />
      <title>
            {`${d.ancestors()
                .map(d=>d.data.name)
                .reverse()
                .join('/')}
                \n${d3.format(',d')(d.value || 0)}`}
      </title>
    {/each}
    </g>

    <g pointer-events="none" text-anchor="middle" style="user-select: none;">
        {#each descendants as d}
          <text dy="0.35em" fill-opacity={+labelVisible(d.current)} transform={labelTransform(d.current)}>
            {d.data.name}
          </text>
        {/each}
    </g>

      <circle
        role="presentation"
        aria-label="button"
        r={radius}
        fill="none"
        pointer-events="all"
        onclick={(event: MouseEvent)=> handleClick(event, root)}
      />
    {/if}
  </svg>
</div>
