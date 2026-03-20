<script lang="ts">
	import { onMount } from 'svelte';
	import { getTick, getMarkupTick } from '../stores/app-state.svelte';
	import {
		viewStateService,
		configProviderService,
		soundHandlerService,
		ssffDataService,
		fontScaleService,
		mathHelperService,
	} from '../stores/services';
	import { styles } from '../../core/util/styles';
	import { getValueAtTime, mergeTrackPair, type TrackInfo } from '../utils/track-merge';

	let staticCanvas: HTMLCanvasElement;
	let dotsCanvas: HTMLCanvasElement;
	let staticCtx: CanvasRenderingContext2D;
	let dotsCtx: CanvasRenderingContext2D;

	let globalMinX = Infinity;
	let globalMaxX = -Infinity;
	let globalMinY = Infinity;
	let globalMaxY = -Infinity;
	const startPoint = 0;
	const endPoint = (Math.PI / 180) * 360;
	const smallFontSize = parseInt(styles.fontInputSize.slice(0, -2)) * 3 / 4;
	const labelFontSize = parseInt(styles.fontInputSize.slice(0, -2)) - 4;

	function syncCanvasSize(c: HTMLCanvasElement) {
		if (!c) return;
		const rect = c.getBoundingClientRect();
		const dpr = window.devicePixelRatio || 1;
		const w = Math.round(rect.width * dpr);
		const h = Math.round(rect.height * dpr);
		if (c.width !== w || c.height !== h) {
			c.width = w;
			c.height = h;
		}
	}

	onMount(() => {
		staticCtx = staticCanvas.getContext('2d')!;
		dotsCtx = dotsCanvas.getContext('2d')!;
	});

	function resetValues() {
		globalMinX = Infinity;
		globalMaxX = -Infinity;
		globalMinY = Infinity;
		globalMaxY = -Infinity;
	}

	function getDd() {
		const persp = configProviderService.vals?.perspectives?.[viewStateService.curPerspectiveIdx];
		return persp?.twoDimCanvases?.twoDimDrawingDefinitions?.[0];
	}

	function buildTrackInfo(ssffTrackName: string): TrackInfo | undefined {
		const trConf = configProviderService.getSsffTrackConfig(ssffTrackName);
		if (!trConf) return undefined;
		const col = ssffDataService.getColumnOfTrack(trConf.name, trConf.columnName);
		if (!col) return undefined;
		const sRaSt = ssffDataService.getSampleRateAndStartTimeOfTrack(trConf.name);
		if (!sRaSt) return undefined;
		return { values: col.values, sampleRate: sRaSt.sampleRate, startTime: sRaSt.startTime };
	}

	function setGlobalMinMaxVals(): boolean {
		const dD = getDd();
		if (!dD) return false;

		for (let i = 0; i < dD.dots.length; i++) {
			const trConf = configProviderService.getSsffTrackConfig(dD.dots[i].xSsffTrack);
			const xCol = ssffDataService.getColumnOfTrack(trConf.name, trConf.columnName);
			if (typeof xCol === 'undefined') return false;
			if (xCol._minVal < globalMinX) globalMinX = xCol._minVal;
			if (xCol._maxVal > globalMaxX) globalMaxX = xCol._maxVal;

			const trConfY = configProviderService.getSsffTrackConfig(dD.dots[i].ySsffTrack);
			const yCol = ssffDataService.getColumnOfTrack(trConfY.name, trConfY.columnName);
			if (typeof yCol === 'undefined') return false;
			if (yCol._minVal < globalMinY) globalMinY = yCol._minVal;
			if (yCol._maxVal > globalMaxY) globalMaxY = yCol._maxVal;
		}

		// staticDots
		if (dD.staticDots) {
			dD.staticDots.forEach((sD: any) => {
				sD.xCoordinates.forEach((xVal: number, xIdx: number) => {
					if (xVal < globalMinX) globalMinX = xVal;
					if (xVal > globalMaxX) globalMaxX = xVal;
					if (sD.yCoordinates[xIdx] < globalMinY) globalMinY = sD.yCoordinates[xIdx];
					if (sD.yCoordinates[xIdx] > globalMaxY) globalMaxY = sD.yCoordinates[xIdx];
				});
			});
		}

		// staticContours
		if (dD.staticContours) {
			dD.staticContours.forEach((sC: any) => {
				const trConf = configProviderService.getSsffTrackConfig(sC.xSsffTrack);
				const xCol = ssffDataService.getColumnOfTrack(trConf.name, trConf.columnName);
				if (xCol._minVal < globalMinX) globalMinX = xCol._minVal;
				if (xCol._maxVal > globalMaxX) globalMaxX = xCol._maxVal;
				const trConfY = configProviderService.getSsffTrackConfig(sC.ySsffTrack);
				const yCol = ssffDataService.getColumnOfTrack(trConfY.name, trConfY.columnName);
				if (yCol._minVal < globalMinY) globalMinY = yCol._minVal;
				if (yCol._maxVal > globalMaxY) globalMaxY = yCol._maxVal;
			});
		}
		return true;
	}

	function drawStaticContour() {
		const dD = getDd();
		if (!dD?.staticContours) return;
		const ctx = staticCtx;
		ctx.clearRect(0, 0, staticCanvas.width, staticCanvas.height);

		for (let i = 0; i < dD.staticContours.length; i++) {
			const sc = dD.staticContours[i];
			const xTrack = buildTrackInfo(sc.xSsffTrack);
			const yTrack = buildTrackInfo(sc.ySsffTrack);
			if (!xTrack || !yTrack) continue;

			const merged = mergeTrackPair(xTrack, yTrack);
			let xPrev: number | undefined;
			let yPrev: number | undefined;

			for (let j = 0; j < merged.xValues.length; j++) {
				const x = ((merged.xValues[j][sc.xContourNr] - globalMinX) / (globalMaxX - globalMinX) * staticCanvas.width);
				const y = staticCanvas.height - ((merged.yValues[j][sc.yContourNr] - globalMinY) / (globalMaxY - globalMinY) * staticCanvas.height);

				ctx.strokeStyle = sc.color;
				ctx.fillStyle = sc.color;
				ctx.beginPath();
				ctx.arc(x, y, 2, startPoint, endPoint, true);
				ctx.fill();

				if (j >= 1 && sc.connect && xPrev !== undefined && yPrev !== undefined) {
					ctx.beginPath();
					ctx.moveTo(xPrev, yPrev);
					ctx.lineTo(x, y);
					ctx.stroke();
				}
				xPrev = x;
				yPrev = y;
			}
		}
	}

	function drawDots() {
		if (!dotsCtx || !staticCtx) return;

		const dD = getDd();
		if (!dD) return;

		// Init min/max on first draw or after reset
		if (globalMinX === Infinity) {
			if (!setGlobalMinMaxVals()) return;
			if (dD.staticContours !== undefined) {
				drawStaticContour();
			}
		}

		syncCanvasSize(staticCanvas);
		syncCanvasSize(dotsCanvas);
		const ctx = dotsCtx;
		ctx.clearRect(0, 0, dotsCanvas.width, dotsCanvas.height);

		const scaleX = dotsCanvas.width / dotsCanvas.offsetWidth;
		const scaleY = dotsCanvas.height / dotsCanvas.offsetHeight;

		// Corner markers
		ctx.beginPath();
		ctx.moveTo(0, 0);
		ctx.lineTo(5, 5);
		ctx.moveTo(0, dotsCanvas.height);
		ctx.lineTo(5, dotsCanvas.height - 5);
		ctx.moveTo(dotsCanvas.width, dotsCanvas.height);
		ctx.lineTo(dotsCanvas.width - 5, dotsCanvas.height - 5);
		ctx.stroke();
		ctx.closePath();

		// Axis labels
		fontScaleService.drawUndistortedText(ctx, 'yMax: ' + mathHelperService.roundToNdigitsAfterDecPoint(globalMaxY, 2), smallFontSize, styles.fontInputFamily, 5, 5, styles.colorWhite, true);
		fontScaleService.drawUndistortedTextTwoLines(ctx, 'yMin: ' + mathHelperService.roundToNdigitsAfterDecPoint(globalMinY, 2), 'xMin: ' + mathHelperService.roundToNdigitsAfterDecPoint(globalMinX, 2), smallFontSize, styles.fontInputFamily, 5, dotsCanvas.height - smallFontSize * scaleY * 2 - 5, styles.colorWhite, true);
		const tw0 = ctx.measureText('xMax: ' + mathHelperService.roundToNdigitsAfterDecPoint(globalMaxX, 5)).width * scaleX;
		fontScaleService.drawUndistortedText(ctx, 'xMax: ' + mathHelperService.roundToNdigitsAfterDecPoint(globalMaxX, 2), smallFontSize, styles.fontInputFamily, dotsCanvas.width - tw0 - 5, dotsCanvas.height - smallFontSize * scaleY - 5, styles.colorWhite, true);

		// Compute current time from mouse position
		const curMousePosTime = viewStateService.curMousePosSample / soundHandlerService.audioBuffer.sampleRate;

		// Frame number (using first dot's x track as reference)
		const xRef = buildTrackInfo(dD.dots[0].xSsffTrack);
		if (!xRef) return;
		let curFrame: number;
		if (xRef.startTime === (1 / xRef.sampleRate) / 2) {
			curFrame = Math.round(curMousePosTime * xRef.sampleRate);
		} else {
			curFrame = Math.round((curMousePosTime * xRef.sampleRate) + ((xRef.startTime - (1 / xRef.sampleRate) / 2) * xRef.sampleRate));
		}
		curFrame = Math.max(0, Math.min(curFrame, xRef.values.length - 1));

		const tw = ctx.measureText('frame: ' + curFrame).width * scaleX;
		ctx.save();
		ctx.rotate(90 * Math.PI / 180);
		fontScaleService.drawUndistortedText(ctx, 'frame: ' + curFrame, labelFontSize, styles.fontInputFamily, dotsCanvas.width / 2 - tw / 2, -dotsCanvas.height, styles.colorWhite, true);
		ctx.restore();

		// Draw dots using time-domain interpolation
		const allDots: { name: string; x: number; y: number }[] = [];

		for (let i = 0; i < dD.dots.length; i++) {
			const dot = dD.dots[i];
			const xTrack = buildTrackInfo(dot.xSsffTrack);
			const yTrack = buildTrackInfo(dot.ySsffTrack);
			if (!xTrack || !yTrack) continue;

			const xVal = getValueAtTime(xTrack, curMousePosTime, dot.xContourNr);
			const yVal = getValueAtTime(yTrack, curMousePosTime, dot.yContourNr);

			const x = ((xVal - globalMinX) / (globalMaxX - globalMinX) * dotsCanvas.width);
			const y = dotsCanvas.height - ((yVal - globalMinY) / (globalMaxY - globalMinY) * dotsCanvas.height);

			ctx.strokeStyle = dot.color;
			ctx.beginPath();
			ctx.arc(x, y, 20, startPoint, endPoint, true);
			ctx.stroke();
			ctx.closePath();

			ctx.beginPath();
			ctx.arc(x, y, 2, startPoint, endPoint, true);
			ctx.fill();
			ctx.closePath();

			fontScaleService.drawUndistortedText(ctx, dot.name, labelFontSize, styles.fontInputFamily, x, y - 5, styles.colorWhite, true);

			allDots.push({ name: dot.name, x, y });
		}

		// Connect lines
		if (dD.connectLines) {
			dD.connectLines.forEach((c: any) => {
				const f = allDots.find(d => d.name === c.fromDot);
				const t = allDots.find(d => d.name === c.toDot);
				if (!f || !t) return;
				ctx.strokeStyle = c.color;
				ctx.beginPath();
				ctx.moveTo(f.x, f.y);
				ctx.lineTo(t.x, t.y);
				ctx.stroke();
				ctx.closePath();
			});
		}

		// Static dots
		if (dD.staticDots) {
			dD.staticDots.forEach((sD: any) => {
				ctx.strokeStyle = sD.color;
				ctx.fillStyle = sD.color;
				const labelX = ((sD.xNameCoordinate - globalMinX) / (globalMaxX - globalMinX) * dotsCanvas.width);
				const labelY = dotsCanvas.height - ((sD.yNameCoordinate - globalMinY) / (globalMaxY - globalMinY) * dotsCanvas.height);
				fontScaleService.drawUndistortedText(ctx, sD.name, labelFontSize, styles.fontInputFamily, labelX, labelY, sD.color, true);

				sD.xCoordinates.forEach((xVal: number, xIdx: number) => {
					const x = ((xVal - globalMinX) / (globalMaxX - globalMinX) * dotsCanvas.width);
					const y = dotsCanvas.height - ((sD.yCoordinates[xIdx] - globalMinY) / (globalMaxY - globalMinY) * dotsCanvas.height);
					ctx.beginPath();
					ctx.arc(x, y, 2, startPoint, endPoint, true);
					ctx.fill();
					ctx.closePath();
					if (sD.connect && xIdx >= 1) {
						const prevX = ((sD.xCoordinates[xIdx - 1] - globalMinX) / (globalMaxX - globalMinX) * dotsCanvas.width);
						const prevY = dotsCanvas.height - ((sD.yCoordinates[xIdx - 1] - globalMinY) / (globalMaxY - globalMinY) * dotsCanvas.height);
						ctx.beginPath();
						ctx.moveTo(prevX, prevY);
						ctx.lineTo(x, y);
						ctx.stroke();
						ctx.closePath();
					}
				});
			});
		}
	}

	// Reset min/max when bundle or perspective changes
	let prevPerspIdx = -1;
	let prevDataLen = -1;

	$effect(() => {
		getTick();
		getMarkupTick();
		if (!dotsCanvas) return;

		const perspIdx = viewStateService.curPerspectiveIdx ?? -1;
		const dataLen = Array.isArray(ssffDataService.data) ? ssffDataService.data.length : (ssffDataService.data ? Object.keys(ssffDataService.data).length : 0);
		if (perspIdx !== prevPerspIdx || dataLen !== prevDataLen) {
			prevPerspIdx = perspIdx;
			prevDataLen = dataLen;
			resetValues();
		}
		drawDots();
	});
</script>

<div class="artic-twoDimCanvasContainer">
	<canvas bind:this={staticCanvas} class="artic-twoDimCanvasStatic" width="512" height="512"></canvas>
	<canvas bind:this={dotsCanvas} class="artic-twoDimCanvasDots" width="512" height="512"></canvas>
</div>
