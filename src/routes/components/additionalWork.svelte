<script lang="ts">

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

function convertDateString(dateString: string): string | null {
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June', 
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    // Split the input string into parts
    const [month, day, year] = dateString.split('-');
    
    // Parse the parts and validate
    const monthNumber = parseInt(month, 10);
    const dayNumber = parseInt(day, 10);
    const yearNumber = parseInt(year, 10);

    if (
        monthNumber >= 1 && monthNumber <= 12 &&
        dayNumber >= 1 && dayNumber <= 31
    ) {
        const monthName = months[monthNumber - 1];
        const fullYear = yearNumber < 100 ? 2000 + yearNumber : yearNumber;
        return `${monthName} ${dayNumber}, ${fullYear}`;
    } else {
        return null; // Invalid date
    }
}

const exampleMetric: CustomMetric = {
  metricName: "Pet Waste Stations Installed",
  metricValue: 205
}
</script>

{#snippet subWork(projectName: string, bodyText: string, location: string, dates: string[], funding?: number, customMetric?: CustomMetric)}
  <div class="flex flex-col items-start justify-center border-b-2 border-slate-700 py-4">
      <p class="flex font-semibold text-xl">
        {projectName}
      </p>
    <div class="flex items-center justify-start w-full ">
      <p class="font-medium text-xl font-[Metropolis]">
        {location}
      </p>
      {#if funding}
        <p class="flex pl-8 font-medium text-xl font-[Metropolis]">
          Funding: ${funding}
        </p>
      {/if}
      <span class="flex-grow"></span>
      {#if dates.length > 1}
        <p class=" font-medium text-xl">
          {convertDateString(dates[0]) as string} - {convertDateString(dates[1]) as string}
        </p>
      {:else}
        <p class=" font-medium text-xl">
          {convertDateString(dates[0]) as string} 
        </p>
      {/if}

    </div>
    {#if customMetric}
      <p class="font-medium text-xl">
        {customMetric.metricName}: {customMetric.metricValue}
      </p>
    {/if}
    <p class="w-full font-[Metropolis]">
      {bodyText}
    </p>

</div>
{/snippet}

<div class="flex flex-col justify-center items-start overflow-auto w-11/12 px-4 py-8 border-t-4 border-slate-700 ">
  <div class="pl-12 w-full">
    <h1 class="font-extrabold text-2xl">
      Additional Work
    </h1>

    {@render subWork("Dog Poop Pickup", "Lorem ipsum odor amet, consectetuer adipiscing elit. Pretium inceptos sagittis nisl primis molestie sociosqu. Vivamus quisque senectus dui morbi efficitur. Condimentum vehicula eros gravida turpis blandit iaculis. Aenean convallis risus sodales sem pellentesque vestibulum. Nullam hendrerit morbi dictum eleifend orci ultrices vestibulum felis purus. Tincidunt amet sit inceptos mollis enim fringilla. Tristique cras lorem magna tempor tincidunt urna. Blandit risus quisque ac varius ipsum.", "Waller County", ["12-31-24", "01-02-25"], 50, exampleMetric)}
    {@render subWork("Clean Dilapidated Buildings", "Lorem ipsum odor amet, consectetuer adipiscing elit. Pretium inceptos sagittis nisl primis molestie sociosqu. Vivamus quisque senectus dui morbi efficitur. Condimentum vehicula eros gravida turpis blandit iaculis. Aenean convallis risus sodales sem pellentesque vestibulum. Nullam hendrerit morbi dictum eleifend orci ultrices vestibulum felis purus. Tincidunt amet sit inceptos mollis enim fringilla. Tristique cras lorem magna tempor tincidunt urna. Blandit risus quisque ac varius ipsum.", "Brazoria County", ["01-04-25", "01-05-25"])}
    {@render subWork("Lemonade Stands Inspected", "Lorem ipsum odor amet, consectetuer adipiscing elit. Pretium inceptos sagittis nisl primis molestie sociosqu. Vivamus quisque senectus dui morbi efficitur. Condimentum vehicula eros gravida turpis blandit iaculis. Aenean convallis risus sodales sem pellentesque vestibulum. Nullam hendrerit morbi dictum eleifend orci ultrices vestibulum felis purus. Tincidunt amet sit inceptos mollis enim fringilla. Tristique cras lorem magna tempor tincidunt urna. Blandit risus quisque ac varius ipsum.", "Fort Bend County", ["01-10-25"], 40)}
  </div>
</div>
