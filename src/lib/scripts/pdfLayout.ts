/**
 * Pure page-layout planner for PDF export. All units are inches.
 *
 * Items are stacked top-to-bottom in a single column, centred horizontally and
 * never upscaled. An item taller than the space left on the page moves to the
 * next page; an item taller than a whole page is sliced across pages.
 *
 * Kept free of DOM / jsPDF imports so it can be unit-tested in isolation.
 */

export interface PageSpec {
	width: number;
	height: number;
	margin: number;
	/** Reserved strip below the top margin for the running header. */
	headerHeight: number;
	/** Reserved strip above the bottom margin for the running footer. */
	footerHeight: number;
	/** Vertical gap between consecutive items. */
	gap: number;
	/** Do not start a slice in less than this much remaining space. */
	minSlice: number;
}

export interface ItemSize {
	width: number;
	height: number;
}

export interface Placement {
	/** Index into the input `items` array. */
	item: number;
	/** 1-based page number. */
	page: number;
	/** Left edge on the page. */
	x: number;
	/** Top edge on the page. */
	y: number;
	/** Rendered width on the page. */
	width: number;
	/** Rendered height of this slice on the page. */
	height: number;
	/** Offset of this slice from the top of the (scaled) item. */
	srcY: number;
	/** Height of this slice, measured in the (scaled) item. */
	srcHeight: number;
	/** Output inches per natural inch (<= 1). */
	scale: number;
}

const EPSILON = 1e-6;

export function planLayout(
	items: ItemSize[],
	spec: PageSpec
): { placements: Placement[]; pageCount: number } {
	const contentWidth = spec.width - 2 * spec.margin;
	const top = spec.margin + spec.headerHeight;
	const bottom = spec.height - spec.margin - spec.footerHeight;
	const contentHeight = bottom - top;

	if (contentWidth <= 0 || contentHeight <= 0) {
		throw new Error('planLayout: page margins leave no printable area');
	}

	const placements: Placement[] = [];
	let page = 1;
	let cursor = top;

	const newPage = () => {
		page += 1;
		cursor = top;
	};

	items.forEach((item, index) => {
		if (!(item.width > 0) || !(item.height > 0)) return; // nothing to draw

		const scale = Math.min(1, contentWidth / item.width);
		const outWidth = item.width * scale;
		const outHeight = item.height * scale;
		const x = spec.margin + (contentWidth - outWidth) / 2;

		// Fits on one page, but not in what is left of this one -> start a new page.
		if (outHeight <= contentHeight + EPSILON && outHeight > bottom - cursor + EPSILON) {
			newPage();
		}

		let remaining = outHeight;
		let srcY = 0;

		while (remaining > EPSILON) {
			let available = bottom - cursor;
			if (remaining > available + EPSILON && available < spec.minSlice) {
				newPage();
				available = bottom - cursor;
			}

			const take = Math.min(remaining, available);
			placements.push({
				item: index,
				page,
				x,
				y: cursor,
				width: outWidth,
				height: take,
				srcY,
				srcHeight: take,
				scale
			});

			remaining -= take;
			srcY += take;
			cursor += take;

			if (remaining > EPSILON) newPage();
		}

		cursor += spec.gap;
	});

	return { placements, pageCount: page };
}
