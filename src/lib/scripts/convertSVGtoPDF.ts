import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas-pro';
import { planLayout, type ItemSize, type PageSpec } from './pdfLayout';

/**
 * Raster PDF export (legacy path).
 *
 * Each element is cloned off-screen, rendered with html2canvas and placed on a
 * Letter page by `planLayout`. Text in the result is an image; the browser
 * print path (see printState.svelte.ts) produces vector, selectable output.
 */

const PX_PER_IN = 96;
const CANVAS_SCALE = 2;
const JPEG_QUALITY = 0.92;

const PAGE: PageSpec = {
	width: 8.5,
	height: 11,
	margin: 0.5,
	headerHeight: 0.35,
	footerHeight: 0.35,
	gap: 0.2,
	minSlice: 1
};

/** A link found inside a captured element, in CSS px relative to that element. */
interface LinkBox {
	href: string;
	x: number;
	y: number;
	width: number;
	height: number;
}

interface Capture {
	canvas: HTMLCanvasElement;
	/** Element size in CSS px. */
	width: number;
	height: number;
	links: LinkBox[];
}

const nextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

/**
 * `cloneNode` copies a <canvas> element but not its pixels, so any canvas-rendered
 * chart (ECharts' default renderer) would come out blank. Swap each cloned canvas
 * for an <img> of the live canvas' current contents.
 */
async function freezeCanvases(source: HTMLElement, clone: HTMLElement) {
	const live = source.querySelectorAll('canvas');
	const copies = clone.querySelectorAll('canvas');

	await Promise.all(
		Array.from(live).map(async (canvas, i) => {
			const copy = copies[i];
			if (!copy) return;
			try {
				const img = document.createElement('img');
				img.src = canvas.toDataURL('image/png');
				img.className = copy.className;
				img.style.width = canvas.style.width || `${canvas.clientWidth}px`;
				img.style.height = canvas.style.height || `${canvas.clientHeight}px`;
				await img.decode().catch(() => undefined);
				copy.replaceWith(img);
			} catch (error) {
				// e.g. a tainted canvas; leave the (blank) clone rather than abort the export
				console.warn('Could not snapshot canvas for PDF export', error);
			}
		})
	);
}

async function captureElement(element: HTMLElement, host: HTMLElement): Promise<Capture> {
	const clone = element.cloneNode(true) as HTMLElement;
	const width = Math.ceil(element.offsetWidth || element.getBoundingClientRect().width || 1000);

	clone.style.position = 'static';
	clone.style.visibility = 'visible';
	clone.style.width = `${width}px`;
	clone.style.height = 'auto';
	clone.style.overflow = 'visible';

	// UI chrome that should not appear in the document
	clone.querySelectorAll('[data-export-ignore], .expand-toggle').forEach((n) => n.remove());

	await freezeCanvases(element, clone);

	host.style.width = `${width}px`;
	host.appendChild(clone);

	try {
		// Measure only AFTER the clone is in the DOM; detached nodes report zero-size rects.
		await document.fonts?.ready;
		await nextFrame();
		await nextFrame();

		const cloneRect = clone.getBoundingClientRect();
		const height = Math.ceil(cloneRect.height);

		const links: LinkBox[] = Array.from(clone.querySelectorAll<HTMLAnchorElement>('a[href]'))
			.map((a) => {
				const r = a.getBoundingClientRect();
				return {
					href: a.href,
					x: r.left - cloneRect.left,
					y: r.top - cloneRect.top,
					width: r.width,
					height: r.height
				};
			})
			.filter((l) => l.width > 0 && l.height > 0 && /^(https?:|mailto:)/i.test(l.href));

		const canvas = await html2canvas(clone, {
			scale: CANVAS_SCALE,
			useCORS: true,
			allowTaint: false,
			width,
			height,
			backgroundColor: '#ffffff',
			logging: false
		});

		return { canvas, width, height, links };
	} finally {
		clone.remove();
	}
}

