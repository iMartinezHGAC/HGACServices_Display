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
	import { accumulateArray, accumulateMappedField, accumulateMappedFieldSubtable, collectAllSubrecords, combineRelatedRecords, mapTableData, selectSplitSubtable } from '../../helpers/chartFormatters';
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

	//console.log('test splt', splitSubtables(tablesData, '14_livable_centers'));

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


  const lcProcessed = combineRelatedRecords(
    tablesData,
    '17_elder_justice',
    ['legal_clinics'],
    ['legal_clinics_sponsor', 'legal_clinics_attendees', 'legal_clinics_documents' ] 
  );

  const trainingProcessed = combineRelatedRecords(
    tablesData,
    '17_elder_justice',
    ['training'],
    ['training_name', 'training_sponsor', 'trainings_hours', 'attendees_count' ]  
  );
	charts.push(
    {
      parent_table: "27_aging_direct_services",
      indicator: {
        indicatorName: "Elderly Transported ",
        indicatorVal: (accumulateMappedFieldSubtable(tablesData, '27_aging_direct_services', 'assistance', 'persons') + accumulateMappedFieldSubtable(tablesData, '27_aging_direct_services', 'respite', 'persons')), 
      },
      chartType: "indicator"
    },  
    {
      parent_table: "26_aging_nutrition_transport",
      indicator: {
        indicatorName: "Trips Provided",
        indicatorVal: (accumulateMappedFieldSubtable(tablesData, '27_aging_direct_services', 'transport','trips_provided'))
      },
      chartType: "indicator"
    },  
    {
      parent_table: "26_aging_nutrition_transport",
      indicator: {
        indicatorName: "Funding",
        indicatorVal: (accumulateMappedFieldSubtable(tablesData, '27_aging_direct_services', 'transport','trips_cost'))
      },
      chartType: "indicator"
    },  
    {
      parent_table: "17_elder_justice",
      indicator: {
        indicatorName: "New Crime Victim Clients",
        indicatorVal: (accumulateMappedFieldSubtable(tablesData, '17_elder_justice', 'crime_victims','new_client_count'))
      },
      chartType: "indicator"
    },  
    {
      parent_table: "17_elder_justice",
      table: lcProcessed?.data,
      columns: lcProcessed?.columns,
      fullWidth: true
    },
    {
      parent_table: "17_elder_justice",
      table: trainingProcessed?.data,
      columns: trainingProcessed?.columns,
      fullWidth: true
    },
	)

  // New function adapted from makePie for two-slice sum-based pies
export function makeTwoSlicePie(
  parent_table: string,
  titleText: string,
  seriesName: string,
  slice1Name: string,
  slice1Value: number,
  slice2Name: string,
  slice2Value: number
): ChartType {
  const pieData = [
    { name: slice1Name, value: slice1Value },
    { name: slice2Name, value: slice2Value }
  ];

  return {
    parent_table: parent_table,
    chart: {
      charts: {
        title: {
          text: titleText,
          left: 'center'
        },
        tooltip: {
          trigger: 'item'
        },
        legend: {
          orient: 'vertical',
          left: 'left',
          top: 30,
        },
        series: [
          {
            name: seriesName,
            type: 'pie',
            radius: '50%',
            data: pieData,
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      }
    },
    chartType: 'piechart'
  };
}


// Elderly Fed pie
const personsHome = accumulateArray((mapTableData(collectAllSubrecords(tablesData, '26_aging_nutrition_transport', 'home'), 'persons') as number[]) || []) || 0;
const personsCongregate = accumulateArray((mapTableData(collectAllSubrecords(tablesData, '26_aging_nutrition_transport', 'congregate'), 'persons') as number[]) || []) || 0;
charts.push(
  makeTwoSlicePie(
    '26_aging_nutrition_transport',
    'Elderly Fed',
    'Elderly Fed',
    'Home',
    personsHome,
    'Congregate',
    personsCongregate
  )
);

// Meals Provided pie
const mealsHome = accumulateArray((mapTableData(collectAllSubrecords(tablesData, '26_aging_nutrition_transport', 'home'), 'meals') as number[]) || []) || 0;
const mealsCongregate = accumulateArray((mapTableData(collectAllSubrecords(tablesData, '26_aging_nutrition_transport', 'congregate'), 'meals') as number[]) || []) || 0;
charts.push(
  makeTwoSlicePie(
    '26_aging_nutrition_transport',
    'Meals Provided',
    'Meals Provided',
    'Home',
    mealsHome,
    'Congregate',
    mealsCongregate
  )
);

// Funding pie
const costHome = accumulateArray((mapTableData(collectAllSubrecords(tablesData, '26_aging_nutrition_transport', 'home'), 'cost') as number[]) || []) || 0;
const costCongregate = accumulateArray((mapTableData(collectAllSubrecords(tablesData, '26_aging_nutrition_transport', 'congregate'), 'cost') as number[]) || []) || 0;
charts.push(
  makeTwoSlicePie(
    '26_aging_nutrition_transport',
    'Funding',
    'Funding',
    'Home',
    costHome,
    'Congregate',
    costCongregate
  )
);


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
