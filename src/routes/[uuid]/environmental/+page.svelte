<script lang="ts">

	import { navigating } from '$app/state';
	const routedFrom = navigating.from?.route.id?.split('/')[2];
	const routedTo = navigating.to?.route.id?.split('/')[2];
	const routedFromLeft = checkRouteDirection(routedFrom, routedTo);

	import type {
		AdworkType,
		ProgramType,
		SchemaMultiType,
		ChartType,
		CardDataType,
		EventType,

		PB_Record_Type

	} from '../../../ambient';

	import CardBody from '../../components/card_body.svelte';
	import { accumulateMappedField, accumulateMappedFieldSubtable, makeBar, makeDrilldownDonut, makeDrilldownPie, makeValueCountPie, mapSelectedSubtable, safeSelectObjectField, selectSplitSubtable, splitAndMapTable, splitExpandedMapTable, splitSubtables, splitTableData } from '../../helpers/chartFormatters';
	import { checkRouteDirection } from '../../helpers/flyAnimationDirection';

	let {
		data
	}: {
		data: {
			post: ProgramType[];
			tableNames: string[];
			tablesData: object;
			schema: SchemaMultiType[];
      projectDetails: AdworkType[];
      eventsData: EventType[];
		};
	} = $props();

	const programs: ProgramType[] = data.post;
	const tablesData = data.tablesData;
	const cardNames = $derived(programs.map((program) => program.program_name));

	//$inspect('table data: ', tablesData);
	//console.log('test splt',  splitSubtables(tablesData, '03_wqmp') ?? "empty");
	// console.log('test safe',  splitTableData(tablesData, '03_wqmp'));
	// console.log('test table',  safeSelectObjectField(splitTableData(tablesData, '03_wqmp'), "ossf"));
	//console.log('split table data', 
//accumulateMappedFieldSubtable(tablesData, '02_water_quality_monitoring', 'clean_rivers_program', 'monitoring_event_cost')
//)
  
	$inspect('data', data);
	const exclusions = [
		'collectionId',
		'collectionName',
		'id',
		'jurisdiction',
		'from_date',
		'to_date'
	];
	const charts: ChartType[] = [];

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
      indicator: {
        indicatorName: "Grants",
        indicatorVal: accumulateMappedField(tablesData, '01_solid_waste', 'grants'),
      },
      chartType: "indicator"
    },    
    {
      parent_table: "01_solid_waste",
      indicator: {
        indicatorName: "Grant Funding",
        indicatorVal: accumulateMappedField(tablesData, '01_solid_waste', 'grant_dollars'),
      },
      chartType: "indicator"
    },  
    {
      parent_table: "01_solid_waste",
      table: selectSplitSubtable(tablesData, '01_solid_waste', 'workshop') as PB_Record_Type
    },
    {
      parent_table: "02_water_quality_monitoring",
      indicator: {
        indicatorName: "Monitoring Sites",
        indicatorVal: accumulateMappedFieldSubtable(tablesData, '02_water_quality_monitoring', 'clean_rivers_program', 'monitoring_sites') ?? 0,
      },
      chartType: "indicator"
    },
    {
      parent_table: "02_water_quality_monitoring",
      indicator: {
        indicatorName: "Monitoring Events",
        indicatorVal: accumulateMappedFieldSubtable(tablesData, '02_water_quality_monitoring', 'clean_rivers_program', 'monitoring_events') ?? 0,
      },
      chartType: "indicator"
    },
		makeDrilldownDonut(
			'02_water_quality_monitoring',
      selectSplitSubtable(tablesData, '02_water_quality_monitoring', 'clean_rivers_program'),
			[
				'monitoring_event_cost_hgac',
				'monitoring_event_cost_inkind',
			],
			'Motorist Assistance Program Services',
      accumulateMappedFieldSubtable(tablesData, '02_water_quality_monitoring', 'clean_rivers_program', 'monitoring_event_cost')?.toString() ?? ''
		),
    {
      parent_table: "03_wqmp",
      indicator: {
        indicatorName: "Monitoring Events",
        indicatorVal: safeSelectObjectField(splitTableData(tablesData, '03_wqmp'), "ossf") ?? 0,
      },
      chartType: "indicator"
    },
    {
      parent_table: "03_wqmp",
      indicator: {
        indicatorName: "Monitoring Events",
        indicatorVal: safeSelectObjectField(splitTableData(tablesData, '03_wqmp'), "ossf"),
      },
      chartType: "indicator"
    },
    {
      parent_table: "03_wqmp",
      indicator: {
        indicatorName: "Completed Septic Projects",
        indicatorVal: safeSelectObjectField(splitTableData(tablesData, '03_wqmp'), "septic"),
      },
      chartType: "indicator"
    },
    {
      parent_table: "03_wqmp",
      indicator: {
        indicatorName: "Completed Septic Project Costs",
        indicatorVal: safeSelectObjectField(splitTableData(tablesData, '03_wqmp'), "septic"),
      },
      chartType: "indicator"
    },
    {
      parent_table: "05_trash_bash",
      indicator: {
        indicatorName: "Trash Pounds",
        indicatorVal: accumulateMappedField(tablesData, '05_trash_bash', 'trash_pounds'),
      },
      chartType: "indicator"
    },
    {
      parent_table: "05_trash_bash",
      indicator: {
        indicatorName: "Tires Removed",
        indicatorVal: accumulateMappedField(tablesData, '05_trash_bash', 'tires'),
      },
      chartType: "indicator"
    },
    {
      parent_table: "05_trash_bash",
      indicator: {
        indicatorName: "Recycled Pounds",
        indicatorVal: accumulateMappedField(tablesData, '05_trash_bash', 'recycled_pounds'),
      },
      chartType: "indicator"
    },
		makeDrilldownDonut(
			'05_trash_bash',
      splitTableData(tablesData, '05_trash_bash'),
			[
				'vol_under_18',
				'vol_scouts',
			],
			'Motorist Assistance Program Services',
      accumulateMappedField(tablesData, '05_trash_bash', 'tot_volunteer_count').toString() ?? ""
		),
    {
      parent_table: "10_parks_and_natural_areas",
      table: selectSplitSubtable(tablesData, '10_parks_and_natural_areas','awards') as PB_Record_Type
    },
    {
      parent_table: "10_parks_and_natural_areas",
      table: selectSplitSubtable(tablesData, '10_parks_and_natural_areas', 'trips') as PB_Record_Type
    },
    {
      parent_table: "13_water_innovation",
      table: splitTableData(tablesData, '13_water_innovation') as PB_Record_Type
    },
	)

data.tableNames.forEach((tableName: string) => {
  const filtered = data.eventsData.filter((field: any) => field.program === tableName);
  
  if (filtered.length > 0) {
    charts.push({
      parent_table: tableName,
      table: filtered as EventType[]
    });
  }
});


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
