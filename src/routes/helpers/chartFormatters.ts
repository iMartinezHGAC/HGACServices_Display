import * as echarts from "echarts"
import { snakeToHuman } from "./caseConversion"
import type { ProgramType, CustomEchartType, TableDataResult, ChartType } from "../../ambient";


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
 * Creates a drilldown donut chart for multiple value keys and their single-key breakdowns.
 * Works with both dataset as array (T[]) or single object (T).
 * 
 * @param parent_table - Name for chart
 * @param dataset - The data (single object or array of objects)
 * @param keys - Array, e.g. ['free_tows','paid_tows']
 * @param title - Optional title for the chart
 * @param centerText - Optional text/value to display in the center of the donut
 * @returns ECharts option plus event handler to enable drilldown.
 */
export function makeDrilldownDonut<T = any>(
  parent_table: string,
  dataset: T | T[],
  keys: (keyof T)[],
  title?: string,
  centerText?: string
): ChartType {
  // Normalize dataset to always be an array
  const dataArray = Array.isArray(dataset) ? dataset : [dataset];

  // Utility to humanize snake_case to Title Case
  function snakeToHuman(str: string): string {
    return str.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
  }

  // Build parent/summary donut data
  const parentData = keys.map(key => {
    let total = 0;
    dataArray.forEach(item => {
      const val = Number(item[key]) || 0;
      total += val;
    });
    return { name: snakeToHuman(String(key)), value: total };
  });

  // Breakdown for a specific key (child donut)
  function getSingleKeyDonutData(k: keyof T) {
    const countMap: Record<string, number> = {};

    dataArray.forEach(item => {
      const val = String(item[k]);
      // Skip undefined/empty values
      if (!val) return;
      if (val in countMap) countMap[val]++;
      else countMap[val] = 1;
    });

    return Object.entries(countMap).map(([name, value]) => ({ name, value }));
  }

  console.log('chart log - dataset length:', dataArray.length);
  console.log('donut data', parentData);

  // Base title configuration
  const titleConfig: any[] = [
    {
      text: title ?? keys.map(k => snakeToHuman(String(k))).join(' vs '),
      left: 'center',
      top: 20
    }
  ];

  // Add center text if provided
  if (centerText) {
    titleConfig.push({
      text: centerText,
      left: 'center',
      top: 'center',
      textStyle: {
        fontSize: 20,
        fontWeight: 'bold'
      }
    });
  }

  // Chart config
  const charts: echarts.EChartsOption = {
    title: titleConfig,
    tooltip: { trigger: 'item' },
    legend: { orient: 'vertical', left: 'left', top: 50 },
    series: [
      {
        name: '',
        type: 'pie',
        radius: ['40%', '70%'], // Donut
        data: parentData,
        label: {
          show: true,
          position: 'outside',
          formatter: '{b}: {c}'
        },
        labelLine: { show: true },
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
        radius: ['40%', '70%'],
        data: parentData,
        itemStyle: { opacity: 0 },
        label: {
          show: function(params: any) {
            return params.percent! >= 5;
          },
          position: 'inside',
          formatter: '{c}',
          opacity: 1
        },
        labelLine: { show: false }
      }
    ]
  };

  // Drilldown handler
  function onDrilldown(params: any, chartInstance: echarts.ECharts) {
    const keyClicked = params.data.name;
    const originalKey = keys.find(k => snakeToHuman(String(k)) === keyClicked);
    if (!originalKey) return;

    const donutData = getSingleKeyDonutData(originalKey);

    const drilldownTitleConfig: any[] = [
      {
        text: snakeToHuman(String(originalKey)),
        left: 'center',
        top: 20
      }
    ];

    if (centerText) {
      drilldownTitleConfig.push({
        text: centerText,
        left: 'center',
        top: 'center',
        textStyle: {
          fontSize: 20,
          fontWeight: 'bold'
        }
      });
    }

    chartInstance.setOption({
      title: drilldownTitleConfig,
      legend: { show: true },
      series: [
        {
          name: snakeToHuman(String(originalKey)),
          type: 'pie',
          radius: ['40%', '70%'],
          data: donutData,
          label: {
            show: true,
            position: 'outside',
            formatter: '{b}: {c}'
          },
          labelLine: { show: true }
        },
        {
          name: snakeToHuman(String(originalKey)) + ' (Inside Labels)',
          type: 'pie',
          radius: ['40%', '70%'],
          data: donutData,
          itemStyle: { opacity: 0 },
          label: {
            show: function(params: any) {
              return params.percent! >= 5;
            },
            position: 'inside',
            formatter: '{c}',
            opacity: 1
          },
          labelLine: { show: false }
        }
      ]
    });
  }

  return {
    parent_table,
    chart: {
      charts,
      onDrilldown
    },
    chartType: 'drilldown_donut',
  };
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
): ChartType {
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
    chart: {
      charts,
      onDrilldown
    },
    chartType: 'drilldown_pie',
  };
}

