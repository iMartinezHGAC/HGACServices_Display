import type { EChartsOption } from 'echarts';

/**
 * Chart look from the Civic Light design (ui-alternatives 01): HGAC brand palette, left-aligned
 * bold titles, quiet axes with light gridlines, donuts with white gaps between slices, bars with
 * rounded ends, small rounded legend keys and a light tooltip.
 *
 * The chart builders (chartFormatters.ts, page-level options, drilldown handlers) each set their
 * own fonts, colours and pie radii, so a theme's defaults alone would not reach them. Instead
 * RenderEchart passes every option through `styleChart` on its way to ECharts, drilldowns
 * included. Positions, formatters and data are left alone; only the look changes. The input is
 * never mutated (callers reuse their options, e.g. to restore a chart after a drilldown).
 */

export const CHART_COLORS = [
	'#025773', // hgac-blue
	'#C6093B', // hgac-red
	'#EF9021', // hgac-orange
	'#25B5AF', // hgac-lightblue
	'#7AB66F', // hgac-green
	'#002F47', // hgac-slate
	'#4E7F45', // darker hgac-green
	'#F5B66B', // lighter hgac-orange
	'#6C9BAD', // lighter hgac-blue
	'#B4B4B4' // hgac-gray
];

const INK = '#002F47';
const MUTED = '#4F6673';
const SOFT = '#8A9AA3';
const LINE = '#E1E6E9';
const GRID = '#EEF2F4';
const FONT = 'Metropolis, sans-serif';

type Obj = Record<string, any>;

/**
 * Styled options that put their legend beside a donut, with the legend formatter for a given
 * room (px; Infinity = full names). Names are shortened to fit, never the share after them.
 */
const sideLegendCharts = new WeakMap<object, (room: number) => (name: string) => string>();

/** The side legend's formatter for a chart `chartWidth` wide (null: full names), if it has one. */
export function sideLegendFormatter(option: unknown, chartWidth: number | null) {
	const make = isObj(option) ? sideLegendCharts.get(option) : undefined;
	return make ? make(chartWidth === null ? Infinity : sideLegendWidths(chartWidth).legendText) : null;
}

/** Room for legend text beside a donut, and for a title across the chart, at a given chart width. */
export function sideLegendWidths(chartWidth: number) {
	return {
		legendText: Math.max(90, Math.round(chartWidth * 0.42) - 40),
		title: Math.max(120, chartWidth - 32)
	};
}

let measure: CanvasRenderingContext2D | null | undefined;
/** Width of legend text (12px Metropolis) in px; an estimate where there is no canvas. */
function textWidth(text: string): number {
	if (measure === undefined) measure = typeof document === 'undefined' ? null : document.createElement('canvas').getContext('2d');
	if (!measure) return text.length * 6.6;
	measure.font = `12px ${FONT}`;
	return measure.measureText(text).width;
}

function fitText(text: string, room: number): string {
	if (textWidth(text) <= room) return text;
	let end = text.length;
	while (end > 1 && textWidth(text.slice(0, end).trimEnd() + '…') > room) end--;
	return text.slice(0, end).trimEnd() + '…';
}

const isObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v);

/** Applies `fn` to a component that may be a single object or an array of them. */
function each<T>(value: T | T[] | undefined, fn: (item: Obj) => Obj): T | T[] | undefined {
	if (Array.isArray(value)) return value.map((v) => (isObj(v) ? fn(v) : v)) as T[];
	return isObj(value) ? (fn(value) as T) : value;
}

/** A title placed in the middle of the chart is a donut's centre label: keep it where it is. */
const isCentreLabel = (t: Obj) => ['center', 'middle'].includes(t.top) || (typeof t.top === 'string' && t.top.endsWith('%') && parseFloat(t.top) > 20);

function styleTitle(t: Obj): Obj {
	if (isCentreLabel(t)) {
		return { ...t, textStyle: { ...t.textStyle, color: INK, fontFamily: FONT } };
	}
	return {
		...t,
		left: 16,
		top: t.top ?? 12,
		textAlign: 'left',
		textStyle: { ...t.textStyle, fontSize: 16, fontWeight: 700, color: INK, fontFamily: FONT },
		subtextStyle: { ...t.subtextStyle, fontSize: 13, color: MUTED, fontFamily: FONT }
	};
}

