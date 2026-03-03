import * as echarts from "echarts";
import { snakeToHuman } from "./caseConversion";
import type {
  ProgramType,
  CustomEchartType,
  TableDataResult,
  ChartType,
  IndicatorType,
  EventType,
  AdworkType,
} from "../../ambient";

import type { EChartsOption, DefaultLabelFormatterCallbackParams } from "echarts";


export function toTitleCase(str: string): string {
  if (!str) return '';

  return str
    .replace(/_/g, ' ')                    // snake_case → spaces
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2') // camelCase → spaces
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Reusable transformation for callout names (TIP / RTP / TSM).
 * 
 * - "Tip" / "tip" / "TIP" → display: "TIP", legend: "Transportation Improvement Programs"
 * - "Rtp" / "rtp" / "RTP" → display: "RTP", legend: "Regional Transportation Projects"
 * - "Tsm" / "tsm" / "TSM" → display: "TSM", legend: "Transportation Planning Studies."
 * 
 * Falls back to cleanCategoryName for everything else.
 * Drop this into your shared utils (e.g. src/lib/utils/charts.ts) and reuse
 * in any pie, table, or filter component across your Svelte 5 + Tailwind + PocketBase app.
 */
export function getCalloutDisplayInfo(value: string): { display: string; full: string } {
  const cleaned = cleanCategoryName(String(value), true);
  if (!cleaned) {
    return { display: '', full: '' };
  }

  const lower = cleaned.toLowerCase().trim();

  switch (lower) {
    case 'tip':
      return { display: 'TIP', full: 'Transportation Improvement Programs' };
    case 'rtp':
      return { display: 'RTP', full: 'Regional Transportation Projects' };
    case 'tsm':
      return { display: 'TSM', full: 'Transportation Systems Manangement' };
    case 'let':
      return { display: 'LET', full: 'Let for Construction' };
    case '10_year_plan':
      return { display: '10-Year', full: '10-Year' };
    default:
      const titleCased = toTitleCase(cleaned);
      return { display: titleCased, full: titleCased };
  }
}



/**
 * Normalizes a category name by:
 * - Trimming leading/trailing whitespace
 * - Collapsing multiple consecutive spaces into a single space
 * - Optionally converting to a consistent case (default: title case via snakeToHuman)
 * 
 * @param value The raw category value (string or anything convertible to string)
 * @param humanize Whether to apply snakeToHuman after cleaning (default: true)
 * @returns Cleaned and optionally humanized string, or empty string if input was falsy
 */
export function cleanCategoryName(
  value: any,
  humanize: boolean = true
): string {
  if (value == null) return ""; // null, undefined → empty

  let str = String(value).trim();           // Remove leading/trailing whitespace
  if (!str) return "";                      // After trim it's empty → return empty

  str = str.replace(/\s+/g, " ");           // Collapse all whitespace sequences → single space

  // Optional: apply snakeToHuman (which also capitalizes words)
  if (humanize) {
    str = snakeToHuman(str);
  }

  return str;
}


// === Shared Formatters ===
const formatNumber = (value: number | string | undefined): string => {
  if (value === undefined || value === null) return "0";
  const num = Number(value);
  return isNaN(num) ? "0" : num.toLocaleString("en-US");
};

const createLabelFormatter = (showName = true, addDollar = false) => {
  return (params: DefaultLabelFormatterCallbackParams) => {
    let valueStr = formatNumber(params.value ?? 0);
    if (addDollar || (params.data as any)?.isMoney) {
      valueStr = "$" + valueStr;
    }
    return showName ? `${params.name}: ${valueStr}` : valueStr;
  };
};

const innerLabelFormatter = (params: DefaultLabelFormatterCallbackParams) => {
  let valueStr = formatNumber(params.value ?? 0);
  if ((params.data as any)?.isMoney) {
    valueStr = "$" + valueStr;
  }
  return valueStr;
};


const monetaryKeywords = [
  "cost", "dollar", "budget", "price", "revenue", "expense", "amount",
  "fee", "charge", "payment", "spend", "profit", "loss", "income", "sale", "total",
  "grant_dollars", "dollars", "funding"];

const isMonetary = (key: string): boolean => {
  const lower = key.toLowerCase();
  return monetaryKeywords.some((kw) => lower.includes(kw));
};

const createOuterFormatter = (forceMonetary = false) => (p: any) => {
  const name = p.name || "Unknown";
  let valueStr = formatNumber(p.value ?? 0);

  if (forceMonetary || isMonetary(name)) {
    valueStr = "$" + valueStr;
  }

  if (typeof p.value === "string") return `${p.percent?.toFixed(1)}%`;
  return `${valueStr} (${p.percent?.toFixed(1)}%)`;
};

// ✅ FIXED tooltipFormatter – now checks the slice NAME directly
// (bypasses any stripping that getStandardPieSeries might do)
const tooltipFormatter = (
  params: DefaultLabelFormatterCallbackParams | DefaultLabelFormatterCallbackParams[]
) => {
  const formatOne = (p: DefaultLabelFormatterCallbackParams) => {
    let valueStr = formatNumber(p.value ?? 0);

    if (isMonetary(p.name)) {
      valueStr = "$" + valueStr;
    }

    return `${p.name}: ${valueStr} (${p.percent ?? 0}%)`;
  };

  return Array.isArray(params)
    ? params.map(formatOne).join("<br/>")
    : formatOne(params);
};


// === No-Data Option ===
const getNoDataOption = (mainTitle?: string, subtext?: string): EChartsOption => ({
  title: {
    text: mainTitle ?? "Chart",
    subtext: subtext ?? "No data available",
    left: "center",
    top: 20,
    textStyle: { fontSize: 16, fontWeight: "bold" },
    subtextStyle: { fontSize: 14, color: "#999" },
  },
  graphic: {
    type: "text",
    left: "center",
    top: "50%",
    style: {
      text: "No data available",
      fontSize: 20,
      fill: "#ccc",
    },
  },
});

const monetaryOuterFormatter = (p: any) => {
  const name = p.name || "Unknown";
  let valueStr = formatNumber(p.value ?? 0);
  if (isMonetary(name)) valueStr = "$" + valueStr;
  if (typeof p.value === "string") return `${p.percent?.toFixed(1)}%`
  return `${valueStr} (${p.percent?.toFixed(1)}%)`;
};


// src/lib/chart-utils.ts
const getStandardPieSeries = (
  data: any[],
  radius: string | string[] = "68%",   // single string = SOLID PIE (no hole)
  outerFormatter: any = monetaryOuterFormatter,
  innerFormatter: any = "{c}",
  showOuterLabels = true
) => [
    {
      type: "pie",
      radius,
      center: ["50%", "50%"],
      data,
      emphasis: {
        itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: "rgba(0, 0, 0, 0.5)" },
      },
      label: {
        show: showOuterLabels,
        position: "outside" as const,
        formatter: outerFormatter,
        alignTo: "labelLine" as const,
        distanceToLabelLine: 6,
        lineHeight: 17,
        fontSize: 13,
        fontWeight: 500,
        color: "#374151",
        padding: [2, 8],
        minShowLabelAngle: 3,
      },
      labelLine: {
        show: showOuterLabels,
        length: 22,
        length2: 38,
        smooth: 0.3,
        lineStyle: { width: 1.6, color: "#94a3b8" },
      },
    },
    {
      type: "pie",
      radius,   // same radius → solid pie with inner labels
      center: ["50%", "50%"],
      data,
      itemStyle: { opacity: 0 },
      label: {
        show: (params: any) => (params.percent ?? 0) >= 5,
        position: "inside" as const,
        formatter: innerFormatter,
        fontWeight: "bold",
        color: "#fff",
      },
      labelLine: { show: false },
    },
  ];

// === Chart Functions (names unchanged) ===