/**
 * Creates a drilldown pie chart for table sizes and their field cardinality breakdowns.
 * @param parent_table - Name for chart
 * @param dataset - The data structure as provided
 * @param title - Optional title for the chart
 * @returns ECharts option plus event handler to enable drilldown.
 */
export function makeTableDrilldownPie<T = any>(
  parent_table: string,
  dataset: T[],
  title?: string
): ChartType {
  // Utility to humanize snake_case to Title Case
  function snakeToHuman(str: string): string {
    return str.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
  }

  // Fields to remove from items
  const fieldsToRemove = ['collectionId', 'id', 'collectionName', 'source jurisdiction', 'created', 'updated', 'from_date', 'to_date'];

  // Extract table map: tableName -> items (with fields removed)
  const tableMap: Record<string, any[]> = {};
  const tableSizes: Record<string, number> = {};
  dataset.forEach(group => {
    if (typeof group === 'object' && group !== null) {
      Object.entries(group).forEach(([tableName, info]: [string, any]) => {
        if (info && Array.isArray(info.items)) {
          // Remove specified fields from each item
          const cleanedItems = info.items.map((item: any) => {
            const newItem = { ...item };
            fieldsToRemove.forEach(field => {
              delete newItem[field];
            });
            return newItem;
          });
          tableMap[tableName] = cleanedItems;
          tableSizes[tableName] = info.totalItems ?? cleanedItems.length;
        }
      });
    }
  });

  const tables = Object.keys(tableMap);

  // Build parent/summary pie data
  const parentData = tables.map(tableName => {
    return { name: snakeToHuman(tableName), value: tableSizes[tableName] };
  });

  // Breakdown for a specific table (child pie: fields with unique value counts)
  function getSingleTablePieData(tableName: string) {
    const items = tableMap[tableName];
    if (!items || items.length === 0) return [];

    // Collect all unique fields (after removal)
    const fieldSet = new Set<string>();
    items.forEach(item => {
      if (typeof item === 'object' && item !== null) {
        Object.keys(item).forEach(key => fieldSet.add(key));
      }
    });

    // For each field, compute number of unique non-null values
    const fieldData = [];
    for (const field of fieldSet) {
      const uniqueValues = new Set<string>();
      items.forEach(item => {
        const val = item[field];
        if (val !== undefined && val !== null) {
          uniqueValues.add(JSON.stringify(val)); // Handle non-primitive values
        }
      });
      fieldData.push({ name: snakeToHuman(field), value: uniqueValues.size });
    }

    return fieldData;
  }

  console.log('chart log', dataset);
  console.log('pie data', parentData);

  // Chart config compatible with your interface
  const charts: echarts.EChartsOption = {
    title: {
      text: title ?? 'Table Sizes',
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
    const nameClicked = params.data.name; // Humanized name
    const originalTable = tables.find(t => snakeToHuman(t) === nameClicked);
    if (!originalTable) return;
    const pieData = getSingleTablePieData(originalTable);

    chartInstance.setOption({
      title: { text: snakeToHuman(originalTable) + ' ', left: 'center' },
      legend: { show: true },
      series: [
        {
          name: snakeToHuman(originalTable),
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
          name: snakeToHuman(originalTable) + ' (Inside Labels)',
          type: 'pie',
          radius: '50%',
          data: pieData,
          itemStyle: {
            opacity: 0 // Makes the series invisible but labels can still show
          },
          label: {
            show: function(params: any) {
              return params.percent! >= 5; // Conditional: show inside value only if slice >=5%
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
    chart: {
      charts,
      onDrilldown
    },
    chartType: 'drilldown_pie',
  };
}

/**
 * Creates a drilldown pie chart for hierarchical categories, summing a value key at each level.
 * @param parent_table - Name for chart
 * @param dataset - The data
 * @param keys - Array starting with the value key (e.g., 'funding'), followed by category keys for drilldown (e.g., ['project_type', 'project_category', ...])
 * @param title - Optional title for the chart
 * @returns ECharts option plus event handler to enable drilldown.
 */
export function makeDrilldownMultPie<T = any>(
  parent_table: string,
  dataset: T[],
  keys: (keyof T)[],
  title?: string
): ChartType {
  // Utility to humanize snake_case to Title Case
  function snakeToHuman(str: string): string {
    return str.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
  }

  const valueKey = keys[0] as keyof T;
  const categoryKeys = keys.slice(1) as (keyof T)[];

  if (categoryKeys.length === 0) {
    throw new Error('At least one category key is required for drilldown.');
  }

  let currentLevel = 0;
  let currentFilters: Partial<Record<keyof T, string>> = {};

  // Function to compute pie data for the current level and filters
  function computePieData(level: number, filters: Partial<Record<keyof T, string>>): { name: string; value: number }[] {
    const filteredData = dataset.filter(item => {
      return Object.entries(filters).every(([cat, val]) => String(item[cat as keyof T]) === val);
    });

    const currentCat = categoryKeys[level];
    const sumMap: Record<string, number> = {};

    filteredData.forEach(item => {
      const catVal = String(item[currentCat]);
      if (!catVal) return; // Skip empty values
      const val = Number(item[valueKey]) || 0;
      sumMap[catVal] = (sumMap[catVal] || 0) + val;
    });

    return Object.entries(sumMap).map(([name, value]) => ({ name, value }));
  }

  // Function to get breadcrumb string
  function getBreadcrumb(): string {
    const parts: string[] = [];
    for (let i = 0; i < currentLevel; i++) {
      const cat = categoryKeys[i];
      const val = currentFilters[cat]!;
      parts.push(`${snakeToHuman(String(cat))}: ${val}`);
    }
    return parts.join(' > ');
  }

  // Function to get subtext
  function getSubtext(): string {
    let subtext = `By ${snakeToHuman(String(categoryKeys[currentLevel]))}`;
    const breadcrumb = getBreadcrumb();
    if (breadcrumb) {
      subtext += `\n${breadcrumb}`;
    }
    return subtext;
  }

  // Function to update the chart
  function updateChart(chart: echarts.ECharts, pieData: { name: string; value: number }[], showBack: boolean) {
    const option: echarts.EChartsOption = {
      title: {
        text: title ?? 'Drilldown Pie',
        subtext: getSubtext(),
        left: 'center',
      },
      tooltip: { trigger: 'item' },
      legend: { orient: 'vertical', left: 'left', top: 30 },
      series: [
        {
          name: '',
          type: 'pie',
          radius: '50%',
          data: pieData,
          label: {
            show: true,
            position: 'outside',
            formatter: '{b}: {c}',
          },
          labelLine: {
            show: true,
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
        },
        {
          name: '',
          type: 'pie',
          radius: '50%',
          data: pieData,
          itemStyle: {
            opacity: 0,
          },
          label: {
            show: (params: any) => params.percent! >= 5,
            position: 'inside',
            formatter: '{c}',
            opacity: 1,
          },
          labelLine: {
            show: false,
          },
        },
      ],
    };

    if (showBack) {
      option.graphic = {
        type: 'text',
        left: 10,
        top: 10,
        z: 100,
        style: {
          text: 'Back',
          fill: '#000',
          fontSize: 14,
          fontWeight: 'bold',
        },
        cursor: 'pointer',
        onclick: () => {
          if (currentLevel > 0) {
            const prevCat = categoryKeys[currentLevel - 1];
            delete currentFilters[prevCat];
            currentLevel--;
            const newPieData = computePieData(currentLevel, currentFilters);
            updateChart(chart, newPieData, currentLevel > 0);
          }
        },
      };
    }

    chart.setOption(option, true);
  }

  // Initial pie data
  const initialPieData = computePieData(0, {});

  // Initial chart config
  const charts: echarts.EChartsOption = {
    title: {
      text: title ?? 'Drilldown Pie',
      subtext: getSubtext(),
      left: 'center',
    },
    tooltip: { trigger: 'item' },
    legend: { orient: 'vertical', left: 'left', top: 30 },
    series: [
      {
        name: '',
        type: 'pie',
        radius: '50%',
        data: initialPieData,
        label: {
          show: true,
          position: 'outside',
          formatter: '{b}: {c}',
        },
        labelLine: {
          show: true,
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
      },
      {
        name: '',
        type: 'pie',
        radius: '50%',
        data: initialPieData,
        itemStyle: {
          opacity: 0,
        },
        label: {
          show: (params: any) => params.percent! >= 5,
          position: 'inside',
          formatter: '{c}',
          opacity: 1,
        },
        labelLine: {
          show: false,
        },
      },
    ],
  };

  // Drilldown handler
  function onDrilldown(params: any, chartInstance: echarts.ECharts) {
    if (params.componentType !== 'series') return;

    const clickedName = params.data.name;
    const currentCat = categoryKeys[currentLevel];
    currentFilters[currentCat] = clickedName;
    currentLevel++;

    if (currentLevel >= categoryKeys.length) {
      console.log('Maximum drilldown level reached');
      currentLevel--; // Revert
      delete currentFilters[currentCat];
      return;
    }

    const newPieData = computePieData(currentLevel, currentFilters);
    updateChart(chartInstance, newPieData, true);
  }

  return {
    parent_table,
    chart: {
      charts,
      onDrilldown,
    },
    chartType: 'drilldown_pie',
  };
}

export function makeValueCountPie<T = any>(
  parent_table: string,
  dataset: T[],
  primaryKey: keyof T,
  secondaryKey: keyof T,
  title?: string
): ChartType {
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
    chart: {
      charts,
      onDrilldown
    },
    chartType: 'drilldown_pie',
  };
}

export function makeValueSumPie<T = any>(
  parent_table: string,
  dataset: T[],
  primaryKey: keyof T,
  secondaryKey: keyof T,
  title?: string
): ChartType {
  // Utility to humanize snake_case to Title Case
  function snakeToHuman(str: string): string {
    return str.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
  }

  // Breakdown for the key (pie data): sum values of each group
  function getSumPieData(gk: keyof T, vk: keyof T, ds: T[] = dataset) {
    const sumMap: Record<string, number> = {};
    ds.forEach(item => {
      const group = String(item[gk]);
      const val = item[vk] as unknown as number; // Assume numeric; non-numbers are skipped
      if (!group || isNaN(val)) return;
      if (group in sumMap) sumMap[group] += val;
      else sumMap[group] = val;
    });
    return Object.entries(sumMap).map(([name, value]) => ({ name: snakeToHuman(name), value, originalName: name }));
  }

  // Existing count function for drilldown
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

  const humanPrimary = snakeToHuman(String(primaryKey));
  const humanSecondary = snakeToHuman(String(secondaryKey));
  const parentData = getSumPieData(primaryKey, secondaryKey);
  const manyCategories = parentData.length > 5;

  // Chart config compatible with your interface
  const charts: echarts.EChartsOption = {
    title: {
      text: title ?? `${humanSecondary} by ${humanPrimary}`,
      left: 'center'
    },
    tooltip: { trigger: 'item' },
    legend: {
      show: !manyCategories,
      orient: 'vertical',
      left: 'left',
      top: 30
    },
    series: [
      {
        name: `${humanSecondary} by ${humanPrimary}`,
        type: 'pie',
        radius: '50%',
        data: parentData,
        label: {
          show: !manyCategories,
          position: 'outside', // Outside labels
          formatter: '{b}: {c}' // Category: value
        },
        labelLine: {
          show: !manyCategories // Connecting lines for outside labels
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          },
          label: {
            show: true,
            position: 'outside',
            formatter: '{b}: {c}'
          },
          labelLine: {
            show: true
          }
        }
      },
      {
        name: `${humanSecondary} by ${humanPrimary}`,
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
    const humanDrilldownSecondary = snakeToHuman(String(secondaryKey));
    const manySubCategories = pieData.length > 5;

    chartInstance.setOption({
      title: { text: `${params.data.name} by ${humanDrilldownSecondary}`, left: 'center' },
      legend: {
        show: !manySubCategories,
        orient: 'vertical',
        left: 'left',
        top: 30
      },
      series: [
        {
          name: `${params.data.name} by ${humanDrilldownSecondary}`,
          type: 'pie',
          radius: '50%',
          data: pieData,
          label: {
            show: !manySubCategories,
            position: 'outside', // Outside labels
            formatter: '{b}: {c}' // Category: value
          },
          labelLine: {
            show: !manySubCategories // Connecting lines for outside labels
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            },
            label: {
              show: true,
              position: 'outside',
              formatter: '{b}: {c}'
            },
            labelLine: {
              show: true
            }
          }
        },
        {
          name: `${params.data.name} by ${humanDrilldownSecondary}`,
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
    chart: {
      charts,
      onDrilldown
    },
    chartType: 'drilldown_pie',
  };
}

export function makePie<T = any>(
  parent_table: string,
  dataset: T[],
  key1: keyof T
): ChartType {
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
    chart: {
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
    },
    chartType: 'piechart'
  };
}

export function makeBar<T = any>(
  parent_table: string,
  dataset: T[],
  key1: keyof T,
  key2: keyof T
): ChartType {
  //console.log('data in makeBar function:', dataset)
  return {
    parent_table: parent_table,
    chart: {
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
}

export function makeGroupedBar<T = any>(
  parent_table: string,
  dataset: T[],
  key1: keyof T,
  groupFields: (keyof T)[],
  title: string
): ChartType {
  //console.log('data in makeGroupedBar function:', dataset)
  return {
    parent_table: parent_table,
    chart: {
      charts: {
        title: {
          text: title
        },
        tooltip: {},
        legend: {
          data: groupFields.map((field: keyof T) => snakeToHuman(field as string))
        },
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
        series: groupFields.map((groupField: keyof T) => ({
          name: snakeToHuman(groupField as string),
          type: 'bar',
          data: dataset.map((item: T) => {
            const value = item[groupField];
            return typeof value !== 'number' || value >= 0 ? value : null;
          }),
        })),
      }
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

type PB_Record_Type = {
  collectionId: string;
  collectionName: string;
  id: string;
  [key: string]: string | number | Date;
};

function isInvalid(data: any) {
  if (data === undefined || data === null) return true
  return false
}

export function splitTableData(tablesData: TableDataResult, tableName: string) {
  const data = tablesData[tableName].items;
  if (isInvalid(data)) return null
  return data
}

export function mapTableData(data: PB_Record_Type[], field: string) {
  if (data === null || typeof data === 'undefined') {
    return null;
  }
  if (Array.isArray(data)) {
    return data.map((row: any) => row[field]);
  } else if (typeof data === 'object') {
    return data[field];
  } else {
    // If primitive, return it directly (or null if it doesn't make sense for your use case)
    return data;
  }
}

export function splitAndMapTable(tableData: TableDataResult, tableName: string, field: string) {
  const table = splitTableData(tableData, tableName);
  return mapTableData(table, field);
}

export function splitExpandedMapTable(tableData: TableDataResult, tableName: string, chosenSubtable: string, field: string) {
  const table = splitSubtables(tableData, tableName)[chosenSubtable]
  return mapTableData(table, field);
}

export function splitSubtables(tablesData: TableDataResult, tableName: string) {
  const data = splitTableData(tablesData, tableName)[0]
  if (isInvalid(data)) return null
  return data.expand;
}

export function selectSplitSubtable(tableData: TableDataResult, tableName: string, chosenSubtable: string) {
  const subtables = splitSubtables(tableData, tableName);
  if (subtables === null || !(chosenSubtable in subtables)) {
    return null;
  }
  const data = subtables[chosenSubtable];
  if (isInvalid(data)) {
    return null;
  }
  return data;
}

export function mapSelectedSubtable(tableData: TableDataResult, tableName: string, chosenSubtable: string, field: string) {
  const data = selectSplitSubtable(tableData, tableName, chosenSubtable)
  return data
}

export function safeSelectObjectField<T extends Object>(table: T, field: keyof T) {
  const data = table[field]
  if (isInvalid(data)) return null
  return data
}

function accumulateArray(numArray: number[]) {
  return numArray
    .reduce((accumulator: number, val) => accumulator + val, 0)
}

export function accumulateMappedFieldSubtable(tableData: TableDataResult, tableName: string, chosenSubtable: string, field: string) {
  const data = selectSplitSubtable(tableData, tableName, chosenSubtable);
  if (data === null) {
    return null;
  }
  const mappedData = mapTableData(data, field);
  if (mappedData === null) {
    return null;
  }
  if (typeof mappedData === 'number') {
    return mappedData;
  }
  if (Array.isArray(mappedData)) {
    return accumulateArray(mappedData as number[]);
  }
  return null;
}

export function accumulateMappedField(tableData: TableDataResult, tableName: string, field: string) {
  const data = splitAndMapTable(tableData, tableName, field)
  return accumulateArray(data)
}
