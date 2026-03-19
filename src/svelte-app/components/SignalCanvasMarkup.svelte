<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { getTick, getMarkupTick, invalidate, invalidateMarkup } from '../stores/app-state.svelte';
	import {
		viewStateService,
		configProviderService,
		ssffDataService,
		drawHelperService,
		historyService,
		soundHandlerService,
	} from '../stores/services';
	import { styles } from '../../core/util/styles';

	let { trackName }: { trackName: string } = $props();

	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D;
	let drawCrossHairs = false;
	let curMouseY = 0;
	let correctionTrack: any = undefined;

	// --- helpers ---

	function isEmptyObj(o: any): boolean {
		return o == null || (typeof o === 'object' && Object.keys(o).length === 0);
	}

	function setSelectDrag(event: MouseEvent | TouchEvent) {
		const curMouseSample = Math.round(
			viewStateService.getX(event) * viewStateService.getSamplesPerPixelVal(event) + viewStateService.curViewPort.sS
		);
		if (curMouseSample > viewStateService.curViewPort.movingS) {
			viewStateService.curViewPort.movingE = curMouseSample;
		} else {
			viewStateService.curViewPort.movingS = curMouseSample;
		}
		viewStateService.select(viewStateService.curViewPort.movingS, viewStateService.curViewPort.movingE);
		invalidate();
	}

	function drawMarkup() {
		if (!ctx) return;
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		let minVal = 0;
		let maxVal = 0;
		let unit = '';

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
			const minMaxValLims = configProviderService.getValueLimsOfTrack(trackName);
			if (!isEmptyObj(minMaxValLims)) {
				minVal = minMaxValLims.minVal;
				maxVal = minMaxValLims.maxVal;
				if (minMaxValLims.unit !== undefined) {
					unit = minMaxValLims.unit;
				}
			} else {
				const col = ssffDataService.getColumnOfTrack(tr.name, tr.columnName);
				if (typeof col !== 'undefined') {
					minVal = col._minVal;
					maxVal = col._maxVal;
				}
			}
			drawHelperService.drawCurViewPortSelected(ctx, false);
			if (maxVal > 0) {
				drawHelperService.drawMinMaxAndName(ctx, trackName, minVal, maxVal, 2);
			}
		}

		if (drawCrossHairs) {
			drawHelperService.drawCrossHairs(
				ctx,
				viewStateService.curMouseX,
				curMouseY,
				minVal,
				maxVal,
				unit,
				trackName
			);
		} else {
			drawHelperService.drawCrossHairX(ctx, viewStateService.curMouseX);
		}

		// formant correction highlights
		if (correctionTrack) {
			const curChangeObj = historyService.curChangeObj;
			const sRaSt = ssffDataService.getSampleRateAndStartTimeOfTrack(correctionTrack.name);

			for (const key in curChangeObj) {
				const currentSampleTime = (1 / sRaSt.sampleRate * curChangeObj[key].sampleBlockIdx) + sRaSt.startTime;
				const x =
					(currentSampleTime - viewStateService.getViewPortStartTime())
					/ (viewStateService.getViewPortEndTime() - viewStateService.getViewPortStartTime())
					* canvas.width;
				const yNew =
					canvas.height
					- curChangeObj[key].newValue
					/ (viewStateService.spectroSettings.rangeTo - viewStateService.spectroSettings.rangeFrom)
					* canvas.height;
				const yOld =
					canvas.height
					- curChangeObj[key].oldValue
					/ (viewStateService.spectroSettings.rangeTo - viewStateService.spectroSettings.rangeFrom)
					* canvas.height;

				// new value
				ctx.strokeStyle = 'black';
				ctx.fillStyle = 'black';
				ctx.beginPath();
				ctx.arc(x, yNew - 1, 2, 0, 2 * Math.PI, false);
				ctx.closePath();
				ctx.stroke();
				ctx.fill();

				// old value
				ctx.strokeStyle = 'red';
				ctx.fillStyle = 'red';
				ctx.beginPath();
				ctx.arc(x, yOld - 1, 2, 0, 2 * Math.PI, false);
				ctx.closePath();
				ctx.stroke();
				ctx.fill();
			}
		}

		drawHelperService.drawMovingBoundaryLine(ctx);
	}

	function drawPlayHead() {
		drawMarkup();
		const posS = viewStateService.getPos(canvas.width, viewStateService.playHeadAnimationInfos.sS);
		const posCur = viewStateService.getPos(canvas.width, viewStateService.playHeadAnimationInfos.curS);
		ctx.fillStyle = styles.colorTransparentLightGrey;
		ctx.fillRect(posS, 0, posCur - posS, canvas.height);
	}

	// --- event handlers ---

	function onMouseDown(event: MouseEvent) {
		if (!event.shiftKey) {
			viewStateService.curViewPort.movingS = Math.round(
				viewStateService.getX(event) * viewStateService.getSamplesPerPixelVal(event) + viewStateService.curViewPort.sS
			);
			viewStateService.curViewPort.movingE = viewStateService.curViewPort.movingS;
			viewStateService.select(viewStateService.curViewPort.movingS, viewStateService.curViewPort.movingE);
			drawMarkup();
			invalidate();
		}
	}

	function onMouseUp(event: MouseEvent) {
		if (event.shiftKey) {
			const curSample = Math.round(
				viewStateService.getX(event) * viewStateService.getSamplesPerPixelVal(event) + viewStateService.curViewPort.sS
			);
			const selectDist = viewStateService.curViewPort.selectE - viewStateService.curViewPort.selectS;
			if (curSample <= viewStateService.curViewPort.selectS + selectDist / 2) {
				viewStateService.curViewPort.selectS = curSample;
			}
			if (curSample >= viewStateService.curViewPort.selectE - selectDist / 2) {
				viewStateService.curViewPort.selectE = curSample;
			}
			drawMarkup();
			invalidate();
		}
	}

	function onMouseMove(event: MouseEvent) {
		let mbutton = 0;
		drawCrossHairs = true;
		if (event.buttons === undefined) {
			mbutton = event.which;
		} else {
			mbutton = event.buttons;
		}

		const mouseX = viewStateService.getX(event);
		viewStateService.curMouseX = mouseX;
		curMouseY = viewStateService.getY(event);
		viewStateService.curMouseY = curMouseY;
		viewStateService.curMouseTrackName = trackName;
		viewStateService.curMousePosSample = Math.round(
			viewStateService.curViewPort.sS + mouseX / canvas.width * (viewStateService.curViewPort.eS - viewStateService.curViewPort.sS)
		);

		let needsFullInvalidate = false;
		switch (mbutton) {
			case 0:
				if (viewStateService.getPermission('labelAction')) {
					if (!isEmptyObj(ssffDataService.data)) {
						if (ssffDataService.data.length !== 0) {
							if (!viewStateService.getdragBarActive()) {
								if (
									viewStateService.curCorrectionToolNr !== undefined &&
									!viewStateService.getdragBarActive() &&
									!isEmptyObj(configProviderService.getAssignment(trackName))
								) {
									if (correctionTrack === undefined) {
										const assignment = configProviderService.getAssignment(trackName);
										if (assignment && assignment.ssffTrackName) {
											correctionTrack = configProviderService.getSsffTrackConfig(assignment.ssffTrackName);
										}
									}
									if (!correctionTrack) return;
									const col = ssffDataService.getColumnOfTrack(correctionTrack.name, correctionTrack.columnName);
									const sRaSt = ssffDataService.getSampleRateAndStartTimeOfTrack(correctionTrack.name);
									const startTimeVP = viewStateService.getViewPortStartTime();
									const endTimeVP = viewStateService.getViewPortEndTime();
									const colStartSampleNr = Math.max(0, Math.ceil((startTimeVP - sRaSt.startTime) * sRaSt.sampleRate));
									const colEndSampleNr = Math.min(
										Math.floor((endTimeVP - sRaSt.startTime) * sRaSt.sampleRate),
										col.values.length - 1
									);
									const nrOfSamples = colEndSampleNr - colStartSampleNr + 1;
									const curSampleArrs = col.values.slice(colStartSampleNr, colStartSampleNr + nrOfSamples);
									const curMouseTime = startTimeVP + (viewStateService.getX(event) / (event.target as HTMLCanvasElement).width) * (endTimeVP - startTimeVP);
									const curMouseSample = Math.round((curMouseTime - sRaSt.startTime) * sRaSt.sampleRate);

									if (curMouseSample - colStartSampleNr < 0 || curMouseSample - colStartSampleNr >= curSampleArrs.length) {
										return;
									}
									viewStateService.curPreselColumnSample = curMouseSample - colStartSampleNr;

									if (event.shiftKey) {
										const oldValue = curSampleArrs[viewStateService.curPreselColumnSample][viewStateService.curCorrectionToolNr - 1];
										const newValue =
											viewStateService.spectroSettings.rangeTo -
											viewStateService.getY(event) / (event.target as HTMLCanvasElement).height * viewStateService.spectroSettings.rangeTo;

										curSampleArrs[viewStateService.curPreselColumnSample][viewStateService.curCorrectionToolNr - 1] = newValue;
										historyService.updateCurChangeObj({
											type: 'SSFF',
											trackName: correctionTrack.name,
											sampleBlockIdx: colStartSampleNr + viewStateService.curPreselColumnSample,
											sampleIdx: viewStateService.curCorrectionToolNr - 1,
											oldValue: oldValue,
											newValue: newValue,
										});
										drawMarkup();
										needsFullInvalidate = true;
									}
								}
							}
						}
					}
				}
				break;
			case 1:
				if (!viewStateService.getdragBarActive()) {
					setSelectDrag(event);
					needsFullInvalidate = true;
				}
				break;
		}
		// Only trigger full invalidate (all canvases) when data changes.
		// For pure mouse movement (crosshair updates), use markup-only invalidate.
		if (needsFullInvalidate) {
			invalidate();
		} else {
			invalidateMarkup();
		}
	}

	function onMouseLeave(_event: MouseEvent) {
		drawCrossHairs = false;
		if (!isEmptyObj(soundHandlerService)) {
			if (!isEmptyObj(soundHandlerService.audioBuffer)) {
				if (!viewStateService.getdragBarActive()) {
					if (viewStateService.getPermission('labelAction')) {
						drawMarkup();
						viewStateService.curMouseTrackName = undefined;
					}
				}
			}
		}
	}

	// --- touch handlers ---

	function onTouchStart(event: TouchEvent) {
		event.preventDefault();
		viewStateService.curViewPort.movingS = Math.round(
			viewStateService.getX(event) * viewStateService.getSamplesPerPixelVal(event) + viewStateService.curViewPort.sS
		);
		viewStateService.curViewPort.movingE = viewStateService.curViewPort.movingS;
		viewStateService.select(viewStateService.curViewPort.movingS, viewStateService.curViewPort.movingE);
		drawMarkup();
		invalidate();
	}

	function onTouchMove(event: TouchEvent) {
		event.preventDefault();
		const mouseX = viewStateService.getX(event);
		viewStateService.curMouseX = mouseX;
		curMouseY = viewStateService.getY(event);
		viewStateService.curMouseY = curMouseY;
		viewStateService.curMouseTrackName = trackName;
		viewStateService.curMousePosSample = Math.round(
			viewStateService.curViewPort.sS + mouseX / canvas.width * (viewStateService.curViewPort.eS - viewStateService.curViewPort.sS)
		);
		if (!viewStateService.getdragBarActive()) {
			setSelectDrag(event);
		}
		invalidate();
	}

	function onTouchEnd(event: TouchEvent) {
		event.preventDefault();
	}

	// --- lifecycle ---

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
		// update correction track on bundle load
		if (!isEmptyObj(ssffDataService.data) && ssffDataService.data.length !== 0) {
			const assignment = configProviderService.getAssignment(trackName);
			if (assignment && assignment.ssffTrackName) {
				correctionTrack = configProviderService.getSsffTrackConfig(assignment.ssffTrackName);
			}
		}
	});

	// reactive redraw — respond to both data changes (tick) and mouse-only changes (markupTick)
	$effect(() => {
		getTick();
		getMarkupTick();
		if (ctx && !isEmptyObj(soundHandlerService.audioBuffer)) {
			syncCanvasSize();
			drawMarkup();
		}
	});
</script>

<canvas
	bind:this={canvas}
	class="grazer-timelineCanvasMarkup"
	onmousedown={onMouseDown}
	onmouseup={onMouseUp}
	onmousemove={onMouseMove}
	onmouseleave={onMouseLeave}
	ontouchstart={onTouchStart}
	ontouchmove={onTouchMove}
	ontouchend={onTouchEnd}
></canvas>

