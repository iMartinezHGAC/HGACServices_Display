<script lang="ts">
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
	import { makeBar, makeDrilldownPie, makePie } from '$routes/helpers/chartFormatters';
	import type { AdworkType, ProgramType, SchemaMultiType, TableDataResult, CustomEchartType } from '../../../ambient';

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
    return splitTableData(tablesData, '34_gc_tow_and_go')[0].expand

  }
	//$inspect('table data: ', tablesData);

	console.log('test splt',splitSubtables(tablesData, '34_gc_tow_and_go').tng);
  
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
    makeDrilldownPie(
      '34_gc_tow_and_go',
      splitSubtables(tablesData, '34_gc_tow_and_go').tng,
      ['free_tows', 'paid_tows']
    ),

    makeDrilldownPie(
      '34_gc_tow_and_go',
      splitSubtables(tablesData, '34_gc_tow_and_go').tng,
      ['towing_charge', 'towing_charge_free']
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
			'funding_dollars'
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
    project_name: "test",
    project_description: "desc",
    start_date: new Date(),
    end_date: new Date(),
    jurisdiction: ['Harris County'],
    program: 'transportation',
    custom_metrics: {}
  }
  ]
</script>

{#if data.post}
	<CardBody {cardNames} {cardData} direction={routedFromLeft} adwork={tempAdwork} />
{:else}
	<div>Loading...</div>
{/if}
