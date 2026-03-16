<script lang="ts">
	import { onMount } from 'svelte';
	import { getTick } from '../stores/app-state.svelte';
	import {
		viewStateService,
		drawHelperService,
	} from '../stores/services';
	import SsffCanvas from './SsffCanvas.svelte';
	import SignalCanvasMarkup from './SignalCanvasMarkup.svelte';

	let { trackName }: { trackName: string } = $props();

	let canvas: HTMLCanvasElement;

	function syncCanvasSize() {
		if (!canvas) return;
		const rect = canvas.getBoundingClientRect();
		const dpr = window.devicePixelRatio || 1;
		const w = Math.round(rect.width * dpr);
		const h = Math.round(rect.height * dpr);
		if (canvas.width !== w || canvas.height !== h) {
			canvas.width = w;
			canvas.height = h;
		}
	}

	$effect(() => {
		getTick();
		if (!canvas) return;
		syncCanvasSize();
		const sS = viewStateService.curViewPort?.sS;
		const eS = viewStateService.curViewPort?.eS;
		if (sS != null && eS != null && eS > sS) {
			drawHelperService.freshRedrawDrawOsciOnCanvas(canvas, sS, eS, false);
		}
	});
</script>

<div class="grazer-timeline">
	<div class="grazer-timelineCanvasContainer">
		<canvas bind:this={canvas} class="grazer-timelineCanvasMain"></canvas>
		<SsffCanvas {trackName} />
		<SignalCanvasMarkup {trackName} />
	</div>
</div>
