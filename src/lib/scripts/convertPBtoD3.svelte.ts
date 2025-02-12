  export function doesGroupExist(objectArray: serviceType[], group: string) {
    return objectArray.find(item => item.Group === group)
  }

  export function calculateCategoryTotal(objectArray: serviceType[], group: string, category: serviceKey) {
    const total = objectArray
      .filter((item: serviceType) => item.Group===group)
      .reduce((totalValue: number, currentItem: serviceType) => {
        return totalValue += currentItem[category] as number
    }, 0)
    return total
  }

  export function getGroupTotal(objectArray: serviceType[], group: string, category: serviceKey) {
    if(!doesGroupExist(objectArray, group)) return -1;
    return calculateCategoryTotal(objectArray, group, category)
  }

  export function donutGetCurrentFunds(objectArray: serviceType[], group: string, category: serviceKey) {
    return {
      name: group,
      value: getGroupTotal(objectArray, group, category)
    }
  }

  export function convertAllToDonut(objectArray: serviceType[], groups: string[], category: serviceKey) {
    let newObjectArray: donutType[] = []
    groups.forEach((group: string) => {
      newObjectArray.push(donutGetCurrentFunds(objectArray, group, category))
    })
    return newObjectArray
  }

  function convertToStackedBarChart(objectArray: serviceType[], groups: string[], category: serviceKey) {
   
  }
