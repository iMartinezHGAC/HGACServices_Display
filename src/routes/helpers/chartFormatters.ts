import * as echarts from "echarts"
import { snakeToHuman } from "./caseConversion"
import type { ProgramType, CustomEchartType, TableDataResult, ChartType, IndicatorType, EventType } from "../../ambient";


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

import type { EChartsOption, DefaultLabelFormatterCallbackParams } from 'echarts';

// Reusable number formatter with comma separators
const formatNumber = (value: number | string | undefined): string => {
  if (value === undefined || value === null) return '0';
  const num = Number(value);
  return isNaN(num) ? '0' : num.toLocaleString('en-US');
};

// Reusable label formatter
const createLabelFormatter = (showName = true) => {
  return (params: DefaultLabelFormatterCallbackParams) => {
    let valueStr = formatNumber(params.value ?? 0);
    if ((params.data as any)?.isMoney) {
      valueStr = '$' + valueStr;
    }
    return showName
      ? `${params.name}: ${valueStr}`
      : valueStr;
  };
};

// Reusable tooltip formatter
const tooltipFormatter = (params: DefaultLabelFormatterCallbackParams | DefaultLabelFormatterCallbackParams[]) => {
  const formatOne = (p: DefaultLabelFormatterCallbackParams) => {
    let valueStr = formatNumber(p.value ?? 0);
    if ((p.data as any)?.isMoney) {
      valueStr = '$' + valueStr;
    }
    return `${p.name}: ${valueStr} (${p.percent ?? 0}%)`;
  };

  if (Array.isArray(params)) {
    return params.map(formatOne).join('<br/>');
  }
  return formatOne(params);
};

// Optional: Inner label formatter with percentage
const innerLabelFormatter = (params: DefaultLabelFormatterCallbackParams) => {
  let valueStr = formatNumber(params.value ?? 0);
  if ((params.data as any)?.isMoney) {
    valueStr = '$' + valueStr;
  }
  return `${valueStr}\n(${params.percent ?? 0}%)`;
};

const monetaryKeywords = [
  'cost', 'dollar', 'budget', 'price', 'revenue',
  'expense', 'amount', 'fee', 'charge', 'payment',
  'spend', 'profit', 'loss', 'income', 'sale', 'total'
];

const isMonetary = (key: string): boolean => {
  const lower = key.toLowerCase();
  return monetaryKeywords.some(kw => lower.includes(kw));
};


/**
 * Revised Hierarchical Category Donut Chart
 * 
 * Key fixes for rendering issues:
 * - Single title object (with subtext for breadcrumb/level info) instead of multiple titles – avoids potential conflicts.
 * - Center total displayed via graphic elements (standard/reliable way for donut holes).
 * - Back button as clickable graphic (only when drilled down).
 * - Immediate visible donut on load with real data.
 * - Supports arbitrary depth (your 4 levels).
 * - Counts projects, handles empty values as "Uncategorized".
 * 
 * This should now render properly even with your current component (initial view visible immediately).
 * 
 * Note on your component: It currently blocks clicks after the first drilldown (isDrilledDown guard).
 * For full multi-level drilldown, remove these lines from your component:
 *   if (isDrilledDown) return;
 *   isDrilledDown = true;
 * The chart's own "← Back" graphic will then handle step-by-step navigation.
 * Your existing "Back" button will still restore to the root view.
 */
