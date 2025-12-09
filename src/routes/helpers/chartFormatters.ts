import * as echarts from "echarts"
import { snakeToHuman } from "./caseConversion"
import type { ProgramType } from "../../ambient";


interface CustomEchartType {
  parent_table: string,
  echarts_data: echarts.EChartsOption,
}

interface CardDataType {
  program: ProgramType,
  echarts: CustomEchartType[]
}

// Format value function
function formatValue(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 10000) {
    return (num / 1000).toFixed(1) + "K";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(2) + "K";
  }
  return num.toLocaleString();
}

export function makePie<T = any>(
  parent_table: string,
  dataset: T[],
  key1: keyof T
): CustomEchartType {
  // Count how many times each unique value appears for key1
  const countMap: Record<string, number> = {};
  dataset.forEach((item: T) => {
    const key = item[key1] as string;
    if (key in countMap) {
      countMap[key]++;
    } else {
      countMap[key] = 1;
    }
  });

  // Prepare data for ECharts
  const pieData = Object.entries(countMap).map(([name, value]) => ({ name, value }));

  return {
    parent_table: parent_table,
    echarts_data: {
      title: {
        text: snakeToHuman(key1 as string),
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
          name: snakeToHuman(key1 as string),
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
  };
}

export function makeBar<T = any>(
  parent_table: string,
  dataset: T[],
  key1: keyof T,
  key2: keyof T
): CustomEchartType {
  //console.log('data in makeBar function:', dataset)
  return {
    parent_table: parent_table,
    echarts_data: {
      title: {
        text: snakeToHuman(key2 as string)
      },
      tooltip: {},
      //@ts-ignore
      xAxis: {
        data: dataset.map((item: T) => truncateDate(item[key1]))
      },
      yAxis: {
        axisLabel: {
          formatter: function(value) {
            if (value > 1000000) {
              return (value / 1000000) + "M"
            }
            else if (value > 100000) {
              return (value / 1000) + "K"
            }
            return value
          }
        }
      },
      //@ts-ignore
      series: [
        {
          name: snakeToHuman(key2 as string),
          type: 'bar',
          data: dataset
            .filter((item: T) => {
              const value = item[key2];
              return typeof value !== 'number' || value >= 0;
            })
            .map((item: T) => item[key2]),
        }
      ],
    }
  }
}

export const truncateDate = <T = any>(input: T): T | string =>
  input instanceof Date || (typeof input === 'string' && input.endsWith('Z'))
    ? new Date(input as Date | string).toISOString().split('T')[0]
    : input


export function truncateNumber<T = any>(value: T) {
  let postScript: string = ""
  if (typeof value === "number") {
    if (value > 999999) {
      return value / 1000000
    }
    else if (value > 1000) {
      return value / 1000
    }
  }
  return value
}

export function determinePostscript<T = any>(value: T) {
  if (typeof value === 'number')
    if (value > 999999) {
      return "(Millions)"
    }
    else if (value > 1000) {
      return "(Thousands)"
    }
}
