<script lang="ts">
import * as d3 from 'd3';

// Define the dataType interface
type dataType = {
  age: number;
  juris: string;
  pop: number;
  key?: string; // Optional key for the stacked data
};

// Specify the chart’s dimensions
const width = 928;
const height = 500;
const marginTop = 10;
const marginRight = 10;
const marginBottom = 20;
const marginLeft = 40;

// Example data (replace with your actual dataset)
const data: dataType[] = [
  { age: 20, juris: "Harris", pop: 2000 },
  { age: 30, juris: "Harris", pop: 2200 },
  { age: 30, juris: "Fort Bend", pop: 800 }
];

// Step 1: Group the data by juris (state) and age
const nestedData = d3.rollup(
  data,
  (v: dataType[]) => d3.rollup(v, (w: dataType[]) => d3.sum(w, (d: dataType) => d.pop)),
  (d: dataType) => d.juris,  // Group by juris (state)
  (d: dataType) => d.age     // Group by age within each state
);

// Step 2: Flatten the grouped data into the format that d3.stack() expects
const flatData = Array.from(nestedData, ([juris, ageMap]) => {
  const entry: { juris: string } = { juris };
  ageMap.forEach((pop, age) => {
    entry[age] = pop;
  });
  return entry;
});

// Step 3: Create the stack using d3.stack()
const series = d3.stack<{ juris: string; [key: number]: number }>()
  .keys([...new Set(data.map(d => d.age))]) // Distinct age values
  .value(([, D], key: number) => D[key] || 0) // Handle missing values
  (flatData);

// Step 4: Prepare the scales
const x = d3.scaleBand()
  .domain(flatData.map(d => d.juris))  // The domain is based on the juris (state)
  .range([marginLeft, width - marginRight])
  .padding(0.1);

const y = d3.scaleLinear()
  .domain([0, d3.max(series, (d: any) => d3.max(d, (d: any) => d[1]))]) // Max value from the stack
  .rangeRound([height - marginBottom, marginTop]);

const color = d3.scaleOrdinal()
  .domain(series.map(d => d.key))  // Color by age (key)
  .range(d3.schemeSpectral[series.length] || d3.schemeCategory10)
  .unknown("#ccc");

// A function to format the value in the tooltip
const formatValue = (x: number) => isNaN(x) ? "N/A" : x.toLocaleString("en");

// Step 5: Create the SVG container
let svg = d3.create("svg")
  .attr("width", width)
  .attr("height", height)
  .attr("viewBox", [0, 0, width, height])
  .attr("style", "max-width: 100%; height: auto;");

// Step 6: Append a group for each series, and a rect for each element in the series
svg.append("g")
  .selectAll()
  .data(series)
  .join("g")
  .attr("fill", (d: { key: string }) => color(d.key))  // Set color for each key (age)
  .selectAll("rect")
  .data((D: { key: string, data: { juris: string } }[]) => D.map((d: { key: string, data: { juris: string } }) => (d.key = D.key, d)))  // Bind data and assign the key
  .join("rect")
  .attr("x", (d: { data: { juris: string } }) => x(d.data.juris))  // Set the x position based on juris (state)
  .attr("y", (d: { [key: string]: number }) => y(d[1]))  // Set the y position based on the stacked value
  .attr("height", (d: { [key: string]: number }) => y(d[0]) - y(d[1]))  // Height is the difference between stacked values
  .attr("width", x.bandwidth())  // Set the width based on the band scale
  .append("title")
  .text((d: { data: { juris: string }, key: string }) => `${d.data.juris} ${d.key}\n${formatValue(d[1] - d[0])}`);  // Tooltip with value

// Step 7: Append the horizontal axis
svg.append("g")
  .attr("transform", `translate(0,${height - marginBottom})`)
  .call(d3.axisBottom(x).tickSizeOuter(0))
  .call((g: d3.Selection<SVGGElement, unknown, null, undefined>) => g.selectAll(".domain").remove());

// Step 8: Append the vertical axis
svg.append("g")
  .attr("transform", `translate(${marginLeft},0)`)
  .call(d3.axisLeft(y).ticks(null, "s"))
  .call((g: d3.Selection<SVGGElement, unknown, null, undefined>) => g.selectAll(".domain").remove());

</script>


<svg bind:this={svg}>

</svg>
