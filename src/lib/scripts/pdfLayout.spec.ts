import { describe, it, expect } from 'vitest';
import { planLayout, type PageSpec } from './pdfLayout';

const PAGE: PageSpec = {
	width: 8.5,
	height: 11,
	margin: 0.5,
	headerHeight: 0.35,
	footerHeight: 0.35,
	gap: 0.2,
	minSlice: 1
};

// Printable area: 7.5in wide, 9.3in tall (11 - 2*0.5 - 2*0.35)
const CONTENT_W = 7.5;
const TOP = 0.85;
const BOTTOM = 10.15;

describe('planLayout', () => {
	it('keeps every placement inside the printable area', () => {
		const { placements } = planLayout(
			[
				{ width: 7.3, height: 4.7 },
				{ width: 7.3, height: 4.7 },
				{ width: 7.3, height: 4.7 },
				{ width: 12, height: 3 }
			],
			PAGE
		);
		for (const p of placements) {
			expect(p.x).toBeGreaterThanOrEqual(PAGE.margin - 1e-9);
			expect(p.x + p.width).toBeLessThanOrEqual(PAGE.margin + CONTENT_W + 1e-9);
			expect(p.y).toBeGreaterThanOrEqual(TOP - 1e-9);
			expect(p.y + p.height).toBeLessThanOrEqual(BOTTOM + 1e-9);
		}
	});

	it('preserves aspect ratio: scale applies equally to width and height', () => {
		const { placements } = planLayout([{ width: 15, height: 6 }], PAGE);
		const [p] = placements;
		expect(p.scale).toBeCloseTo(CONTENT_W / 15);
		expect(p.width / p.height).toBeCloseTo(15 / 6);
	});

	it('never upscales small items', () => {
		const { placements } = planLayout([{ width: 3, height: 2 }], PAGE);
		expect(placements[0].scale).toBe(1);
		expect(placements[0].width).toBe(3);
	});

	it('does not emit a blank first page for a single item', () => {
		const { placements, pageCount } = planLayout([{ width: 7, height: 4 }], PAGE);
		expect(pageCount).toBe(1);
		expect(placements[0].page).toBe(1);
	});

	it('moves an item that does not fit the remaining space to the next page', () => {
		const { placements, pageCount } = planLayout(
			[
				{ width: 7, height: 6 },
				{ width: 7, height: 6 }
			],
			PAGE
		);
		expect(pageCount).toBe(2);
		expect(placements.map((p) => p.page)).toEqual([1, 2]);
		expect(placements[1].y).toBeCloseTo(TOP);
	});

	it('slices an item taller than one page and loses no height', () => {
		const height = 25;
		const { placements, pageCount } = planLayout([{ width: 7, height }], PAGE);
		expect(pageCount).toBeGreaterThan(2);
		const total = placements.reduce((sum, p) => sum + p.srcHeight, 0);
		expect(total).toBeCloseTo(height);
		// slices are contiguous
		let expectedSrc = 0;
		for (const p of placements) {
			expect(p.srcY).toBeCloseTo(expectedSrc);
			expectedSrc += p.srcHeight;
		}
	});

	it('skips zero-sized items', () => {
		const { placements } = planLayout([{ width: 0, height: 5 }, { width: 5, height: 2 }], PAGE);
		expect(placements).toHaveLength(1);
		expect(placements[0].item).toBe(1);
	});
});
