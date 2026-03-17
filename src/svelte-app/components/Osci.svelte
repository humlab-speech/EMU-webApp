<script lang="ts">
	import { onMount } from 'svelte';
	import { getTick } from '../stores/app-state.svelte';
	import {
		viewStateService,
		drawHelperService,
		soundHandlerService,
	} from '../stores/services';
	import SsffCanvas from './SsffCanvas.svelte';
	import SignalCanvasMarkup from './SignalCanvasMarkup.svelte';

	let { trackName }: { trackName: string } = $props();

	let canvas: HTMLCanvasElement;
	let lastAudioLength = 0;

	// Change detection to avoid unnecessary redraws
	let prevSS = -1;
	let prevES = -1;
	let prevCanvasW = -1;
	let prevCanvasH = -1;
	let prevChannel = -1;

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
		if (sS != null && eS != null && eS > sS && soundHandlerService.audioBuffer?.length > 0) {
			const curLen = soundHandlerService.audioBuffer.length;
			const forceRecalc = curLen !== lastAudioLength;
			if (forceRecalc) lastAudioLength = curLen;
			const cw = canvas.width;
			const ch = canvas.height;
			const channel = viewStateService.osciSettings?.curChannel ?? 0;

			// Only redraw when viewport, canvas size, or audio data actually changes
			if (sS !== prevSS || eS !== prevES || cw !== prevCanvasW || ch !== prevCanvasH || forceRecalc || channel !== prevChannel) {
				prevSS = sS;
				prevES = eS;
				prevCanvasW = cw;
				prevCanvasH = ch;
				prevChannel = channel;
				drawHelperService.freshRedrawDrawOsciOnCanvas(canvas, sS, eS, forceRecalc);
			}
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
