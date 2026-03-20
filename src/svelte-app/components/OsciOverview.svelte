<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { getTick } from '../stores/app-state.svelte';
	import { viewStateService, soundHandlerService, drawHelperService } from '../stores/services';

	let canvas: HTMLCanvasElement;
	let markupCanvas: HTMLCanvasElement;
	let envelopeHasBeenDrawn = false;
	let startSample = -1;
	let prevBundleName: string | undefined;

	// Colors (matching artic-design.scss)
	const COLOR_TRANSPARENT_LIGHT_GREY = 'rgba(152, 152, 152, 0.18)';
	const COLOR_WHITE = '#fff';

	function hasAudioBuffer(): boolean {
		return soundHandlerService.audioBuffer && typeof soundHandlerService.audioBuffer.length === 'number' && soundHandlerService.audioBuffer.length > 0;
	}

	function drawPreview() {
		if (!hasAudioBuffer()) return;
		if (!envelopeHasBeenDrawn) {
			envelopeHasBeenDrawn = true;
			drawHelperService.freshRedrawDrawOsciOnCanvas(canvas, 0, soundHandlerService.audioBuffer.length, true);
		}
		drawVpOsciMarkup();
	}

	function drawVpOsciMarkup() {
		if (!markupCanvas || !hasAudioBuffer()) return;
		const ctx = markupCanvas.getContext('2d')!;
		const bufLen = soundHandlerService.audioBuffer.length;
		const posS = (markupCanvas.width / bufLen) * viewStateService.curViewPort.sS;
		const posE = (markupCanvas.width / bufLen) * viewStateService.curViewPort.eS;

		ctx.clearRect(0, 0, markupCanvas.width, markupCanvas.height);
		ctx.fillStyle = COLOR_TRANSPARENT_LIGHT_GREY;
		ctx.fillRect(posS, 0, posE - posS, markupCanvas.height);
		ctx.strokeStyle = COLOR_WHITE;
		ctx.beginPath();
		ctx.moveTo(posS, 0);
		ctx.lineTo(posS, markupCanvas.height);
		ctx.moveTo(posE, 0);
		ctx.lineTo(posE, markupCanvas.height);
		ctx.closePath();
		ctx.stroke();
	}

	/** Convert a mouse/touch event X to a canvas-pixel X, accounting for CSS scaling */
	function getCanvasX(e: MouseEvent | TouchEvent): number {
		const target = e.target as HTMLCanvasElement;
		const rect = target.getBoundingClientRect();
		let clientX: number;
		if ('touches' in e && e.touches.length > 0) {
			clientX = e.touches[0].clientX;
		} else if ('changedTouches' in e && e.changedTouches.length > 0) {
			clientX = e.changedTouches[0].clientX;
		} else {
			clientX = (e as MouseEvent).clientX;
		}
		const x = clientX - rect.left;
		return x * (target.width / target.clientWidth);
	}

	function applyViewport(x: number, target: HTMLCanvasElement) {
		if (!hasAudioBuffer()) return;
		const bufLen = soundHandlerService.audioBuffer.length;
		const width = viewStateService.curViewPort.eS - viewStateService.curViewPort.sS;
		let sample = x * (bufLen / target.width);

		// Clamp so viewport stays within buffer
		if (sample - width / 2 < 0) {
			sample = Math.ceil(width / 2);
		} else if (sample + width / 2 > bufLen) {
			sample = Math.floor(bufLen - width / 2);
		}

		if (!viewStateService.isEditing()) {
			viewStateService.setViewPort(sample - width / 2, sample + width / 2);
		}
	}

	// Mouse handlers
	function handleClick(e: MouseEvent) {
		if (!hasAudioBuffer()) return;
		const x = getCanvasX(e);
		applyViewport(x, e.target as HTMLCanvasElement);
	}

	function handleMouseDown(e: MouseEvent) {
		if (!hasAudioBuffer()) return;
		startSample = getCanvasX(e) * (soundHandlerService.audioBuffer.length / (e.target as HTMLCanvasElement).width);
	}

	function handleMouseMove(e: MouseEvent) {
		const mbutton = e.buttons === undefined ? e.which : e.buttons;
		if (mbutton === 1 && startSample !== -1) {
			const x = getCanvasX(e);
			applyViewport(x, e.target as HTMLCanvasElement);
		}
	}

	function handleMouseUp() {
		startSample = -1;
	}

	function handleMouseOut() {
		startSample = -1;
	}

	// Touch handlers
	function handleTouchStart(e: TouchEvent) {
		e.preventDefault();
		if (!hasAudioBuffer()) return;
		startSample = getCanvasX(e) * (soundHandlerService.audioBuffer.length / (e.target as HTMLCanvasElement).width);
	}

	function handleTouchMove(e: TouchEvent) {
		e.preventDefault();
		if (startSample === -1) return;
		const x = getCanvasX(e);
		applyViewport(x, e.target as HTMLCanvasElement);
	}

	function handleTouchEnd(e: TouchEvent) {
		e.preventDefault();
		if (!hasAudioBuffer()) return;
		const bufLen = soundHandlerService.audioBuffer.length;
		const width = viewStateService.curViewPort.eS - viewStateService.curViewPort.sS;

		if (startSample - width / 2 < 0) {
			startSample = Math.ceil(width / 2);
		} else if (startSample + width / 2 > bufLen) {
			startSample = Math.floor(bufLen - width / 2);
		}

		if (!viewStateService.isEditing()) {
			viewStateService.setViewPort(startSample - width / 2, startSample + width / 2);
		}
		startSample = -1;
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

	$effect(() => {
		const _tick = getTick();
		if (!canvas || !markupCanvas) return;
		syncCanvasSize(canvas);
		syncCanvasSize(markupCanvas);

		// Detect bundle change: reset envelope flag
		const curName = viewStateService.curViewPort?.bundleName;
		if (curName !== prevBundleName) {
			envelopeHasBeenDrawn = false;
			prevBundleName = curName;

			// Clear on empty bundle
			if (!curName) {
				canvas.getContext('2d')!.clearRect(0, 0, canvas.width, canvas.height);
				markupCanvas.getContext('2d')!.clearRect(0, 0, markupCanvas.width, markupCanvas.height);
				return;
			}
		}

		drawPreview();
	});
</script>

<div
	class="artic-preview"
	role="presentation"
	onclick={handleClick}
	onmousedown={handleMouseDown}
	onmousemove={handleMouseMove}
	onmouseup={handleMouseUp}
	onmouseout={handleMouseOut}
	ontouchstart={handleTouchStart}
	ontouchmove={handleTouchMove}
	ontouchend={handleTouchEnd}
>
	<canvas bind:this={canvas} class="artic-preview-canvas" style="background: #000; border: 1px solid gray; width: 100%; height: 100%;"></canvas>
	<canvas bind:this={markupCanvas} class="artic-preview-canvas-markup" style="width: 100%; height: 100%;"></canvas>
</div>

<style>
	.artic-preview-canvas {
		position: absolute;
		top: 0;
		left: 0;
	}

	.artic-preview-canvas-markup {
		position: absolute;
		top: 0;
		left: 0;
		pointer-events: none;
	}
</style>