function styleLegend(l: Obj): Obj {
	// a legend along the top shares the row with the (left-aligned) title: move it to the right
	const atTop = l.bottom === undefined && l.orient !== 'vertical';
	const place = atTop && (l.left === undefined || l.left === 'center') ? { left: 'auto', right: 16 } : l.left === 'left' ? { left: 16 } : {};
	return {
		...l,
		...place,
		icon: l.icon ?? 'roundRect',
		itemWidth: 10,
		itemHeight: 10,
		itemGap: Math.max(Number(l.itemGap ?? 0), 16),
		textStyle: { ...l.textStyle, fontSize: 12, color: MUTED, fontFamily: FONT },
		pageTextStyle: { ...l.pageTextStyle, color: MUTED }
	};
}

function styleAxis(a: Obj): Obj {
	const value = a.type === 'value' || a.type === 'log';
	return {
		...a,
		axisLine: { ...a.axisLine, show: value ? false : (a.axisLine?.show ?? true), lineStyle: { ...a.axisLine?.lineStyle, color: LINE } },
		axisTick: { ...a.axisTick, show: false },
		axisLabel: { ...a.axisLabel, color: SOFT, fontSize: 11, fontFamily: FONT },
		splitLine: value ? { ...a.splitLine, show: a.splitLine?.show ?? true, lineStyle: { ...a.splitLine?.lineStyle, color: GRID } } : { ...a.splitLine, show: false },
		nameTextStyle: { ...a.nameTextStyle, color: SOFT, fontSize: 11, fontFamily: FONT }
	};
}

function styleTooltip(t: Obj): Obj {
	return {
		...t,
		backgroundColor: '#ffffff',
		borderColor: LINE,
		borderWidth: 1,
		padding: [8, 12],
		textStyle: { ...t.textStyle, color: INK, fontSize: 12, fontFamily: FONT },
		extraCssText: 'border-radius: 8px; box-shadow: 0 4px 12px rgb(0 47 71 / 0.12);'
	};
}

/** A single pie radius is a solid pie; the design draws donuts. */
function toDonut(radius: unknown): unknown {
	if (Array.isArray(radius)) return radius;
	const outer = typeof radius === 'string' || typeof radius === 'number' ? radius : '68%';
	const outerPct = typeof outer === 'string' && outer.endsWith('%') ? parseFloat(outer) : null;
	return [outerPct ? `${Math.round(outerPct * 0.58)}%` : '40%', outer];
}

function stylePie(s: Obj): Obj {
	const overlay = s.itemStyle?.opacity === 0; // transparent twin that only carries inside labels
	const styled: Obj = {
		...s,
		radius: toDonut(s.radius),
		label: s.label && {
			...s.label,
			color: s.label.position === 'inside' ? '#ffffff' : MUTED,
			fontSize: s.label.position === 'inside' ? 11 : 12,
			fontWeight: s.label.position === 'inside' ? 700 : 500,
			fontFamily: FONT
		},
		labelLine: s.labelLine && { ...s.labelLine, lineStyle: { ...s.labelLine.lineStyle, color: '#C5CED3', width: 1 } }
	};
	if (!overlay) {
		styled.itemStyle = { ...s.itemStyle, borderColor: '#ffffff', borderWidth: 2, borderRadius: 4 };
		styled.emphasis = { ...s.emphasis, scale: true, scaleSize: 4, itemStyle: { ...s.emphasis?.itemStyle, shadowBlur: 0 } };
	}
	return styled;
}

function styleBar(s: Obj, horizontal: boolean): Obj {
	// round only the free end; stacked segments stay square so they butt together
	const radius = s.stack ? 0 : horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0];
	return {
		...s,
		barMaxWidth: s.barMaxWidth ?? 40,
		itemStyle: { ...s.itemStyle, borderRadius: radius },
		label: s.label && { ...s.label, fontFamily: FONT, fontSize: 11 },
		emphasis: { ...s.emphasis, itemStyle: { ...s.emphasis?.itemStyle, shadowBlur: 0 } }
	};
}

