// Define a donut type (assuming you have this defined elsewhere)
interface DonutType {
  name: string;
  value: number;
}

export function doesGroupExist(objectArray: GroupData[], group: string): GroupData | undefined {
  return objectArray.find(item => item.Group === group);
}

export function calculateCategoryTotal(
  objectArray: GroupData[], 
  group: string, 
  category: ServiceKey
): number {
  const total = objectArray
    .filter((item: GroupData) => item.Group === group)
    .reduce((totalValue: number, currentItem: GroupData) => {
      // Handle direct number values
      if (typeof currentItem[category] === 'number') {
        return totalValue + (currentItem[category] as number);
      }
      
      // Handle historical object values
      if (currentItem[category] && typeof currentItem[category] === 'object') {
        return totalValue + Object.values(currentItem[category] as Record<string, number>)
          .reduce((sum, value) => sum + (value || 0), 0);
      }
      
      // Return current total if no valid value
      return totalValue;
    }, 0);
  
  return total;
}

export function getGroupTotal(
  objectArray: GroupData[], 
  group: string, 
  category: ServiceKey
): number {
  if (!doesGroupExist(objectArray, group)) return -1;
  return calculateCategoryTotal(objectArray, group, category);
}

export function donutGetCurrentFunds(
  objectArray: GroupData[], 
  group: string, 
  category: ServiceKey
): DonutType {
  return {
    name: group,
    value: getGroupTotal(objectArray, group, category)
  };
}

export function convertAllToDonut(
  objectArray: GroupData[], 
  groups: string[], 
  category: ServiceKey
): DonutType[] {
  return groups.map((group: string) => 
    donutGetCurrentFunds(objectArray, group, category)
  );
}
