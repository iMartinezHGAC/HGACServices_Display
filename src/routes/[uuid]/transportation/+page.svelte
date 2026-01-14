<script lang="ts">
	interface CardDataType {
		program: ProgramType;
		echarts: CustomEchartType[];
	}

	import { navigating } from '$app/state';
	const routedFrom = navigating.from?.route.id?.split('/')[2];
	const routedTo = navigating.to?.route.id?.split('/')[2];
	const routedFromLeft = checkRouteDirection(routedFrom, routedTo);

	import type {
		AdworkType,
		ProgramType,
		SchemaMultiType,
		TableDataResult,
		CustomEchartType
	} from '../../../ambient';
	import CardBody from '../../components/card_body.svelte';
	import { makeBar, makeDrilldownPie, makeValueCountPie } from '../../helpers/chartFormatters';
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

	function splitTableData(tablesData: TableDataResult, tableName: string) {
		//console.log('splitTableData data',tablesData[tableName].items)
		return tablesData[tableName].items;
	}

	type PB_Record_Type = {
		collectionId: string;
		collectionName: string;
		id: string;
		[key: string]: string | number | Date;
	};

	function mapTableData(data: PB_Record_Type[], field: string) {
		return data.map((entry: PB_Record_Type) => entry[field]);
	}

	function splitAndMapTable(tableData: TableDataResult, tableName: string, field: string) {
		const table = splitTableData(tableData, tableName);
		return mapTableData(table, field);
	}

	function splitSubtables(tableData: TableDataResult, tableName: string) {
		return splitTableData(tablesData, tableName)[0].expand;
	}
	$inspect('table data: ', tablesData);

	console.log('test splt', splitSubtables(tablesData, '36_transportation_improvement_plan'));

	//console.log('split map table data', splitAndMapTable(tablesData, '37_clean_vehicles', 'emissions_reduction'));

	//$inspect('data', data);
	const charts: CustomEchartType[] = [];
	const exclusions = [
		'collectionId',
		'collectionName',
		'id',
		'jurisdiction',
		'from_date',
		'to_date'
	];

	const keys = $derived(
		data.schema
			.filter((schema: SchemaMultiType) => schema.tableName === '34_gc_tow_and_go')
			.map((schema: SchemaMultiType) => schema.schema)
			.at(0)
			.map((schema: SchemaType) => schema.Name)
	);

	$inspect('keys: ', keys);

	//programNames.forEach((programName) => {
	charts.push(
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

  makeValueCountPie(
			'35_rtp',
			splitSubtables(tablesData, '35_rtp').rtp_projects,
    'project_type',                      // The key to count unique values for
    'RTP Project Types'          // Optional custom title
  ),  
  makeValueCountPie(
			'35_rtp',
			splitSubtables(tablesData, '35_rtp').yr10_projects,
    'project_type',                      // The key to count unique values for
			'Yr 10 Projects'
  ),  
  makeValueCountPie(
			'36_transportation_improvement_plan',
			splitSubtables(tablesData, '36_transportation_improvement_plan').tip,
    'project_type',                      // The key to count unique values for
			'TIP Project Type'
		),
  makeValueCountPie(
			'36_transportation_improvement_plan',
			splitSubtables(tablesData, '36_transportation_improvement_plan').let,
    'project_type',                      // The key to count unique values for
			'LET Project Type'
		),
		makeBar(
			'37_clean_vehicles',
			splitTableData(tablesData, '37_clean_vehicles'),
			'from_date',
			'emissions_reduction'
		)
	);
	charts.push(
		makeBar(
			'37_clean_vehicles',
			splitTableData(tablesData, '37_clean_vehicles'),
			'from_date',
			'vehicles_monitored'
		)
	);
	//});

	const cardData: CardDataType[] = $derived(
		programs.map((program: ProgramType) => {
			const eCharts = charts.filter((chart) => chart.parent_table == program.parent_table);
			const data: CardDataType = { program: program, echarts: eCharts };
			return data;
		})
	);

	$inspect('card data', cardData);

	const tempAdwork: AdworkType[] = [
		{
			budget: 0,
			project_name: 'test',
			project_description: 'desc',
			start_date: new Date(),
			end_date: new Date(),
			jurisdiction: ['Harris County'],
			program: 'transportation',
			custom_metrics: {}
		}
	];
</script>

{#if data.post}
	<CardBody {cardNames} {cardData} direction={routedFromLeft} adwork={tempAdwork} />
{:else}
	<div>Loading...</div>
{/if}
