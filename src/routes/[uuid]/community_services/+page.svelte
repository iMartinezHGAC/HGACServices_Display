<script lang="ts">
	interface CustomEchartType {
		parent_table: string;
		echarts_data: echarts.EChartsOption;
		chartType?: string;
		indicatorVal?: string | number;
		indicatorName?: string;
	}

	interface CardDataType {
		program: ProgramType;
		echarts: CustomEchartType[];
	}

	import type { PageData } from './$types';
	import { page } from '$app/stores';
	import { navigating } from '$app/state';
	import type { AdworkType } from '../../ambient';

	const routedFrom = navigating.from?.route.id?.split('/')[2];
	const routedTo = navigating.to?.route.id?.split('/')[2];
	const routedFromLeft = checkRouteDirection(routedFrom, routedTo);

	import CardBody from '$routes/components/card_body.svelte';
	import { checkRouteDirection } from '$routes/helpers/flyAnimationDirection';
	import { makeBar, makePie } from '$routes/helpers/chartFormatters';

	let { data }: { data: PageData } = $props();

	const programs: ProgramType[] = data.post;
	const tablesData = data.tablesData;
  $inspect('tablesData', tablesData)
	let charts = $state<CustomEchartType[]>([]);
	//$inspect('data',tablesData['14_livable_centers']['items'].map(item=>item.expand.studies).filter(item => item !== undefined))
	let projectDetails = data.projectDetails as AdworkType[];
	//$inspect('project details', data.projectDetails)
	const cardNames = $derived(programs.map((program) => program.program_name));
	const programNames = $derived(
		programs.map((program) => program.parent_table).filter((str) => str !== '')
	);

	const exclusions = [
		'collectionId',
		'collectionName',
		'id',
		'jurisdiction',
		'from_date',
		'to_date'
	];

	const assistance = tablesData['14_livable_centers']['items']
		.map((item) => item.expand.assistance)
		.filter((item) => item !== undefined);
	const studies = tablesData['14_livable_centers']['items']
		.map((item) => item.expand.studies)
		.filter((item) => item !== undefined);

	charts.push(makePie('14_livable_centers', assistance, 'task_request_type'));
	charts.push(makePie('14_livable_centers', studies, 'study_progress'));

	charts.push({
		parent_table: '12_fall_planning_workshop',
		echarts_data: {},
		chartType: 'indicator',
		//@ts-ignore
		indicatorVal: 25,
		indicatorName: 'Attendees'
	});
	charts.push({
		parent_table: '09_bb_main_street',
		echarts_data: {},
		chartType: 'indicator',
		//@ts-ignore
		indicatorVal: 17,
		indicatorName: 'Meeting Count'
	});
	charts.push({
		parent_table: '09_bb_main_street',
		echarts_data: {},
		chartType: 'indicator',
		//@ts-ignore
		indicatorVal: 8,
		indicatorName: 'Meeting Hours'
	});

	const cardData: CardDataType[] = $derived(
		programs.map((program: ProgramType) => {
			const eCharts = charts.filter((chart) => chart.parent_table == program.parent_table);
			const data: CardDataType = { program: program, echarts: eCharts };
			return data;
		})
	);
</script>

{#if data.post}
	<CardBody {cardNames} {cardData} direction={routedFromLeft} adwork={projectDetails} />
{:else}
	<div>Loading...</div>
{/if}
