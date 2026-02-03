import * as echarts from 'echarts'

type JurisdictionType = {
  collectionId: string,
  collectionName: string,
  name: string,
  geography: string,
  id: string
}

type graphProp = {
  data: object[],
  width: number,
  height: number,
  marginTop: number,
  marginRight: number,
  marginBottom: number,
  marginLeft: number
}

interface GroupData {
  Group: string;
  Current_Funds: number;
  Current_Services: number;
  Current_Total_Participation: number;
  Historical_Funds: {
    [year: string]: number;
  };
  Historical_Services: {
    [year: string]: number;
  };
}

type ServiceKey = 'Current_Funds' | 'Current_Services' | 'Current_Total_Participation' |
  'Historical_Funds' | 'Historical_Services';

type collection_site_id = {
  collectionId?: string,
  collectionName?: string,
  date?: date,
  id?: string,
  geometry?: object,
  site_name: string,
}

type expandTB = {
  collection_site_id: collection_site_id
}

type Trashbash = {
  collectionId?: string,
  collectionName?: string,
  date?: date,
  id?: string,
  collection_site_id: string,
  miles_cleaned: number,
  recycled_pounds: number,
  tires: number,
  tot_volunteer_count: number,
  trash_pounds: number,
  vol_scouts: number,
  vol_under_18: number,
  expand: expandTB
}

type stackedTrash = {
  juris: string,
  historical_funds: number,
  current_funds: number,
}

type serviceType = {
  Group: string,
  Program: string,
  Current_Funds: number,
  Current_Services: number,
  Current_Total_Participation: number | null,
  Historical_Funds: number,
}

type serviceKey = keyof serviceType

type DonutType = {
  name: string,
  value: number,
}

/*
interface ChartType {
  chartTitle: string,
  chartData: object,
  Chart: Component,
  // chartType?: string,
  x_axis: string,
  x_axis_label: string,
  y_axis: string,
  y_axis_label: string,
  sort?: string,
  colors?: string[] | number[],
  chartType?: string,
}
*/

interface ProgramBlurb {
  collectionId: string;
  collectionName: string;
  created: string;
  id: string;
  program_blurb: string;
  // Add any other potential properties from the blurb
}

interface ProgramExpand {
  blurb: ProgramBlurb;
  links: any[]; // or more specifically typed if possible
}

interface ProgramType {
  active_directory_group: string;
  blurb?: string;
  collectionId: string;
  collectionName: string;
  expand?: ProgramExpand;
  id: string;
  links: any[]; // or more specifically typed if possible
  parent_table: string;
  program_name: string;
  dashboard_group?: string;
}

type PB_Record_Type = {
  collectionId: string;
  collectionName: string;
  id: string;
  [key: string]: string | number | Date;  // Dynamic properties allowing string, number, or Date values
};

interface IndicatorType {
  indicatorVal: string | number | null,
  indicatorName: string,
  indicatorSymPre?: string
}

interface CustomEchartType {
  charts: echarts.EChartsOption | null,
  onDrilldown?: (params: any, chartInstance: echarts.ECharts) => void
}

interface ChartType {
  parent_table: string,
  chart?: CustomEchartType,
  indicator?: IndicatorType,
  table?: PB_Record_Type | EventType[]
  chartType?: string,
  fullWidth?: boolean
}

interface CardDataType {
  program: ProgramType,
  echarts: ChartType[]
}

interface DashboardType {
  tab_name: string,
  sort_order: number,
  tab_color: string,
  collectionId: string,
  collectionName: string,
  created: string,
  id: string,
  sort_order: number,
  tab_name: string,
  tab_text_light_mode: boolean,
  updated: Date,
}


type AdworkType = {
  budget: number,
  custom_metrics: object,
  start_date: Date,
  end_date: Date,
  jurisdiction: string[],
  program: string,
  project_description: string,
  project_name: string,
  expand?: { program: ProgramType }
}

interface TableFetchOptions {
  sort?: string;
  expand?: string;
  filter?: string;
  perPage?: number;
}

interface TableDataResult<T = any> {
  [tableName: string]: T | { error: string }
}


interface LabeledCollectionType {
  table_name: string,
  table_data: object
}

interface CollectionWSubType {
  collection: string,
  subCollections: LabeledCollectionType
}

type SchemaType = {
  Name: string,
  Type: string
}

type SchemaMultiType = {
  tableName: string,
  schema: SchemaType[]
}

type EventType = {
  FormData: Object,
  email: string,
  event_name: string,
  event_description: string,
  attendee_count: number,
  program: string,
  event_date: string | Date
}

type ImageRecord = {
  collectionId: string,
  collectionName: string,
  id: string,
  jurisdiction: string,
  image: string,
  created: string,
  updated: string,
}
