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
		fields?: string[];      // ← from buildTableData.result.fields
		columns?: string[];     // ← from buildTableData.result.columns (already aliased!)
		title?: string;
		aliases?: Record<string, string>;
	}

	const {
		data,
		fields: providedFields = [],
		columns: providedColumns = [],
		title: providedTitle,
		aliases = {}
	}: Props = $props();

	// ── Normalize records (exactly as in your original working code) ──
	let records = $derived.by(() => {
		if (!data) return null;

		const arr = Array.isArray(data) ? data : [data];

		if (arr.length > 0 && 'event_name' in arr[0]) {
			return arr.map((record) => {
				const copy = { ...record };
				if (copy.event_date) {
					copy.event_date = new Date(copy.event_date)
						.toISOString()
						.split('T')[0];
				}
				return copy;
			});
		}

		return arr;
	});

	const excludedKeys = ['collectionId', 'collectionName', 'id', 'created', 'from_date', 'jurisdiction', 'source_jurisdiction', 'to_date', 'updated', 'FormData', 'email', 'address', 'program'];

	// ── Data keys for record[key] access ──
	let dataKeys = $derived.by(() => {
		if (providedFields.length > 0) return [...providedFields];

		if (!records) return [];

		const seen = new Set<string>();
		const keys: string[] = [];

		records.forEach(r => {
			Object.keys(r).forEach(k => {
				if (!excludedKeys.includes(k) && !seen.has(k)) {
					seen.add(k);
					keys.push(k);
				}
			});
		});

		if (records.length > 0 && 'event_name' in records[0]) {
			const preferred = ['event_name', 'event_description', 'event_date', 'attendee_count'];
			return [
				...preferred.filter(k => keys.includes(k)),
				...keys.filter(k => !preferred.includes(k))
			];
		}
		return keys;
	});

// ── Display headers ──
	let displayHeaders = $derived.by(() => {
		if (providedColumns.length > 0) return [...providedColumns];
		return dataKeys.map(key => aliases[key] ?? snakeToHuman(key));
	});

	// ── New: count field detection (protects attendee_count, etc.) ──
	function isCountField(key: string): boolean {
		const keywords = ['attendee', 'attendees', 'count', 'participants', 'quantity', 'total', 'number'];
		const lowerKey = key.toLowerCase();
		return keywords.some(word => lowerKey.includes(word));
	}

	// ── Date field detection (unchanged) ──
	function isDateField(key: string): boolean {
		const keywords = [
			'date', 'created', 'updated', 'from_date', 'to_date',
			'event_date', 'timestamp', 'dob', 'birth', 'start_date', 'end_date'
		];
		const lowerKey = key.toLowerCase();
		return keywords.some(word => lowerKey.includes(word));
	}

	function looksLikeDate(val: any): boolean {
		if (typeof val !== 'string') return false;
		const trimmed = val.trim();
		return /^\d{4}-\d{2}-\d{2}/.test(trimmed);
	}

function isMonetaryField(key: string): boolean {
		const keywords = ['cost','budget','dollar','dollars','price','fee','payment','expense','revenue','income','profit','salary','funding','amount','total','charge','balance','paid','due','spend','value'];
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
// URLs are shown as a compact clickable label ("PDF ↗" or the site name); the full URL stays
	// in href and in the hover title. Long file names wrapped to 3 lines and made ragged rows.
	function isUrl(val: unknown): val is string {
		return typeof val === 'string' && /^https?:\/\//i.test(val.trim());
	}

	function urlLabel(raw: string): string {
		try {
			const url = new URL(raw.trim());
			return /\.pdf$/i.test(url.pathname) ? 'PDF ↗' : `${url.hostname.replace(/^www\./, '')} ↗`;
		} catch {
			return 'Link ↗';
		}
	}

function formatDisplayValue(key: string, val: any): string {
		if (val == null) return '-';
		// Database NULLs that arrive as the literal string "NULL"
		if (typeof val === 'string' && ['', 'null'].includes(val.trim().toLowerCase())) return '-';

		// 1. Numbers first — this prevents 0 → "1970-01-01" on attendee counts
		if (typeof val === 'number') {
			if (isYearField(key)) return val.toString();
			const numStr = val.toLocaleString('en-US');
			return isMonetaryField(key) ? `$${numStr}` : numStr;
		}

		// 2. Dates only if the field name clearly indicates a date
		//    AND it's NOT a count field (extra safety layer)
		if (!isCountField(key) && (isDateField(key) || looksLikeDate(val))) {
			const date = new Date(val);
			if (!isNaN(date.getTime())) {
				return date.toISOString().split('T')[0];
			}
		}

		// 3. Everything else (strings, etc.)
		if (typeof val === 'string') {
			const info = getCalloutDisplayInfo(val);
			return info.display;
		}

		if (val instanceof Date) {
			return val.toISOString().split('T')[0];
		}

		if (Array.isArray(val)) return `${val.length} item(s)`;
		return String(val);
	}

	let displayTitle = $derived.by(() => 
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
		<table data-print-table class="table-auto border-collapse border border-gray-400 mx-auto w-full">
			{#if records && dataKeys.length > 0}
				<thead>
					<tr>
						{#each displayHeaders as header}
							<th class="font-bold px-4 py-2 border border-gray-300 bg-gray-100 text-left sticky top-0 z-10">
								{snakeToHuman(header)}
							</th>
						{/each}
					</tr>
				</thead>
				<tbody>
					{#each records as record}
						<tr class="hover:bg-gray-50">
							{#each dataKeys as key (key)}
								{@const val = record[key] ?? null}
								{@const isNumeric = typeof val === 'number'}
								<td class="px-4 py-2 border border-gray-300 {isNumeric ? 'text-right font-medium whitespace-nowrap' : ''}">
									{#if isUrl(val)}
										<a
											href={val.trim()}
											target="_blank"
											rel="noopener noreferrer"
											title={val.trim()}
											class="whitespace-nowrap text-blue-700 underline print:text-slate-800"
										>{urlLabel(val)}</a>
									{:else}
										{formatDisplayValue(key, val)}
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
						<td class="px-4 py-8 text-center text-gray-500 italic">Consider using HART to manage your data</td>
					</tr>
				</tbody>
			{/if}
		</table>
	</div>
</div>
