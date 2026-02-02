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
	import { accumulateMappedField, accumulateMappedFieldSubtable, makeBar, makeDrilldownDonut, makeDrilldownPie, makeValueCountPie, makeValueSumPie, mapSelectedSubtable, safeSelectObjectField, selectSplitSubtable, splitAndMapTable, splitExpandedMapTable, splitSubtables, splitTableData } from '../../helpers/chartFormatters';
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

	//console.log("Name: ", programNames)
	$inspect('table data: ', tablesData);

  $inspect('test split', splitTableData(tablesData, '19_regional_juvenile_mental_health'))

  //splitSubtables(tablesData, '14_livable_centers'));

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

	charts.push(
    makeValueSumPie(
    '15_regional_law_enforcement_training',  // Parent table name (from your data example)
			splitTableData(tablesData, '15_regional_law_enforcement_training'),
    'class_name',
    'participants',                      // The key to count unique values for
    'Participants by Class Name'          // Optional custom title
  ),
    makeValueSumPie(
    '15_regional_law_enforcement_training',  // Parent table name (from your data example)
			splitTableData(tablesData, '15_regional_law_enforcement_training'),
    'class_name',
    'contact_hours_provided',                      // The key to count unique values for
    'Contact Hours by Class Name'          // Optional custom title
  ),
    makeValueSumPie(
    '16_regional_criminal_justice_grants',  // Parent table name (from your data example)
    splitTableData(tablesData, '16_regional_criminal_justice_grants'),
    'grant_type',                      // The key to count unique values for
    'grant_dollars',
    'Grants Prioritized'          // Optional custom title
  ),
    {
      parent_table: "16_regional_criminal_justice_grants",
      table: splitTableData(tablesData, '16_regional_criminal_justice_grants') 
    },
    makeValueSumPie(
    '19_regional_juvenile_mental_health',  // Parent table name (from your data example)
			splitTableData(tablesData, '19_regional_juvenile_mental_health'),
    'service_type',                      // The key to count unique values for
    'service_count',
  ),
    makeValueSumPie(
    '19_regional_juvenile_mental_health',  // Parent table name (from your data example)
			splitTableData(tablesData, '19_regional_juvenile_mental_health'),
    'service_type',                      // The key to count unique values for
    'dollar_amount',
    'Dollar Amount by Service Type'          // Optional custom title
  ),
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

