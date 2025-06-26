import * as echarts from 'echarts'

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

type donutType = {
  name: string,
  value: number,
}

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

interface CustomEchartType {
  parent_table: string,
  charts: echarts.EChartsOption,
}

interface CardDataType {
  program: ProgramType,
  echarts: CustomEchartType[]
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