export function makeHierarchicalCategoryDonut<T = any>(
  parent_table: string,
  dataset: T[] | null | undefined,
  categoryKeys: (keyof T)[],
  title?: string
): ChartType {
  if (!dataset || dataset.length === 0 || categoryKeys.length === 0) {
    return {
      parent_table,
      chart: { charts: getNoDataOption(title ?? "Projects by Category") },
      chartType: "drilldown_donut",
    };
  }

  let currentLevel = 0;
  let currentFilters: Record<string, string> = {};

  const getFilteredData = (): T[] =>
    dataset.filter((item: any) =>
      Object.entries(currentFilters).every(([key, val]) => String(item[key] ?? "") === val)
    );

  const computePieData = (): { name: string; value: number }[] => {
    const filtered = getFilteredData();
    if (currentLevel >= categoryKeys.length || filtered.length === 0) return [];

    const currentCat = categoryKeys[currentLevel];
    const countMap: Record<string, number> = {};

    filtered.forEach((item: any) => {
      let val = String(item[currentCat] ?? "").trim() || "Uncategorized";
      countMap[val] = (countMap[val] || 0) + 1;
    });

    return Object.entries(countMap)
      .sort(([, a], [, b]) => b - a)
      .map(([name, value]) => ({ name, value }));
  };

  const getBreadcrumb = (): string => {
    const parts: string[] = [];
    for (let i = 0; i < currentLevel; i++) {
      const key = categoryKeys[i];
      const val = currentFilters[String(key)];
      if (val) parts.push(`${snakeToHuman(String(key))}: ${val}`);
    }
    return parts.join(" > ");
  };

  const buildOption = (
    pieData: { name: string; value: number }[],
    filteredCount: number,
    showBack: boolean
  ): EChartsOption => {
    const breadcrumb = getBreadcrumb();
    const levelText =
      currentLevel === 0 ? `By ${snakeToHuman(String(categoryKeys[0]))}` : breadcrumb;

    const graphicElements: any[] = [
      {
        type: "text",
        left: "center",
        top: "40%",
        style: { text: filteredCount.toString(), font: "bold 36px sans-serif", fill: "#333" },
      },
      {
        type: "text",
        left: "center",
        top: "55%",
        style: { text: "Total Projects", font: "14px sans-serif", fill: "#999" },
      },
    ];

    if (pieData.length === 0) {
      graphicElements.push({
        type: "text",
        left: "center",
        top: "50%",
        style: { text: "No projects in this category", fontSize: 18, fill: "#999" },
      });
    }

    if (showBack) {
      graphicElements.push({
        type: "text",
        left: 20,
        top: 20,
        style: {
          text: "← Back",
          font: "16px sans-serif",
          fontWeight: "bold",
          fill: "#000",
          cursor: "pointer",
        },
        onclick: () => {
          if (currentLevel === 0) return;
          const catToRemove = categoryKeys[currentLevel - 1];
          delete currentFilters[String(catToRemove)];
          currentLevel--;
          const newPieData = computePieData();
          const newFilteredCount = getFilteredData().length;
          chartInstance?.setOption(buildOption(newPieData, newFilteredCount, currentLevel > 0));
        },
      });
    }

    return {
      title: {
        text: title ?? "Projects by Category",
        subtext: levelText,
        left: "center",
        top: 10,
        textStyle: { fontSize: 16, fontWeight: "bold" },
        subtextStyle: { fontSize: 14, color: "#666" },
      },
      graphic: graphicElements,
      tooltip: {
        trigger: "item",
        formatter: (params: any) =>
          `${params.name}: ${params.value} projects (${params.percent?.toFixed(1)}%)`,
      },
      legend: { orient: "horizontal", left: "left", bottom: 10 },
      series: pieData.length === 0 ? [] : getStandardPieSeries(pieData, ["40%", "70%"], "{b}\n{c} projects ({d}%)", "{c}"),
    };
  };

  const initialPieData = computePieData();
  const initialFilteredCount = getFilteredData().length;
  const charts = buildOption(initialPieData, initialFilteredCount, false);

  let chartInstance: echarts.ECharts | null = null;

  const onDrilldown = (params: any, instance: echarts.ECharts) => {
    chartInstance = instance;
    if (params.componentType !== "series" || currentLevel >= categoryKeys.length - 1) return;

    const clickedName = params.name;
    const currentCat = categoryKeys[currentLevel];
    currentFilters[String(currentCat)] = clickedName;
    currentLevel++;

    const newPieData = computePieData();
    const newFilteredCount = getFilteredData().length;
    instance.setOption(buildOption(newPieData, newFilteredCount, true));
  };

  return {
    parent_table,
    chart: { charts, onDrilldown },
    chartType: "drilldown_donut",
  };
}

// src/lib/chart-utils.ts  ← add/replace this new function
export function makeValueSumDonut<T = any>(
  parent_table: string,
  dataset: T[] | null | undefined,
  primaryKey: keyof T,
  secondaryKey: keyof T,
  title?: string,
  centerText?: string   // ← new: custom text in the donut center (defaults to grand total $)
): ChartType {
  if (!dataset || dataset.length === 0) {
    return {
      parent_table,
      chart: {
        charts: getNoDataOption(title ?? `${snakeToHuman(String(secondaryKey))} by ${snakeToHuman(String(primaryKey))}`),
      },
      chartType: "drilldown_donut",
    };
  }

  const getSumPieData = (gk: keyof T, vk: keyof T, ds: T[] = dataset) => {
    const sumMap: Record<string, number> = {};
    ds.forEach((item) => {
      const rawGroup = String(item[gk] ?? "");
      const cleanGroup = cleanCategoryName(rawGroup, true);
      if (!cleanGroup) return;

      const val = Number(item[vk]);
      if (isNaN(val) || val <= 0) return;

      sumMap[cleanGroup] = (sumMap[cleanGroup] || 0) + val;
    });

    return Object.entries(sumMap)
      .map(([name, value]) => ({
        name: snakeToHuman(name),
        value,
        originalName: name,
      }))
      .sort((a, b) => b.value - a.value);
  };

  const getValueCountPieData = (k: keyof T, originalVal: string) => {
    const filtered = dataset.filter((item) => String(item[primaryKey]) === originalVal);
    const countMap: Record<string, number> = {};

    filtered.forEach((item) => {
      const val = String(item[k] ?? "").trim();
      if (val) countMap[val] = (countMap[val] || 0) + 1;
    });

    return Object.entries(countMap)
      .map(([name, value]) => ({
        name: snakeToHuman(name),
        value,
        originalName: name,
      }))
      .sort((a, b) => b.value - a.value);
  };

  const parentData = getSumPieData(primaryKey, secondaryKey);
  const manyCategories = parentData.length > 6;

  // Grand total for nice default center text
  const grandTotal = parentData.reduce((sum, d) => sum + d.value, 0);
  const displayCenter = centerText ?? `$${formatNumber(grandTotal)}`;

  const titleConfig: any[] = [
    {
      text: title ?? `${snakeToHuman(String(secondaryKey))} by ${snakeToHuman(String(primaryKey))}`,
      left: "center",
      top: 24,
    },
    {
      text: displayCenter,
      left: "center",
      top: "center",
      textStyle: {
        fontSize: 26,
        fontWeight: "700",
        color: "#1f2937",
      },
    },
  ];

  const charts: EChartsOption = {
    title: titleConfig,
    tooltip: {
      trigger: "item",
      formatter: (p: any) => `${p.name}: $${formatNumber(p.value)} (${p.percent?.toFixed(1)}%)`,
    },
    legend: {
      show: !manyCategories,
      orient: "horizontal",
      left: "center",
      bottom: 38,
      itemGap: 22,
      textStyle: { fontSize: 13.5 },
    },
    grid: { left: 40, right: 40, top: 90, bottom: 120 },
    series: getStandardPieSeries(parentData, ["40%", "68%"]), // ← donut!
  };

  const onDrilldown = (params: any, chartInstance: echarts.ECharts) => {
    const originalVal = params.data?.originalName;
    if (!originalVal) return;

    const childData = getValueCountPieData(secondaryKey, originalVal);
    const manySub = childData.length > 6;

    if (childData.length === 0) {
      chartInstance.setOption(getNoDataOption(`${params.data.name} by ${snakeToHuman(String(secondaryKey))}`));
      return;
    }

    const subTotal = childData.reduce((sum, d) => sum + d.value, 0);

    const drillTitleConfig: any[] = [
      {
        text: `${params.data.name} — ${snakeToHuman(String(secondaryKey))}`,
        left: "center",
        top: 24,
      },
      {
        text: `${subTotal} items`,
        left: "center",
        top: "center",
        textStyle: { fontSize: 24, fontWeight: "700", color: "#1f2937" },
      },
    ];

    chartInstance.setOption({
      title: drillTitleConfig,
      tooltip: {
        trigger: "item",
        formatter: (p: any) => `${p.name}: ${p.value} items (${p.percent?.toFixed(1)}%)`,
      },
      legend: {
        show: !manySub,
        orient: "horizontal",
        left: "center",
        bottom: 38,
        itemGap: 22,
        textStyle: { fontSize: 13.5 },
      },
      grid: { left: 40, right: 40, top: 90, bottom: 120 },
      series: getStandardPieSeries(childData, ["40%", "68%"]),
    });
  };

  return {
    parent_table,
    chart: { charts, onDrilldown },
    chartType: "drilldown_donut",
  };
}

