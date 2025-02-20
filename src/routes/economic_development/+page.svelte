<script>
	import SunburstChart from "../charts/SunburstChart.svelte";

  const test_data = {
    name: 'economic spending',
    children: [
      {name: 'A', value: 10, children: [{name: "A1", value: 10}, {name: "A2", value: 25}]},
      {name: 'B', value: 20, children: [{name: "B1", value: 10}, {name: "B2", value: 25}]},
      {name: 'C', value: 30, children: [{name: "C1", value: 5}, {name: "C2", value: 15}]},
    ]
  }

</script>

<div class="flex w-screen h-screen items-center justify-center bg-slate-200">
  <SunburstChart width={800} data={test_data}/>
</div>

