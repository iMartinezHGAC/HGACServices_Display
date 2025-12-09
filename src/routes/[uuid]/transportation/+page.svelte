<script lang="ts">
	interface CustomEchartType {
		parent_table: string;
		echarts_data: echarts.EChartsOption;
	}

	interface CardDataType {
		program: ProgramType;
		echarts: CustomEchartType[];
	}

	import { navigating } from '$app/state';

	const routedFrom = navigating.from?.route.id?.split('/')[2];
	const routedTo = navigating.to?.route.id?.split('/')[2];
	const routedFromLeft = checkRouteDirection(routedFrom, routedTo);

	import CardBody from '$routes/components/card_body.svelte';
	import { checkRouteDirection } from '$routes/helpers/flyAnimationDirection';
	import { makeBar } from '$routes/helpers/chartFormatters';
	import type { TableDataResult } from '../../../ambient';

	let {
		data
	}: {
		data: {
			post: ProgramType;
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
	//$inspect('table data: ', tablesData);

	//console.log(splitTableData(tablesData, '37_clean_vehicles'));
	console.log(splitAndMapTable(tablesData, '37_clean_vehicles', 'emissions_reduction'));

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
		makeBar(
			'37_clean_vehicles',
			splitAndMapTable(tablesData, '37_clean_vehicles', 'emissions_reduction'),
			'from_date',
			'orders_count'
		)
	);
	charts.push(
		makeBar(
			'37_clean_vehicles',
			splitAndMapTable(tablesData, '37_clean_vehicles', 'funding_dollars'),
			'from_date',
			'orders_dollars'
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
</script>

{#if data.post}
	<CardBody {cardNames} {cardData} direction={routedFromLeft} adwork={false} />
{:else}
	<div>Loading...</div>
{/if}
