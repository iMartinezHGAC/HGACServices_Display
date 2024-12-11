<script lang="ts">
	import BarChart from "../charts/BarChart.svelte";
	import FilledAreaChart from "../charts/FilledAreaChart.svelte";
	import LinePlot from "../charts/LinePlot.svelte";
	import StackedBarChart from "../charts/StackedBarChart.svelte";
	import AdditionalWork from "../components/additionalWork.svelte";
	import Card from "../components/card.svelte";
	import CardLc from "../components/card_lc.svelte";
	import CardRc from "../components/card_rc.svelte";
	import CardSw from "../components/card_sw.svelte";
	import StatDisplay from "../components/statDisplay.svelte";

</script>
<div class="fixed top-28 flex flex-col items-center justify-start w-screen h-screen h-max-screen overflow-auto pt-[0%] pb-[6%] z-10">
  <div class="flexy flex-col">
    <div class="flexy">
    <Card 
      projectName={"Trash Bash"} 
      projectBlurb={"Lorem ipso facto"} 
      chart1={StackedBarChart} 
      chartTitle1={"Trash & Recycyling tonnage"}
      chart2={BarChart}
      chartTitle2={"Tire Count"}
      chart3={BarChart}
      chartTitle3={"Count"}
      chart4={BarChart}
      chartTitle4={"Total Miles"}
      chart5={BarChart}
      chartTitle5={"Cleanup Sites"}
    />   
    <AdditionalWork bodyText={"Lorem ipsum dolor sit amet, consectetur adipisicing elit. Facere, sunt inventore? Voluptas eos minima ipsum distinctio animi, odit praesentium perspiciatis corrupti iure nostrum! Sunt odit autem sapiente consequatur unde dignissimos?"}/>
  </div>
    <div class="flexy">
    <CardLc 
      projectName={"Livable Centers"} 
      projectBlurb={"Lorem ipso facto"} 
      chart1={BarChart} 
      chartTitle1={"Projects Count"}
      chart2={LinePlot}
      chartTitle2={"Funding Dollars"}
      chart3={FilledAreaChart}
      chartTitle3={"Studies Adopted"}
      chart4={FilledAreaChart}
      chartTitle4={"Recommendations Implemented"}
      chart5={FilledAreaChart}
      chartTitle5={"Legacy Studies"}
      chart6={FilledAreaChart}
      chartTitle6={"Maturing Studies"}
      chart7={BarChart}
      chartTitle7={"New Studies"}
      chart8={BarChart}
      chartTitle8={"VMT Reduction"}
    />   
    <AdditionalWork bodyText={"Lorem ipsum dolor sit amet, consectetur adipisicing elit. Facere, sunt inventore? Voluptas eos minima ipsum distinctio animi, odit praesentium perspiciatis corrupti iure nostrum! Sunt odit autem sapiente consequatur unde dignissimos?"}/>
  </div>
  <!-- rc -->
    <div class="flexy">
    <CardRc 
      projectName={"Regional Conservation"} 
      projectBlurb={"Lorem ipso facto"} 
      chart1={BarChart} 
      chartTitle1={"Project Count"}
      chart2={BarChart}
      chartTitle2={"Assistance Given"}
      chart3={BarChart}
      chartTitle3={"# Meetings"}
      chart4={BarChart}
      chartTitle4={"Meeting Hours"}
      chart5={LinePlot}
      chartTitle5={"Funding Dollars"}
      chart6={FilledAreaChart}
      chartTitle6={"Data Request Hours"}
      chart7={LinePlot}
      chartTitle7={"Funding Dollars lev"}
    />    
    <AdditionalWork bodyText={"Lorem ipsum dolor sit amet, consectetur adipisicing elit. Facere, sunt inventore? Voluptas eos minima ipsum distinctio animi, odit praesentium perspiciatis corrupti iure nostrum! Sunt odit autem sapiente consequatur unde dignissimos?"}/>
  </div>
  <!-- sw -->
  <div class="flexy">
    <CardSw
      projectName={"Solid Waste"} 
      projectBlurb={"Lorem ipso facto"} 
      chart1={BarChart} 
      chartTitle1={"# Attendees"}
      chart2={BarChart}
      chartTitle2={"Assistance Given"}
      chart3={LinePlot}
      chartTitle3={"Dollars"}
    />
    <AdditionalWork bodyText={"Lorem ipsum dolor sit amet, consectetur adipisicing elit. Facere, sunt inventore? Voluptas eos minima ipsum distinctio animi, odit praesentium perspiciatis corrupti iure nostrum! Sunt odit autem sapiente consequatur unde dignissimos?"}/>
  </div>

  </div>
</div>

