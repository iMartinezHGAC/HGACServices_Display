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
	import Table from '../../components/table.svelte';
	import { accumulateMappedField, makeBar, makeDrilldownPie, makeValueCountPie, mapSelectedSubtable, safeSelectObjectField, selectSplitSubtable, splitAndMapTable, splitExpandedMapTable, splitSubtables, splitTableData } from '../../helpers/chartFormatters';
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

	type PB_Record_Type = {
		collectionId: string;
		collectionName: string;
		id: string;
		[key: string]: string | number | Date;
  };

	$inspect('table data: ', tablesData);

	//console.log('test splt',  splitSubtables(tablesData, '03_wqmp') ?? "empty");


	// console.log('test safe',  splitTableData(tablesData, '03_wqmp'));
	// console.log('test table',  safeSelectObjectField(splitTableData(tablesData, '03_wqmp'), "ossf"));
	console.log('split table data', splitSubtables(tablesData, '10_parks_and_natural_areas'))
  
	$inspect('data', data);
	const charts: CustomEchartType[] = [];
	const exclusions = [
		'collectionId',
		'collectionName',
		'id',
		'jurisdiction',
		'from_date',
		'to_date'
	];

	charts.push(
    /*
		makeDrilldownPie('10_parks_and_natural_areas', 
      splitSubtables(tablesData, '10_parks_and_natural_areas').tng, [
			'free_tows',
			'paid_tows'
		]),
    */

    {
      parent_table: "01_solid_waste",
      indicatorName: "Grants",
      indicatorVal: accumulateMappedField(tablesData, '01_solid_waste', 'grants'),
      chartType: "indicator"
    },    
    {
      parent_table: "02_water_quality_monitoring",
      indicatorName: "Monitoring Sites",
      indicatorVal: selectSplitSubtable(tablesData, '02_water_quality_monitoring', 'clean_rivers_program').monitoring_sites,
      chartType: "indicator"
    },
    {
      parent_table: "02_water_quality_monitoring",
      indicatorName: "Monitoring Events",
      indicatorVal: splitSubtables(tablesData, '02_water_quality_monitoring').clean_rivers_program.monitoring_events,
      chartType: "indicator"
    },
    {
      parent_table: "03_wqmp",
      indicatorName: "Monitoring Events",
      indicatorVal: safeSelectObjectField(splitTableData(tablesData, '03_wqmp'), "ossf"),
      chartType: "indicator"
    },
    {
      parent_table: "03_wqmp",
      indicatorName: "Monitoring Events",
      indicatorVal: safeSelectObjectField(splitTableData(tablesData, '03_wqmp'), "ossf"),
      chartType: "indicator"
    },
    {
      parent_table: "03_wqmp",
      indicatorName: "Completed Septic Projects",
      indicatorVal: safeSelectObjectField(splitTableData(tablesData, '03_wqmp'), "septic"),
      chartType: "indicator"
    },
    {
      parent_table: "03_wqmp",
      indicatorName: "Completed Septic Project Costs",
      indicatorVal: safeSelectObjectField(splitTableData(tablesData, '03_wqmp'), "septic"),
      chartType: "indicator"
    },
    {
      parent_table: "05_trash_bash",
      indicatorName: "Trash Pounds",
      indicatorVal: accumulateMappedField(tablesData, '05_trash_bash', 'trash_pounds'),
      chartType: "indicator"
    },
    {
      parent_table: "05_trash_bash",
      indicatorName: "Tires Removed",
      indicatorVal: accumulateMappedField(tablesData, '05_trash_bash', 'tires'),
      chartType: "indicator"
    },
    {
      parent_table: "05_trash_bash",
      indicatorName: "Recycled Pounds",
      indicatorVal: accumulateMappedField(tablesData, '05_trash_bash', 'recycled_pounds'),
      chartType: "indicator"
    },

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

<Table data={splitSubtables(tablesData, '10_parks_and_natural_areas').awards as PB_Record_Type}/>

{#if data.post}
	<CardBody {cardNames} {cardData} direction={routedFromLeft} adwork={data.projectDetails} />
{:else}
	<div>Loading...</div>
{/if}
