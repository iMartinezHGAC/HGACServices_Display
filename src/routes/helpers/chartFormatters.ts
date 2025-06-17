import * as echarts from "echarts"
import { snakeToHuman } from "./caseConversion"

export function makeBar<T = any>(
    dataset: T[], 
    key1: keyof T, 
    key2: keyof T
  ): echarts.EChartsOption {
    return {
      title: {
        text: snakeToHuman(key2 as string)
      },
      tooltip: {},
      //@ts-ignore
      xAxis: {
        data: dataset.map((item: T) => truncateDate(item[key1]))
      },
      yAxis: {},
      //@ts-ignore
      series: [
        {
        name: snakeToHuman(key2 as string),
        type: 'bar',
        data: dataset.map((item: T) => item[key2])
        }
      ],
  }
}

export const truncateDate = <T = any>(input: T): T | string => 
  input instanceof Date || (typeof input === 'string' && input.endsWith('Z'))
    ? new Date(input as Date | string).toISOString().split('T')[0] 
    : input


export function truncateNumber<T = any>(value: T) {
  let postScript: string = ""
  if(typeof value === "number") {
    if(value > 999999) {
      return value/1000000
    }
    else if (value > 1000) {
      return value/1000
    }
  }
  return value
}

export function determinePostscript<T = any>(value: T) {
  if(typeof value === 'number')
    if(value > 999999) {
      return "(Millions)"
    }
    else if (value > 1000) {
      return "(Thousands)"
    }
}