export function makeHierarchicalCategoryDonut<T = any>(
  parent_table: string,
  dataset: T[],
  categoryKeys: (keyof T)[],
  title?: string
): ChartType {
  if (categoryKeys.length === 0) {
    throw new Error('At least one category key is required.');
  }

  function snakeToHuman(str: string): string {
    return str.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
  }

  let currentLevel = 0;
  let currentFilters: Record<string, string> = {};

  function getFilteredData(): T[] {
    return dataset.filter((item: any) => {
      return Object.entries(currentFilters).every(([key, val]) => String(item[key] ?? '') === val);
    });
  }

  function computePieData(): { name: string; value: number }[] {
    const filtered = getFilteredData();
    if (currentLevel >= categoryKeys.length || filtered.length === 0) return [];

    const currentCat = categoryKeys[currentLevel];
    const countMap: Record<string, number> = {};

    filtered.forEach((item: any) => {
      let val = String(item[currentCat] ?? '').trim();
      if (!val) val = 'Uncategorized';
      countMap[val] = (countMap[val] || 0) + 1;
    });

    const entries = Object.entries(countMap);
    entries.sort(([, a], [, b]) => b - a); // Descending by count

    return entries.map(([rawName, value]) => ({
      name: rawName, // Keep original (assume data has readable strings like "Roadway")
      value
    }));
  }

  function getBreadcrumb(): string {
    const parts: string[] = [];
    for (let i = 0; i < currentLevel; i++) {
      const catKey = categoryKeys[i];
      const val = currentFilters[String(catKey)];
      if (val) {
        parts.push(`${snakeToHuman(String(catKey))}: ${val}`);
      }
    }
    return parts.join(' > ');
  }

  function buildOption(pieData: { name: string; value: number }[], filteredCount: number, showBack: boolean): echarts.EChartsOption {
    const breadcrumb = getBreadcrumb();
    const levelText = currentLevel === 0
      ? `By ${snakeToHuman(String(categoryKeys[0]))}`
      : breadcrumb;

    const graphicElements: any[] = [
      // Center total count
      {
        type: 'text',
        left: 'center',
        top: '40%',
        style: {
          text: filteredCount.toString(),
          font: 'bold 36px sans-serif',
          fill: '#333'
        }
      },
      {
        type: 'text',
        left: 'center',
        top: '55%',
        style: {
          text: 'Total Projects',
          font: '14px sans-serif',
          fill: '#999'
        }
      }
    ];

    if (showBack) {
      graphicElements.push({
        type: 'text',
        left: 20,
        top: 20,
        style: {
          text: '← Back',
          font: '16px sans-serif',
          fontWeight: 'bold',
          fill: '#000',
          cursor: 'pointer'
        },
        onclick: () => {
          if (currentLevel > 0) {
            const catToRemove = categoryKeys[currentLevel - 1];
            delete currentFilters[String(catToRemove)];
            currentLevel--;
            const newPieData = computePieData();
            const newFilteredCount = getFilteredData().length;
            chartInstance?.setOption(buildOption(newPieData, newFilteredCount, currentLevel > 0));
          }
        }
      });
    }

    return {
      title: {
        text: title ?? 'Projects by Category',
        subtext: levelText,
        left: 'center',
        top: 10,
        textStyle: { fontSize: 16, fontWeight: 'bold' },
        subtextStyle: { fontSize: 14, color: '#666' }
      },
      graphic: graphicElements,
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => `${params.name}: ${params.value} projects (${params.percent?.toFixed(1)}%)`
      },
      legend: { orient: 'horizontal', left: 'left', bottom: 10 },
      series: [
        {
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['50%', '50%'],
          data: pieData,
          emphasis: {
            itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)' }
          },
          label: {
            show: true,
            position: 'outside',
            formatter: '{b}\n{c} projects ({d}%)'
          },
          labelLine: { show: true }
        },
        {
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['50%', '50%'],
          data: pieData,
          itemStyle: { opacity: 0 },
          label: {
            show: (params: any) => (params.percent ?? 0) >= 5,
            position: 'inside',
            formatter: '{c}',
            fontWeight: 'bold',
            color: '#fff'
          },
          labelLine: { show: false }
        }
      ]
    };
  }

  // Initial setup
  const initialPieData = computePieData();
  const initialFilteredCount = getFilteredData().length;

  const charts: echarts.EChartsOption = buildOption(initialPieData, initialFilteredCount, false);

  let chartInstance: echarts.ECharts | null = null;

  function onDrilldown(params: any, instance: echarts.ECharts) {
    chartInstance = instance;

    if (params.componentType !== 'series' || currentLevel >= categoryKeys.length - 1) return;

    const clickedName = params.name;
    const currentCat = categoryKeys[currentLevel];
    currentFilters[String(currentCat)] = clickedName;
    currentLevel++;

    const newPieData = computePieData();
    const newFilteredCount = getFilteredData().length;
    const newOption = buildOption(newPieData, newFilteredCount, true);

    instance.setOption(newOption);
  }

  return {
    parent_table,
    chart: {
      charts,
      onDrilldown
    },
    chartType: 'drilldown_donut'
  };
}

