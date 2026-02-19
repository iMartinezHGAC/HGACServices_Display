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
	import { accumulateMappedField, accumulateMappedFieldSubtable, buildTableData, combineRelatedRecords, makeBar, makeDrilldownDonut, makeDrilldownPie, makeHierarchicalCategoryDonut, makeValueCountPie, mapSelectedSubtable, safeSelectObjectField, selectSplitSubtable, splitAndMapTable, splitExpandedMapTable, splitSubtables, splitTableData } from '../../helpers/chartFormatters';
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

	console.log('test splt', splitTableData(tablesData, '37_clean_vehicles'));

const rtpProcessed = combineRelatedRecords(
  tablesData,
  '35_rtp',
  ['rtp_projects', 'yr10_projects'],
  ['fiscal_year', 'project_name', 'project_description','funding', 'project_type','project_category', 'project_subcategory', 'project_subcategory2',   ] // optional – omit for auto columns
);

  //console.log('rtp processed', rtpProcessed)


  const tipProcessed = combineRelatedRecords(
    tablesData,
    '36_transportation_improvement_plan',
    ['tip_projects'],                 // only one source
    ['project_name', 'project_description', 'funding'] // optional
  );
  const tpsProcessed  = buildTableData(tablesData['38_transportation_planning_studies'], false,['study_name', 'study_description', 'study_type', 'schedule', 'estimated_cost', 'study_url']);

  //console.log('tps', tpsProcessed)

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
      '34_gc_tow_and_go', selectSplitSubtable(tablesData, '34_gc_tow_and_go', 'tng'), [
			'free_tows',
			'paid_tows'
		]),
		makeDrilldownPie('34_gc_tow_and_go', selectSplitSubtable(tablesData, '34_gc_tow_and_go', 'tng'), [
			'towing_charge',
			'towing_charge_free'
		]),
		makeDrilldownPie(
			'34_gc_tow_and_go',
			selectSplitSubtable(tablesData, '34_gc_tow_and_go', 'tng'),
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
  'project_type',           // primary
  'project_subcategory',    // secondary → drilldown
  'Regional Transportation Projects: # of Projects Grouped by Type'
),

makeValueCountPie(
  '35_rtp',
  splitSubtables(tablesData, '35_rtp').yr10_projects,
  'project_type',
  'project_subcategory',
  '10 Year RTP Projects: # of Projects Grouped by Type'
),

// Same pattern for TIP and LET
makeValueCountPie(
  '36_transportation_improvement_plan',
  selectSplitSubtable(tablesData, '36_transportation_improvement_plan', 'tip') || [],
  'project_type',
  'project_subcategory',
  'TIP Projects: # of Projects grouped by Type'
),

makeValueCountPie(
  '36_transportation_improvement_plan',
  selectSplitSubtable(tablesData, '36_transportation_improvement_plan', 'let') || [],
  'project_type',
  'project_subcategory',
  'LET Projects: # of Projects grouped by Type'
),


    {
      parent_table: "35_rtp",
      table: rtpProcessed?.data ?? null,
      columns: rtpProcessed?.columns,
      fullWidth: true
    },
    {
      parent_table: "36_transportation_improvement_plan",
      table: splitSubtables(tablesData, '36_transportation_improvement_plan').tip as PB_Record_Type,
      fullWidth: true
    },
		makeBar(
			'37_clean_vehicles',
			splitTableData(tablesData, '37_clean_vehicles'),
			'from_date',
			'emissions_reduction'
		),	
    makeBar(
			'37_clean_vehicles',
			splitTableData(tablesData, '37_clean_vehicles'),
			'from_date',
			'vehicles_monitored'
		),
makeValueCountPie(
  '38_transportation_planning_studies',
  splitTableData(tablesData, '38_transportation_planning_studies'),
  'study_type',
  'study_name',
  'Planning Studies Type: # of Studies Grouped by Type'
),
makeValueCountPie(
  '38_transportation_planning_studies',
  splitTableData(tablesData, '38_transportation_planning_studies'),
  'schedule',
  'study_name',
  'Planning Studies Schedule: # of Studies Grouped by Schedule'
),
    {
      parent_table: "38_transportation_planning_studies",
      table: tpsProcessed?.data ?? null,
      columns: tpsProcessed?.columns,
      fullWidth: true
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
