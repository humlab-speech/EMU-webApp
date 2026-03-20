<script lang="ts">
	import { onMount } from 'svelte';
	import { getTick } from '../stores/app-state.svelte';
	import {
		viewStateService,
		configProviderService,
		ssffDataService,
		fontScaleService,
	} from '../stores/services';
	import { styles } from '../../core/util/styles';

	let { trackName }: { trackName: string } = $props();

	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D;
	let assignmentTrackName = '';

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

	function drawValues(
		col: any,
		sR: number,
		sT: number,
		minMaxContourLims: any,
		minMaxValLims: any
	) {
		let minVal: number;
		let maxVal: number;

		if (trackName === 'SPEC' && assignmentTrackName !== '') {
			minVal = viewStateService.spectroSettings.rangeFrom;
			maxVal = viewStateService.spectroSettings.rangeTo;
		} else {
			minVal = col._minVal;
			maxVal = col._maxVal;
		}

		// if minMaxValLims are set use those instead
		if (minMaxValLims && Object.keys(minMaxValLims).length > 0) {
			minVal = minMaxValLims.minVal;
			maxVal = minMaxValLims.maxVal;
		}

		const startTimeVP = viewStateService.getViewPortStartTime();
		const endTimeVP = viewStateService.getViewPortEndTime();
		const colStartSampleNr = Math.max(0, Math.ceil((startTimeVP - sT) * sR));
		const colEndSampleNr = Math.min(
			Math.floor((endTimeVP - sT) * sR),
			col.values.length - 1
		);
		const nrOfSamples = colEndSampleNr - colStartSampleNr + 1;
		const curSampleArrs = col.values.slice(colStartSampleNr, colStartSampleNr + nrOfSamples);

		// draw horizontal lines
		const horizontalLines = configProviderService.getHorizontalLinesOfTrack(trackName);
		if (horizontalLines) {
			horizontalLines.yValues.forEach((yVal: number) => {
				ctx.beginPath();
				ctx.lineWidth = 2 as any;
				ctx.strokeStyle = 'blue';
				ctx.globalAlpha = 0.75;
				const zeroY = canvas.height - ((yVal - minVal) / (maxVal - minVal) * canvas.height);
				ctx.moveTo(0, zeroY);
				ctx.lineTo(canvas.width, zeroY);
				ctx.stroke();
				ctx.lineWidth = 1 as any;
				ctx.globalAlpha = 1;
			});
		}

		if (nrOfSamples < canvas.width && nrOfSamples >= 2) {
			let x: number, y: number, curSampleInCol: number, curSampleInColTime: number;

			curSampleArrs[0].forEach((contourVal: number, contourNr: number) => {
				const isEmpty = (obj: any) => !obj || Object.keys(obj).length === 0;

				if (
					isEmpty(minMaxContourLims) ||
					(contourNr >= minMaxContourLims.minContourIdx &&
						contourNr <= minMaxContourLims.maxContourIdx)
				) {
					// set color
					if (isEmpty(minMaxContourLims)) {
						ctx.strokeStyle = 'hsl(' + contourNr * (360 / curSampleArrs[0].length) + ',80%, 50%)';
						ctx.fillStyle = 'hsl(' + contourNr * (360 / curSampleArrs[0].length) + ',80%, 50%)';
					} else {
						const l = (minMaxContourLims.maxContourIdx - minMaxContourLims.minContourIdx) + 1;
						ctx.strokeStyle = 'hsl(' + contourNr * (360 / l) + ',80%, 50%)';
						ctx.fillStyle = 'hsl(' + contourNr * (360 / l) + ',80%, 50%)';
					}

					// overwrite color settings if preconfigured
					let contColors: any;
					if (assignmentTrackName !== '') {
						contColors = configProviderService.getContourColorsOfTrack(assignmentTrackName);
					} else {
						contColors = configProviderService.getContourColorsOfTrack(trackName);
					}
					if (contColors !== undefined) {
						if (contColors.colors[contourNr] !== undefined) {
							ctx.strokeStyle = contColors.colors[contourNr];
							ctx.fillStyle = contColors.colors[contourNr];
						}
					}

					// mark selected formant
					if (
						viewStateService.curCorrectionToolNr - 1 === contourNr &&
						trackName === 'SPEC' &&
						assignmentTrackName !== ''
					) {
						ctx.strokeStyle = styles.colorGreen;
						ctx.fillStyle = styles.colorGreen;
					}

					ctx.beginPath();

					// first line from sample not in view (left)
					if (colStartSampleNr >= 1) {
						const leftBorder = col.values[colStartSampleNr - 1];
						const leftVal = leftBorder[contourNr];
						curSampleInCol = colStartSampleNr - 1;
						curSampleInColTime = (1 / sR * curSampleInCol) + sT;
						x = (curSampleInColTime - startTimeVP) / (endTimeVP - startTimeVP) * canvas.width;
						y = canvas.height - ((leftVal - minVal) / (maxVal - minVal) * canvas.height);
						ctx.moveTo(x, y);
					}

					curSampleArrs.forEach((curArr: number[], curArrIdx: number) => {
						curSampleInCol = colStartSampleNr + curArrIdx;
						curSampleInColTime = (1 / sR * curSampleInCol) + sT;
						x = (curSampleInColTime - startTimeVP) / (endTimeVP - startTimeVP) * canvas.width;
						y = canvas.height - ((curArr[contourNr] - minVal) / (maxVal - minVal) * canvas.height);
						ctx.arc(x, y - 1, 2, 0, 2 * Math.PI, false);
						ctx.lineTo(x, y);
					});

					// last line from sample not in view (right)
					if (colEndSampleNr < col.values.length - 1) {
						const rightBorder = col.values[colEndSampleNr + 1];
						const rightVal = rightBorder[contourNr];
						curSampleInCol = colEndSampleNr + 1;
						curSampleInColTime = (1 / sR * curSampleInCol) + sT;
						x = (curSampleInColTime - startTimeVP) / (endTimeVP - startTimeVP) * canvas.width;
						y = canvas.height - ((rightVal - minVal) / (maxVal - minVal) * canvas.height);
						ctx.lineTo(x, y);
					}

					ctx.stroke();
				}
			});
		} else {
			ctx.strokeStyle = 'red';
			const fontSize = parseInt(styles.fontSmallSize.slice(0, -2)) / 1.05;
			if (nrOfSamples <= 2) {
				fontScaleService.drawUndistortedTextTwoLines(
					ctx, 'Zoom out to', 'see contour(s)',
					fontSize, styles.fontSmallFamily,
					canvas.width / 2 - (ctx.measureText('see contour(s)').width * ctx.canvas.width / ctx.canvas.offsetWidth / 2),
					25, styles.colorTransparentRed
				);
			} else {
				fontScaleService.drawUndistortedTextTwoLines(
					ctx, 'Zoom in to', 'see contour(s)',
					fontSize, styles.fontSmallFamily,
					canvas.width / 2 - (ctx.measureText('see contour(s)').width * ctx.canvas.width / ctx.canvas.offsetWidth / 2),
					25, styles.colorTransparentRed
				);
			}
		}
	}

	function handleUpdate() {
		if (!ctx) return;
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		const allSsffData = ssffDataService.data;
		if (!allSsffData || (Array.isArray(allSsffData) && allSsffData.length === 0)) {
			return;
		}

		if (typeof allSsffData === 'object' && Object.keys(allSsffData).length === 0) {
			return;
		}

		assignmentTrackName = '';

		// check assignments (= overlays)
		const perspectives = configProviderService.vals?.perspectives;
		if (perspectives && perspectives[viewStateService.curPerspectiveIdx]) {
			const assignments = perspectives[viewStateService.curPerspectiveIdx].signalCanvases?.assign;
			if (assignments) {
				assignments.forEach((assignment: any) => {
					if (assignment.signalCanvasName === trackName) {
						assignmentTrackName = assignment.ssffTrackName;
						const tr = configProviderService.getSsffTrackConfig(assignment.ssffTrackName);
						const col = ssffDataService.getColumnOfTrack(tr.name, tr.columnName);
						const sRaSt = ssffDataService.getSampleRateAndStartTimeOfTrack(tr.name);
						const minMaxContourLims = configProviderService.getContourLimsOfTrack(tr.name);
						const minMaxValLims = configProviderService.getValueLimsOfTrack(tr.name);
						drawValues(col, sRaSt.sampleRate, sRaSt.startTime, minMaxContourLims, minMaxValLims);
					}
				});
			}
		}

		assignmentTrackName = '';

		// draw ssffTrack onto own canvas
		if (trackName !== 'OSCI' && trackName !== 'SPEC') {
			const tr = configProviderService.getSsffTrackConfig(trackName);
			const col = ssffDataService.getColumnOfTrack(tr.name, tr.columnName);
			const sRaSt = ssffDataService.getSampleRateAndStartTimeOfTrack(tr.name);
			const minMaxContourLims = configProviderService.getContourLimsOfTrack(tr.name);
			const minMaxValLims = configProviderService.getValueLimsOfTrack(tr.name);
			drawValues(col, sRaSt.sampleRate, sRaSt.startTime, minMaxContourLims, minMaxValLims);
		}
	}

	$effect(() => {
		getTick();
		if (!canvas) return;
		syncCanvasSize();
		handleUpdate();
	});
</script>

<canvas bind:this={canvas} class="artic-timelineCanvasSSFF"></canvas>

