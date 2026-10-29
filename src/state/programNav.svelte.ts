/**
 * The current tab's program list, published by card_body so navigation outside it (the Civic
 * Light sidebar) can list the programs too. `active` is the program card currently in view.
 */
let names = $state<string[]>([]);
let active = $state<string>('');

export function programNav() {
	return {
		get names() {
			return names;
		},
		get active() {
			return active;
		},
		set(list: string[]) {
			names = list;
		},
		setActive(name: string) {
			active = name;
		},
		clear() {
			names = [];
			active = '';
		}
	};
}
