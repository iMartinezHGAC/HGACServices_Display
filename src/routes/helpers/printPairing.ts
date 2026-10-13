import type { EChartsOption } from 'echarts';

/**
 * Print layout: which charts share a row on paper.
 *
 * Two charts print side by side (each ~3.5in wide) when both have room for their
 * plot and their legend at that width. A paired chart's legend is moved out of the
 * chart and printed as text just below it (see RenderEchart), so the limits here
 * are about keeping the plot and the legend readable, not about the legend fitting
 * inside the chart.
 *
 * Kept free of DOM / Svelte imports so it can be unit-tested in isolation.
 */

/** More legend entries than this and the legend would be taller than the chart. */
export const MAX_HALF_LEGEND_ITEMS = 12;
/** More axis categories than this and the axis labels collide at half width. */
export const MAX_HALF_CATEGORIES = 12;

const asArray = <T>(v: T | T[] | undefined | null): T[] => (v == null ? [] : Array.isArray(v) ? v : [v]);

/** Series whose legend entries are their data items rather than the series itself. */
const ITEM_LEGEND_TYPES = new Set(['pie', 'funnel']);

/** Names the chart's legend shows, in order. Empty when the chart has no visible legend. */
export function legendNames(option: EChartsOption | null | undefined): string[] {
	if (!option) return [];
	const legends = asArray(option.legend as any);
	if (legends.length === 0 || legends.every((l: any) => l?.show === false)) return [];

	const names: string[] = [];
	const seen = new Set<string>();
	const add = (name: unknown) => {
		if (name == null || name === '') return;
		const key = String(name);
		if (seen.has(key)) return;
		seen.add(key);
		names.push(key);
	};

	for (const s of asArray(option.series as any)) {
		if (ITEM_LEGEND_TYPES.has(s?.type)) {
			for (const d of asArray(s.data)) add((d as any)?.name);
		} else {
			add(s?.name);
		}
	}

	// An explicit legend.data list filters and orders the entries
	const explicit = legends
		.flatMap((l: any) => asArray(l?.data))
		.map((d: any) => (typeof d === 'string' ? d : d?.name))
		.filter((n: unknown): n is string => typeof n === 'string');
	return explicit.length > 0 ? explicit.filter((n) => seen.has(n)) : names;
}

/** Largest number of categories on any category axis. */
export function categoryCount(option: EChartsOption | null | undefined): number {
	if (!option) return 0;
	const axes = [...asArray(option.xAxis as any), ...asArray(option.yAxis as any)];
	return axes.reduce(
		(max: number, a: any) => (a?.type === 'category' || Array.isArray(a?.data) ? Math.max(max, asArray(a.data).length) : max),
		0
	);
}

/** Whether a chart stays readable at half the printable width with its legend below it. */
export function fitsHalfWidth(option: EChartsOption | null | undefined): boolean {
	if (!option) return false;
	return legendNames(option).length <= MAX_HALF_LEGEND_ITEMS && categoryCount(option) <= MAX_HALF_CATEGORIES;
}

/**
 * Groups cells into print rows. Consecutive half-width-capable cells are paired;
 * everything else (and a capable cell left without a partner) gets a row of its own.
 */
export function pairForPrint<T>(cells: T[], canHalf: (cell: T) => boolean): T[][] {
	const rows: T[][] = [];
	for (let i = 0; i < cells.length; i++) {
		if (i + 1 < cells.length && canHalf(cells[i]) && canHalf(cells[i + 1])) {
			rows.push([cells[i], cells[i + 1]]);
			i++;
		} else {
			rows.push([cells[i]]);
		}
	}
	return rows;
}

/**
 * For a two-column grid filled in order: which cells end up alone in their row.
 * A cell that `spansRow` takes a whole row itself and is never reported as alone.
 */
export function aloneInRow<T>(cells: T[], spansRow: (cell: T) => boolean): boolean[] {
	const alone = cells.map(() => false);
	let column = 0;
	cells.forEach((cell, i) => {
		if (spansRow(cell)) {
			column = 0;
		} else if (column === 1) {
			column = 0;
		} else {
			const next = cells[i + 1];
			if (next === undefined || spansRow(next)) alone[i] = true;
			else column = 1;
		}
	});
	return alone;
}
