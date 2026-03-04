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

	$inspect('table data: ', tablesData);

	//console.log('test splt',splitTableData (tablesData, '33_hgac_coop_purchasing'))

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
    '33_hgac_coop_purchasing',  // Parent table name (from your data example)
			splitTableData(tablesData, '33_hgac_coop_purchasing'),
    'category',                      // The key to count unique values for
    'orders',
    'Orders Placed: Order Count Grouped by Category'          // Optional custom title
  ),
    makeValueSumPie(
    '33_hgac_coop_purchasing',  // Parent table name (from your data example)
			splitTableData(tablesData, '33_hgac_coop_purchasing'),
    'category',                      // The key to count unique values for
    'dollars',
    'Orders Dollars: Count of Dollars Grouped by Category'          // Optional custom title
  ),
    makeValueSumPie(
    '33_hgac_coop_purchasing',  // Parent table name (from your data example)
			splitTableData(tablesData, '33_hgac_coop_purchasing'),
    'category',                      // The key to count unique values for
    'fee_dollars',
    'Fee Dollars by Category'          // Optional custom title
  ),
  {
      parent_table: "31_hgac_energy_corp",
      indicator: {
        indicatorName: "Dollars spent on electricity through H-GAC Energy",
        indicatorVal: accumulateMappedField(tablesData, '31_hgac_energy_corp', 'dollar_amount'),
        indicatorSymPre: '$',
      },
      chartType: "indicator"
    },
  {
      parent_table: "31_hgac_energy_corp",
      indicator: {
        indicatorName: "Entities in your area utilizing H-GAC Energy",
        indicatorVal: accumulateMappedField(tablesData, '31_hgac_energy_corp', 'accounts_count')
      },
      chartType: "indicator"
    },
	)


data.tableNames.forEach((tableName: string) => {
  const filtered = data.eventsData?.filter((field: any) => field.program === tableName) || [];
  
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
