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
	return () => {
		window.removeEventListener('beforeprint', before);
		window.removeEventListener('afterprint', after);
	};
}