/** Crop [sy, sy + sh) (canvas px) out of a canvas. */
function cropCanvas(source: HTMLCanvasElement, sy: number, sh: number): HTMLCanvasElement {
	const out = document.createElement('canvas');
	out.width = source.width;
	out.height = sh;
	const ctx = out.getContext('2d');
	if (!ctx) throw new Error('Failed to get 2D canvas context');
	ctx.fillStyle = '#ffffff';
	ctx.fillRect(0, 0, out.width, out.height);
	ctx.drawImage(source, 0, sy, source.width, sh, 0, 0, source.width, sh);
	return out;
}

const pad = (n: number) => n.toString().padStart(2, '0');

export default async function exportChartToPDF(
	vectors: HTMLElement[],
	title = 'Harris County'
): Promise<void> {
	const targets = vectors.filter((v) => v && v.isConnected);
	if (targets.length === 0) {
		console.warn('exportChartToPDF: nothing to export');
		return;
	}

	// Off-screen host. Not `visibility: hidden`, which html2canvas would honour.
	const host = document.createElement('div');
	host.setAttribute('aria-hidden', 'true');
	host.style.cssText =
		'position:fixed;left:-10000px;top:0;pointer-events:none;overflow:visible;background:#fff;';
	document.body.appendChild(host);

	try {
		const captures: Capture[] = [];
		for (const target of targets) {
			captures.push(await captureElement(target, host)); // sequential: html2canvas is heavy
		}

		const sizes: ItemSize[] = captures.map((c) => ({
			width: c.width / PX_PER_IN,
			height: c.height / PX_PER_IN
		}));
		const { placements, pageCount } = planLayout(sizes, PAGE);

		const pdf = new jsPDF({ orientation: 'p', unit: 'in', format: 'letter', compress: true });
		for (let p = 2; p <= pageCount; p++) pdf.addPage();

		for (const pl of placements) {
			const cap = captures[pl.item];
			pdf.setPage(pl.page);

			// canvas pixels per output inch for this item
			const pxPerInch = cap.canvas.width / pl.width;
			const sy = Math.min(Math.round(pl.srcY * pxPerInch), cap.canvas.height - 1);
			const sh = Math.max(1, Math.min(Math.round(pl.srcHeight * pxPerInch), cap.canvas.height - sy));
			const isWhole = sy === 0 && sh >= cap.canvas.height - 1;

			const source = isWhole ? cap.canvas : cropCanvas(cap.canvas, sy, sh);
			// Derive height from the pixels actually drawn, so rounding can't distort the aspect ratio.
			pdf.addImage(
				source.toDataURL('image/jpeg', JPEG_QUALITY),
				'JPEG',
				pl.x,
				pl.y,
				pl.width,
				source.height / pxPerInch
			);

			// Real, clickable link annotations laid over the image
			const inchesPerCssPx = pl.scale / PX_PER_IN;
			for (const link of cap.links) {
				const linkTop = link.y * inchesPerCssPx;
				const linkBottom = linkTop + link.height * inchesPerCssPx;
				const top = Math.max(linkTop, pl.srcY);
				const bottom = Math.min(linkBottom, pl.srcY + pl.srcHeight);
				if (bottom - top <= 0) continue;

				pdf.link(
					pl.x + link.x * inchesPerCssPx,
					pl.y + (top - pl.srcY),
					link.width * inchesPerCssPx,
					bottom - top,
					{ url: link.href }
				);
			}
		}

		// Running header / footer on every page
		const now = new Date();
		const displayDate = now.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
		const fileDate = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

		pdf.setFontSize(9);
		pdf.setTextColor(80, 80, 80);
		for (let p = 1; p <= pageCount; p++) {
			pdf.setPage(p);
			pdf.text(title, PAGE.margin, PAGE.margin + 0.2);
			pdf.text(displayDate, PAGE.width - PAGE.margin, PAGE.margin + 0.2, { align: 'right' });
			pdf.text(`Page ${p} of ${pageCount}`, PAGE.width / 2, PAGE.height - PAGE.margin - 0.1, {
				align: 'center'
			});
		}

		const slug =
			title
				.toLowerCase()
				.replace(/[^a-z0-9]+/g, '-')
				.replace(/^-+|-+$/g, '') || 'export';

		pdf.save(`${slug}-${fileDate}.pdf`); // once (previously saved twice)
	} finally {
		host.remove(); // runs on success *and* failure
	}
}
