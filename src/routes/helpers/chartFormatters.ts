
type tbKey = keyof Trashbash

export function makeBarData(dataset: Trashbash[], key: tbKey) {
  if(dataset) {
  return dataset.map((item: Trashbash) => ({
      juris: item.expand.collection_site_id.site_name,
      value: item[key]
    }))    }
}
