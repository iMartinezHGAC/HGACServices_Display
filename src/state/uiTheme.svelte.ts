import { browser } from '$app/environment';
import { getContext, setContext } from 'svelte';

/**
 * Interface theme, picked in the Options menu (gear icon).
 *
 * "classic" is the original dashboard; the others are the design alternatives explored in
 * ui-alternatives/ (refined = 05, civic = 01, command = 02, report = 03). Themes change the
 * on-screen chrome and colours only: printing / Save as PDF always uses the classic print layout.
 *
 * The choice lives in a cookie so the server renders the chosen theme (no flash on load). The
 * root layout combines the cookie (from its load) with a choice made in this tab and hands the
 * result down by context: module state is shared between requests on the server, so it only
 * ever holds a choice made in the browser.
 */
export const UI_THEMES = [
	{ id: 'classic', name: 'Classic', description: 'The original dashboard' },
	{ id: 'refined', name: 'Refined Classic', description: 'The original layout, tidied up' },
	{ id: 'civic', name: 'Civic Light', description: 'Light, with sidebar navigation' },
	{ id: 'command', name: 'Command Center', description: 'Dark and dense' },
	{ id: 'report', name: 'Annual Report', description: 'Editorial, reads like a briefing' }
] as const;

export type UiThemeId = (typeof UI_THEMES)[number]['id'];

export const UI_THEME_COOKIE = 'hgac_ui_theme';

export function isUiTheme(value: unknown): value is UiThemeId {
	return UI_THEMES.some((t) => t.id === value);
}

let chosen = $state<UiThemeId | null>(null);

/** Switches the theme for this browser (and remembers it for a year). */
export function setUiTheme(value: UiThemeId) {
	if (!browser) return;
	chosen = value;
	document.cookie = `${UI_THEME_COOKIE}=${value}; Max-Age=${365 * 24 * 60 * 60}; Path=/; SameSite=Lax`;
}

/** A choice made in this tab since it loaded, if any. */
export function chosenUiTheme() {
	return chosen;
}

const KEY = Symbol('ui-theme');

type UiThemeContext = { readonly id: UiThemeId };

export function provideUiTheme(ctx: UiThemeContext) {
	setContext(KEY, ctx);
}

/** The active theme; components below the root layout read it here. */
export function useUiTheme(): UiThemeContext {
	return getContext<UiThemeContext>(KEY) ?? { id: 'classic' };
}