export function makeCategoryCountDrilldownDonut<T = any>(
  parent_table: string,
  dataset: T[] | null | undefined,
  categoryField: string,
  title?: string,
  centerText?: string,                      // ← optional; if omitted → auto total count
  fundingField: string = "grant_dollars"
): ChartType {
  if (!dataset || dataset.length === 0) {
    return {
      parent_table,
      chart: { charts: getNoDataOption(title ?? `Distribution by ${categoryField}`) },
      chartType: "drilldown_pie",
    };
  }

  const categoryMap: Record<string, {
    count: number;
    totalFunding: number;
    items: T[]
  }> = {};

  dataset.forEach((item: any) => {
    if (!item) return;

    let key = item[categoryField];
    key = (key == null || String(key).trim() === '') ? 'Other' : String(key).trim();

    if (!categoryMap[key]) {
      categoryMap[key] = { count: 0, totalFunding: 0, items: [] };
    }

    const funding = Number(item[fundingField] ?? item.funding ?? 0) || 0;
    categoryMap[key].count += 1;
    categoryMap[key].totalFunding += funding;
    categoryMap[key].items.push(item);
  });

  const totalCount = Object.values(categoryMap).reduce((sum, g) => sum + g.count, 0);

  const parentData = Object.keys(categoryMap)
    .map((key) => ({
      name: key,
      value: categoryMap[key].count,
      totalFunding: categoryMap[key].totalFunding,
      originalKey: key,
      fullName: key,
      projects: categoryMap[key].items
        .map((item: any) => ({
          name: item.project_name ?? item.id?.slice(0, 12) ?? "Grant",
          funding: Number(item[fundingField] ?? item.funding ?? 0) || 0,
        }))
        .sort((a, b) => b.funding - a.funding),
    }))
    .filter((item) => item.value > 0)
    .sort((a: any, b: any) => b.value - a.value);

  const customTooltipFormatter = (params: any): string => {
    /* ← paste your original customTooltipFormatter here (unchanged) */
  };

  const legendConfig = {
    orient: "horizontal",
    left: "center",
    bottom: 0,
    width: "92%",
    itemWidth: 18,
    itemHeight: 12,
    itemGap: 18,
    textStyle: { fontSize: 13.2 },
    formatter: (name: string) => name,
  };

  // Build donut series + force % callouts
  let seriesConfig = getStandardPieSeries(parentData, "72%", (v: number) => `${v}`);
  if (!Array.isArray(seriesConfig)) seriesConfig = [seriesConfig];

  seriesConfig.forEach((s: any) => {
    if (s) {
      s.radius = ['42%', '72%'];
      s.label = {
        formatter: '{d}%',                    // ← ONLY percentage in callouts
        fontSize: 14,
        fontWeight: '600',
        color: '#1f2937',
        distanceToLabelLine: 8
      };
      s.labelLine = { show: true, length: 12, length2: 8, smooth: true };
    }
  });

  const charts: EChartsOption = {
    title: {
      text: title ?? `Distribution by ${categoryField}`,
      left: "center",
      top: 16
    },
    tooltip: { trigger: "item", formatter: customTooltipFormatter, confine: true },
    legend: legendConfig,
    series: seriesConfig,
    graphic: {
      elements: [{
        type: 'text',
        left: 'center',
        top: 'middle',
        style: {
          text: centerText ?? `${totalCount}`,   // ← auto total if no arg passed
          fontSize: 32,
          fontWeight: '700',
          fill: '#1f2937',
          textAlign: 'center',
          lineHeight: 1.1,
        }
      }]
    },
  };

  const onDrilldown = (params: any, chartInstance: echarts.ECharts) => {
    const originalKey = params.data?.originalKey;
    if (!originalKey) return;

    const group = categoryMap[originalKey];
    if (!group?.items.length) {
      chartInstance.setOption(getNoDataOption(`${originalKey} — No data`));
      return;
    }

    const drillData = group.items
      .map((item: any) => ({
        name: item.id ? `#${item.id.slice(-8)}` : "Grant",
        value: Number(item[fundingField] ?? item.funding ?? 0) || 0,
        fullName: item.project_name ?? item.id ?? "Grant",
      }))
      .filter(d => d.value > 0)
      .sort((a, b) => b.value - a.value);

    let drillSeries = getStandardPieSeries(drillData, "72%", monetaryOuterFormatter);
    if (!Array.isArray(drillSeries)) drillSeries = [drillSeries];

    drillSeries.forEach((s: any) => {
      if (s) {
        s.radius = ['42%', '72%'];
        s.label = {
          formatter: '{d}%',                    // ← % callouts on drilldown too
          fontSize: 14,
          fontWeight: '600',
          color: '#1f2937'
        };
        s.labelLine = { show: true, length: 12, length2: 8 };
      }
    });

    chartInstance.setOption({
      title: {
        text: `${originalKey} — ${group.count} Grants by Funding`,
        left: "center",
        top: 16
      },
      legend: legendConfig,
      series: drillSeries,
      graphic: undefined,
    });
  };

  return {
    parent_table,
    chart: { charts, onDrilldown },
    chartType: "drilldown_pie"
  };
}

export function makeCategoryCountDrilldownPie<T = any>(
  parent_table: string,
  dataset: T[] | null | undefined,
  categoryField: string,                    // ← e.g. "grant_type"
  title?: string,
  fundingField: string = "grant_dollars"
): ChartType {
  if (!dataset || dataset.length === 0) {
    return {
      parent_table,
      chart: { charts: getNoDataOption(title ?? `Distribution by ${categoryField}`) },
      chartType: "drilldown_pie",
    };
  }

  const categoryMap: Record<string, {
    count: number;
    totalFunding: number;
    items: T[]
  }> = {};

  dataset.forEach((item: any) => {
    if (!item) return;

    let key = item[categoryField];
    key = (key == null || String(key).trim() === '') ? 'Other' : String(key).trim();

    if (!categoryMap[key]) {
      categoryMap[key] = { count: 0, totalFunding: 0, items: [] };
    }

    const funding = Number(item[fundingField] ?? item.funding ?? 0) || 0;
    categoryMap[key].count += 1;
    categoryMap[key].totalFunding += funding;
    categoryMap[key].items.push(item);
  });

  const parentData = Object.keys(categoryMap)
    .map((key) => ({
      name: key,                          // ← clean string (this was the root cause)
      value: categoryMap[key].count,
      totalFunding: categoryMap[key].totalFunding,
      originalKey: key,
      fullName: key,
      projects: categoryMap[key].items
        .map((item: any) => ({
          name: item.project_name ?? item.id?.slice(0, 12) ?? "Grant",
          funding: Number(item[fundingField] ?? item.funding ?? 0) || 0,
        }))
        .sort((a, b) => b.funding - a.funding),
    }))
    .filter((item) => item.value > 0)
    .sort((a: any, b: any) => b.value - a.value);

  // === YOUR ORIGINAL CUSTOM TOOLTIP (paste it here - 100% unchanged) ===
  const customTooltipFormatter = (params: any): string => {
    /* ← PUT YOUR EXISTING customTooltipFormatter CODE HERE */
    // (it will now receive clean .name and .fullName strings)
  };

  const legendConfig = {
    orient: "horizontal",
    left: "center",
    bottom: 0,
    width: "92%",
    itemWidth: 18,
    itemHeight: 12,
    itemGap: 18,
    textStyle: { fontSize: 13.2 },
    formatter: (name: string) => name,   // ← CRITICAL FIX: forces string, kills [object Object]
  };

  // Get standard series then FORCE clean callout labels
  let seriesConfig = getStandardPieSeries(parentData, "68%", (v: number) => `${v}`);

  if (!Array.isArray(seriesConfig)) seriesConfig = [seriesConfig];

  // Override label/callout formatter to guarantee string output (fixes the bug)
  seriesConfig.forEach((s: any) => {
    if (s.label) {
      s.label.formatter = '{b}';           // just the name
      s.label.fontSize = 13;
      s.label.distanceToLabelLine = 8;
    }
    if (s.labelLine) s.labelLine.show = true;
  });

  const charts: EChartsOption = {
    title: {
      text: title ?? `Distribution by ${categoryField}`,
      left: "center",
      top: 12
    },
    tooltip: { trigger: "item", formatter: customTooltipFormatter, confine: true },
    legend: legendConfig,
    series: seriesConfig,
  };

  const onDrilldown = (params: any, chartInstance: echarts.ECharts) => {
    const originalKey = params.data?.originalKey;
    if (!originalKey) return;

    const group = categoryMap[originalKey];
    if (!group?.items.length) {
      chartInstance.setOption(getNoDataOption(`${originalKey} — No data`));
      return;
    }

    const drillData = group.items
      .map((item: any) => ({
        name: item.id ? `#${item.id.slice(-8)}` : "Grant",
        value: Number(item[fundingField] ?? item.funding ?? 0) || 0,
        fullName: item.project_name ?? item.id ?? "Grant",
      }))
      .filter(d => d.value > 0)
      .sort((a, b) => b.value - a.value);

    chartInstance.setOption({
      title: { text: `${originalKey} — ${group.count} Grants by Funding`, left: "center", top: 12 },
      legend: legendConfig,
      series: getStandardPieSeries(drillData, "68%", monetaryOuterFormatter),
    });
  };

  return {
    parent_table,
    chart: { charts, onDrilldown },
    chartType: "drilldown_pie"
  };
}

