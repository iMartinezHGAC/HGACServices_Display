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
  geometry?: Object,
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

class IterableStackedTrash {
  private data: stackedTrash[];

  constructor(data: stackedTrash[]) {
    this.data = data
  }
   
  [Symbol.iterator]() {
    let index = 0
    const data = this.data

    return {
      next(): IteratorResult<stackedTrash> {
        if (index < data.length) {
          return {value: data[index++], done: false }
        } else {
          return {done: true, value: undefined };
        }
      }
    }
  }
}

type stackedTrash = {
  juris: string,
  trash_pounds: number,
  recycled_pounds: number,
}
