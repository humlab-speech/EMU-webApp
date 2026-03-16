<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { getTick } from '../stores/app-state.svelte';
	import {
		viewStateService,
		soundHandlerService,
		configProviderService,
		fontScaleService,
		mathHelperService,
	} from '../stores/services';
	import { SpectroDrawingWorker } from '../../core/workers/spectro-drawing.worker';
	import { styles } from '../../core/util/styles';
	import SsffCanvas from './SsffCanvas.svelte';
	import SignalCanvasMarkup from './SignalCanvasMarkup.svelte';

	let { trackName }: { trackName: string } = $props();

	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D;
	let primeWorker: any = null;
	const alpha = 0.16;
	const devicePixelRatio = (typeof window !== 'undefined' ? window.devicePixelRatio : 1) || 1;

	function calcSamplesPerPxl(): number {
		return (viewStateService.curViewPort.eS + 1 - viewStateService.curViewPort.sS) / canvas.width;
	}

	function killSpectroRenderingThread() {
		ctx.fillStyle = styles.colorBlack;
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		fontScaleService.drawUndistortedText(
			ctx,
			'rendering...',
			parseInt(styles.fontSmallSize.slice(0, -2)) * 0.75,
			styles.fontSmallFamily,
			10,
			50,
			styles.colorBlack,
			true
		);
		if (primeWorker !== null) {
			primeWorker.kill();
			primeWorker = null;
		}
	}

	function setupEvent() {
		const imageData = ctx.createImageData(canvas.width, canvas.height);
		const samplesPerPxlSnapshot = calcSamplesPerPxl();
		primeWorker.says((event: any) => {
			if (event.status === undefined) {
				if (samplesPerPxlSnapshot === event.samplesPerPxl) {
					const tmp = new Uint8ClampedArray(event.img);
					imageData.data.set(tmp);
					ctx.putImageData(imageData, 0, 0);
				}
			} else {
				console.error('Error rendering spectrogram:', event.status.message);
			}
		});
	}

	function startSpectroRenderingThread(buffer: Float32Array) {
		if (buffer.length === 0) return;

		primeWorker = new SpectroDrawingWorker();
		let parseData: Float32Array;
		let fftN = mathHelperService.calcClosestPowerOf2Gt(
			soundHandlerService.audioBuffer.sampleRate * viewStateService.spectroSettings.windowSizeInSecs
		);
		if (fftN < 512) {
			fftN = 512;
		}

		// extract relevant data
		parseData = buffer.subarray(viewStateService.curViewPort.sS, viewStateService.curViewPort.eS);

		let leftPadding: Float32Array | any[] = [];
		let rightPadding: Float32Array | any[] = [];

		// check if any zero padding at LEFT edge is necessary
		const windowSizeInSamples = soundHandlerService.audioBuffer.sampleRate * viewStateService.spectroSettings.windowSizeInSecs;
		if (viewStateService.curViewPort.sS < windowSizeInSamples / 2) {
			// padding with zeros (empty array)
		} else {
			leftPadding = buffer.subarray(
				viewStateService.curViewPort.sS - windowSizeInSamples / 2,
				viewStateService.curViewPort.sS
			);
		}

		// check if zero padding at RIGHT edge is necessary
		if (viewStateService.curViewPort.eS + fftN / 2 - 1 >= soundHandlerService.audioBuffer.length) {
			// padding with zeros (empty array)
		} else {
			rightPadding = buffer.subarray(
				viewStateService.curViewPort.eS,
				viewStateService.curViewPort.eS + fftN / 2 - 1
			);
		}

		// add padding
		const paddedSamples = new Float32Array(leftPadding.length + parseData.length + rightPadding.length);
		paddedSamples.set(leftPadding);
		paddedSamples.set(parseData, leftPadding.length);
		paddedSamples.set(rightPadding, leftPadding.length + parseData.length);

		if (viewStateService.curViewPort.sS >= fftN / 2) {
			parseData = buffer.subarray(
				viewStateService.curViewPort.sS - fftN / 2,
				viewStateService.curViewPort.eS + fftN
			);
		} else {
			parseData = buffer.subarray(
				viewStateService.curViewPort.sS,
				viewStateService.curViewPort.eS + fftN
			);
		}

		setupEvent();
		primeWorker.tell({
			'windowSizeInSecs': viewStateService.spectroSettings.windowSizeInSecs,
			'fftN': fftN,
			'alpha': alpha,
			'upperFreq': viewStateService.spectroSettings.rangeTo,
			'lowerFreq': viewStateService.spectroSettings.rangeFrom,
			'samplesPerPxl': calcSamplesPerPxl(),
			'window': viewStateService.spectroSettings.window,
			'imgWidth': canvas.width,
			'imgHeight': canvas.height,
			'dynRangeInDB': viewStateService.spectroSettings.dynamicRange,
			'pixelRatio': devicePixelRatio,
			'sampleRate': soundHandlerService.audioBuffer.sampleRate,
			'transparency': configProviderService.vals.spectrogramSettings.transparency,
			'audioBuffer': paddedSamples,
			'audioBufferChannels': soundHandlerService.audioBuffer.numberOfChannels,
			'drawHeatMapColors': viewStateService.spectroSettings.drawHeatMapColors,
			'preEmphasisFilterFactor': viewStateService.spectroSettings.preEmphasisFilterFactor,
			'heatMapColorAnchors': viewStateService.spectroSettings.heatMapColorAnchors,
			'invert': viewStateService.spectroSettings.invert,
		}, [paddedSamples.buffer]);
	}

	function drawSpectro(buffer: Float32Array) {
		killSpectroRenderingThread();
		startSpectroRenderingThread(buffer);
	}

	function redraw() {
		if (!soundHandlerService.audioBuffer?.getChannelData) return;
		const channel = viewStateService.osciSettings?.curChannel ?? 0;
		drawSpectro(soundHandlerService.audioBuffer.getChannelData(channel));
	}

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

	onDestroy(() => {
		if (primeWorker !== null) {
			primeWorker.kill();
			primeWorker = null;
		}
	});

	$effect(() => {
		getTick();
		if (!canvas) return;
		if (!ctx) ctx = canvas.getContext('2d')!;
		if (!soundHandlerService.audioBuffer) return;
		syncCanvasSize();
		redraw();
	});
</script>

<div class="grazer-timeline">
	<div class="grazer-timelineCanvasContainer">
		<canvas bind:this={canvas} class="grazer-timelineCanvasMain"></canvas>
		<SsffCanvas {trackName} />
		<SignalCanvasMarkup {trackName} />
	</div>
</div>

