import { PB_URL } from "$env/static/private";
import PocketBase from 'pocketbase'
import type { PageServerLoad } from "./$types";
import type { CollectionWSubType, TableDataResult, TableFetchOptions } from "../../../ambient";


async function fetchTable(pb: PocketBase, tableName: string, options: TableFetchOptions): Promise<Object> {
  const defaultOptions: TableFetchOptions = {
    sort: '',
    expand: '',
    filter: '',
    perPage: 50,
  }

  const mergedOptions = {...defaultOptions, ...options}
  let results = {}

    try {

      const lower_limit: number = Math.floor(Math.random() * 3);
      const upper_limit: number = Math.floor(Math.random() * 300) + 100;
      let records
      if(tableName === "33_hgac_coop_purchasing") {
        records = await pb.collection(tableName).getList(lower_limit,upper_limit,{
          sort: mergedOptions.sort,
          expand: mergedOptions.expand,
          filter: mergedOptions.filter,
          perPage: mergedOptions.perPage,
        })
      } else {
        records = await pb.collection(tableName).getList(1,1,{
          sort: mergedOptions.sort,
          expand: mergedOptions.expand,
          filter: mergedOptions.filter,
          perPage: mergedOptions.perPage,
        })
      }
      results = records 
    } catch (err) {
      results = {error: err instanceof Error ? err.message : "Unknown error"}
      console.error(err)
    }
  return results
}

async function getSchema(tableName: string) {
  let res = await fetch(`${PB_URL}/api/collections/${tableName}/schema`)
  return await res.json()
}

async function getSubtableSchema(tableName: string) {
  let res = await fetch(`${PB_URL}/api/collections/${tableName}/dashboard-schema`)
  return await res.json()
}

export const load: PageServerLoad = async ({ locals, params }) => {
  const collections = ['35_rtp', '36_transportation_improvement_plan']
  let pbData: CollectionWSubType[] = []

  collections.forEach(async (table: string) => {
    let subCollectionsNames = await getSubtableSchema(table)
    let subTableNames = subCollectionsNames.map((name: string) => table + "_" + name)
    subTableNames.forEach(async (subTable: string)=> {
      let record = await fetchTable(locals.pb, subTable, {
        //filter: `jurisdiction = "${params.uuid}"`
        perPage: 1000
      })

      pbData.push({
        collection: table, 
        subCollections: {
          table_name: subTable, 
          table_data: record
        }
      })
    })
  })

  return {
    pbData: pbData 
  }
}
