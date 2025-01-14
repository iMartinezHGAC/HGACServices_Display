<script lang="ts">
  import StackedBarChart from "../charts/StackedBarChart.svelte";
  import StatDisplay from "../components/statDisplay.svelte";
  import {fly} from "svelte/transition"

const donut_data = [
    {name: 'Justice', value: 100}, 
    {name: 'Workforce', value: 200}, 
    {name: 'Environment', value: 300}]

const donut_data2 = [
    {name: 'Justice', value: 200}, 
    {name: 'Workforce', value: 300}, 
    {name: 'Environment', value: 350}
  ]

const donut_data3 = [
    {name: 'Justice', value: 270}, 
    {name: 'Workforce', value: 127}, 
    {name: 'Environment', value: 188},
    {name: 'Transportation', value: 72},
  ]
const donut_data4 = [
    {name: 'Justice', value: 37000}, 
    {name: 'Workforce', value: 42700}, 
    {name: 'Environment', value: 19008},
    {name: 'Transportation', value: 27200},
  ]
const bar_data = [
    { juris: 'A', frequency: 25 },
    { juris: 'Transportation', frequency: 30 },
    { juris: 'Environment', frequency: 55 },
    { juris: 'Workforce', frequency: 65 },
    { juris: 'C', frequency: 15 },
    { juris: 'Galveston', frequency: 40 },
    { juris: 'B', frequency: 20 },
    { juris: 'Justice', frequency: 90 }
  ];

const area_data  = [
    { date: new Date('2021-01-01'), juris: 'Justice County', unemployed: 500 },
    { date: new Date('2021-01-01'), juris: 'Workforce County', unemployed: 300 },
    { date: new Date('2021-01-01'), juris: 'Tarrant County', unemployed: 700 },
    { date: new Date('2021-02-01'), juris: 'Justice County', unemployed: 450 },
    { date: new Date('2021-02-01'), juris: 'Workforce County', unemployed: 350 },
    { date: new Date('2021-02-01'), juris: 'Tarrant County', unemployed: 200 },
    { date: new Date('2021-03-01'), juris: 'Justice County', unemployed: 600 },
    { date: new Date('2021-03-01'), juris: 'Workforce County', unemployed: 200 },
    { date: new Date('2021-03-01'), juris: 'Tarrant County', unemployed: 500 },
    // Add more data points...
  ];

const stackbar_data = [
    { juris: 'Justice', age: '18-24', population: 1000 },
    { juris: 'Justice', age: '25-34', population: 1500 },
    { juris: 'Justice', age: '35-44', population: 2700 },
    { juris: 'Justice', age: '45-54', population: 1200 },
    { juris: 'Workforce', age: '18-24', population: 800 },
    { juris: 'Workforce', age: '25-34', population: 1200 },
    { juris: 'Workforce', age: '35-44', population: 1700 },
    { juris: 'Workforce', age: '45-54', population: 1000 },
    { juris: 'Environment', age: '18-24', population: 1100 },
    { juris: 'Environment', age: '25-34', population: 1500 },
    { juris: 'Environment', age: '35-44', population: 1300 },
    { juris: 'Environment', age: '45-54', population: 1100 },
    { juris: 'Criminal Justice', age: '18-24', population: 800 },
    { juris: 'Criminal Justice', age: '25-34', population: 1800 },
    { juris: 'Criminal Justice', age: '35-44', population: 2200 },
    { juris: 'Criminal Justice', age: '45-54', population: 900 },
    // More data entries...
  ];
</script>

<div in:fly={{x:300}} out:fly={{x:-400}} class="flexy flex-col fixed top-28 h-fit w-full z-10">
  <div class="w-5/6 h-12 flexy bg-slate-700 text-slate-200 flex rounded-t-lg">
    <p class="font-poppins font-medium py-4 w-3/4 flexy">
      Blurb, if any, for jurisdiction form communications (will probably only be here for large jurisdictions)
    </p>
  </div>
  <div class="w-5/6 h-96 flexy flex-row">
    <StatDisplay header="Total Funds Received" data={donut_data} index={0} preSymbol="$" postSymbol="M"/>
    <StatDisplay header="Services Received" data={donut_data2} index={1} postSymbol=""/>
    <StatDisplay header="Total Participation" data={donut_data3} index={2} />
    <StatDisplay header="Transportation Projects" data={donut_data4} index={3}/>
  </div>
  <div class="w-5/6 h-3/6 bg-hgac-slate text-slate-200 px-6 grid grid-cols-2">
    <div class="transform scale-[70%] -translate-y-20">
    <StackedBarChart data={stackbar_data} yLabel="Historic Funds Received"/>
    </div>
    <div class="transform scale-[70%] -translate-y-20">
    <StackedBarChart data={stackbar_data} yLabel="Historic Services Received"/>
    </div>
  </div>
</div>