export function makeProjectCountDrilldownPie<T = any>(
  parent_table: string,
  dataset: T[] | null | undefined,
  title?: string
): ChartType {
  if (!dataset || dataset.length === 0) {
    return {
      parent_table,
      chart: { charts: getNoDataOption(title ?? "Number of Projects by Program/Plan") },
      chartType: "drilldown_pie",
    };
  }

  const totalFundingMap: Record<string, number> = {};
  const countMap: Record<string, number> = {};
  const projectsMap: Record<string, { name: string; funding: number }[]> = {};
  const itemsMap: Record<string, any[]> = {};

  dataset.forEach((group: any) => {
    if (typeof group !== "object" || group === null) return;
    Object.entries(group).forEach(([programKey, info]: [string, any]) => {
      if (!info || !Array.isArray(info)) return;
      itemsMap[programKey] = info;

      let totalFunding = 0;
      const projs: { name: string; funding: number }[] = [];

      info.forEach((item: any) => {
        const funding = Number(item.funding) || 0;
        totalFunding += funding;
        const name = item.project_name?.trim() || "Unnamed Project";
        projs.push({ name, funding });
      });

      projs.sort((a, b) => b.funding - a.funding);

      totalFundingMap[programKey] = totalFunding;
      countMap[programKey] = info.length;
      projectsMap[programKey] = projs;
    });
  });

  // Filter out zero-count slices
  const parentData = Object.keys(projectsMap)
    .map((key) => {
      const info = getCalloutDisplayInfo(key);
      return {
        name: info.display,
        value: countMap[key],
        totalFunding: totalFundingMap[key],
        projects: projectsMap[key],
        originalKey: key,
        fullName: info.full,
      };
    })
    .filter((item) => item.value > 0)   // ← no more zero-slice clutter
    .sort((a: any, b: any) => b.value - a.value);

  const getProjectTypeData = (programKey: string): any[] => {
    const items = itemsMap[programKey] || [];
    if (items.length === 0) return [];

    const typeMap: Record<string, { count: number; totalFunding: number; projects: any[] }> = {};

    items.forEach((item: any) => {
      let ptype = item.project_type?.trim() || "Other";
      if (!ptype || ptype === "NULL") ptype = "Other";

      const cleanPtype = cleanCategoryName(ptype, true);

      if (!typeMap[cleanPtype]) {
        typeMap[cleanPtype] = { count: 0, totalFunding: 0, projects: [] };
      }

      const funding = Number(item.funding) || 0;
      typeMap[cleanPtype].totalFunding += funding;
      typeMap[cleanPtype].count += 1;
      typeMap[cleanPtype].projects.push({
        name: item.project_name?.trim() || "Unnamed Project",
        funding,
      });
    });

    Object.values(typeMap).forEach((g) => g.projects.sort((a, b) => b.funding - a.funding));

    return Object.keys(typeMap)
      .map((ptype) => ({
        name: snakeToHuman(ptype),
        value: typeMap[ptype].count,
        totalFunding: typeMap[ptype].totalFunding,
        projects: typeMap[ptype].projects,
      }))
      .filter((item) => item.value > 0)   // ← filter zeros here too
      .sort((a: any, b: any) => b.value - a.value);
  };

  // (your customTooltipFormatter stays 100% unchanged)
  const customTooltipFormatter = (params: any): string => { /* ... your existing code ... */ };

  const legendConfig = {
    orient: "horizontal",
    left: "center",
    bottom: 0,                    // more breathing room
    width: "90%",
    itemWidth: 18,
    itemHeight: 12,
    itemGap: 22,
    textStyle: { fontSize: 13.2 },
    formatter: (name: string) => getCalloutDisplayInfo(name).full,
  };

  const charts: EChartsOption = {
    title: { text: title ?? "Number of Projects by Program/Plan", left: "center", top: 12 },
    tooltip: { trigger: "item", formatter: customTooltipFormatter, confine: true },
    legend: legendConfig,
    grid: { left: 40, right: 40, top: 75, bottom: 130 },
    series: getStandardPieSeries(parentData, "68%", monetaryOuterFormatter),
  };

  const onDrilldown = (params: any, chartInstance: echarts.ECharts) => {
    const originalKey = params.data?.originalKey;
    if (!originalKey) return;

    const fullName = params.data?.fullName || params.name;
    const childData = getProjectTypeData(originalKey);

    if (childData.length === 0) {
      chartInstance.setOption(getNoDataOption(`${fullName} — Projects by Type`, "No data"));
      return;
    }

    chartInstance.setOption({
      title: {
        text: `${fullName} — Number of Projects by Project Type`,
        left: "center",
        top: 12,
      },
      legend: legendConfig,
      grid: { left: 40, right: 40, top: 75, bottom: 135 },
      series: getStandardPieSeries(childData, "68%", monetaryOuterFormatter),
    });
  };

  return { parent_table, chart: { charts, onDrilldown }, chartType: "drilldown_pie" };
}

export function makeDrilldownDonut<T = any>(
  parent_table: string,
  dataset: T | T[] | null | undefined,
  keys: (keyof T)[],
  title?: string,
  centerText?: string
): ChartType {
  const dataArray: T[] = dataset
    ? (Array.isArray(dataset) ? dataset : [dataset]).filter(
      (i) => i !== null && i !== undefined
    )
    : [];

  if (dataArray.length === 0 || keys.length === 0) {
    return {
      parent_table,
      chart: { charts: getNoDataOption(title ?? keys.map((k) => snakeToHuman(String(k))).join(" vs ")) },
      chartType: "drilldown_donut",
    };
  }

  // Parent level – zeros filtered (no more $0 callouts/legend entries)
  const parentData = keys
    .map((key) => {
      const total = dataArray.reduce(
        (sum, item) => sum + (Number((item as any)[key]) || 0),
        0
      );
      return {
        name: snakeToHuman(String(key)),
        value: total,
      };
    })
    .filter((item) => item.value > 0);

  // Breakdown counts – zeros filtered
  const getBreakdownData = (k: keyof T) => {
    const map: Record<string, number> = {};
    dataArray.forEach((item) => {
      const val = String((item as any)[k] ?? "");
      if (val) map[val] = (map[val] || 0) + 1;
    });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .filter((item) => item.value > 0);
  };

  const donutRadius: [string, string] = ["40%", "70%"];

  const titleConfig: any[] = [
    { text: title ?? keys.map((k) => snakeToHuman(String(k))).join(" vs "), left: "center", top: 20 },
  ];
  if (centerText) {
    titleConfig.push({
      text: centerText,
      left: "center",
      top: "center",
      textStyle: { fontSize: 20, fontWeight: "bold" },
    });
  }

  // Helper that brings callouts back intelligently
  const getSeriesWithCallouts = (data: any[]) => {
    const baseSeries = getStandardPieSeries(data, donutRadius);
    const hasMultiple = data.length > 1;

    const labelConfig = hasMultiple
      ? {
        show: true,
        position: "outside",
        formatter: (params: any) => {
          const formattedValue = Number(params.value).toLocaleString("en-US");
          const percent = params.percent.toFixed(1);
          return `${formattedValue} (${percent}%)`;
        },
        fontSize: 13,
        color: "#333",
        distanceToLabelLine: 8,
      }
      : { show: false };

    const labelLineConfig = hasMultiple
      ? {
        show: true,
        length: 25,
        length2: 20,
        smooth: true,
        lineStyle: { width: 1.5 },
      }
      : { show: false };

    const seriesConfig = Array.isArray(baseSeries)
      ? baseSeries.map((s: any) => ({
        ...s,
        label: labelConfig,
        labelLine: labelLineConfig,
        labelLayout: { hideOverlap: true },
      }))
      : {
        ...baseSeries,
        label: labelConfig,
        labelLine: labelLineConfig,
        labelLayout: { hideOverlap: true },
      };

    return seriesConfig;
  };

  const charts: EChartsOption = {
    title: titleConfig,
    tooltip: { trigger: "item", formatter: tooltipFormatter },

    grid: { left: 40, right: 40, top: 75, bottom: 170 }, // extra space for legend + callouts when shown

    legend: {
      orient: "horizontal",
      left: "center",
      bottom: 42,
      itemGap: 26,
      textStyle: { fontSize: 13.5 },
    },

    series: getSeriesWithCallouts(parentData),
  };

  const onDrilldown = (params: any, chartInstance: echarts.ECharts) => {
    const clickedName = params.data.name;
    const key = keys.find((k) => snakeToHuman(String(k)) === clickedName);
    if (!key) return;

    const breakdownData = getBreakdownData(key);
    if (breakdownData.length === 0) {
      chartInstance.setOption(getNoDataOption(snakeToHuman(String(key)), "No breakdown data"));
      return;
    }

    const drillTitleConfig: any[] = [{ text: snakeToHuman(String(key)), left: "center", top: 20 }];
    if (centerText) drillTitleConfig.push(titleConfig[1]);

    chartInstance.setOption({
      title: drillTitleConfig,
      series: getSeriesWithCallouts(breakdownData),
    });
  };

  return { parent_table, chart: { charts, onDrilldown }, chartType: "drilldown_donut" };
}

