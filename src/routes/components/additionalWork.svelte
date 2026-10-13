<script lang="ts">
	import type { AdworkType } from '../../ambient';
	import AdditionalWorkBody from '../fragments/additionalWorkBody.svelte';

	type CustomMetric = {
		metricName: string;
		metricValue: string | number;
	};

	interface addWorkProps {
    adwork: AdworkType
	}

	let {
    adwork,
	}: addWorkProps = $props();

	//$inspect(start_date, end_date)

	const exampleMetric: CustomMetric = {
		metricName: 'Attendees',
		metricValue: 19
	};

</script>

<div
	class="flex w-11/12 flex-col items-start justify-center overflow-auto border-t-4 border-slate-700 px-4 py-8 print:w-full print:border-t-2 print:py-3"
>
	<div class="w-full pl-12 print:pl-2">
		<AdditionalWorkBody
			expanded={false}
			{adwork}
		/>
	</div>
</div>
