import { tick } from 'svelte';

/**
 * Print mode.
 *
 * While `active` is true, components render their "print version": accordions
 * expanded, clamped text unclamped, chart animations off. It is switched on by
 * `printPage()` (the Print button) and, as a best effort, by the browser's own
 * `beforeprint` event (Ctrl/Cmd+P).
 */
let active = $state(false);

export function printState() {
	return {
		get active() {
			return active;
		}
	};
}

/**
 * File name. Browsers name "Save as PDF" files after `document.title`, so while printing the
 * title is swapped for "<Jurisdiction> - <Tab> - <YYYY-MM-DD>" and put back afterwards.
 */
let titleParts: string[] = [];
let savedTitle: string | null = null;

/** Called from the root layout whenever the jurisdiction or tab changes. */
export function setPrintTitleParts(parts: (string | null | undefined)[]) {
	titleParts = parts.map((p) => (p ?? '').trim()).filter(Boolean);
}

function applyPrintTitle() {
	if (titleParts.length === 0 || savedTitle !== null) return; // nothing to name it after, or already applied
	const now = new Date();
	const pad = (n: number) => String(n).padStart(2, '0');
	const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
	savedTitle = document.title;
	// characters that are illegal in file names on Windows/macOS become dashes
	document.title = [...titleParts, date].join(' - ').replace(/[\\/:*?"<>|]+/g, '-');
}

function restoreTitle() {
	if (savedTitle === null) return;
	document.title = savedTitle;
	savedTitle = null;
}

const nextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

/**
 * Fonts. Browsers download a web font only once something on screen uses it, and print a
 * snapshot without waiting for downloads still in flight: content that first appears in print
 * mode (masthead, expanded sections, chart legends) then prints in a fallback system font, and
 * only a second attempt (font now cached) comes out right. So every declared face that covers
 * Latin text is fetched up front, and the Print button also waits for it.
 */
let fontsLoading: Promise<unknown> | null = null;

const coversLatin = (face: FontFace) => /U\+0+-(?:0*FF|10FFFF)\b/i.test(face.unicodeRange);

function preloadFonts(): Promise<unknown> {
	if (typeof document === 'undefined' || !document.fonts) return Promise.resolve();
	fontsLoading ??= Promise.allSettled(
		Array.from(document.fonts)
			.filter(coversLatin)
			.map((face) => face.load())
	).then(() => document.fonts.ready);
	return fontsLoading;
}

/** Resolves when `promise` does, or after `ms`, whichever is first: never block printing for long. */
const atMost = (promise: Promise<unknown>, ms: number) =>
	Promise.race([promise, new Promise((resolve) => setTimeout(resolve, ms))]);

/**
 * Switch to print mode, wait for the expanded content and charts to render,
 * then open the browser's print dialog ("Save as PDF" is a destination there).
 */
export async function printPage() {
	if (typeof window === 'undefined' || active) return;

	window.addEventListener(
		'afterprint',
		() => {
			active = false;
			restoreTitle();
		},
		{ once: true }
	);
	active = true;

	await tick(); // Svelte applies the expanded state to the DOM
	await nextFrame();
	await nextFrame();
	await new Promise((resolve) => setTimeout(resolve, 150)); // let freshly mounted charts paint
	// fonts used by the print version (see preloadFonts); capped so a slow network can't stall the dialog
	await atMost(Promise.all([preloadFonts(), document.fonts?.ready]), 4000);
	await nextFrame(); // re-layout with the fonts in place

	applyPrintTitle();
	window.print();
}

/** Covers Ctrl/Cmd+P and the browser menu. Call once from the root layout. */
export function installPrintListeners() {
	const before = () => {
		active = true;
		applyPrintTitle();
	};
	const after = () => {
		active = false;
		restoreTitle();
	};
	window.addEventListener('beforeprint', before);
	window.addEventListener('afterprint', after);

	// Ctrl/Cmd+P cannot be made to wait, so fetch the fonts ahead of time, once the page is idle
	const idle = window.requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 1500));
	idle(() => void preloadFonts());

	return () => {
		window.removeEventListener('beforeprint', before);
		window.removeEventListener('afterprint', after);
	};
}
