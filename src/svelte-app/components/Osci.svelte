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

	onMount(() => {
		// initial draw handled by first $effect run
	});

	$effect(() => {
		getTick();
		if (!canvas) return;
		const sS = viewStateService.curViewPort?.sS;
		const eS = viewStateService.curViewPort?.eS;
		if (sS != null && eS != null) {
			drawHelperService.freshRedrawDrawOsciOnCanvas(canvas, sS, eS, false);
		}
	});
</script>

<div class="grazer-timeline">
	<div class="grazer-timelineCanvasContainer">
		<canvas bind:this={canvas} class="grazer-timelineCanvasMain" width="4096"></canvas>
		<SsffCanvas {trackName} />
		<SignalCanvasMarkup {trackName} />
	</div>
</div>

<style>
	.grazer-timeline {
		position: relative;
		width: 100%;
		height: 100%;
	}
	.grazer-timelineCanvasContainer {
		position: relative;
		width: 100%;
		height: 100%;
	}
	canvas {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
	}
</style>
