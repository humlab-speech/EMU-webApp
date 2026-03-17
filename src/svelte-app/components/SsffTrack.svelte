<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { getTick, getMarkupTick } from '../stores/app-state.svelte';
	import {
		viewStateService,
		configProviderService,
		ssffDataService,
		drawHelperService,
		fontScaleService,
		soundHandlerService,
		historyService,
	} from '../stores/services';

	// Props
	let { trackName = '', order = 0 }: { trackName: string; order: number } = $props();

	// Colors
	const COLOR_WHITE = '#fff';
	const COLOR_TRANSPARENT_RED = 'rgba(255, 0, 0, 0.3)';

	let mainCanvas: HTMLCanvasElement;
	let ssffCanvas: HTMLCanvasElement;
	let markupCanvas: HTMLCanvasElement;

	let drawCrossHairs = false;
	let curMouseY = 0;
	let formantCorrectionTrack: any;
	let assignmentTrackName = '';

	function isEmptyObj(obj: any): boolean {
		return !obj || (typeof obj === 'object' && Object.keys(obj).length === 0);
	}

	function hasAudioBuffer(): boolean {
		return soundHandlerService.audioBuffer && typeof soundHandlerService.audioBuffer.length === 'number' && soundHandlerService.audioBuffer.length > 0;
	}

	// ── SSFF data drawing (ported from ssff-canvas.component) ──

	function drawSsffData() {
		if (!ssffCanvas) return;
		const ctx = ssffCanvas.getContext('2d')!;
		ctx.clearRect(0, 0, ssffCanvas.width, ssffCanvas.height);

		if (isEmptyObj(ssffDataService.data) || ssffDataService.data.length === 0) return;

		assignmentTrackName = '';

		// Check assignments (overlays)
		const perspective = configProviderService.vals?.perspectives?.[viewStateService.curPerspectiveIdx];
		if (perspective?.signalCanvases?.assign) {
			perspective.signalCanvases.assign.forEach((assignment: any) => {
				if (assignment.signalCanvasName === trackName) {
					assignmentTrackName = assignment.ssffTrackName;
					const tr = configProviderService.getSsffTrackConfig(assignment.ssffTrackName);
					const col = ssffDataService.getColumnOfTrack(tr.name, tr.columnName);
					const sRaSt = ssffDataService.getSampleRateAndStartTimeOfTrack(tr.name);
					const minMaxContourLims = configProviderService.getContourLimsOfTrack(tr.name);
					const minMaxValLims = configProviderService.getValueLimsOfTrack(tr.name);
					drawValues(ctx, col, sRaSt.sampleRate, sRaSt.startTime, minMaxContourLims, minMaxValLims);
				}
			});
		}
		assignmentTrackName = '';

		// Draw ssff track onto own canvas (not OSCI/SPEC)
		if (trackName !== 'OSCI' && trackName !== 'SPEC') {
			const tr = configProviderService.getSsffTrackConfig(trackName);
			if (!tr) return;
			const col = ssffDataService.getColumnOfTrack(tr.name, tr.columnName);
			const sRaSt = ssffDataService.getSampleRateAndStartTimeOfTrack(tr.name);
			const minMaxContourLims = configProviderService.getContourLimsOfTrack(tr.name);
			const minMaxValLims = configProviderService.getValueLimsOfTrack(tr.name);
			drawValues(ctx, col, sRaSt.sampleRate, sRaSt.startTime, minMaxContourLims, minMaxValLims);
		}
	}

	function drawValues(ctx: CanvasRenderingContext2D, col: any, sR: number, sT: number, minMaxContourLims: any, minMaxValLims: any) {
		if (!col) return;

		let minVal: number, maxVal: number;
		if (trackName === 'SPEC' && assignmentTrackName === 'FORMANTS') {
			minVal = viewStateService.spectroSettings.rangeFrom;
			maxVal = viewStateService.spectroSettings.rangeTo;
		} else {
			minVal = col._minVal;
			maxVal = col._maxVal;
		}
		if (!isEmptyObj(minMaxValLims)) {
			minVal = minMaxValLims.minVal;
			maxVal = minMaxValLims.maxVal;
		}

		const startTimeVP = viewStateService.getViewPortStartTime();
		const endTimeVP = viewStateService.getViewPortEndTime();
		const colStartSampleNr = Math.max(0, Math.ceil((startTimeVP - sT) * sR));
		const colEndSampleNr = Math.min(Math.floor((endTimeVP - sT) * sR), col.values.length - 1);
		const nrOfSamples = colEndSampleNr - colStartSampleNr + 1;
		const curSampleArrs = col.values.slice(colStartSampleNr, colStartSampleNr + nrOfSamples);
		const canvasW = ssffCanvas.width;
		const canvasH = ssffCanvas.height;

		// Horizontal lines
		const horizontalLines = configProviderService.getHorizontalLinesOfTrack(trackName);
		if (horizontalLines) {
			horizontalLines.yValues.forEach((yVal: number) => {
				ctx.beginPath();
				ctx.lineWidth = 2;
				ctx.strokeStyle = 'blue';
				ctx.globalAlpha = 0.75;
				const zeroY = canvasH - ((yVal - minVal) / (maxVal - minVal) * canvasH);
				ctx.moveTo(0, zeroY);
				ctx.lineTo(canvasW, zeroY);
				ctx.stroke();
				ctx.lineWidth = 1;
				ctx.globalAlpha = 1;
			});
		}

		if (nrOfSamples < canvasW && nrOfSamples >= 2) {
			curSampleArrs[0].forEach((contourVal: number, contourNr: number) => {
				if (isEmptyObj(minMaxContourLims) || (contourNr >= minMaxContourLims.minContourIdx && contourNr <= minMaxContourLims.maxContourIdx)) {
					// Set color
					if (isEmptyObj(minMaxContourLims)) {
						ctx.strokeStyle = `hsl(${contourNr * (360 / curSampleArrs[0].length)},80%, 50%)`;
						ctx.fillStyle = ctx.strokeStyle;
					} else {
						const l = (minMaxContourLims.maxContourIdx - minMaxContourLims.minContourIdx) + 1;
						ctx.strokeStyle = `hsl(${contourNr * (360 / l)},80%, 50%)`;
						ctx.fillStyle = ctx.strokeStyle;
					}

					// Overwrite with preconfigured colors
					const contColors = configProviderService.getContourColorsOfTrack(assignmentTrackName || trackName);
					if (contColors?.colors?.[contourNr]) {
						ctx.strokeStyle = contColors.colors[contourNr];
						ctx.fillStyle = contColors.colors[contourNr];
					}

					// Highlight selected correction tool
					if (viewStateService.curCorrectionToolNr - 1 === contourNr && trackName === 'SPEC' && assignmentTrackName === 'FORMANTS') {
						ctx.strokeStyle = '#00ff00';
						ctx.fillStyle = '#00ff00';
					}

					ctx.beginPath();

					// Left border sample
					if (colStartSampleNr >= 1) {
						const leftBorder = col.values[colStartSampleNr - 1];
						const leftVal = leftBorder[contourNr];
						const curSampleInCol = colStartSampleNr - 1;
						const curSampleInColTime = (1 / sR * curSampleInCol) + sT;
						const x = (curSampleInColTime - startTimeVP) / (endTimeVP - startTimeVP) * canvasW;
						const y = canvasH - ((leftVal - minVal) / (maxVal - minVal) * canvasH);
						ctx.moveTo(x, y);
					}

					curSampleArrs.forEach((curArr: number[], curArrIdx: number) => {
						const curSampleInCol = colStartSampleNr + curArrIdx;
						const curSampleInColTime = (1 / sR * curSampleInCol) + sT;
						const x = (curSampleInColTime - startTimeVP) / (endTimeVP - startTimeVP) * canvasW;
						const y = canvasH - ((curArr[contourNr] - minVal) / (maxVal - minVal) * canvasH);
						ctx.arc(x, y - 1, 2, 0, 2 * Math.PI, false);
						ctx.lineTo(x, y);
					});

					// Right border sample
					if (colEndSampleNr < col.values.length - 1) {
						const rightBorder = col.values[colEndSampleNr + 1];
						const rightVal = rightBorder[contourNr];
						const curSampleInCol = colEndSampleNr + 1;
						const curSampleInColTime = (1 / sR * curSampleInCol) + sT;
						const x = (curSampleInColTime - startTimeVP) / (endTimeVP - startTimeVP) * canvasW;
						const y = canvasH - ((rightVal - minVal) / (maxVal - minVal) * canvasH);
						ctx.lineTo(x, y);
					}

					ctx.stroke();
				}
			});
		} else {
			ctx.strokeStyle = 'red';
			const fontSize = 12;
			const fontFamily = 'monospace';
			const msg = nrOfSamples <= 2 ? 'Zoom out to' : 'Zoom in to';
			if (fontScaleService.drawUndistortedTextTwoLines) {
				fontScaleService.drawUndistortedTextTwoLines(
					ctx, msg, 'see contour(s)',
					fontSize / 1.05, fontFamily,
					canvasW / 2 - (ctx.measureText('see contour(s)').width * canvasW / (ssffCanvas.offsetWidth || 1) / 2),
					25, COLOR_TRANSPARENT_RED
				);
			}
		}
	}

	// ── Markup drawing (ported from signal-canvas-markup-canvas.component) ──

	function drawMarkup() {
		if (!markupCanvas) return;
		const ctx = markupCanvas.getContext('2d')!;
		ctx.clearRect(0, 0, markupCanvas.width, markupCanvas.height);

		let minVal = 0, maxVal = 0, unit = '';

		if (trackName === 'OSCI') {
			drawHelperService.drawViewPortTimes(ctx, true);
			drawHelperService.drawCurViewPortSelected(ctx, true);
		} else if (trackName === 'SPEC') {
			minVal = viewStateService.spectroSettings.rangeFrom;
			maxVal = viewStateService.spectroSettings.rangeTo;
			unit = 'Hz';
			drawHelperService.drawCurViewPortSelected(ctx, false);
			drawHelperService.drawMinMaxAndName(ctx, '', minVal, maxVal, 2);
		} else {
			const tr = configProviderService.getSsffTrackConfig(trackName);
			if (tr) {
				const minMaxValLims = configProviderService.getValueLimsOfTrack(trackName);
				if (!isEmptyObj(minMaxValLims)) {
					minVal = minMaxValLims.minVal;
					maxVal = minMaxValLims.maxVal;
					if (minMaxValLims.unit) unit = minMaxValLims.unit;
				} else {
					const col = ssffDataService.getColumnOfTrack(tr.name, tr.columnName);
					if (col) {
						minVal = col._minVal;
						maxVal = col._maxVal;
					}
				}
				drawHelperService.drawCurViewPortSelected(ctx, false);
				if (maxVal > 0) {
					drawHelperService.drawMinMaxAndName(ctx, trackName, minVal, maxVal, 2);
				}
			}
		}

		if (drawCrossHairs && drawHelperService.drawCrossHairs) {
			drawHelperService.drawCrossHairs(ctx, viewStateService.curMouseX, curMouseY, minVal, maxVal, unit, trackName);
		} else {
			drawHelperService.drawCrossHairX(ctx, viewStateService.curMouseX);
		}

		// Draw moving boundary line
		drawHelperService.drawMovingBoundaryLine(ctx);
	}

	// ── Mouse/touch handlers (from signal-canvas-markup-canvas) ──

	function getCanvasX(e: MouseEvent | TouchEvent): number {
		const event = e;
		const target = e.target as HTMLCanvasElement;
		let x: number;
		if ('touches' in event && event.touches.length > 0) {
			const rect = target.getBoundingClientRect();
			x = event.touches[0].clientX - rect.left;
		} else if ('changedTouches' in event && event.changedTouches.length > 0) {
			const rect = target.getBoundingClientRect();
			x = event.changedTouches[0].clientX - rect.left;
		} else {
			x = (event as MouseEvent).offsetX;
		}
		return x * (target.width / target.clientWidth);
	}

	function getCanvasY(e: MouseEvent | TouchEvent): number {
		const target = e.target as HTMLCanvasElement;
		let y: number;
		if ('touches' in e && e.touches.length > 0) {
			const rect = target.getBoundingClientRect();
			y = e.touches[0].clientY - rect.top;
		} else if ('changedTouches' in e && e.changedTouches.length > 0) {
			const rect = target.getBoundingClientRect();
			y = e.changedTouches[0].clientY - rect.top;
		} else {
			y = (e as MouseEvent).offsetY;
		}
		return y * (target.height / target.clientHeight);
	}

	function handleMouseDown(e: MouseEvent) {
		if (!e.shiftKey) {
			const samplesPerPx = viewStateService.getSamplesPerPixelVal(e);
			viewStateService.curViewPort.movingS = Math.round(getCanvasX(e) * samplesPerPx + viewStateService.curViewPort.sS);
			viewStateService.curViewPort.movingE = viewStateService.curViewPort.movingS;
			viewStateService.select(viewStateService.curViewPort.movingS, viewStateService.curViewPort.movingE);
			drawMarkup();
		}
	}

	function handleMouseUp(e: MouseEvent) {
		if (e.shiftKey) {
			const curSample = Math.round(getCanvasX(e) * viewStateService.getSamplesPerPixelVal(e) + viewStateService.curViewPort.sS);
			const selectDist = viewStateService.curViewPort.selectE - viewStateService.curViewPort.selectS;
			if (curSample <= viewStateService.curViewPort.selectS + selectDist / 2) {
				viewStateService.curViewPort.selectS = curSample;
			}
			if (curSample >= viewStateService.curViewPort.selectE - selectDist / 2) {
				viewStateService.curViewPort.selectE = curSample;
			}
			drawMarkup();
		}
	}

	function handleMouseMove(e: MouseEvent) {
		drawCrossHairs = true;
		const mbutton = e.buttons === undefined ? e.which : e.buttons;
		const mouseX = getCanvasX(e);
		viewStateService.curMouseX = mouseX;
		curMouseY = getCanvasY(e);
		viewStateService.curMouseY = curMouseY;
		viewStateService.curMouseTrackName = trackName;
		viewStateService.curMousePosSample = Math.round(
			viewStateService.curViewPort.sS + mouseX / markupCanvas.width * (viewStateService.curViewPort.eS - viewStateService.curViewPort.sS)
		);

		if (mbutton === 1 && !viewStateService.getdragBarActive()) {
			setSelectDrag(e);
		}

		drawMarkup();
	}

	function handleMouseLeave() {
		drawCrossHairs = false;
		if (hasAudioBuffer() && !viewStateService.getdragBarActive() && viewStateService.getPermission('labelAction')) {
			drawMarkup();
			viewStateService.curMouseTrackName = undefined;
		}
	}

	function setSelectDrag(e: MouseEvent | TouchEvent) {
		const curMouseSample = Math.round(getCanvasX(e) * viewStateService.getSamplesPerPixelVal(e) + viewStateService.curViewPort.sS);
		if (curMouseSample > viewStateService.curViewPort.movingS) {
			viewStateService.curViewPort.movingE = curMouseSample;
		} else {
			viewStateService.curViewPort.movingS = curMouseSample;
		}
		viewStateService.select(viewStateService.curViewPort.movingS, viewStateService.curViewPort.movingE);
	}

	// Touch handlers
	function handleTouchStart(e: TouchEvent) {
		e.preventDefault();
		if (!(e as any).shiftKey) {
			const samplesPerPx = viewStateService.getSamplesPerPixelVal(e);
			viewStateService.curViewPort.movingS = Math.round(getCanvasX(e) * samplesPerPx + viewStateService.curViewPort.sS);
			viewStateService.curViewPort.movingE = viewStateService.curViewPort.movingS;
			viewStateService.select(viewStateService.curViewPort.movingS, viewStateService.curViewPort.movingE);
			drawMarkup();
		}
	}

	function handleTouchMove(e: TouchEvent) {
		e.preventDefault();
		const mouseX = getCanvasX(e);
		viewStateService.curMouseX = mouseX;
		curMouseY = getCanvasY(e);
		viewStateService.curMouseY = curMouseY;
		viewStateService.curMouseTrackName = trackName;
		viewStateService.curMousePosSample = Math.round(
			viewStateService.curViewPort.sS + mouseX / markupCanvas.width * (viewStateService.curViewPort.eS - viewStateService.curViewPort.sS)
		);
		if (!viewStateService.getdragBarActive()) {
			setSelectDrag(e);
		}
	}

	function handleTouchEnd(e: TouchEvent) {
		e.preventDefault();
	}

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

	// Change detection for data canvases (only redraw when viewport/data changes)
	let prevSS = -1;
	let prevES = -1;
	let prevCanvasW = -1;
	let prevCanvasH = -1;
	let prevDataLen = -1;

	$effect(() => {
		const _tick = getTick();
		if (!mainCanvas || !ssffCanvas || !markupCanvas) return;
		syncCanvasSize(mainCanvas);
		syncCanvasSize(ssffCanvas);
		syncCanvasSize(markupCanvas);

		const sS = viewStateService.curViewPort?.sS ?? -1;
		const eS = viewStateService.curViewPort?.eS ?? -1;
		const cw = mainCanvas.width;
		const ch = mainCanvas.height;
		const dataLen = Array.isArray(ssffDataService.data) ? ssffDataService.data.length : 0;

		if (sS !== prevSS || eS !== prevES || cw !== prevCanvasW || ch !== prevCanvasH || dataLen !== prevDataLen) {
			prevSS = sS;
			prevES = eS;
			prevCanvasW = cw;
			prevCanvasH = ch;
			prevDataLen = dataLen;
			drawSsffData();
		}
		drawMarkup();
	});

	// Also redraw markup on markup-only ticks (mouse movement)
	$effect(() => {
		getMarkupTick();
		if (!markupCanvas) return;
		drawMarkup();
	});
</script>

<div class="grazer-timeline">
	<div class="grazer-timelineCanvasContainer">
		<canvas bind:this={mainCanvas} class="grazer-timelineCanvasMain"></canvas>
		<canvas
			bind:this={ssffCanvas}
			class="grazer-timelineCanvasSSFF"
					></canvas>
		<canvas
			bind:this={markupCanvas}
			class="grazer-timelineCanvasMarkup"
						role="presentation"
			onmousedown={handleMouseDown}
			onmouseup={handleMouseUp}
			onmousemove={handleMouseMove}
			onmouseleave={handleMouseLeave}
			ontouchstart={handleTouchStart}
			ontouchmove={handleTouchMove}
			ontouchend={handleTouchEnd}
		></canvas>
	</div>
</div>

