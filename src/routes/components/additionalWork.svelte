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
  metricName: "Pet Waste Stations Installed",
  metricValue: 205
}
</script>



<div class="flex flex-col justify-center items-start overflow-auto w-11/12 px-4 py-8 border-t-4 border-slate-700 ">
  <div class="pl-12 w-full">
    <h1 class="font-extrabold text-2xl">
      Additional Work
    </h1>
    <AdditionalWorkBody
      projectName="Dog Poop Pickup" 
      expanded={false}  
      bodyText="Lorem ipsum odor amet, consectetuer adipiscing elit. Pretium inceptos sagittis nisl primis molestie sociosqu. Vivamus quisque senectus dui morbi efficitur. Condimentum vehicula eros gravida turpis blandit iaculis. Aenean convallis risus sodales sem pellentesque vestibulum.
 Nullam hendrerit morbi dictum eleifend orci ultrices vestibulum felis purus. Tincidunt amet sit inceptos mollis enim fringilla. Tristique cras lorem magna tempor tincidunt urna. Blandit risus quisque ac varius ipsum.
 Nullam hendrerit morbi dictum eleifend orci ultrices vestibulum felis purus. Tincidunt amet sit inceptos mollis enim fringilla. Tristique cras lorem magna tempor tincidunt urna. Blandit risus quisque ac varius ipsum.
 Nullam hendrerit morbi dictum eleifend orci ultrices vestibulum felis purus. Tincidunt amet sit inceptos mollis enim fringilla. Tristique cras lorem magna tempor tincidunt urna. Blandit risus quisque ac varius ipsum.
      "
      location="Waller County"
      dates={["12-31-24", "01-02-25"]} 
      funding={50}
      customMetric={exampleMetric}/>
    <AdditionalWorkBody 
      projectName="Clean Dilapidated Buildings"
      expanded={false}
      bodyText="Lorem ipsum odor amet, consectetuer adipiscing elit. Pretium inceptos sagittis nisl primis molestie sociosqu."
      location="Brazoria County"
      dates={["01-04-25", "01-05-25"]}
    />
    <AdditionalWorkBody
      projectName="Lemonade Stands Inspected"
      expanded={false}
      bodyText="Lorem ipsum odor amet, consectetuer adipiscing elit. Pretium inceptos sagittis nisl primis molestie sociosqu. Vivamus quisque senectus dui morbi efficitur. Condimentum vehicula eros gravida turpis blandit iaculis. Aenean convallis risus sodales sem pellentesque vestibulum. Nullam hendrerit morbi dictum eleifend orci ultrices vestibulum felis purus. Tincidunt amet sit inceptos mollis enim fringilla. Tristique cras lorem magna tempor tincidunt urna. Blandit risus quisqu ac varius ips"
      location="Fort Bend County"
      dates={["01-10-25"]} 
      funding={40}
    />
  </div>
</div>
