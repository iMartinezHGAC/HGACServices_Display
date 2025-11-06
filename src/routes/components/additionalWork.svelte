<script lang="ts">
	import StackedBarChart from "$routes/charts/StackedBarChart.svelte";
import AdditionalWorkBody from "../fragments/additionalWorkBody.svelte"

type CustomMetric = {
  metricName: string,
  metricValue: string | number,
}

interface addWorkProps {
  bodyText: string,
  projectName: string
  customMetrics?: CustomMetric[],
  funding?: number,
  start_date?: Date,
  end_date?: Date
}

let {bodyText, projectName="Brazoria County: Dog poop stations", start_date, end_date, customMetrics, funding}: addWorkProps = $props()

//$inspect(start_date, end_date)

const exampleMetric: CustomMetric = {
  metricName: "Attendees",
  metricValue: 19
}

function formatToMMDDYY(input: Date | string): string {
  // Convert string to Date if needed
  const date: Date = typeof input === 'string' ? new Date(input) : input;

  // Validate the date
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    throw new Error('Invalid date');
  }

  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = String(date.getFullYear()).slice(-2);

  return `${month}-${day}-${year}`;
}

const dateRange = $derived.by(()=> {
  if(start_date && end_date)
      return [formatToMMDDYY(start_date), formatToMMDDYY(end_date)]
  else if (start_date && !end_date)
      return [formatToMMDDYY(start_date)]
  else
      return [""]

})

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
      dates={dateRange}
      funding={0}
      customMetrics={[exampleMetric]}/>
  </div>
</div>
