<script lang="ts">
	import { onMount } from 'svelte';
	import { getViewportTick, getMarkupTick } from '../stores/app-state.svelte';
	import {
		viewStateService,
		configProviderService,
		soundHandlerService,
		ssffDataService,
		fontScaleService,
	} from '../stores/services';
	import { styles } from '../../core/util/styles';

	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D;

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

	onMount(() => {
		ctx = canvas.getContext('2d')!;
		syncCanvasSize();
	});

	function drawEpgGrid() {
		if (!ctx) return;
		const tr = configProviderService.getSsffTrackConfig('EPG');
		if (!tr) return;
		const col = ssffDataService.getColumnOfTrack(tr.name, tr.columnName);
		if (typeof col === 'undefined') return;
		const sRaSt = ssffDataService.getSampleRateAndStartTimeOfTrack(tr.name);
		if (!sRaSt) return;

		syncCanvasSize();
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.fillStyle = 'green';
		ctx.strokeStyle = styles.colorBlack;
		ctx.font = `${parseInt(styles.fontInputSize.slice(0, -2))}px ${styles.fontInputFamily}`;

		const gridWidth = canvas.width / 8;
		const gridHeight = canvas.height / 8;
		const sInterv = 1 / sRaSt.sampleRate - sRaSt.startTime;
		const curFrame = Math.min(
			Math.max(0, Math.round((viewStateService.curMousePosSample / soundHandlerService.audioBuffer.sampleRate) / sInterv)),
			col.values.length - 1
		);

		// Copy and reverse (no angular.copy needed)
		const curFrameVals = [...col.values[curFrame]].reverse();

		curFrameVals.forEach((el: number, elIdx: number) => {
			const binValStrArr = el.toString(2).split('').reverse();
			while (binValStrArr.length < 8) {
				binValStrArr.push('0');
			}
			binValStrArr.forEach((binStr: string, binStrIdx: number) => {
				ctx.fillStyle = binStr === '1' ? 'grey' : 'white';
				ctx.fillRect(binStrIdx * gridWidth + 5, gridHeight * elIdx + 5, gridWidth - 10, gridHeight - 10);
			});
		});

		// Labels
		fontScaleService.drawUndistortedTextTwoLines(
			ctx, 'EPG', 'Frame:' + curFrame,
			parseInt(styles.fontInputSize.slice(0, -2)) * 3 / 4,
			styles.fontInputFamily, 5, 0, styles.colorBlack, true
		);
	}

	$effect(() => {
		getViewportTick();
		getMarkupTick();
		drawEpgGrid();
	});
</script>

<div class="artic-twoDimCanvasContainer">
	<canvas bind:this={canvas} width="512" height="512"></canvas>
</div>
