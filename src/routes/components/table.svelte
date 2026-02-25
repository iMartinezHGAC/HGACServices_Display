<script lang="ts">
	import type { EventType } from "../../ambient";
	import { snakeToHuman } from "../helpers/caseConversion";
	import { getCalloutDisplayInfo } from "../helpers/chartFormatters";

	type PB_Record_Type = {
		collectionId: string;
		collectionName: string;
		id: string;
		[key: string]: string | number | Date | any;
	};

	interface Props {
		data: PB_Record_Type | PB_Record_Type[] | EventType[] | null;  
		columns?: string[];  
		title?: string;
	}

	const { data, columns = [], title: providedTitle }: Props = $props();

let records = $derived.by(() => {
		if (!data) return null;

		const arr = Array.isArray(data) ? data : [data];

		// Special event-date formatting (only if we detect an event record)
		if (arr.length > 0 && 'event_name' in arr[0]) {
			return arr.map((record) => {
				const copy = { ...record }; // shallow copy to avoid mutating original PB data
				if (copy.event_date) {
					copy.event_date = new Date(copy.event_date)
						.toISOString()
						.split('T')[0]; // "2025-12-25"
				}
				return copy;
			});
		}

		return arr;
	});


	const excludedKeys = ['collectionId', 'collectionName', 'id', 'created', 'from_date', 'jurisdiction', 'source_jurisdiction', 'to_date', 'updated', 'FormData', 'email', 'address', 'program'];

let allKeys = $derived(
		records
			? columns.length > 0
				? columns
				: (() => {
						// 1. Collect every key that appears in ANY record (unique, order-preserving)
						const computedKeys = [
							...new Set(
								records.flatMap((record) =>
									Object.keys(record).filter((key) => !excludedKeys.includes(key))
								)
							)
						];

						// 2. Special "event" collection friendly ordering (very common pattern)
						if (records.length > 0 && 'event_name' in records[0]) {
							const preferredOrder = [
								'event_name',
								'event_description',
								'event_date',
								'attendee_count'
							];
							return [
								...preferredOrder.filter((k) => computedKeys.includes(k)),
								...computedKeys.filter((k) => !preferredOrder.includes(k))
							];
						}

						return computedKeys;
					})()
			: null
	);

	function isMonetaryField(key: string): boolean {
		const keywords = [
			'cost', 'budget', 'dollar', 'dollars', 'price', 'fee', 'payment',
			'expense', 'revenue', 'income', 'profit', 'salary', 'funding',
			'amount', 'total', 'charge', 'balance', 'paid', 'due', 'spend', 'value'
		];
		const lowerKey = key.toLowerCase();
		const lowerHeader = snakeToHuman(key).toLowerCase();
		return keywords.some(word => lowerKey.includes(word) || lowerHeader.includes(word));
	}

	function isYearField(key: string): boolean {
		const keywords = ['year', 'yr', 'years'];
		const lowerKey = key.toLowerCase();
		const lowerHeader = snakeToHuman(key).toLowerCase();
		return keywords.some(word => lowerKey.includes(word) || lowerHeader.includes(word));
	}

	function formatHeader(key: string): string {
		let header = snakeToHuman(key);
		header = header.trim().replace(/\s+/g, ' ');
		return header.replace(/\w\S*/g, txt => 
			txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase()
		);
	}

	// "tip" / "Tip" / "TIP" → "TIP"
	// "rtp" → "RTP"
	// "tsm" → "TSM"
	// everything else → clean Title Case (via getCalloutDisplayInfo)
	function formatDisplayValue(key: string, val: any): string {
		if (typeof val === 'string') {
			const info = getCalloutDisplayInfo(val);
			return info.display;
		}

		if (val instanceof Date) {
			return val.toISOString().split('T')[0];
		}

		if (typeof val === 'number') {
			if (isYearField(key)) {
				return val.toString();
			}
			const numStr = val.toLocaleString('en-US');
			return isMonetaryField(key) ? `$${numStr}` : numStr;
		}

		if (Array.isArray(val)) return `${val.length} item(s)`;

		if (val == null) return '-';
		return String(val);
	}

	let displayTitle = $derived(
		providedTitle !== undefined 
			? providedTitle 
			: (records && records.length > 0 && 'event_name' in records[0] 
				? 'Events' 
				: null)
	);
</script>

<div class="w-full">
	{#if displayTitle}
		<h2 class="text-2xl font-semibold mb-4 text-gray-900 tracking-tight text-center font-[Metropolis]">
			{displayTitle}
		</h2>
	{/if}

	<div class="w-full overflow-x-auto max-h-96">
		<table class="table-auto border-collapse border border-gray-400 mx-auto w-full">
			{#if records && allKeys}
				<thead>
					<tr>
						{#each allKeys as key}
							<th class="font-bold px-4 py-2 border border-gray-300 bg-gray-100 text-left sticky top-0 z-10">
								{formatHeader(key)}
							</th>
						{/each}
					</tr>
				</thead>
				<tbody>
					{#each records as record}
						<tr>
							{#each allKeys as key}
								{@const val = key in record ? record[key] : null}
								{@const isNumeric = typeof val === 'number'}
								<td class="px-4 py-2 border border-gray-300 {isNumeric ? 'text-right font-medium' : ''}">
									{#if key in record}
										{formatDisplayValue(key, val)}
									{:else}
                    {console.log(`Failed to find key: ${key} in record ${Object.entries(record)}`)}
										-
									{/if}
								</td>
							{/each}
						</tr>
					{/each}
				</tbody>
			{:else}
				<thead>
					<tr>
						<th class="font-bold px-4 py-2 border border-gray-300 bg-gray-100 text-left sticky top-0 z-10">No data</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>Consider using HART to manage your data</td>
					</tr>
				</tbody>
			{/if}
		</table>
	</div>
</div>
