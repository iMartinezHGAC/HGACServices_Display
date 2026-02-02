<script lang="ts">
	import AdditionalWorkBody from '../fragments/additionalWorkBody.svelte';

	type CustomMetric = {
		metricName: string;
		metricValue: string | number;
	};

	interface addWorkProps {
		bodyText: string;
		projectName: string;
		customMetrics?: CustomMetric[];
		funding?: number;
		start_date?: Date;
		end_date?: Date;
	}

	let {
		bodyText,
		projectName = 'Brazoria County: Dog poop stations',
		start_date,
		end_date,
		customMetrics,
		funding
	}: addWorkProps = $props();

	//$inspect(start_date, end_date)

	const exampleMetric: CustomMetric = {
		metricName: 'Attendees',
		metricValue: 19
	};

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

	const dateRange = $derived.by(() => {
		if (start_date && end_date) return [formatToMMDDYY(start_date), formatToMMDDYY(end_date)];
		else if (start_date && !end_date) return [formatToMMDDYY(start_date)];
		else return [''];
	});
</script>

<div
	class="flex w-11/12 flex-col items-start justify-center overflow-auto border-t-4 border-slate-700 px-4 py-8"
>
	<div class="w-full pl-12">
		<AdditionalWorkBody
			{projectName}
			expanded={false}
			{bodyText}
			dates={dateRange}
			funding={0}
			customMetrics={[exampleMetric]}
		/>
	</div>
</div>
