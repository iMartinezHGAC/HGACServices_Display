<script lang="ts">
	import { snakeToHuman } from '../helpers/caseConversion';

	type tabProps = {
		tabText: string;
		path: string;
		color: string;
		uuid: string;
		setChosen: (tabName: string) => void;
		textLight: boolean;
	};

	let { tabText, path, color = 'gray', setChosen, uuid, textLight }: tabProps = $props();

	function chooseEvent() {
		setChosen(tabText);
	}
	const base =
		'flex items-center justify-center px-5 h-12 py-3 mx-2 rounded-t-md font-[Staatliches] hover:bg-slate-700 hover:text-slate-100 ';
	const colorClass = $derived(base);
	const textColor = textLight ? '#f8fafc' : '#334155';

</script>

<button onclick={chooseEvent}>
	<a class={colorClass} style="background-color: {color}; color: {textColor};" href={path}
		>{snakeToHuman(tabText)}</a
	>
</button>
