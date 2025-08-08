<script lang="ts">
import AdditionalWorkBody from "../fragments/additionalWorkBody.svelte"

type CustomMetric = {
  metricName: string,
  metricValue: string | number,
}

interface addWorkProps {
  bodyText: string,
  projectName: string
  projectTimeframe?: string,
  customMetrics?: CustomMetric[],
  funding?: number,
}

let {bodyText, projectName="Brazoria County: Dog poop stations", projectTimeframe, customMetrics, funding}: addWorkProps = $props()


const exampleMetric: CustomMetric = {
  metricName: "Attendees",
  metricValue: 19
}

</script>



<div class="flex flex-col justify-center items-start overflow-auto w-11/12 px-4 py-8 border-t-4 border-slate-700 ">
  <div class="pl-12 w-full">
    <h1 class="font-extrabold text-2xl">
      Additional Work
    </h1>
    <AdditionalWorkBody
      projectName={projectName}
      expanded={false}  
      bodyText={bodyText}
      location="Harris County"
      dates={["12-06-24"]} 
      funding={0}
      customMetrics={[exampleMetric]}/>
  </div>
</div>
