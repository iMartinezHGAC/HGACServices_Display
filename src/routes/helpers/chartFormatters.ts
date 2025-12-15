import * as echarts from "echarts"
import { snakeToHuman } from "./caseConversion"
import type { ProgramType, CustomEchartType } from "../../ambient";

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


/**
 * Creates a drilldown pie chart for multiple value keys and their single-key breakdowns.
 * @param parent_table - Name for chart
 * @param dataset - The data
 * @param keys - Array, e.g. ['free_tows','paid_tows']
 * @returns ECharts option plus event handler to enable drilldown.
 */
export function makeDrilldownPie<T = any>(
  parent_table: string,
  dataset: T[],
  keys: (keyof T)[],
  title?: string
): CustomEchartType {
  // Utility to humanize snake_case to Title Case
  function snakeToHuman(str: string): string {
    return str.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
  }

  // Build parent/summary pie data
  const parentData = keys.map(key => {
    let total = 0;
    dataset.forEach(item => {
      const val = Number(item[key]) || 0;
      total += val;
    });
    return { name: snakeToHuman(String(key)), value: total }; // Humanize names here
  });

  // Breakdown for a specific key (child pie)
  function getSingleKeyPieData(k: keyof T) {
    const countMap: Record<string, number> = {};
    dataset.forEach(item => {
      const val = String(item[k]);
      // Optionally: skip undefined/empty
      if (!val) return;
      if (val in countMap) countMap[val]++;
      else countMap[val] = 1;
    });
    return Object.entries(countMap).map(([name, value]) => ({ name, value }));
  }


  console.log('chart log', dataset)
  console.log('pie data', parentData)
  // Chart config compatible with your interface
  const charts: echarts.EChartsOption = {
    title: {
      text: title ?? keys.map(k => snakeToHuman(String(k))).join(' vs '),
      left: 'center'
    },
    tooltip: { trigger: 'item' },
    legend: { orient: 'vertical', left: 'left', top: 30 },
    series: [
      {
        name: '',
        type: 'pie',
        radius: '50%',
        data: parentData,
        label: {
          show: true,
          position: 'outside', // Outside labels always shown
          formatter: '{b}: {c}' // Category: value
        },
        labelLine: {
          show: true // Connecting lines for outside labels
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      },
      {
        name: '',
        type: 'pie',
        radius: '50%',
        data: parentData,
        itemStyle: {
          opacity: 0 // Makes the series invisible but labels can still show
        },
        label: {
          show: function(params: any) {
            return params.percent! >= 5; // Conditional: show inside value only if slice >=5% (adjust as needed for "fits")
          },
          position: 'inside',
          formatter: '{c}', // Value inside
          opacity: 1 // Ensures label visibility
        },
        labelLine: {
          show: false // No lines for inside labels
        }
      }
    ]
  };

  // Drilldown function available for controller to register
  function onDrilldown(params: any, chartInstance: echarts.ECharts) {
    const keyClicked = params.data.name; // Use humanized name, but map back if needed
    const originalKey = keys.find(k => snakeToHuman(String(k)) === keyClicked);
    if (!originalKey) return;
    const pieData = getSingleKeyPieData(originalKey);

    chartInstance.setOption({
      title: { text: snakeToHuman(String(originalKey)), left: 'center' },
      legend: { show: true },
      series: [
        {
          name: snakeToHuman(String(originalKey)),
          type: 'pie',
          radius: '50%',
          data: pieData,
          label: {
            show: true,
            position: 'outside', // Outside labels always shown
            formatter: '{b}: {c}' // Category: value
          },
          labelLine: {
            show: true // Connecting lines for outside labels
          }
        },
        {
          name: snakeToHuman(String(originalKey)) + ' (Inside Labels)',
          type: 'pie',
          radius: '50%',
          data: pieData,
          itemStyle: {
            opacity: 0 // Makes the series invisible but labels can still show
          },
          label: {
            show: function(params: any) {
              return params.percent! >= 5; // Conditional: show inside value only if slice >=5% (adjust as needed)
            },
            position: 'inside',
            formatter: '{c}', // Value inside
            opacity: 1 // Ensures label visibility
          },
          labelLine: {
            show: false // No lines for inside labels
          }
        }
      ]
    });
  }

  return {
    parent_table,
    charts,
    chartType: 'drilldown_pie',
    onDrilldown // <-- custom handler, available on the result for your controller to use
  };
}

export function makeValueCountPie<T = any>(
  parent_table: string,
  dataset: T[],
  primaryKey: keyof T,
  secondaryKey: keyof T,
  title?: string
): CustomEchartType {
  // Utility to humanize snake_case to Title Case
  function snakeToHuman(str: string): string {
    return str.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
  }

  // Breakdown for the key (pie data): count occurrences of each value
  function getValueCountPieData(k: keyof T, ds: T[] = dataset) {
    const countMap: Record<string, number> = {};
    ds.forEach(item => {
      const val = String(item[k]);
      // Optionally: skip undefined/empty
      if (!val) return;
      if (val in countMap) countMap[val]++;
      else countMap[val] = 1;
    });
    return Object.entries(countMap).map(([name, value]) => ({ name: snakeToHuman(name), value, originalName: name }));
  }

  const humanPrimary = snakeToHuman(String(secondaryKey ?? primaryKey));
  const parentData = getValueCountPieData(primaryKey);


  // Chart config compatible with your interface
  const charts: echarts.EChartsOption = {
    title: {
      text: title ?? `${humanPrimary}`,
      left: 'center'
    },
    tooltip: { trigger: 'item' },
    legend: { orient: 'vertical', left: 'left', top: 30 },
    series: [
      {
        name: humanPrimary,
        type: 'pie',
        radius: '50%',
        data: parentData,
        label: {
          show: true,
          position: 'outside', // Outside labels always shown
          formatter: '{b}: {c}' // Category: value
        },
        labelLine: {
          show: true // Connecting lines for outside labels
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      },
      {
        name: humanPrimary,
        type: 'pie',
        radius: '50%',
        data: parentData,
        itemStyle: {
          opacity: 0 // Makes the series invisible but labels can still show
        },
        label: {
          show: function(params: any) {
            return params.percent! >= 5; // Conditional: show inside value only if slice >=5% (adjust as needed)
          },
          position: 'inside',
          formatter: '{c}', // Value inside
          opacity: 1 // Ensures label visibility
        },
        labelLine: {
          show: false // No lines for inside labels
        }
      }
    ]
  };

  // Drilldown function available for controller to register
  function onDrilldown(params: any, chartInstance: echarts.ECharts) {
    const originalVal = params.data.originalName;
    if (!originalVal) return;
    const filteredDataset = dataset.filter(item => String(item[primaryKey]) === originalVal);
    const pieData = getValueCountPieData(secondaryKey, filteredDataset);
    const humanSecondary = snakeToHuman(String(secondaryKey));

    chartInstance.setOption({
      title: { text: `${params.data.name} by ${humanSecondary}`, left: 'center' },
      legend: { show: true },
      series: [
        {
          name: `${params.data.name} by ${humanSecondary}`,
          type: 'pie',
          radius: '50%',
          data: pieData,
          label: {
            show: true,
            position: 'outside', // Outside labels always shown
            formatter: '{b}: {c}' // Category: value
          },
          labelLine: {
            show: true // Connecting lines for outside labels
          }
        },
        {
          name: `${params.data.name} by ${humanSecondary}`,
          type: 'pie',
          radius: '50%',
          data: pieData,
          itemStyle: {
            opacity: 0 // Makes the series invisible but labels can still show
          },
          label: {
            show: function(params: any) {
              return params.percent! >= 5; // Conditional: show inside value only if slice >=5% (adjust as needed)
            },
            position: 'inside',
            formatter: '{c}', // Value inside
            opacity: 1 // Ensures label visibility
          },
          labelLine: {
            show: false // No lines for inside labels
          }
        }
      ]
    });
  }

  return {
    parent_table,
    charts,
    chartType: 'drilldown_pie',
    onDrilldown // <-- custom handler, available on the result for your controller to use
  };
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
    charts: {
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
    charts: {
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
