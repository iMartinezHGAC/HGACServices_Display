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

	$inspect('table data: ', tablesData);

	console.log('test splt', splitSubtables(tablesData, '36_transportation_improvement_plan'));

	//console.log('split map table data', splitAndMapTable(tablesData, '37_clean_vehicles', 'emissions_reduction'));

	//$inspect('data', data);
	const charts: ChartType[] = [];
	const exclusions = [
		'collectionId',
		'collectionName',
		'id',
		'jurisdiction',
		'from_date',
		'to_date'
	];

	charts.push(
		makeDrilldownPie(
      '34_gc_tow_and_go', splitSubtables(tablesData, '34_gc_tow_and_go').tng, [
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
			'Other Tow and Go Services Provided'
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
				'mechanical',
				'medical_fire',
				'towing_services',
				'traffic_control'
			],
			'Motorist Assistance Program (MAP) Services'
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
		makeDrilldownPie(
			'36_transportation_improvement_plan',
			splitSubtables(tablesData, '36_transportation_improvement_plan').tip,
			[
        'project_type',                      // The key to count unique values for
        'project_category',
        'project_subcategory',
        'project_subcategory2'
			],
			'TIP Projects'
		),
		makeDrilldownPie(
			'36_transportation_improvement_plan',
			splitSubtables(tablesData, '36_transportation_improvement_plan').let,
			[
        'project_type',                      // The key to count unique values for
        'project_category',
        'project_subcategory',
        'project_subcategory2'
			],
			'LET Projects'
		),
		makeBar(
			'37_clean_vehicles',
			splitTableData(tablesData, '37_clean_vehicles'),
			'from_date',
			'emissions_reduction'
		),
    {
      parent_table: "36_transportation_improvement_plan",
      table: splitSubtables(tablesData, '36_transportation_improvement_plan').tip as PB_Record_Type
    },
	);

data.tableNames.forEach((tableName: string) => {
  const filtered = data.eventsData.filter((field: any) => field.program === tableName);
  
  if (filtered.length > 0) {
    charts.push({
      parent_table: tableName,
      table: filtered as EventType[]
    });
  }
});
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
