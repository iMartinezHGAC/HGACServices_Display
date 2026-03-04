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
	import { accumulateArray, accumulateMappedFieldSubtable, collectAllSubrecords, mapTableData} from '../../helpers/chartFormatters';
	import { checkRouteDirection } from '../../helpers/flyAnimationDirection';
	import { addScaledColumn, combineRelatedRecords } from '../../helpers/tableFormatters';

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
  if (lcProcessed) {
    let scaledLCProcessed = lcProcessed.data
   scaledLCProcessed = addScaledColumn(scaledLCProcessed, "estimated_value_added", "legal_clinics_attendees", 2500) 
    charts.push(
    {
      parent_table: "17_elder_justice",
      table: scaledLCProcessed,
      columns: [
      ...lcProcessed?.columns,
      'estimated_value_added',
        ],
      fullWidth: true
    },
    )
  }

  $inspect('legal clinics', lcProcessed)

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
        indicatorVal: (accumulateMappedFieldSubtable(tablesData, '26_aging_nutrition_transport', 'transport','trips_provided'))
      },
      chartType: "indicator"
    },  
    {
      parent_table: "26_aging_nutrition_transport",
      indicator: {
        indicatorName: "Funding",
        indicatorVal: (accumulateMappedFieldSubtable(tablesData, '26_aging_nutrition_transport', 'transport','trips_cost')),
			indicatorSymPre: '$'
      },
      chartType: "indicator"
    },  
    {
      parent_table: "17_elder_justice",
      indicator: {
        indicatorName: "New Crime Victim Clients",
        indicatorVal: (accumulateMappedFieldSubtable(tablesData, '17_elder_justice', 'crime_victims','new_client_count')),
      },
      chartType: "indicator"
    },  

    {
      parent_table: "17_elder_justice",
      table: trainingProcessed?.data,
      columns: trainingProcessed?.columns,
      fullWidth: true
    },
	)


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
          left: 'center',
          textStyle: { fontSize: 18, fontWeight: '600' }
        },
        tooltip: {
          trigger: 'item',
          formatter: (params: any) => {
            const formattedValue = Number(params.value).toLocaleString('en-US');
                return titleText.toLowerCase() === 'funding'
            ? `${params.seriesName}<br/>${params.name}: $${formattedValue} (${params.percent.toFixed(1)}%)`
            : `${params.seriesName}<br/>${params.name}: ${formattedValue} (${params.percent.toFixed(1)}%)`

          }
        },
        legend: {
          orient: 'vertical',
          left: 'left',
          top: 30,
          textStyle: { fontSize: 14 }
        },
        series: [
          {
            name: seriesName,
            type: 'pie',
            radius: '60%', // larger solid pie = plenty of room for inside labels
            avoidLabelOverlap: true,
            minAngle: 15,
            color: ['#10b981', '#f59e0b'], // exact green Home + orange Congregate from your screenshot
            data: pieData,
            label: {
              show: true,
              position: 'inside',
              formatter: (params: any) => {
                const formattedValue = Number(params.value).toLocaleString('en-US');
                return titleText.toLowerCase() === 'funding'
                    ? `$${formattedValue}\n(${params.percent.toFixed(1)}%)`
                    : `${formattedValue}\n(${params.percent.toFixed(1)}%)`
              },
              fontSize: 14,
              lineHeight: 15,
              fontWeight: 600,
              color: '#ffffff', // high contrast on colored slices
              align: 'center'
            },
            emphasis: {
              itemStyle: {
                shadowBlur: 15,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.7)'
              },
              label: {
                show: true,
                fontSize: 15.5,
                fontWeight: 'bold'
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