export function makeDrilldownPie<T = any>(
  parent_table: string,
  dataset: T[] | null | undefined,
  keys: (keyof T)[],
  title?: string
): ChartType {
  if (!dataset || dataset.length === 0 || keys.length === 0) {
    return {
      parent_table,
      chart: {
        charts: getNoDataOption(title ?? keys.map((k) => snakeToHuman(String(k))).join(" vs ")),
      },
      chartType: "drilldown_pie",
    };
  }

  const parentData = keys
    .map((key) => {
      const total = dataset.reduce(
        (sum, item) => sum + (Number((item as any)[key]) || 0),
        0
      );
      return { name: snakeToHuman(String(key)), value: total, isMoney: isMonetary(String(key)) };
    })
    .sort((a: any, b: any) => b.value - a.value);

  const getBreakdownData = (k: keyof T) => {
    const map: Record<string, number> = {};
    dataset.forEach((item) => {
      const val = String((item as any)[k]);
      if (val) map[val] = (map[val] || 0) + 1;
    });

    let entries = Object.entries(map);
    if (isMonetary(String(k))) {
      entries.sort(([a], [b]) => Number(a) - Number(b));
    } else {
      entries.sort(([, a], [, b]) => b - a);
    }

    return entries.map(([rawName, value]) => {
      let name = rawName;
      if (isMonetary(String(k))) {
        const num = Number(rawName);
        if (!isNaN(num)) name = "$" + formatNumber(num);
      }
      return { name, value };
    });
  };

  const charts: EChartsOption = {
    title: { text: title ?? keys.map((k) => snakeToHuman(String(k))).join(" vs "), left: "center" },
    tooltip: { trigger: "item", formatter: tooltipFormatter },
    legend: { orient: "horizontal", left: "left", bottom: 10 },
    series: getStandardPieSeries(parentData, "50%"),
  };

  const onDrilldown = (params: any, chartInstance: echarts.ECharts) => {
    const clickedName = params.data.name;
    const key = keys.find((k) => snakeToHuman(String(k)) === clickedName);
    if (!key) return;

    const breakdownData = getBreakdownData(key);
    if (breakdownData.length === 0) {
      chartInstance.setOption(getNoDataOption(snakeToHuman(String(key)), "No breakdown data"));
      return;
    }

    chartInstance.setOption({
      title: { text: snakeToHuman(String(key)), left: "center" },
      series: getStandardPieSeries(breakdownData, "50%"),
    });
  };

  return { parent_table, chart: { charts, onDrilldown }, chartType: "drilldown_pie" };
}

export function makeTableDrilldownPie<T = any>(
  parent_table: string,
  dataset: T[] | null | undefined,
  title?: string
): ChartType {
  if (!dataset || dataset.length === 0) {
    return {
      parent_table,
      chart: { charts: getNoDataOption(title ?? "Table Sizes") },
      chartType: "drilldown_pie",
    };
  }

  const fieldsToRemove = [
    "collectionId",
    "id",
    "collectionName",
    "source jurisdiction",
    "created",
    "updated",
    "from_date",
    "to_date",
  ];

  const tableMap: Record<string, any[]> = {};
  const tableSizes: Record<string, number> = {};

  dataset.forEach((group: any) => {
    if (typeof group !== "object" || group === null) return;
    Object.entries(group).forEach(([tableName, info]: [string, any]) => {
      if (info && Array.isArray(info.items)) {
        const cleaned = info.items.map((item: any) => {
          const copy = { ...item };
          fieldsToRemove.forEach((f) => delete copy[f]);
          return copy;
        });
        tableMap[tableName] = cleaned;
        tableSizes[tableName] = info.totalItems ?? cleaned.length;
      }
    });
  });

  const tables = Object.keys(tableMap);
  const parentData = tables.map((t) => ({ name: snakeToHuman(t), value: tableSizes[t] }));

  const getFieldCardinalityData = (tableName: string) => {
    const items = tableMap[tableName] || [];
    if (items.length === 0) return [];

    const fieldSet = new Set<string>();
    items.forEach((item) => {
      Object.keys(item).forEach((k) => {
        const cleanField = cleanCategoryName(k, false); // field names usually don't need humanize
        if (cleanField) fieldSet.add(cleanField);
      });
    });

    return Array.from(fieldSet).map((field) => {
      const unique = new Set(
        items
          .map((i) => JSON.stringify(i[field]))
          .filter((v) => v !== "null" && v !== "undefined")
      );
      return { name: field, value: unique.size }; // already cleaned
    });
  };

  const charts: EChartsOption = {
    title: { text: title ?? "Table Sizes", left: "center" },
    tooltip: { trigger: "item" },
    legend: { orient: "horizontal", left: "left", bottom: 10 },
    series: getStandardPieSeries(parentData, "50%"),
  };

  const onDrilldown = (params: any, chartInstance: echarts.ECharts) => {
    const table = tables.find((t) => snakeToHuman(t) === params.data.name);
    if (!table) return;

    const fieldData = getFieldCardinalityData(table);
    if (fieldData.length === 0) {
      chartInstance.setOption(getNoDataOption(snakeToHuman(table), "No fields"));
      return;
    }

    chartInstance.setOption({
      title: { text: snakeToHuman(table), left: "center" },
      series: getStandardPieSeries(fieldData, "50%"),
    });
  };

  return { parent_table, chart: { charts, onDrilldown }, chartType: "drilldown_pie" };
}

export function makeDrilldownMultPie<T = any>(
  parent_table: string,
  dataset: T[] | null | undefined,
  keys: (keyof T)[],
  title?: string
): ChartType {
  if (!dataset || dataset.length === 0 || keys.length < 2) {
    return {
      parent_table,
      chart: { charts: getNoDataOption(title ?? "Drilldown Pie") },
      chartType: "drilldown_pie",
    };
  }

  const valueKey = keys[0] as keyof T;
  const categoryKeys = keys.slice(1) as (keyof T)[];

  let currentLevel = 0;
  let currentFilters: Partial<Record<keyof T, string>> = {};


  //If something breaks its this
  const computePieData = (
    level: number,
    filters: Partial<Record<keyof T, string>>
  ): { name: string; value: number }[] => {
    const filteredData = dataset.filter((item) =>
      Object.entries(filters).every(([cat, val]) => String(item[cat as keyof T]) === val)
    );

    const currentCat = categoryKeys[currentLevel];
    const countMap: Record<string, number> = {};

    filteredData.forEach((item: any) => {
      const rawVal = String(item[currentCat] ?? "").trim();
      const cleanVal = cleanCategoryName(rawVal, true); // ← apply here
      if (!cleanVal) {
        // Optionally treat empty as "Uncategorized"
        countMap["Uncategorized"] = (countMap["Uncategorized"] || 0) + 1;
      } else {
        countMap[cleanVal] = (countMap[cleanVal] || 0) + 1;
      }
    });

    return Object.entries(countMap)
      .sort(([, a], [, b]) => b - a)
      .map(([name, value]) => ({ name, value }));
  };

  const getSubtext = (): string => {
    let subtext = `By ${snakeToHuman(String(categoryKeys[currentLevel]))}`;
    const breadcrumb = Object.entries(currentFilters)
      .map(([cat, val]) => `${snakeToHuman(String(cat))}: ${val}`)
      .join(" > ");
    if (breadcrumb) subtext += `\n${breadcrumb}`;
    return subtext;
  };

  const initialPieData = computePieData(0, {});

  const charts: EChartsOption = {
    title: {
      text: title ?? "Drilldown Pie",
      subtext: getSubtext(),
      left: "center",
    },
    tooltip: { trigger: "item", formatter: tooltipFormatter },
    legend: { orient: "horizontal", left: "left", bottom: 10 },
    series: getStandardPieSeries(initialPieData, "50%"),
  };

  const onDrilldown = (params: any, chartInstance: echarts.ECharts) => {
    if (params.componentType !== "series") return;

    const clickedName = params.data.name;
    const currentCat = categoryKeys[currentLevel];
    currentFilters[currentCat] = clickedName;
    currentLevel++;

    if (currentLevel >= categoryKeys.length) {
      currentLevel--;
      delete currentFilters[currentCat];
      return;
    }

    const newPieData = computePieData(currentLevel, currentFilters);
    if (newPieData.length === 0) {
      chartInstance.setOption(getNoDataOption(title ?? "Drilldown Pie", "No data at this level"));
      return;
    }

    chartInstance.setOption({
      title: { subtext: getSubtext() },
      series: getStandardPieSeries(newPieData, "50%"),
    });
  };

  return { parent_table, chart: { charts, onDrilldown }, chartType: "drilldown_pie" };
}

