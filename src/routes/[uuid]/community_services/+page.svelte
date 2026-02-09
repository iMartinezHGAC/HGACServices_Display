
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
	import { accumulateMappedField, accumulateMappedFieldSubtable, combineRelatedRecords, makeBar, makeDrilldownDonut, makeDrilldownPie, makeGroupedBar, makeValueCountPie, mapSelectedSubtable, safeSelectObjectField, selectSplitSubtable, splitAndMapTable, splitExpandedMapTable, splitSubtables, splitTableData } from '../../helpers/chartFormatters';
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
	//console.log('test splt', splitSubtables(tablesData, '14_livable_centers'));
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

  const lcProcessed = combineRelatedRecords(
    tablesData,
    '14_livable_centers',
    ['studies'],
    ['year', 'study_name', 'status', 'study_progress', 'cost', 'awards'  ] // optional – omit for auto columns
  );

	charts.push(


  makeValueCountPie(
    '14_livable_centers', 
			splitSubtables(tablesData, '14_livable_centers').studies,
    'status',            
    'Study Status'      
  ),  
    makeValueCountPie(
    '14_livable_centers',
			splitSubtables(tablesData, '14_livable_centers').studies,
    'study_progress',   
    'Study Progress'   
  ),
    makeGroupedBar(
      '14_livable_centers',
			splitSubtables(tablesData, '14_livable_centers').studies,
      'from_date',
      [
        'task_request_type'
      ],
      "Assistance Provided"
    ),
  {
    parent_table: "14_livable_centers",
    table: lcProcessed?.data,
    columns: lcProcessed?.columns,
    fullWidth: true
  },
    /*
    makeValueCountPie(
    '14_livable_centers', 
			selectSplitSubtable(tablesData, '14_livable_centers', 'assistance'),
    'task_request_type',
      'Task Request Type',
  ),
    */
	)

data.tableNames.forEach((tableName: string) => {
  const filtered = data.eventsData?.filter((field: any) => field.program === tableName) || [];
  if (filtered.length > 0) {
    charts.push({
      parent_table: tableName,
      table: filtered as EventType[],
      fullWidth: true
    });
  }
});

	//$inspect('charts data', charts);
	const cardData: CardDataType[] = $derived(
		programs.map((program: ProgramType) => {
			const eCharts = charts.filter((chart) => chart.parent_table == program.parent_table);
			const data: CardDataType = { program: program, echarts: eCharts };
			return data;
		})
	);

	//$inspect('card data', cardData);


</script>

{#if data.post}
	<CardBody {cardNames} {cardData} direction={routedFromLeft} adwork={data.projectDetails} />
{:else}
	<div>Loading...</div>
{/if}
