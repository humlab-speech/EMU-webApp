<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { getViewportTick } from '../stores/app-state.svelte';
	import {
		viewStateService,
		configProviderService,
		drawHelperService,
		fontScaleService,
		dataService,
		hierarchyLayoutService,
		levelService,
	} from '../stores/services';
	import { HierarchyWorker } from '../../core/workers/hierarchy.worker';
	import { safeGetItem } from '../../core/util/safe-storage';

	// Colors
	const COLOR_BLACK = '#000';
	const COLOR_WHITE = '#fff';
	const COLOR_BLUE = '#0DC5FF';
	const COLOR_YELLOW = '#ff0';
	const COLOR_GREY = '#424242';

	let canvas: HTMLCanvasElement;
	let markupCanvas: HTMLCanvasElement;
	let resizeCleanup: (() => void) | undefined;
	let hierarchyWorker: HierarchyWorker;

	function isEmptyObj(obj: any): boolean {
		return !obj || (typeof obj === 'object' && Object.keys(obj).length === 0);
	}

	async function redrawAll() {
		if (!canvas || !markupCanvas) return;

		const annotation = dataService.getData();
		if (!annotation || !annotation.levels || annotation.levels.length === 0) return;

		let path = viewStateService.hierarchyState?.path;
		if (!path || path.length === 0) {
			const pathInfo = hierarchyLayoutService.findAllNonPartialPaths();
			if (pathInfo?.possible?.[0]) {
				viewStateService.hierarchyState.path = pathInfo.possible[0];
				viewStateService.hierarchyState.curPathIdx = 0;
				path = pathInfo.possible[0];
			} else {
				return;
			}
		}

		const ctx = canvas.getContext('2d')!;
		ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

		const vpSS = viewStateService.curViewPort.sS;
		const vpES = viewStateService.curViewPort.eS;

		try {
			if (!hierarchyWorker) hierarchyWorker = new HierarchyWorker();
			const reducedAnnotation = await hierarchyWorker.reduceAnnotationToViewableTimeAndPath(annotation, path, vpSS, vpES);

			const nrOfPxlsPerLevel = 1024 / path.length;
			let topLimitPxl = 0;
			let bottomLimitPxl = nrOfPxlsPerLevel;

			const pathClone = structuredClone(path);
			const reversedPath = pathClone.reverse();

			for (const levelName of reversedPath) {
				const levelDetails = await hierarchyWorker.getLevelDetails(levelName, reducedAnnotation);
				drawLevelDetails(levelDetails, topLimitPxl, bottomLimitPxl);
				topLimitPxl += nrOfPxlsPerLevel;
				bottomLimitPxl += nrOfPxlsPerLevel;
			}
		} catch (e) {
			// Worker may fail if annotation structure incomplete
			console.warn('[HierarchyPathCanvas] redrawAll error:', e);
		}

		drawLevelMarkup();
	}

	function drawLevelDetails(levelDetails: any, topLimitPxl: number = 0, bottomLimitPxl: number = 1024) {
		if (!canvas || isEmptyObj(levelDetails) || isEmptyObj(viewStateService) || isEmptyObj(configProviderService)) return;

		const perspective = configProviderService.vals?.perspectives?.[viewStateService.curPerspectiveIdx];
		if (!perspective) return;

		// Font config
		const fontFamily = 'monospace';
		let labelFontFamily = perspective.levelCanvases?.labelFontFamily || fontFamily;

		let levelCanvasesFontScalingFactor = Number(safeGetItem('levelCanvasesFontScalingFactor')) || 100;
		levelCanvasesFontScalingFactor = levelCanvasesFontScalingFactor / 100;

		const fontSize = 12;
		let labelFontSize = (perspective.levelCanvases?.labelFontPxSize || fontSize) * levelCanvasesFontScalingFactor;

		const curAttrDef = viewStateService.getCurAttrDef(levelDetails.name);

		const ctx = canvas.getContext('2d')!;
		ctx.clearRect(0, topLimitPxl, ctx.canvas.width, bottomLimitPxl);

		const sDist = viewStateService.getSampleDist(ctx.canvas.width);

		// Draw level name
		if (levelDetails.name === curAttrDef) {
			fontScaleService.drawUndistortedText(
				ctx, levelDetails.name, fontSize - 2, fontFamily,
				4, topLimitPxl + (bottomLimitPxl - topLimitPxl) / 2,
				COLOR_BLUE, true
			);
		} else {
			fontScaleService.drawUndistortedTextTwoLines(
				ctx,
				levelDetails.name + ':' + curAttrDef,
				'(' + levelDetails.type + ')',
				fontSize, fontFamily,
				4, topLimitPxl + (bottomLimitPxl - topLimitPxl) / 2,
				COLOR_YELLOW, true
			);
		}

		const mTxtImgWidth = ctx.measureText('m').width * (fontScaleService.scaleX || 1);

		const vpSS = viewStateService.curViewPort.sS;
		const vpES = viewStateService.curViewPort.eS;

		if (levelDetails.type === 'SEGMENT' || levelDetails.type === 'ITEM') {
			ctx.fillStyle = COLOR_WHITE;

			levelDetails.items.forEach((item: any) => {
				if (
					(item.sampleStart >= vpSS && item.sampleStart <= vpES) ||
					(item.sampleStart + item.sampleDur > vpSS && item.sampleStart + item.sampleDur < vpES) ||
					(item.sampleStart < vpSS && item.sampleStart + item.sampleDur > vpES)
				) {
					let curLabVal: string | undefined;
					item.labels.forEach((lab: any) => {
						if (lab.name === curAttrDef) curLabVal = lab.value;
					});

					const posS = viewStateService.getPos(ctx.canvas.width, item.sampleStart);
					const posE = viewStateService.getPos(ctx.canvas.width, item.sampleStart + item.sampleDur + 1);

					// Segment start line
					ctx.fillStyle = COLOR_WHITE;
					ctx.fillRect(posS, topLimitPxl, 2, (bottomLimitPxl - topLimitPxl) / 2);

					// Segment end line
					ctx.fillStyle = COLOR_GREY;
					ctx.fillRect(posE, topLimitPxl + (bottomLimitPxl - topLimitPxl) / 2, 2, (bottomLimitPxl - topLimitPxl) / 2);

					ctx.font = (labelFontSize - 2) + 'px ' + labelFontFamily;

					// Label text if space permits
					if (curLabVal !== undefined && posE - posS > mTxtImgWidth * curLabVal.length) {
						fontScaleService.drawUndistortedText(
							ctx, curLabVal, labelFontSize - 2, labelFontFamily,
							posS + (posE - posS) / 2,
							(topLimitPxl + (bottomLimitPxl - topLimitPxl) / 2) - (fontSize - 2) + 2,
							COLOR_WHITE, false
						);
					}

					// Helper lines
					if (curLabVal !== undefined && curLabVal.length !== 0) {
						const labelCenter = posS + (posE - posS) / 2;

						let hlY = topLimitPxl + (bottomLimitPxl - topLimitPxl) / 4;
						ctx.strokeStyle = COLOR_WHITE;
						ctx.beginPath();
						ctx.moveTo(posS, hlY);
						ctx.lineTo(labelCenter, hlY);
						ctx.lineTo(labelCenter, hlY + 5);
						ctx.stroke();

						hlY = topLimitPxl + (bottomLimitPxl - topLimitPxl) / 4 * 3;
						ctx.strokeStyle = COLOR_GREY;
						ctx.beginPath();
						ctx.moveTo(posE, hlY);
						ctx.lineTo(labelCenter, hlY);
						ctx.lineTo(labelCenter, hlY - 5);
						ctx.stroke();
					}
				}
			});
		} else if (levelDetails.type === 'EVENT') {
			ctx.fillStyle = COLOR_WHITE;

			levelDetails.items.forEach((item: any) => {
				if (item.samplePoint > vpSS && item.samplePoint < vpES) {
					const perc = Math.round(viewStateService.getPos(ctx.canvas.width, item.samplePoint) + (sDist / 2));

					let curLabVal: string | undefined;
					item.labels.forEach((lab: any) => {
						if (lab.name === curAttrDef) curLabVal = lab.value;
					});

					ctx.fillStyle = COLOR_WHITE;
					const halfH = (bottomLimitPxl - topLimitPxl) / 2;
					const fifthH = (bottomLimitPxl - topLimitPxl) / 5;
					ctx.fillRect(perc, 0, 1, halfH - fifthH);
					ctx.fillRect(perc, halfH + fifthH, 1, halfH - fifthH);

					fontScaleService.drawUndistortedText(
						ctx, curLabVal, labelFontSize - 2, labelFontFamily,
						perc, halfH - (fontSize - 2) + 2,
						COLOR_WHITE, false
					);
				}
			});
		}
	}

	function drawLevelMarkup() {
		if (!markupCanvas) return;
		const ctx = markupCanvas.getContext('2d')!;
		ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

		// Draw moving boundary line
		drawHelperService.drawMovingBoundaryLine(ctx);

		// Draw current viewport selected
		drawHelperService.drawCurViewPortSelected(ctx);

		// Draw cursor crosshair
		drawHelperService.drawCrossHairX(ctx, viewStateService.curMouseX);
	}

	function handleMouseLeave() {
		viewStateService.setcurMouseItem(undefined, undefined, undefined);
		drawLevelMarkup();
	}

	onMount(() => {
		let resizeTimer: ReturnType<typeof setTimeout>;
		const handleResize = () => {
			clearTimeout(resizeTimer);
			resizeTimer = setTimeout(() => redrawAll(), 1000);
		};
		window.addEventListener('resize', handleResize);
		resizeCleanup = () => {
			clearTimeout(resizeTimer);
			window.removeEventListener('resize', handleResize);
		};
	});

	onDestroy(() => {
		resizeCleanup?.();
	});

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
		const _tick = getViewportTick();
		if (!canvas || !markupCanvas) return;
		syncCanvasSize(canvas);
		syncCanvasSize(markupCanvas);
		redrawAll();
	});
</script>

<div
	class="artic-level"
	role="presentation"
	onmouseleave={handleMouseLeave}
>
	<div class="artic-level-container">
		<canvas
			bind:this={canvas}
			class="artic-level-canvas"
			style="background: {COLOR_BLACK};"
		></canvas>
		<canvas
			bind:this={markupCanvas}
			class="artic-level-markup"
			style="background-color: rgba(200, 200, 200, 0.3); filter: blur(1px);"
		></canvas>
	</div>
</div>

<style>
	.artic-level {
		position: relative;
		width: 100%;
		height: 256px;
	}

	.artic-level-container {
		position: relative;
		width: 100%;
		height: 100%;
	}

	.artic-level-canvas {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
	}

	.artic-level-markup {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
	}
</style>