export function makeValueCountPie<T = any>(
  parent_table: string,
  dataset: T[] | null | undefined,
  primaryKey: keyof T,
  secondaryKey: keyof T,
  title?: string
): ChartType {
  if (!dataset || dataset.length === 0) {
    return {
      parent_table,
      chart: { charts: getNoDataOption(title ?? snakeToHuman(String(primaryKey))) },
      chartType: "drilldown_pie",
    };
  }

  const getValueCountPieData = (k: keyof T, ds: T[] = dataset) => {
    const countMap: Record<string, number> = {};

    ds.forEach((item) => {
      const rawVal = String(item[k]);
      const cleaned = cleanCategoryName(rawVal, true);
      if (cleaned) {
        countMap[cleaned] = (countMap[cleaned] || 0) + 1;
      }
    });

    return Object.entries(countMap)
      .map(([cleaned, value]) => {
        const info = getCalloutDisplayInfo(cleaned);
        return {
          name: info.display,          // short name → pie slice labels + tooltip
          value,
          originalName: cleaned,       // exact match key used in original filter logic
          fullName: info.full,         // full name for titles / drilldown
        };
      })
      .sort((a, b) => b.value - a.value);
  };

  const parentData = getValueCountPieData(primaryKey);

  const legendConfig = {
    orient: "horizontal",
    left: "left",
    bottom: 10,
    formatter: (name: string) => getCalloutDisplayInfo(name).full, // legend always shows full name
  };

  const charts: EChartsOption = {
    title: { text: title ?? snakeToHuman(String(primaryKey)), left: "center" },
    tooltip: { trigger: "item" },
    legend: legendConfig,
    series: getStandardPieSeries(parentData, "50%"),
  };

  const onDrilldown = (params: any, chartInstance: echarts.ECharts) => {
    const originalVal = params.data.originalName;
    if (!originalVal) return;

    const fullName = params.data.fullName || params.data.name;
    const filtered = dataset.filter((item) => String(item[primaryKey]) === originalVal);
    const pieData = getValueCountPieData(secondaryKey, filtered);

    const drillTitle = `${fullName} by ${snakeToHuman(String(secondaryKey))}`;

    if (pieData.length === 0) {
      chartInstance.setOption(getNoDataOption(drillTitle));
      return;
    }

    chartInstance.setOption({
      title: { text: drillTitle, left: "center" },
      legend: legendConfig, // ensure formatter travels to drilldown chart
      series: getStandardPieSeries(pieData, "50%"),
    });
  };

  return { parent_table, chart: { charts, onDrilldown }, chartType: "drilldown_pie" };
}

export function makeValueSumPie<T = any>(
  parent_table: string,
  dataset: T[] | null | undefined,
  primaryKey: keyof T,
  secondaryKey: keyof T,
  title?: string
): ChartType {
  if (!dataset || dataset.length === 0) {
    return {
      parent_table,
      chart: {
        charts: getNoDataOption(title ?? `${snakeToHuman(String(secondaryKey))} by ${snakeToHuman(String(primaryKey))}`),
      },
      chartType: "drilldown_pie",
    };
  }

  const getSumPieData = (gk: keyof T, vk: keyof T, ds: T[] = dataset) => {
    const sumMap: Record<string, number> = {};
    ds.forEach((item) => {
      const rawGroup = String(item[gk]);
      const cleanGroup = cleanCategoryName(rawGroup, true);
      if (!cleanGroup) return;

      const val = Number(item[vk]);
      if (isNaN(val)) return;

      sumMap[cleanGroup] = (sumMap[cleanGroup] || 0) + val;
    });
    return Object.entries(sumMap)
      .map(([name, value]) => ({ name, value, originalName: name }))
      .filter((d) => d.value > 0);
  };

  const getValueCountPieData = (k: keyof T, ds: T[] = dataset) => {
    const countMap: Record<string, number> = {};
    ds.forEach((item) => {
      const val = String(item[k]);
      if (val) countMap[val] = (countMap[val] || 0) + 1;
    });
    return Object.entries(countMap)
      .map(([name, value]) => ({ name: snakeToHuman(name), value, originalName: name }));
  };

  const parentData = getSumPieData(primaryKey, secondaryKey);
  const manyCategories = parentData.length > 5;

  const isMonetaryValue = isMonetary(String(secondaryKey));   // ← new

  const charts: EChartsOption = {
    title: {
      text: title ?? `${snakeToHuman(String(secondaryKey))} by ${snakeToHuman(String(primaryKey))}`,
      left: "center",
    },
    tooltip: { trigger: "item" },
    legend: { show: !manyCategories, orient: "horizontal", left: "left", bottom: 10 },
    series: getStandardPieSeries(parentData, "50%", createOuterFormatter(isMonetaryValue), innerLabelFormatter, !manyCategories),
  };

  const onDrilldown = (params: any, chartInstance: echarts.ECharts) => {
    const originalVal = params.data.originalName;
    if (!originalVal) return;

    const filtered = dataset.filter((item) => String(item[primaryKey]) === originalVal);
    const pieData = getValueCountPieData(secondaryKey, filtered);
    const manySub = pieData.length > 5;

    if (pieData.length === 0) {
      chartInstance.setOption(
        getNoDataOption(`${params.data.name} by ${snakeToHuman(String(secondaryKey))}`)
      );
      return;
    }

    chartInstance.setOption({
      title: { text: `${params.data.name} by ${snakeToHuman(String(secondaryKey))}`, left: "center" },
      legend: { show: !manySub },
      series: getStandardPieSeries(pieData, "50%", createLabelFormatter(true), innerLabelFormatter, !manySub),
    });
  };

  return { parent_table, chart: { charts, onDrilldown }, chartType: "drilldown_pie" };
}

export function makeValueSumPieTop10<T = any>(
  parent_table: string,
  dataset: T[] | null | undefined,
  primaryKey: keyof T,
  secondaryKey: keyof T,
  title?: string
): ChartType {
  if (!dataset || dataset.length === 0) {
    return {
      parent_table,
      chart: {
        charts: getNoDataOption(title ?? `${snakeToHuman(String(secondaryKey))} by ${snakeToHuman(String(primaryKey))}`),
      },
      chartType: "drilldown_pie",
    };
  }

  const getValueCountPieData = (k: keyof T, ds: T[] = dataset) => {
    const countMap: Record<string, number> = {};
    ds.forEach((item) => {
      const val = String(item[k]);
      if (val) countMap[val] = (countMap[val] || 0) + 1;
    });
    return Object.entries(countMap)
      .map(([name, value]) => ({ name: snakeToHuman(name), value, originalName: name }));
  };

  const sumMap: Record<string, number> = {};
  dataset.forEach((item) => {
    const group = String(item[primaryKey]);
    const val = Number(item[secondaryKey]);
    if (!group || isNaN(val)) return;
    sumMap[group] = (sumMap[group] || 0) + val;
  });

  let rawPieData = Object.entries(sumMap)
    .map(([originalName, value]) => ({
      name: snakeToHuman(originalName),
      value,
      originalName,
    }))
    .filter((d) => d.value > 0)
    .sort((a, b) => b.value - a.value);

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
      otherOriginals = otherItems.map((d) => d.originalName);
      parentData.push({
        name: "Other",
        value: otherSum,
        originals: otherOriginals,
        itemStyle: { color: "#aaaaaa" },
      });
    }
  }

  const charts: EChartsOption = {
    title: {
      text: title ?? `${snakeToHuman(String(secondaryKey))} by ${snakeToHuman(String(primaryKey))}`,
      left: "center",
    },
    tooltip: { trigger: "item" },
    legend: { orient: "horizontal", left: "left", bottom: 10 },
    series: getStandardPieSeries(parentData, "50%"),
  };

  const onDrilldown = (params: any, chartInstance: echarts.ECharts) => {
    const data = params.data;

    let filtered: T[] = [];
    let drillTitle = "";

    if (data.originals && Array.isArray(data.originals)) {
      const origs: string[] = data.originals;
      filtered = dataset.filter((item) => origs.includes(String(item[primaryKey])));
      drillTitle = "Other Categories";
    } else if (data.originalName) {
      const originalVal = data.originalName;
      filtered = dataset.filter((item) => String(item[primaryKey]) === originalVal);
      drillTitle = data.name;
    } else {
      return;
    }

    if (filtered.length === 0) return;

    const pieData = getValueCountPieData(secondaryKey, filtered);
    const manySub = pieData.length > 5;

    chartInstance.setOption({
      title: { text: `${drillTitle} by ${snakeToHuman(String(secondaryKey))}`, left: "center" },
      legend: { show: !manySub },
      series: getStandardPieSeries(pieData, "50%", createLabelFormatter(true), innerLabelFormatter, !manySub),
    });
  };

  return { parent_table, chart: { charts, onDrilldown }, chartType: "drilldown_pie" };
}



export function makePie<T = any>(
  parent_table: string,
  dataset: T[] | null | undefined,
  key1: keyof T
): ChartType {
  if (!dataset || dataset.length === 0) {
    return {
      parent_table,
      chart: { charts: getNoDataOption(snakeToHuman(String(key1))) },
      chartType: "piechart",
    };
  }

  const countMap: Record<string, number> = {};
  dataset.forEach((item: T) => {
    const key = String(item[key1]);
    if (key) countMap[key] = (countMap[key] || 0) + 1;
  });

  const pieData = Object.entries(countMap).map(([name, value]) => ({ name, value }));

  return {
    parent_table,
    chart: {
      charts: {
        title: { text: snakeToHuman(String(key1)), left: "center" },
        tooltip: { trigger: "item" },
        legend: { orient: "horizontal", left: "left", bottom: 10 },
        series: [
          {
            name: snakeToHuman(String(key1)),
            type: "pie",
            radius: "50%",
            data: pieData,
            emphasis: {
              itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: "rgba(0, 0, 0, 0.5)" },
            },
          },
        ],
      },
    },
    chartType: "piechart",
  };
}
/** Short readable date for x-axis (e.g. "Jan 25") */
function formatShortDate(value: any): string {
  if (!value) return 'N/A';

  try {
    const date = new Date(value);
    if (isNaN(date.getTime())) return String(value).slice(0, 10);

    return date.toLocaleDateString('en-US', {
      month: 'short',
      year: '2-digit'
    });
  } catch {
    return String(value).slice(0, 10);
  }
}

