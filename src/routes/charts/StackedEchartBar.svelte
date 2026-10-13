<script lang="ts">
	import * as echarts from 'echarts';
	import type { ECharts, EChartsOption } from 'echarts';

	interface $$Props {
		actual?: Record<string, number>;
		potential?: Record<string, number>;
	}

	let { actual = {}, potential = {} } = $props();

	let chartInstance = $state<ECharts | null>(null);

	const keyToName: Record<string, string> = {
		'07': 'Aging Disability',
		'41': 'Workforce',
		'55': 'Economic Development',
		'64': 'Environmental',
		'71': 'Enterprise Solutions',
		'74': 'Public Safety',
		'76': 'Transportation',
		'92': 'Community Services'
	};

	const computed = $derived(() => {
		const act = actual;
		const pot = potential;

		const allCodes = Array.from(new Set([...Object.keys(act), ...Object.keys(pot)]));
		const categoryCodes = allCodes.sort((a, b) => Number(a) - Number(b));

		const categories = categoryCodes.map(code => keyToName[code] ?? code);

		const actualValues = categoryCodes.map(code => act[code] ?? 0);
		const potentialValues = categoryCodes.map(code => pot[code] ?? 0);
		const gapValues = categoryCodes.map((_, i) => Math.max(0, potentialValues[i] - actualValues[i]));

		// Bake totals into gap data objects to avoid any reactive closure issues in formatter
		const gapData = gapValues.map((gap, i) => ({
			value: gap,
			total: potentialValues[i]
		}));

		const actualData = actualValues.map((val, i) => ({
			value: val
		}));

		return { categories, actualData, gapData };
	});

	const option = $derived<EChartsOption>({
		backgroundColor: '#fff',
		title: {
			text: 'Actual vs Potential (Stacked)',
			left: 'center',
			textStyle: { fontWeight: 'normal', fontSize: 18 }
		},
		tooltip: {
			trigger: 'axis',
			axisPointer: { type: 'shadow' },
			formatter: (params: any) => {
				const actual = params.find((p: any) => p.seriesName === 'Actual')?.value ?? 0;
				const gap = params.find((p: any) => p.seriesName === 'Remaining to Potential')?.value ?? 0;
				const total = actual + gap;
				return `${params[0].name}<br/>Actual: ${actual}<br/>Remaining: ${gap}<br/><strong>Potential: ${total}</strong>`;
			}
		},
		legend: {
			data: ['Actual', 'Remaining to Potential'],
			top: 30
		},
		grid: {
			left: 60,
			right: 40,
			bottom: 120,
			top: 80,
			containLabel: true
		},
		xAxis: {
			type: 'category',
			data: computed.categories,
			axisLabel: {
				rotate: 45,
				fontSize: 12,
				interval: 0
			}
		},
		yAxis: {
			type: 'value',
			min: 0,
			axisLabel: { fontSize: 12 }
		},
		series: [
			{
				name: 'Actual',
				type: 'bar',
				stack: 'total',
				barWidth: '60px',
				data: computed.actualData,
				itemStyle: { color: '#5470c6' },
				label: {
					show: true,
					position: 'inside',
					fontWeight: 'bold',
					color: '#fff',
					formatter: (params: any) => params.value > 0 ? params.value : ''
				}
			},
			{
				name: 'Remaining to Potential',
				type: 'bar',
				stack: 'total',
				barWidth: '60px',
				data: computed.gapData,
				itemStyle: { color: '#91cc75' },
				label: {
					show: true,
					position: 'top',
					fontWeight: 'bold',
					// Safe: no reactive closure, total baked into data object
					formatter: (params: any) => params.data?.total > 0 ? params.data.total : ''
				}
			}
		]
	});

	const initChart = (element: HTMLElement) => {
		chartInstance = echarts.init(element, null, { renderer: 'svg' });
		chartInstance.resize();

		return {
			destroy() {
				chartInstance?.dispose();
				chartInstance = null;
			}
		};
	};

	$effect(() => {
		option;

		if (chartInstance) {
			chartInstance.setOption(option, true);
			requestAnimationFrame(() => chartInstance?.resize());
		}
	});
</script>

<div use:initChart class="w-[700px] h-[400px] px-8 bg-white rounded-lg shadow-md"></div>
