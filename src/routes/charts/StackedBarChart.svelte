<script lang="ts">
  import * as d3 from 'd3';
  import {shrinkLongNames} from "$lib/scripts/textFormatters.svelte"
	import { graphsState } from './graphVectors.svelte';

  type stackedTrash = {
    juris: string,
    historical_funds: number,
    current_funds: number,
  }

  // import state
  const graphState = graphsState()

  let vector: HTMLDivElement;

  // when parent Export to PDF button is clicked, add this vector to the array of vectors to be exported
  export function handleAdd() {
    graphState.add(vector)
  }
  let {data = [], yLabel = "", colorSet}: {data: stackedTrash[], yLabel: string, colorSet: string[]} = $props(); // Data passed as a prop

  // Chart dimensions
  let width = 1000;
  let height = 700;
  const marginTop = 10;
  const marginRight = 20;
  const marginBottom = 20;
  const marginLeft = 70;
  const yLabelMargin = 35;
  const legendMargin = 30;
  const legendItemHeight = 20;
  const legendItemWidth = 20;

  //const colors = d3.scaleSequential([0.5,0.5], d3.interpolateBlues)
  const colors = d3.scaleLinear([0,1,2,3,4], colorSet);
  // get unique data categories
  const uniqueCats = new Set(data.map((d) => d.juris))
  // calculate the required spacing between legends
  const intraLegendSpacing = width/(uniqueCats.size)+marginRight;
  // get the number of values whose data will be represented as a bar
  const numOfValues = Object.entries(data)[0].length

  //let tooltip;
  // Get the keys of each object entry
  const rawKeys = Object.keys(Object.values(data)[0])
  // remove the Jurisdiction key
  const keys =  rawKeys.slice(1)  

  // Use the remaining keys to create a d3 stack
  const stack = d3.stack()
    .keys(keys)
  // create an object array of all values and their data
  const stackedData = stack(data)[numOfValues-1].map(data =>data.data)




  function accumulator(acc: number, val: unknown): number {
    if(typeof val === 'number') {
      return acc+val
    }
    return acc
  }

  /*
  * getMaxValueInObjArray
  * 
  */
  function getMaxValueInObjArray(arr: object[]) {
    return arr.reduce((max: number, item: object) => {
      let sum = Object.values(item).splice(1).reduce(accumulator,0)
      if(sum > max) {
        max = sum
      }
      return max
    }, -Infinity)
  }

  const maxVal = getMaxValueInObjArray(stackedData)
 


  //console.log(`StackedData: ${stackedData[2]}`)
const x = $derived(d3.scaleBand()
      .domain(uniqueCats)
      .range([marginLeft, width - marginRight])
      .padding(0.1)
  )

const y = $derived(d3.scaleLinear()
    .domain([0, maxVal])
    .rangeRound([height - marginBottom, marginTop])
  )

  let previousSum: number = 0
</script>

<div class="bg-white rounded-xl p-16" bind:this={vector}>
  <svg 
        width={width}
        height={height*1.4}
        viewBox={`0, ${0}, ${width}, ${height*1}`}
        class={'z-10 w-full h-full'}
  >
    <!-- x-axis -->
    <g transform={`translate(${marginLeft+0}, ${height - marginBottom})`} class="x-axis">
      {#each x.domain() as d}
        <g transform={`translate(${x(d) - yLabelMargin},${marginBottom}) rotate(45 0 0)`}>
        <text class="font-[Metropolis] text-lg transform translate-y-6" text-anchor="start">{shrinkLongNames(d)}</text>
        </g>
      {/each}
    </g>
   <!-- Y-axis group -->
    <g transform={`translate(${marginLeft},0)`} class="y-axis">
      <text 
        x={`-${marginLeft}`} 
        y={`-${marginTop}`} 
        text-anchor="left"
        class="text-5xl font-bold font-[Metropolis] text-start items-start fill-slate-700"
      >
        {yLabel}
      </text>

      {#each y.ticks(5) as tick}
        <g transform={`translate(0,${y(tick)})`}>
          <line x2={width - marginRight - marginLeft} class="stroke-black stroke-2" stroke-dasharray={4} stroke-opacity={0.8}/>
          <text x={-10} dy=".32em" text-anchor="middle" class={`text-3xl font-[Metropolis] transform -translate-x-8`}>{tick}</text>
        </g>
      {/each}
    </g> 
    <!------------------------ Create stacked bars ---------------------->
    <g>
      {#each stackedData as {juris, ...rest}}
        {#each Object.entries(rest) as [key, value],i}
          {previousSum = Object.values(rest).slice(0,i).reduce(accumulator,0)}
          <!--{console.log(`Juris: ${juris}, Cat: ${key},\nValue: ${value}, Accum: ${previousSum}, \ny-Val: ${y(value)}, y-Accum: ${y(previousSum)},\ni`)}-->
              <rect
                x={x(juris.toString())}
                y={y(previousSum+value)}
                height={height-y(value)}
                width={x.bandwidth()}
                fill={colors(i)}
              >
              </rect> 
        {/each}
      {/each}
    </g>


    <!-------------------- Legend --------------------->
    <g transform={`translate(${marginLeft}, ${height+(marginBottom*2)})`}>
      {#each keys as key,i}
        <rect 
          x={(width/1.7)-(i*(legendItemHeight*3+intraLegendSpacing))} 
          y={-height-marginTop*8} 
          width={legendItemWidth} 
          height={legendItemHeight} 
          fill={colors(i)}
          class={`stroke-black transform`}
        >
        </rect>
        <text 
          x={(width/1.7)-(i*(legendItemHeight*3+intraLegendSpacing))} 
          y={-height-marginTop*6} 
          class="font-[Metropolis] text-3xl transform translate-x-8">
          <tspan>{key}</tspan>
        </text>
      {/each}
    </g>
  </svg>
</div>