export function makeBar<T extends Record<string, any>>(
  parent_table: string,
  dataset: T[] | null | undefined,
  xKey: keyof T, // 'from_date'
  yKey: keyof T, // 'emissions_reduction' or 'vehicles_monitored'
  customTitle?: string
): ChartType {
  if (!dataset?.length) {
    return {
      parent_table,
      chart: { charts: getNoDataOption(customTitle ?? snakeToHuman(String(yKey))) },
      chartType: 'barchart'
    };
  }

  const xAxisData = dataset.map((item) => formatShortDate(item[xKey]));

  const seriesData = dataset.map((item) => {
    const v = item[yKey];
    return typeof v === 'number' && !isNaN(v) ? v : 0;
  });

  const option: echarts.EChartsOption = {
    backgroundColor: '#ffffff',
    title: {
      text: customTitle ?? snakeToHuman(String(yKey)),
      left: 'center',
      textStyle: { fontSize: 16, fontWeight: 600, color: '#1f2937' }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    grid: {
      left: '4%',
      right: '4%',
      bottom: '10%', // extra space for rotated labels
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: xAxisData,
      axisLabel: {
        rotate: 45,
        interval: 0,
        fontSize: 11.5,
        margin: 15,
        color: '#4b5563'
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: (value: number) =>
          value >= 1_000_000
            ? (value / 1_000_000).toFixed(1) + 'M'
            : value >= 1_000
              ? (value / 1_000).toFixed(1) + 'K'
              : value
      }
    },
    series: [
      {
        name: snakeToHuman(String(yKey)),
        type: 'bar',
        data: seriesData,
        barMaxWidth: 60,
        itemStyle: {
          color: '#3b82f6', // Tailwind blue-500
          borderRadius: [8, 8, 0, 0]
        },
        emphasis: {
          itemStyle: { color: '#2563eb' }
        }
      }
    ]
  };

  return {
    parent_table,
    chart: { charts: option },
    chartType: 'barchart'
  };
}


export function makeGroupedBar<T = any>(
  parent_table: string,
  dataset: T[] | null | undefined,
  key1: keyof T,
  groupFields: (keyof T)[],
  title: string
): ChartType {
  if (!dataset || dataset.length === 0 || groupFields.length === 0) {
    return {
      parent_table,
      chart: { charts: getNoDataOption(title) },
      chartType: "grouped_barchart",
    };
  }

  return {
    parent_table,
    chart: {
      charts: {
        title: { text: title },
        tooltip: {},
        legend: { data: groupFields.map((f) => snakeToHuman(String(f))) },
        xAxis: { data: dataset.map((item: T) => truncateDate(item[key1])) },
        yAxis: {
          axisLabel: {
            formatter: (value: number) =>
              value > 1000000
                ? (value / 1000000) + "M"
                : value > 1000
                  ? (value / 1000) + "K"
                  : value,
          },
        },
        series: groupFields.map((field) => ({
          name: snakeToHuman(String(field)),
          type: "bar",
          data: dataset.map((item: T) => {
            const v = item[field];
            return typeof v === "number" && v >= 0 ? v : null;
          }),
        })),
      },
    },
  };
}

// In your chart utils (TypeScript)
export function makeActualPotentialStackedBar(
  fullActualData: FullTabData | null | undefined,
  dataPotential: Record<string, number> | null | undefined,
  title: string
): ChartType {
  if (!fullActualData || !dataPotential) {
    return {
      chart: { charts: getNoDataOption(title) },
      chartType: "stackedbarchart",
    };
  }

  const keyToName: Record<string, string> = {
    '07': 'Aging Disability',
    '41': 'Workforce',
    '55': 'Economic Development',
    '64': 'Environmental',
    '71': 'Enterprise Solutions',
    '74': 'Public Safety',
    '76': 'Transportation',
    '92': 'Community Services'
  };

  const sortedKeys = Object.keys(tabCodeMap).sort((a, b) => Number(a) - Number(b));

  const categories = sortedKeys.map((code) => keyToName[code] ?? code);

  // Attach programs directly to each bar data point
  const actualData = sortedKeys.map((code) => ({
    value: fullActualData[code as TabCode].count,
    programs: fullActualData[code as TabCode].programs,
  }));

  const actualValues = actualData.map((d) => d.value);
  const potentialValues = sortedKeys.map((code) => dataPotential[code] ?? 0);
  const gapValues = potentialValues.map((p, i) => Math.max(0, p - actualValues[i]));

  const gapData = gapValues.map((gap, i) => ({
    value: gap,
    total: potentialValues[i],
  }));

  const option: echarts.EChartsOption = {
    backgroundColor: "#fff",
    title: {
      text: title,
      left: "center",
      textStyle: { fontWeight: "normal", fontSize: 18, fontFamily: 'Metropolis' },
    },
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      formatter: (params: any[]) => {
        const idx = params[0]?.dataIndex ?? 0;
        const categoryName = categories[idx];
        const actualItem = actualData[idx];
        const actual = actualItem.value;
        const gap = gapValues[idx];
        const total = potentialValues[idx];

        let html = `<b style="font-size:14px;">${categoryName}</b><br/>`;
        html += `Actual: <strong>${actual}</strong><br/>`;

        if (actualItem.programs.length > 0) {
          html += `<br/><b>Programs (${actualItem.programs.length}):</b><br/>`;
          html += actualItem.programs.map((p) => `• ${p}`).join('<br/>');
          html += '<br/><br/>';
        }

        html += `Remaining: ${gap}<br/>`;
        html += `<strong style="color:#5470c6">Potential: ${total}</strong>`;

        return html;
      },
    },
    legend: {
      data: ["Actual", "Available Programs"],
      top: 30,
    },
    grid: {
      left: 70,
      right: 50,
      bottom: 80,
      top: 100,
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: categories,
      axisLabel: {
        rotate: 45,
        interval: 0,
        fontSize: 12,
      },
    },
    yAxis: {
      type: "value",
      axisLabel: { fontSize: 12 },
    },
    series: [
      {
        name: "Actual",
        type: "bar",
        stack: "total",
        barWidth: "60px",
        data: actualData,
        itemStyle: { color: "#5470c6" },
        emphasis: { focus: "series" },
        label: {
          show: true,
          position: "inside",
          fontWeight: "bold",
          color: "#fff",
          formatter: (p: any) => (p.data.value > 0 ? p.data.value : ""),
        },
      },
      {
        name: "Available Programs",
        type: "bar",
        stack: "total",
        barWidth: "60px",
        data: gapData,
        itemStyle: { color: "#cccccc", opacity: 0.5 },
        emphasis: { focus: "series" },
        label: {
          show: true,
          position: "top",
          fontWeight: "bold",
          formatter: (p: any) => (p.data.total > 0 ? p.data.total : ""),
        },
      },
    ],
  };

  return {
    chart: { charts: option },
    chartType: "stackedbarchart",
  };
}

export const truncateDate = <T = any>(input: T): T | string =>
  input instanceof Date || (typeof input === "string" && input.endsWith("Z"))
    ? new Date(input as Date | string).toISOString().split("T")[0]
    : input;

function isInvalid(data: any) {
  return data === undefined || data === null;
}

export function splitTableData(tablesData: TableDataResult, tableName: string): any[] {
  const items = tablesData?.[tableName];
  return Array.isArray(items) ? items : [];
}

export function mapTableData(data: any[] | any, field: string) {
  if (isInvalid(data)) {
    return null;
  }
  if (Array.isArray(data)) {
    return data.map((row: any) => row[field]);
  } else if (typeof data === "object") {
    return data[field];
  }
  return data;
}

export function splitAndMapTable(tableData: TableDataResult, tableName: string, field: string) {
  const table = splitTableData(tableData, tableName);
  return mapTableData(table, field);
}

export function splitExpandedMapTable(tableData: TableDataResult, tableName: string, chosenSubtable: string, field: string) {
  const table = selectSplitSubtable(tableData, tableName, chosenSubtable)
  return mapTableData(table, field);
}

export function splitSubtables(tablesData: TableDataResult, tableName: string) {
  const splitData = splitTableData(tablesData, tableName);
  if (!splitData || splitData.length === 0) return null;
  console.log('split data in splitSubtables', splitData)
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
  const data = selectSplitSubtable(tableData, tableName, chosenSubtable);
  return mapTableData(data, field);
}

