<script lang="ts">

	import { navigating } from '$app/state';
	const routedFrom = navigating.from?.route.id?.split('/')[2];
	const routedTo = navigating.to?.route.id?.split('/')[2];
	const routedFromLeft = checkRouteDirection(routedFrom, routedTo);

	import type {
		AdworkType,
		ProgramType,
		SchemaMultiType,
		TableDataResult,
		CustomEchartType,

		ChartType,

		CardDataType


	} from '../../../ambient';
	import CardBody from '../../components/card_body.svelte';
	import { makeBar, makeDrilldownPie, makeValueCountPie, selectSplitSubtable, splitSubtables } from '../../helpers/chartFormatters';
	import { checkRouteDirection } from '../../helpers/flyAnimationDirection';

	let {
		data
	}: {
		data: {
			post: ProgramType[];
			tableNames: string[];
			tablesData: object;
			schema: SchemaMultiType[];
		};
	} = $props();

	const programs: ProgramType[] = data.post;
	const tablesData = data.tablesData;
	const cardNames = $derived(programs.map((program) => program.program_name));
	const programNames = $derived(
		programs.map((program) => program.parent_table).filter((str) => str !== '')
	);
	//console.log("Name: ", programNames)
	$inspect('table data: ', tablesData);

	//console.log('test splt', splitSubtables(tablesData, '14_livable_centers'));

	//console.log('split map table data', splitAndMapTable(tablesData, '37_clean_vehicles', 'emissions_reduction'));

	$inspect('data', data);
	const charts: ChartType[] = [];
	const exclusions = [
		'collectionId',
		'collectionName',
		'id',
		'jurisdiction',
		'from_date',
		'to_date'
	];

   /* 
	const keys = $derived(
		data.schema
			.filter((schema: SchemaMultiType) => schema.tableName === '34_gc_tow_and_go')
			.map((schema: SchemaMultiType) => schema.schema)
			.at(0)
			.map((schema: SchemaType) => schema.Name)
	);

	$inspect('keys: ', keys);
  */

	//programNames.forEach((programName) => {

	charts.push(

  /**
		makeDrilldownPie('34_gc_tow_and_go', splitSubtables(tablesData, '34_gc_tow_and_go').tng, [
			'free_tows',
			'paid_tows'
		]),
		makeDrilldownPie('34_gc_tow_and_go', splitSubtables(tablesData, '34_gc_tow_and_go').tng, [
			'towing_charge',
			'towing_charge_free'
		]),
		makeDrilldownPie(
			'34_gc_tow_and_go',
			splitSubtables(tablesData, '34_gc_tow_and_go').tng,
			[
				'abandoned_vehicles',
				'law_enforcement_special_cases',
				'mechanical',
				'medical_fire',
				'other'
			],
			'Other Services'
		),
		makeDrilldownPie(
			'34_gc_tow_and_go',
			splitSubtables(tablesData, '34_gc_tow_and_go').map,
			[
				'abandoned_vehicles',
				'debris',
				'gone_on_arrival',
				'information_assistance',
				'law_enforcement',
				'mechanicol',
				'medical_fire',
				'towing_services',
				'traffic_control'
			],
			'Motorist Assistance Program Services'
		),

		makeDrilldownPie(
			'35_rtp',
			splitSubtables(tablesData, '35_rtp').rtp_projects,
			['fiscal_year', 'funding'],
			'R.T.P. Projects'
		),
		makeDrilldownPie(
			'35_rtp',
			splitSubtables(tablesData, '35_rtp').yr10_projects,
			['fiscal_year', 'funding'],
			'Yr 10 Projects'
		),
		makeDrilldownPie(
			'36_transportation_improvement_plan',
			splitSubtables(tablesData, '36_transportation_improvement_plan').tip,
			['fiscal_year', 'funding'],
			'TIP'
		),
		makeDrilldownPie(
			'36_transportation_improvement_plan',
			splitSubtables(tablesData, '36_transportation_improvement_plan').let,
			['fiscal_year', 'funding'],
			'LET'
		),
		makeBar(
			'37_clean_vehicles',
			splitTableData(tablesData, '37_clean_vehicles'),
			'from_date',
			'emissions_reduction'
		)
	);
  makeValueCountPie(
    '14_livable_centers',  // Parent table name (from your data example)
			splitSubtables(tablesData, '14_livable_centers').studies,
    'status',                      // The key to count unique values for
    'Status'          // Optional custom title
  ),  
    makeValueCountPie(
    '14_livable_centers',  // Parent table name (from your data example)
			splitSubtables(tablesData, '14_livable_centers').studies,
    'study_progress',                      // The key to count unique values for
    'Study Progress'          // Optional custom title
  ),

   */

    makeValueCountPie(
    '26_aging_nutrition_transport',  // Parent table name (from your data example)
			selectSplitSubtable(tablesData, '26_aging_nutrition_transport', 'congregate'),
    'persons',                      // The key to count unique values for
    'Elderly Fed'          // Optional custom title
  ),

	)


	$inspect('charts data', charts);
	const cardData: CardDataType[] = $derived(
		programs.map((program: ProgramType) => {
			const eCharts = charts.filter((chart) => chart.parent_table == program.parent_table);
			const data: CardDataType = { program: program, echarts: eCharts };
			return data;
		})
	);

	$inspect('card data', cardData);

</script>

{#if data.post}
	<CardBody {cardNames} {cardData} direction={routedFromLeft} adwork={data.projectDetails} />
{:else}
	<div>Loading...</div>
{/if}
