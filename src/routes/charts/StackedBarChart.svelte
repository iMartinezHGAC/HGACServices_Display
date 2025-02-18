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
  const yLabelMargin = 50;
  const legendMargin = 30;
  const legendItemHeight = 20;
  const legendItemWidth = 20;

  //const colors = d3.scaleSequential([0.5,0.5], d3.interpolateBlues)
  const colors = d3.scaleLinear([0,1,2,3,4], colorSet);
  // get unique data categories
  const uniqueCats = new Set(data.map((d) => d.juris))
  const intraLegendSpacing = width/(uniqueCats.size)+marginRight;
  const numOfValues = Object.entries(data)[0].length

  //let tooltip;
  const rawKeys = Object.keys(Object.values(data)[0])
  const keys =  rawKeys.slice(1)  
  const jurisdictions = rawKeys[0]
  const stack = d3.stack()
    .keys(keys)
  const stackedData = stack(data)[numOfValues-1].map(data =>data.data)

  const getMaxValueInObjArray = (arr: object[]) => {
    return arr.reduce((max: number, item: object) => {
      for (const key in item) {
        if(key !== 'juris') {
          if(item[key] > max) {
            max = item[key]
          }
        }
      }
      return max
    }, -Infinity)
  }

  const maxVal = getMaxValueInObjArray(stackedData)
  console.log("Max value: ", maxVal)
 


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
    <!------------------------ Create stacked bars ---------------------->
    <g>
      {#each stackedData as {juris, ...rest}}
        {#each Object.entries(rest) as [key, value],i}
          {previousSum = Object.values(rest).slice(0,i).reduce((acc,val)=> acc+val,0)}
          <!--{console.log(juris, key, value, previousSum, i)}-->
              <rect
                x={x(juris.toString())}
                y={y(value)}
                height={height-y(value)}
                width={x.bandwidth()}
                fill={colors(i)}
              >
              </rect> 
        {/each}
      {/each}
    </g>

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
          <line x2={width - marginRight - marginLeft} stroke="black" stroke-width={2} stroke-dasharray={1.8} transform="translate(0,0)"/>
          <text x={-10} dy=".32em" text-anchor="middle" class={`text-3xl font-[Metropolis] transform -translate-x-8`}>{tick}</text>
        </g>
      {/each}
    </g> 
    <!-------------------- Legend --------------------->
    <g transform={`translate(${marginLeft}, ${height+(marginBottom*2)})`}>
      {#each keys as key,i}
        <rect 
          x={(width/2)-(i*(legendItemHeight*3+intraLegendSpacing))} 
          y={-height-(marginTop)} 
          width={legendItemWidth} 
          height={legendItemHeight} 
          fill={colors(i)}
          class={`stroke-black transform`}
        >
        </rect>
        <text 
          x={(width/2)-(i*(legendItemHeight*3+intraLegendSpacing))} 
          y={-height+(marginTop)} 
          class="font-[Metropolis] text-3xl transform translate-x-8">
          <tspan>{key}</tspan>
        </text>
      {/each}
    </g>
  </svg>
</div>
