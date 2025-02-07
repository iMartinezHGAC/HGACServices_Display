type graphProp = {
  data: object[],
  width: number,
  height: number,
  marginTop: number,
  marginRight: number,
  marginBottom: number,
  marginLeft: number
}

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
