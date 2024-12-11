<script lang="ts">
	import BarChart from "../charts/BarChart.svelte";
	import StackedBarChart from "../charts/StackedBarChart.svelte";
	import Card from "../components/card.svelte";

</script>

<div class="fixed top-28 flex flex-col items-center justify-start w-screen h-screen h-max-screen overflow-auto pt-[0%] pb-[0%] z-10">
  <Card projectName={"Trash Bash"} projectBlurb={"Lorem ipso facto"} chart1={StackedBarChart} chart2={BarChart}/>
</div>