/**
 * Creates a drilldown pie chart showing project counts (not funding) by program/plan,
 * with drilldown to project counts by project_type.
 * Tooltips show total funding + top 5 projects (by funding) + "and X more".
 * @param parent_table - Internal reference name
 * @param dataset - Renamed data structure (e.g., combinedA with RTP, 10_year, TIP, LET)
 * @param title - Optional title for parent chart
 * @returns ChartType with drilldown
 */
export function makeProjectCountDrilldownPie<T = any>(
  parent_table: string,
  dataset: T[],
  title?: string
): ChartType {
  function snakeToHuman(str: string): string {
    return str
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase())
      .trim();
  }

  const totalFundingMap: Record<string, number> = {};
  const countMap: Record<string, number> = {};
  const projectsMap: Record<string, { name: string; funding: number }[]> = {};
  const itemsMap: Record<string, any[]> = {};

  dataset.forEach((group) => {
    if (typeof group === 'object' && group !== null) {
      Object.entries(group).forEach(([programKey, info]: [string, any]) => {
        if (info && Array.isArray(info.items)) {
          const items = info.items;
          itemsMap[programKey] = items;

          let totalFunding = 0;
          const projs: { name: string; funding: number }[] = [];

          items.forEach((item: any) => {
            const funding = Number(item.funding) || 0;
            totalFunding += funding;
            const name = item.project_name?.trim() || 'Unnamed Project';
            projs.push({ name, funding });
          });

          projs.sort((a, b) => b.funding - a.funding);

          totalFundingMap[programKey] = totalFunding;
          countMap[programKey] = items.length;
          projectsMap[programKey] = projs;
        }
      });
    }
  });

  const programs = Object.keys(projectsMap);

  let parentData = programs.map((key) => ({
    name: snakeToHuman(key),
    value: countMap[key],
    totalFunding: totalFundingMap[key],
    projects: projectsMap[key],
  }));

  parentData.sort((a, b) => b.value - a.value);

  function getProjectTypeData(programKey: string): any[] {
    const items = itemsMap[programKey] || [];
    if (items.length === 0) return [];

    const typeMap: Record<
      string,
      { count: number; totalFunding: number; projects: { name: string; funding: number }[] }
    > = {};

    items.forEach((item: any) => {
      let ptype = item.project_type?.trim() || 'Other';
      if (ptype === 'NULL' || ptype === '') ptype = 'Other';

      if (!typeMap[ptype]) {
        typeMap[ptype] = { count: 0, totalFunding: 0, projects: [] };
      }

      const funding = Number(item.funding) || 0;
      typeMap[ptype].totalFunding += funding;
      typeMap[ptype].count += 1;
      const name = item.project_name?.trim() || 'Unnamed Project';
      typeMap[ptype].projects.push({ name, funding });
    });

    Object.values(typeMap).forEach((group) => {
      group.projects.sort((a, b) => b.funding - a.funding);
    });

    let pieData = Object.keys(typeMap).map((ptype) => ({
      name: snakeToHuman(ptype),
      value: typeMap[ptype].count,
      totalFunding: typeMap[ptype].totalFunding,
      projects: typeMap[ptype].projects,
    }));

    pieData.sort((a, b) => b.value - a.value);
    return pieData;
  }

  // Tooltip – now shows count + total funding + top 5 (by funding) + "and X more"
  function tooltipFormatter(params: any): string {
    const name = params.name || 'Unknown';
    const count = params.value ?? 0;
    const totalFunding = params.data?.totalFunding ?? 0;
    const projects: { name: string; funding: number }[] = params.data?.projects ?? [];

    let html = `<div style="font-weight: bold; font-size: 14px;">${name}</div>`;
    html += count === 1
      ? `<div>${count} project</div>`
      : `<div>${count} projects</div>`;
    html += `<div>Total Funding: <strong>$${totalFunding.toLocaleString()}</strong></div><br/>`;
    html += `<div style="font-size: 13px; font-weight: bold;">Projects:</div>`;

    if (projects.length === 0) {
      html += `<div>No projects</div>`;
    } else {
      const displayed = projects.slice(0, 5);
      displayed.forEach((p: any, idx: number) => {
        html += `<div>${idx + 1}. ${p.name} — $${p.funding.toLocaleString()}</div>`;
      });
      const remaining = projects.length - 5;
      if (remaining > 0) {
        html += `<div style="margin-top: 4px; font-style: italic;">and ${remaining} more</div>`;
      }
    }
    return html;
  }

  // Label formatters – now show project counts
  const outerLabelFormatter = (params: echarts.DefaultLabelFormatterCallbackParams) => {
    const name = params.name as string;
    const count = params.value as number;
    const percent = params.percent?.toFixed(1) ?? '0';
    return `${name}\n${count} projects\n(${percent}%)`;
  };

  const innerLabelFormatter = (params: echarts.DefaultLabelFormatterCallbackParams) => {
    return (params.value as number).toString();
  };

  const charts: echarts.EChartsOption = {
    title: {
      text: title ?? 'Number of Projects by Program/Plan',
      left: 'center',
      top: 4,
    },
    tooltip: {
      trigger: 'item',
      formatter: tooltipFormatter,
      confine: true,
    },
    legend: { orient: 'horizontal', left: 'left', bottom: 10 },
    series: [
      {
        type: 'pie',
        radius: '70%', // Solid pie (no donut hole)
        center: ['50%', '50%'],
        data: parentData,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
        label: {
          show: true,
          position: 'outside',
          formatter: outerLabelFormatter,
        },
        labelLine: {
          show: true,
        },
      },
      {
        type: 'pie',
        radius: '70%',
        center: ['50%', '50%'],
        data: parentData,
        itemStyle: { opacity: 0 },
        label: {
          show: (params: any) => (params.percent ?? 0) >= 5,
          position: 'inside',
          formatter: innerLabelFormatter,
          fontWeight: 'bold',
          color: '#fff',
        },
        labelLine: { show: false },
      },
    ],
  };

  function onDrilldown(params: any, chartInstance: echarts.ECharts) {
    const currentOption = chartInstance.getOption();
    const currentTitle = (currentOption.title as any[])[0]?.text || '';
    if (currentTitle.includes('by Project Type')) {
      return; // Already at child level
    }

    const clickedName = params.name;
    const programKey = programs.find((k) => snakeToHuman(k) === clickedName);
    if (!programKey) return;

    const childData = getProjectTypeData(programKey);
    if (childData.length === 0) return;

    chartInstance.setOption({
      title: {
        text: `${clickedName} — Number of Projects by Project Type`,
        left: 'center',
        top: 20,
      },
      series: [
        {
          type: 'pie',
          radius: '70%',
          center: ['50%', '50%'],
          data: childData,
          label: {
            show: true,
            position: 'outside',
            formatter: outerLabelFormatter,
          },
          labelLine: { show: true },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
        },
        {
          type: 'pie',
          radius: '70%',
          center: ['50%', '50%'],
          data: childData,
          itemStyle: { opacity: 0 },
          label: {
            show: (params: any) => (params.percent ?? 0) >= 5,
            position: 'inside',
            formatter: innerLabelFormatter,
            fontWeight: 'bold',
            color: '#fff',
          },
          labelLine: { show: false },
        },
      ],
    });
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
//chartFormatters.ts
export function makeDrilldownDonut<T = any>(
  parent_table: string,
  dataset: T | T[] | null,
  keys: (keyof T)[],
  title?: string,
  centerText?: string
): ChartType {
  // Normalize dataset to always be an array, handling null/undefined and filtering out null items
  let dataArray: T[] = [];
  if (dataset) {
    dataArray = (Array.isArray(dataset) ? dataset : [dataset]).filter(item => item !== null && item !== undefined);
  }

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
    legend: { orient: 'horizontal', left: 'left', bottom: 10 },
    series: [
      {
        name: '',
        type: 'pie',
        radius: ['40%', '70%'], // Donut
        data: parentData,
        label: {
          show: true,
          position: 'outside',
          formatter: createLabelFormatter(true)
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
          formatter: createLabelFormatter(true),
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
            formatter: createLabelFormatter(true)
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
            formatter: createLabelFormatter(true),
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
    return {
      name: snakeToHuman(String(key)),
      value: total,
      isMoney: isMonetary(String(key))
    };
  });

  // Sort parent slices by value descending (largest first)
  parentData.sort((a, b) => b.value - a.value);

  // Breakdown for a specific key (child pie)
  function getSingleKeyPieData(k: keyof T) {
    const countMap: Record<string, number> = {};
    dataset.forEach(item => {
      const val = String(item[k]);
      if (!val) return;
      countMap[val] = (countMap[val] || 0) + 1;
    });

    let entries = Object.entries(countMap);

    // Sort logic
    if (isMonetary(String(k))) {
      // For monetary fields: sort by the numeric amount ascending
      entries.sort(([a], [b]) => Number(a) - Number(b));
    } else {
      // For non-monetary: sort by count descending
      entries.sort(([, a], [, b]) => b - a);
    }

    // Format names (add $ and commas for monetary fields)
    const pieData = entries.map(([rawName, value]) => {
      let name = rawName;
      if (isMonetary(String(k))) {
        const num = Number(rawName);
        if (!isNaN(num)) {
          name = '$' + formatNumber(num);
        }
      }
      return { name, value };
    });

    return pieData;
  }

  console.log(`chart log ${parent_table}`, dataset);
  console.log('pie data', parentData);

  // Chart config compatible with your interface
  const charts: echarts.EChartsOption = {
    title: {
      text: title ?? keys.map(k => snakeToHuman(String(k))).join(' vs '),
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: tooltipFormatter
    },
    legend: { orient: 'horizontal', left: 'left', bottom: 10 },
    series: [
      {
        name: '',
        type: 'pie',
        radius: '50%',
        data: parentData,
        label: {
          show: true,
          position: 'outside',
          formatter: createLabelFormatter(true)
        },
        labelLine: {
          show: true
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
          opacity: 0
        },
        label: {
          show: function(params: any) {
            return params.percent! >= 5;
          },
          position: 'inside',
          formatter: innerLabelFormatter,
          opacity: 1
        },
        labelLine: {
          show: false
        }
      }
    ]
  };

  // Drilldown function available for controller to register
  function onDrilldown(params: any, chartInstance: echarts.ECharts) {
    const keyClicked = params.data.name;
    const originalKey = keys.find(k => snakeToHuman(String(k)) === keyClicked);
    if (!originalKey) return;

    const pieData = getSingleKeyPieData(originalKey);

    chartInstance.setOption({
      title: { text: snakeToHuman(String(originalKey)), left: 'center' },
      legend: { show: true },
      tooltip: {
        trigger: 'item',
        formatter: tooltipFormatter
      },
      series: [
        {
          name: snakeToHuman(String(originalKey)),
          type: 'pie',
          radius: '50%',
          data: pieData,
          label: {
            show: true,
            position: 'outside',
            formatter: createLabelFormatter(true)
          },
          labelLine: {
            show: true
          }
        },
        {
          name: snakeToHuman(String(originalKey)) + ' (Inside Labels)',
          type: 'pie',
          radius: '50%',
          data: pieData,
          itemStyle: {
            opacity: 0
          },
          label: {
            show: function(params: any) {
              return params.percent! >= 5;
            },
            position: 'inside',
            formatter: innerLabelFormatter,
            opacity: 1
          },
          labelLine: {
            show: false
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
    legend: { orient: 'horizontal', left: 'left', bottom: 10 },
    series: [
      {
        name: '',
        type: 'pie',
        radius: '50%',
        data: parentData,
        label: {
          show: true,
          position: 'outside', // Outside labels always shown
          formatter: createLabelFormatter(true) // Category: value
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
          formatter: innerLabelFormatter, // Value inside
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
      legend: { orient: 'horizontal', left: 'left', bottom: 10 },
      series: [
        {
          name: snakeToHuman(originalTable),
          type: 'pie',
          radius: '50%',
          data: pieData,
          label: {
            show: true,
            position: 'outside', // Outside labels always shown
            formatter: createLabelFormatter(true) // Category: value
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
            formatter: innerLabelFormatter, // Value inside
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
      legend: { orient: 'horizontal', left: 'center', top: 10 },
      series: [
        {
          name: '',
          type: 'pie',
          radius: '50%',
          data: pieData,
          label: {
            show: true,
            position: 'outside',
            formatter: createLabelFormatter(true),
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
            formatter: innerLabelFormatter, // Value inside
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
    legend: { orient: 'horizontal', left: 'left', bottom: 10 },
    series: [
      {
        name: '',
        type: 'pie',
        radius: '50%',
        data: initialPieData,
        label: {
          show: true,
          position: 'outside',
          formatter: createLabelFormatter(true),
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
          formatter: innerLabelFormatter,
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

  function getValueCountPieData(k: keyof T, ds: T[] = dataset) {
    if (!ds) {
      return [];
    }
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
    legend: { orient: 'horizontal', left: 'left', bottom: 10 },
    series: [
      {
        name: humanPrimary,
        type: 'pie',
        radius: '50%',
        data: parentData,
        label: {
          show: true,
          position: 'outside', // Outside labels always shown
          formatter: createLabelFormatter(true) // Category: value
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
          formatter: innerLabelFormatter,
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
            formatter: createLabelFormatter(true) // Category: value
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
            formatter: innerLabelFormatter,
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
      orient: 'horizontal',
      left: 'left',
      bottom: 10
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
          formatter: createLabelFormatter(true) // Category: value
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
            formatter: createLabelFormatter(true)
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
          formatter: innerLabelFormatter,
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
        orient: 'horizontal', left: 'left', bottom: 10
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
            formatter: createLabelFormatter(true) // Category: value
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
              formatter: createLabelFormatter(true)
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
            formatter: innerLabelFormatter,
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

export function makeValueSumPieTop10<T = any>(
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

  // Breakdown for drilldown: count of each secondary value in the selected group(s)
  function getValueCountPieData(k: keyof T, ds: T[] = dataset) {
    const countMap: Record<string, number> = {};
    ds.forEach(item => {
      const val = String(item[k]);
      if (!val) return;
      if (val in countMap) countMap[val]++;
      else countMap[val] = 1;
    });
    return Object.entries(countMap).map(([name, value]) => ({ name: snakeToHuman(name), value, originalName: name }));
  }

  const humanPrimary = snakeToHuman(String(primaryKey));
  const humanSecondary = snakeToHuman(String(secondaryKey));

  // Compute summed data
  const sumMap: Record<string, number> = {};
  dataset.forEach(item => {
    const group = String(item[primaryKey]);
    const val = Number(item[secondaryKey]);
    if (!group || isNaN(val)) return;
    sumMap[group] = (sumMap[group] || 0) + val;
  });

  // Build raw pie data with humanized names
  let rawPieData = Object.entries(sumMap)
    .map(([originalName, value]) => ({
      name: snakeToHuman(originalName),
      value,
      originalName
    }))
    .filter(d => d.value > 0); // Skip zero-value categories

  // Sort descending by value
  rawPieData.sort((a, b) => b.value - a.value);

  // Build final parent data: top 10 + "Other" if needed
  const topCount = 10;
  let parentData: any[] = [];
  let otherOriginals: string[] = [];

  if (rawPieData.length <= topCount) {
    parentData = rawPieData;
  } else {
    const topItems = rawPieData.slice(0, topCount);
    parentData = topItems;

    const otherItems = rawPieData.slice(topCount);
    const otherSum = otherItems.reduce((acc, d) => acc + d.value, 0);

    if (otherSum > 0) {
      otherOriginals = otherItems.map(d => d.originalName);
      parentData.push({
        name: "Other",
        value: otherSum,
        originals: otherOriginals, // Custom property to identify "Other" group
        itemStyle: {
          color: '#aaaaaa'  // Fixed grey color for "Other" slice
        }
      });
    }
  }

  const manyCategories = parentData.length > topCount;

  // Chart config
  const charts: echarts.EChartsOption = {
    title: {
      text: title ?? `${humanSecondary} by ${humanPrimary}`,
      left: 'center'
    },
    tooltip: { trigger: 'item' },
    legend: {
      orient: 'horizontal',
      left: 'left',
      bottom: 10
    },
    series: [
      {
        name: `${humanSecondary} by ${humanPrimary}`,
        type: 'pie',
        radius: '50%',
        data: parentData,
        label: {
          show: !manyCategories,
          position: 'outside',
          formatter: createLabelFormatter(true)
        },
        labelLine: {
          show: !manyCategories
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
            formatter: createLabelFormatter(true)
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
          opacity: 0
        },
        label: {
          show: function(params: any) {
            return params.percent! >= 5;
          },
          position: 'inside',
          formatter: innerLabelFormatter,
          opacity: 1
        },
        labelLine: {
          show: false
        }
      }
    ]
  };

  // Drilldown handler
  function onDrilldown(params: any, chartInstance: echarts.ECharts) {
    const data = params.data;

    let filteredDataset: T[] = [];
    let drillTitle: string = "";

    if (data.originals && Array.isArray(data.originals)) {
      // "Other" group – combine all small categories
      const origs: string[] = data.originals;
      filteredDataset = dataset.filter(item => origs.includes(String(item[primaryKey])));
      drillTitle = "Other Categories";
    } else if (data.originalName) {
      // Individual top-10 category
      const originalVal = data.originalName;
      filteredDataset = dataset.filter(item => String(item[primaryKey]) === originalVal);
      drillTitle = data.name;
    } else {
      return; // No drilldown possible
    }

    if (filteredDataset.length === 0) return;

    const pieData = getValueCountPieData(secondaryKey, filteredDataset);
    const humanDrilldownSecondary = snakeToHuman(String(secondaryKey));
    const manySubCategories = pieData.length > 5;

    chartInstance.setOption({
      title: { text: `${drillTitle} by ${humanDrilldownSecondary}`, left: 'center' },
      legend: {
        show: !manySubCategories,
        orient: 'horizontal',
        left: 'left',
        bottom: 10
      },
      series: [
        {
          name: `${drillTitle} by ${humanDrilldownSecondary}`,
          type: 'pie',
          radius: '50%',
          data: pieData,
          label: {
            show: !manySubCategories,
            position: 'outside',
            formatter: createLabelFormatter(true)
          },
          labelLine: {
            show: !manySubCategories
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
              formatter: createLabelFormatter(true)
            },
            labelLine: {
              show: true
            }
          }
        },
        {
          name: `${drillTitle} by ${humanDrilldownSecondary}`,
          type: 'pie',
          radius: '50%',
          data: pieData,
          itemStyle: {
            opacity: 0
          },
          label: {
            show: function(params: any) {
              return params.percent! >= 5;
            },
            position: 'inside',
            formatter: innerLabelFormatter,
            opacity: 1
          },
          labelLine: {
            show: false
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
        legend: { orient: 'horizontal', left: 'left', bottom: 10 },
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

export function splitTableData(tablesData: TableDataResult, tableName: string): any[] {
  // Safely access items, default to empty array if table or items missing/malformed
  const items = tablesData?.[tableName]?.items;
  return Array.isArray(items) ? items : [];
  // Removed the isInvalid check + null return – charts handle empty arrays better than null
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
  const splitData = splitTableData(tablesData, tableName);
  if (!splitData || !Array.isArray(splitData) || splitData.length === 0) return null;
  const data = splitData[0];
  if (isInvalid(data)) return null;
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

export function safeSelectObjectField<T extends Object>(table: T | null | undefined, field: keyof T) {
  if (!table) return null;
  const data = table[field];
  if (isInvalid(data)) return null;
  return data;
}

export function accumulateArray(numArray: number[] | null) {
  return numArray?.reduce((accumulator: number, val) => accumulator + val, 0) ?? 0;
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

export function collectAllSubrecords(tablesData: TableDataResult, tableName: string, subtable: string): PB_Record_Type[] {
  const items = splitTableData(tablesData, tableName);
  if (!items) return [];
  return items.reduce((acc: PB_Record_Type[], item: any) => {
    if (item.expand && item.expand[subtable]) {
      const sub = item.expand[subtable];
      if (Array.isArray(sub)) {
        acc.push(...sub);
      } else {
        acc.push(sub);
      }
    }
    return acc;
  }, []);
}


export function isChartEmptyOrAllZero(chartType: ChartType): boolean {
  const customEchart = chartType.chart;
  if (!customEchart || !customEchart.charts) {
    return true;
  }

  const option: echarts.EChartsOption = customEchart.charts;
  let series = option.series;
  if (!series) {
    return true;
  }

  if (!Array.isArray(series)) {
    series = [series];
  }

  if (series.length === 0) {
    return true;
  }



  for (const ser of series) {
    const data = ser.data;
    if (data && Array.isArray(data) && data.length > 0 && hasNonZeroNumber(data)) {
      return false;
    }
  }

  return true;
}

function hasNonZeroNumber(item: any): boolean {
  if (typeof item === 'number') {
    return item !== 0;
  }
  if (Array.isArray(item)) {
    return item.some(hasNonZeroNumber);
  }
  if (typeof item === 'object' && item !== null) {
    return Object.values(item).some(hasNonZeroNumber);
  }
  return false;
}

export function isIndicatorEmptyOrZero(indicator: IndicatorType | undefined): boolean {
  if (!indicator || indicator.indicatorVal == null) {
    return true;
  }
  const val = indicator.indicatorVal;
  if (typeof val === 'number') {
    return val === 0;
  } else { // string
    const trimmed = val.trim();
    return trimmed === '' || trimmed === '0';
  }
}

export function isTableEmptyOrAllZero(table: PB_Record_Type | EventType[] | undefined): boolean {
  if (!table) {
    return true;
  }
  return !hasNonZeroNumber(table);
}

export function isChartAndIndicatorEmptyOrZero(chartType: ChartType): boolean {
  return isChartEmptyOrAllZero(chartType) && isIndicatorEmptyOrZero(chartType.indicator);
}

export function isAllComponentsEmptyOrZero(chartType: ChartType): boolean {
  return isChartEmptyOrAllZero(chartType) && isIndicatorEmptyOrZero(chartType.indicator) && isTableEmptyOrAllZero(chartType.table);
}

export function areAllChartsEmptyOrZero(chartTypes: ChartType[]): boolean {
  return chartTypes.every(isAllComponentsEmptyOrZero);
}