export function safeSelectObjectField<T extends object>(table: T | null | undefined, field: keyof T) {
  if (!table) return null;
  const data = table[field];
  if (isInvalid(data)) return null;
  return data;
}

export function accumulateArray(numArray: number[] | null) {
  return numArray?.reduce((acc: number, val) => acc + val, 0) ?? 0;
}

export function accumulateMappedFieldSubtable(tableData: TableDataResult, tableName: string, chosenSubtable: string, field: string) {
  const data = selectSplitSubtable(tableData, tableName, chosenSubtable);
  if (data === null) {
    return 0;
  }
  const mappedData = mapTableData(data, field);
  if (mappedData === null) {
    return 0;
  }
  if (typeof mappedData === "number") {
    return mappedData;
  }
  if (Array.isArray(mappedData)) {
    return accumulateArray(mappedData as number[]);
  }
  return 0;
}

export function accumulateMappedField(tableData: TableDataResult, tableName: string, field: string) {
  const data = splitAndMapTable(tableData, tableName, field);
  return accumulateArray(data as number[] | null);
}

export function collectAllSubrecords(tablesData: TableDataResult, tableName: string, subtable: string): any[] {
  const items = splitTableData(tablesData, tableName);
  if (!items) return [];
  return items.reduce((acc: any[], item: any) => {
    if (item.expand && item.expand[subtable]) {
      const sub = item.expand[subtable];
      if (Array.isArray(sub)) {
        acc.push(...sub);
      } else if (sub) {
        acc.push(sub);
      }
    }
    return acc;
  }, []);
}

/* === Emptiness Checks (simplified) === */
export const isChartEmptyOrAllZero = (chartType: ChartType): boolean => {
  const option = (chartType.chart?.charts ?? {}) as EChartsOption;

  const seriesArray = Array.isArray(option.series)
    ? option.series
    : option.series
      ? [option.series]
      : [];

  if (seriesArray.length === 0) return true;

  return seriesArray.every((s: any) => {
    const data = s?.data;
    if (!data) return true;

    const dataItems = Array.isArray(data) ? data : [data];

    return dataItems.every((d: any) => {
      // ✅ Handles BOTH formats used in your app:
      // 1. Plain numbers → makeBar / simple bars
      // 2. { value: number } → makeActualPotentialStackedBar
      let value: number | null | undefined;

      if (typeof d === 'number' || typeof d === 'string') {
        value = Number(d);
      } else if (d && typeof d === 'object' && d !== null) {
        value = d.value ?? d.val ?? null;
      } else {
        value = null;
      }

      return value == null || isNaN(value) || value === 0;
    });
  });
};

export const isIndicatorEmptyOrZero = (indicator: IndicatorType | undefined): boolean => {
  if (!indicator || indicator.indicatorVal == null) return true;
  const val = indicator.indicatorVal;
  return typeof val === "number" ? val === 0 : String(val).trim() === "" || String(val).trim() === "0";
};

export const isTableEmptyOrAllZero = (
  table: any[] | null | undefined
): boolean => !table || table.length === 0;

export const isChartAndIndicatorEmptyOrZero = (chartType: ChartType): boolean =>
  isChartEmptyOrAllZero(chartType) && isIndicatorEmptyOrZero(chartType.indicator);

export const isAllComponentsEmptyOrZero = (chartType: ChartType): boolean =>
  isChartEmptyOrAllZero(chartType) &&
  isIndicatorEmptyOrZero(chartType.indicator) &&
  isTableEmptyOrAllZero(chartType.table);

export const areAllChartsEmptyOrZero = (chartTypes: ChartType[]): boolean =>
  chartTypes.every(isAllComponentsEmptyOrZero);

export const hasAdworkForProgram = (
  adwork: AdworkType[] | undefined,
  parent_table: string | undefined
): boolean => {
  if (!adwork?.length || !parent_table) return false;
  return adwork.some(
    (item) => item.expand?.program?.parent_table === parent_table
  );
};

export const shouldRenderCard = (
  charts: ChartType[],
  additionalWork: AdworkType[] | undefined,
  program: ProgramType
): boolean => {
  const hasRealCharts = !areAllChartsEmptyOrZero(charts);
  const hasAdwork = hasAdworkForProgram(additionalWork, program.parent_table)
  console.log(`shouldRenderCard results for ${program.parent_table}. hasCharts: ${hasRealCharts}, hasAdwork: ${hasAdwork}`)
  if (!hasRealCharts) console.log(`Charts for ${program.parent_table}: ${charts}`)
  return hasRealCharts || hasAdwork;
};

/**
 * Core helper – builds clean table-ready data + columns from any array of PocketBase records.
 * Now includes optional `sortBy` (5th param in the public API).
 * • "fiscal_year" → ascending
 * • "-fiscal_year" → descending
 * Supports numbers, dates, strings (case-insensitive), and nulls intelligently.
 */
export function buildTableData(
  records: any[],
  hasMultipleSources: boolean = false,
  columnOrder: string[] = [],
  sortBy?: string   // "field" or "-field"
): { data: any[]; columns: string[] } | null {
  if (!records?.length) {
    return null;
  }

  const excludedKeys = [
    "collectionId",
    "collectionName",
    "id",
    "created",
    "from_date",
    "jurisdiction",
    "source_jurisdiction",
    "to_date",
    "updated",
    "FormData",
    "email",
    "address",
    "program",
  ];

  let columns: string[];

  if (columnOrder.length > 0) {
    columns = [...columnOrder];
    if (hasMultipleSources && !columns.includes("source")) {
      columns.unshift("source");
    }
  } else {
    const seen = new Set<string>();
    const keys: string[] = [];

    records.forEach((r) => {
      Object.keys(r).forEach((k) => {
        if (!excludedKeys.includes(k) && !seen.has(k)) {
          seen.add(k);
          keys.push(k);
        }
      });
    });

    if (hasMultipleSources) {
      const sourceIdx = keys.indexOf("source");
      if (sourceIdx !== -1) {
        keys.splice(sourceIdx, 1);
        keys.unshift("source");
      }
    }

    columns = keys;
  }

  // Shallow clones + sorting
  let data = records.map((r) => ({ ...r }));

  if (sortBy) {
    const isDescending = sortBy.startsWith('-');
    const field = isDescending ? sortBy.slice(1) : sortBy;

    data.sort((a, b) => {
      let valA = a[field];
      let valB = b[field];

      // Nulls last (asc) / first (desc)
      if (valA == null && valB == null) return 0;
      if (valA == null) return isDescending ? -1 : 1;
      if (valB == null) return isDescending ? 1 : -1;

      // Numbers (fiscal_year, funding, etc.)
      if (typeof valA === 'number' && typeof valB === 'number') {
        return isDescending ? valB - valA : valA - valB;
      }

      // Dates (PocketBase timestamps)
      if (typeof valA === 'string' && typeof valB === 'string') {
        const dateA = new Date(valA);
        const dateB = new Date(valB);
        if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
          return isDescending
            ? dateB.getTime() - dateA.getTime()
            : dateA.getTime() - dateB.getTime();
        }
      }

      // Strings (case-insensitive)
      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();
      return isDescending
        ? strB.localeCompare(strA)
        : strA.localeCompare(strB);
    });
  }

  return { data, columns };
}


/**
 * Main public function – drop-in replacement (no changes to existing calls).
 * New optional 5th parameter: `sortBy` (keeps parameter order intact).
 */
export function combineRelatedRecords(
  tablesData: Record<string, any>,
  parentCollection: string,
  relatedFields: string[] | null = null,
  columnOrder: string[] = [],
  sortBy?: string   // ← NEW: "fiscal_year" or "-fiscal_year"
): { data: any[]; columns: string[] } | null {
  const raw = tablesData[parentCollection];
  if (!raw) return null;

  // Supports both full PB response and direct array (your RTP case)
  const items: any[] = Array.isArray(raw)
    ? raw
    : (raw.items && Array.isArray(raw.items) ? raw.items : []);

  if (!items.length) {
    return null;
  }

  let combinedRecords: any[] = [];
  let hasMultipleSources = false;

  if (relatedFields && relatedFields.length > 0) {
    // Related expand mode
    const expand = items[0]?.expand ?? {};
    hasMultipleSources = relatedFields.length > 1;

    for (const field of relatedFields) {
      const rel = expand[field];
      if (!rel) continue;

      const relArray = Array.isArray(rel) ? rel : [rel];

      for (const record of relArray) {
        const newRecord = { ...record };
        if (hasMultipleSources) {
          newRecord.source = snakeToHuman(field);
        }
        combinedRecords.push(newRecord);
      }
    }
  } else {
    // Direct table.items mode
    hasMultipleSources = false;
    combinedRecords = items.map((item: any) => ({ ...item }));
  }

  if (combinedRecords.length === 0) {
    return null;
  }

  return buildTableData(combinedRecords, hasMultipleSources, columnOrder, sortBy);
}




