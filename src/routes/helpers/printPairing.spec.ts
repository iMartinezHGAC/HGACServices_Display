import { describe, it, expect } from 'vitest';
import { aloneInRow, categoryCount, fitsHalfWidth, legendNames, pairForPrint } from './printPairing';

const pie = (n: number, legend: any = { bottom: 0 }) => ({
	legend,
	series: [
		{ type: 'pie', data: Array.from({ length: n }, (_, i) => ({ name: `Cat ${i}`, value: i + 1 })) },
		// getStandardPieSeries draws a second, transparent pie with the same names
		{ type: 'pie', data: Array.from({ length: n }, (_, i) => ({ name: `Cat ${i}`, value: i + 1 })) }
	]
});

describe('legendNames', () => {
	it('lists pie data items once each', () => {
		expect(legendNames(pie(3) as any)).toEqual(['Cat 0', 'Cat 1', 'Cat 2']);
	});

	it('lists series names for non-pie charts', () => {
		const option = { legend: {}, series: [{ type: 'bar', name: 'A' }, { type: 'bar', name: 'B' }] };
		expect(legendNames(option as any)).toEqual(['A', 'B']);
	});

	it('is empty without a visible legend', () => {
		expect(legendNames({ series: [{ type: 'bar', name: 'A' }] } as any)).toEqual([]);
		expect(legendNames(pie(3, { show: false }) as any)).toEqual([]);
	});

	it('honours an explicit legend.data list', () => {
		const option = {
			legend: { data: ['B', 'Missing'] },
			series: [{ type: 'bar', name: 'A' }, { type: 'bar', name: 'B' }]
		};
		expect(legendNames(option as any)).toEqual(['B']);
	});
});

describe('fitsHalfWidth', () => {
	it('accepts a pie with a modest legend', () => {
		expect(fitsHalfWidth(pie(8) as any)).toBe(true);
	});

	it('rejects a legend too long to sit under a half-width chart', () => {
		expect(fitsHalfWidth(pie(20) as any)).toBe(false);
	});

	it('rejects a bar chart with too many categories', () => {
		const option = { xAxis: { type: 'category', data: Array.from({ length: 30 }, (_, i) => i) }, series: [] };
		expect(categoryCount(option as any)).toBe(30);
		expect(fitsHalfWidth(option as any)).toBe(false);
	});

	it('rejects a missing option', () => {
		expect(fitsHalfWidth(null)).toBe(false);
	});
});

describe('pairForPrint', () => {
	const half = (c: string) => c.startsWith('h');

	it('pairs consecutive capable cells', () => {
		expect(pairForPrint(['h1', 'h2', 'h3', 'h4'], half)).toEqual([['h1', 'h2'], ['h3', 'h4']]);
	});

	it('leaves an unpaired capable cell on its own row', () => {
		expect(pairForPrint(['h1', 'f1', 'h2', 'h3', 'h4'], half)).toEqual([['h1'], ['f1'], ['h2', 'h3'], ['h4']]);
	});
});

describe('aloneInRow', () => {
	const full = (c: string) => c.startsWith('f');

	it('finds the odd cell out at the end', () => {
		expect(aloneInRow(['a', 'b', 'c'], full)).toEqual([false, false, true]);
	});

	it('finds a cell left alone before a full-row cell', () => {
		expect(aloneInRow(['a', 'f1', 'b', 'c'], full)).toEqual([true, false, false, false]);
	});

	it('treats a single cell as alone', () => {
		expect(aloneInRow(['a'], full)).toEqual([true]);
	});
});