function styleLine(s: Obj): Obj {
	return {
		...s,
		symbol: s.symbol ?? 'circle',
		symbolSize: s.symbolSize ?? 6,
		showSymbol: s.showSymbol ?? false,
		lineStyle: { ...s.lineStyle, width: 3 },
		areaStyle: s.stack ? s.areaStyle : { opacity: 0.15, ...s.areaStyle }
	};
}

/**
 * The design's donut: ring on the left, legend on the right listing each slice's share. Outside
 * callouts go (values stay inside the ring and in the tooltip). Only for a plain pie chart: a
 * chart with a centre label or graphics is laid out around the middle, so it is left as it is.
 */
function donutWithSideLegend(o: Obj, chartWidth?: number): Obj {
	const series: Obj[] = Array.isArray(o.series) ? o.series : [o.series];
	const pies = series.filter((s) => s?.type === 'pie');
	if (pies.length === 0 || pies.length !== series.length) return o;
	if (o.graphic || (Array.isArray(o.title) ? o.title : [o.title]).some((t: any) => isObj(t) && isCentreLabel(t))) return o;
	if (Array.isArray(o.legend) || !isObj(o.legend) || o.legend.show === false) return o;

	const data: Obj[] = (pies.find((s) => s.itemStyle?.opacity !== 0) ?? pies[0]).data ?? [];
	const total = data.reduce((sum, d) => sum + (Number(isObj(d) ? d.value : d) || 0), 0);
	const share = new Map(data.filter(isObj).map((d) => [String(d.name), total ? (Number(d.value) / total) * 100 : 0]));
	const own = o.legend.formatter;
	const label = (name: string) =>
		typeof own === 'function' ? String(own(name)) : typeof own === 'string' ? own.replace(/\{name\}/g, name) : name;

	// plain text (no rich markup): the print legend reuses this formatter's output
	const formatterFor = (room: number) => (name: string) => {
		const pct = share.get(name);
		if (pct === undefined) return fitText(label(name), room);
		const suffix = `   ${pct.toFixed(1)}%`;
		return fitText(label(name), room - textWidth(suffix)) + suffix;
	};

	const widths = chartWidth ? sideLegendWidths(chartWidth) : null;
	const fit = (w: number) => ({ width: w, overflow: 'truncate', ellipsis: '…' });
	const styled: Obj = {
		...o,
		title: widths && isObj(o.title) ? { ...o.title, textStyle: { ...o.title.textStyle, ...fit(widths.title) } } : o.title,
		legend: {
			...o.legend,
			type: 'scroll',
			orient: 'vertical',
			left: '58%',
			right: 16,
			top: 'middle',
			bottom: undefined,
			width: undefined,
			itemGap: 12,
			tooltip: { show: true }, // the full name, when it was cut short
			formatter: formatterFor(widths ? widths.legendText : Infinity)
		},
		series: series.map((s) => ({
			...s,
			center: ['30%', '52%'],
			radius: ['34%', '56%'],
			...(s.itemStyle?.opacity === 0 ? {} : { label: { ...s.label, show: false }, labelLine: { ...s.labelLine, show: false } })
		}))
	};
	sideLegendCharts.set(styled, formatterFor);
	return styled;
}

/** `chartWidth`: the chart's current width in px, so long legend names and titles are fitted to it. */
export function styleChart<T extends EChartsOption | null | undefined>(option: T, chartWidth?: number): T {
	if (!isObj(option)) return option;
	const o: Obj = { ...option };

	o.backgroundColor = 'transparent';
	o.textStyle = { ...o.textStyle, fontFamily: FONT, color: MUTED };
	if (o.title) o.title = each(o.title, styleTitle);
	if (o.legend) o.legend = each(o.legend, styleLegend);
	if (o.tooltip) o.tooltip = each(o.tooltip, styleTooltip);
	if (o.xAxis) o.xAxis = each(o.xAxis, styleAxis);
	if (o.yAxis) o.yAxis = each(o.yAxis, styleAxis);

	if (o.series) {
		const yAxes = Array.isArray(o.yAxis) ? o.yAxis : [o.yAxis];
		const horizontal = yAxes.some((a: any) => a?.type === 'category');
		o.series = each(o.series, (s) =>
			s.type === 'pie' ? stylePie(s) : s.type === 'bar' ? styleBar(s, horizontal) : s.type === 'line' ? styleLine(s) : s
		);
	}
	return donutWithSideLegend(o, chartWidth) as T;
}
