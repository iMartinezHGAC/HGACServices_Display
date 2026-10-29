/** A service-area tab, as the theme headers / sidebars draw it (built in splash.svelte). */
export type NavTab = {
	/** tab_name from dashboard_tabs; also the (relative) link to the tab */
	name: string;
	label: string;
	color: string;
	active: boolean;
};

export type ChromeProps = {
	tabs: NavTab[];
	jurisdiction: string;
	logo_url: string | null;
	feedbackUrl: string;
	dataRange: string;
	/** Highlights the clicked tab straight away, before navigation finishes */
	onSelect: (tabName: string) => void;
};
