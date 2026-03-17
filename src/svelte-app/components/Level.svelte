<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { getTick, invalidate } from '../stores/app-state.svelte';
	import {
		viewStateService,
		soundHandlerService,
		configProviderService,
		drawHelperService,
		fontScaleService,
		historyService,
		levelService,
	} from '../stores/services';
	import { styles } from '../../core/util/styles';
	import { safeGetItem } from '../../app/util/safe-storage';
	import LevelCanvasMarkup from './LevelCanvasMarkup.svelte';

	let { levelName, idx }: { levelName: string; idx: number } = $props();

	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D;
	let levelDef: any = undefined;
	let open = true;

	// --- helpers ---

	function isEmptyObj(o: any): boolean {
		return o == null || (typeof o === 'object' && Object.keys(o).length === 0);
	}

	function changeCurAttrDef(attrDefName: string, index: number) {
		const curAttrDef = viewStateService.getCurAttrDef(levelName);
		if (curAttrDef !== attrDefName) {
			viewStateService.setCurAttrDef(levelName, attrDefName, index);
			viewStateService.setEditing(false);
			levelService.deleteEditArea();
			invalidate();
		}
	}

	function getAttrDefBtnColor(attrDefName: string): string {
		const curAttrDef = viewStateService.getCurAttrDef(level.name);
		if (attrDefName === curAttrDef) {
			return `background: -webkit-radial-gradient(50% 50%, closest-corner, rgba(0,0,0,1), rgba(0,0,0,0) 60%); border-color: ${styles.colorYellow}`;
		}
		return `background-color: ${styles.colorWhite}`;
	}

	function drawLevelDetailsFor(level: any) {
		if (!ctx || isEmptyObj(level)) return;

		const fontFamily = styles.fontSmallFamily;
		let labelFontFamily: string;
		if (
			typeof configProviderService.vals.perspectives[viewStateService.curPerspectiveIdx]?.levelCanvases?.labelFontFamily === 'undefined'
		) {
			labelFontFamily = styles.fontSmallFamily;
		} else {
			labelFontFamily = configProviderService.vals.perspectives[viewStateService.curPerspectiveIdx].levelCanvases.labelFontFamily;
		}

		let levelCanvasesFontScalingFactor = Number(safeGetItem('levelCanvasesFontScalingFactor'));
		if (levelCanvasesFontScalingFactor === 0) {
			levelCanvasesFontScalingFactor = 100;
		}
		levelCanvasesFontScalingFactor = levelCanvasesFontScalingFactor / 100;

		const fontSize = parseInt(styles.fontSmallSize.slice(0, -2));
		let labelFontSize: number;
		if (
			typeof configProviderService.vals.perspectives[viewStateService.curPerspectiveIdx]?.levelCanvases?.fontPxSize === 'undefined'
		) {
			labelFontSize = parseInt(styles.fontSmallSize.slice(0, -2)) * levelCanvasesFontScalingFactor;
		} else {
			labelFontSize = configProviderService.vals.perspectives[viewStateService.curPerspectiveIdx].levelCanvases.labelFontPxSize * levelCanvasesFontScalingFactor;
		}

		const curAttrDef = viewStateService.getCurAttrDef(level.name);
		const isOpen = true; // in Svelte we default to open; Angular checked parent CSS height

		ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

		const sDist = viewStateService.getSampleDist(ctx.canvas.width);
		const scaleY = ctx.canvas.height / ctx.canvas.offsetHeight;

		// draw level name
		if (level.name === curAttrDef) {
			fontScaleService.drawUndistortedText(
				ctx, level.name, fontSize, fontFamily,
				4, ctx.canvas.height / 2,
				styles.colorBlue, true
			);
		} else {
			fontScaleService.drawUndistortedTextTwoLines(
				ctx, level.name + ':' + curAttrDef, '(' + level.type + ')',
				fontSize, fontFamily,
				4, ctx.canvas.height / 2 - fontSize * scaleY,
				styles.colorWhite, true
			);
		}

		const mTxtImgWidth = ctx.measureText('m').width * fontScaleService.scaleX;
		const zeroTxtImgWidth = ctx.measureText('0').width * fontScaleService.scaleX;

		if (level.type === 'SEGMENT') {
			ctx.fillStyle = styles.colorWhite;
			level.items.forEach((item: any) => {
				if (
					(item.sampleStart >= viewStateService.curViewPort.sS && item.sampleStart <= viewStateService.curViewPort.eS) ||
					(item.sampleStart + item.sampleDur > viewStateService.curViewPort.sS && item.sampleStart + item.sampleDur < viewStateService.curViewPort.eS) ||
					(item.sampleStart < viewStateService.curViewPort.sS && item.sampleStart + item.sampleDur > viewStateService.curViewPort.eS)
				) {
					let curLabVal: string | undefined;
					item.labels.forEach((lab: any) => {
						if (lab.name === curAttrDef) curLabVal = lab.value;
					});

					const posS = viewStateService.getPos(ctx.canvas.width, item.sampleStart);
					const posE = viewStateService.getPos(ctx.canvas.width, item.sampleStart + item.sampleDur + 1);

					// segment start
					ctx.fillStyle = styles.colorWhite;
					ctx.fillRect(posS, 0, 2, ctx.canvas.height / 2);

					// segment end
					ctx.fillStyle = styles.colorGrey;
					ctx.fillRect(posE, ctx.canvas.height / 2, 2, ctx.canvas.height);

					ctx.font = (fontSize - 2) + 'px ' + labelFontFamily;

					// label text
					if (curLabVal !== undefined && posE - posS > mTxtImgWidth * curLabVal.length) {
						fontScaleService.drawUndistortedText(
							ctx, curLabVal, labelFontSize - 2, labelFontFamily,
							posS + (posE - posS) / 2,
							(ctx.canvas.height / 2) - (fontSize - 2) + 2,
							styles.colorWhite, false
						);
					}

					// helper lines
					if (open && curLabVal !== undefined && curLabVal.length !== 0) {
						const labelCenter = posS + (posE - posS) / 2;

						let hlY = ctx.canvas.height / 4;
						ctx.strokeStyle = styles.colorWhite;
						ctx.lineWidth = 4;
						ctx.beginPath();
						ctx.moveTo(posS, hlY);
						ctx.lineTo(labelCenter, hlY);
						ctx.lineTo(labelCenter, hlY + 5);
						ctx.stroke();

						hlY = ctx.canvas.height / 4 * 3;
						ctx.strokeStyle = styles.colorGrey;
						ctx.beginPath();
						ctx.moveTo(posE, hlY);
						ctx.lineTo(labelCenter, hlY);
						ctx.lineTo(labelCenter, hlY - 5);
						ctx.stroke();
						ctx.lineWidth = 1;
					}

					if (open) {
						// sampleStart numbers
						if (posE - posS > zeroTxtImgWidth * item.sampleStart.toString().length && isOpen) {
							fontScaleService.drawUndistortedText(
								ctx, item.sampleStart, fontSize - 2, fontFamily,
								posS + 3, (fontSize * scaleY) / 2,
								styles.colorBlue, true
							);
						}

						// sampleDur numbers
						const durtext = 'dur: ' + item.sampleDur + ' ';
						if (posE - posS > zeroTxtImgWidth * durtext.length && isOpen) {
							fontScaleService.drawUndistortedText(
								ctx, durtext, fontSize - 2, fontFamily,
								posE - (ctx.measureText(durtext).width * fontScaleService.scaleX),
								ctx.canvas.height / 4 * 3 + (fontSize * scaleY) / 2,
								styles.colorBlue, true
							);
						}
					}
				}
			});
		} else if (level.type === 'EVENT') {
			ctx.fillStyle = styles.colorWhite;
			level.items.forEach((item: any) => {
				if (item.samplePoint > viewStateService.curViewPort.sS && item.samplePoint < viewStateService.curViewPort.eS) {
					const perc = Math.round(viewStateService.getPos(ctx.canvas.width, item.samplePoint) + (sDist / 2));
					let curLabVal: string | undefined;
					item.labels.forEach((lab: any) => {
						if (lab.name === curAttrDef) curLabVal = lab.value;
					});

					ctx.fillStyle = styles.colorWhite;
					ctx.fillRect(perc, 0, 3, ctx.canvas.height / 2 - ctx.canvas.height / 5);
					ctx.fillRect(perc, ctx.canvas.height / 2 + ctx.canvas.height / 5, 3, ctx.canvas.height / 2 - ctx.canvas.height / 5);

					fontScaleService.drawUndistortedText(
						ctx, curLabVal, labelFontSize - 2, labelFontFamily,
						perc, (ctx.canvas.height / 2) - (fontSize - 2) + 2,
						styles.colorWhite, false
					);

					if (isOpen) {
						fontScaleService.drawUndistortedText(
							ctx, item.samplePoint, fontSize - 2, labelFontFamily,
							perc + 5, (fontSize * scaleY) / 2,
							styles.colorBlue, true
						);
					}
				}
			});
		}
	}

	function drawLevelMarkup() {
		// Note: The markup is drawn by LevelCanvasMarkup child component.
		// This function is kept for cases where the parent needs to trigger markup redraws.
		// The child reacts to getTick() automatically.
	}

	function onMouseLeave() {
		viewStateService.setcurMouseItem(undefined, undefined, undefined);
		invalidate();
	}

	// --- resize handling ---
	let resizeObserver: ResizeObserver | undefined;

	function syncCanvasSize() {
		if (!canvas) return;
		const rect = canvas.getBoundingClientRect();
		const dpr = window.devicePixelRatio || 1;
		const w = Math.round(rect.width * dpr);
		const h = Math.round(rect.height * dpr);
		if (w > 0 && h > 0 && (canvas.width !== w || canvas.height !== h)) {
			canvas.width = w;
			canvas.height = h;
		}
	}

	onMount(() => {
		ctx = canvas.getContext('2d')!;
		levelDef = configProviderService.getLevelDefinition(levelName);
		syncCanvasSize();

		resizeObserver = new ResizeObserver(() => {
			syncCanvasSize();
			const curLevel = levelService.getLevelDetails(levelName);
			if (curLevel && !isEmptyObj(curLevel)) {
				drawLevelDetailsFor(curLevel);
			}
		});
		resizeObserver.observe(canvas);
	});

	onDestroy(() => {
		resizeObserver?.disconnect();
	});

	// Change detection to avoid unnecessary redraws
	let prevSS = -1;
	let prevES = -1;
	let prevCanvasW = -1;
	let prevCanvasH = -1;
	let prevAttrDef = '';
	let prevItemCount = -1;

	// reactive redraw
	$effect(() => {
		getTick();
		if (!canvas) return;
		if (!ctx) ctx = canvas.getContext('2d')!;
		const curLevel = levelService.getLevelDetails(levelName);
		if (!levelDef && curLevel?.name) {
			levelDef = configProviderService.getLevelDefinition(curLevel.name);
		}
		syncCanvasSize();

		const sS = viewStateService.curViewPort?.sS ?? -1;
		const eS = viewStateService.curViewPort?.eS ?? -1;
		const cw = canvas.width;
		const ch = canvas.height;
		const attrDef = viewStateService.getCurAttrDef(levelName) ?? '';
		const itemCount = curLevel?.items?.length ?? -1;

		if (sS !== prevSS || eS !== prevES || cw !== prevCanvasW || ch !== prevCanvasH || attrDef !== prevAttrDef || itemCount !== prevItemCount) {
			prevSS = sS;
			prevES = eS;
			prevCanvasW = cw;
			prevCanvasH = ch;
			prevAttrDef = attrDef;
			prevItemCount = itemCount;
			if (curLevel && !isEmptyObj(curLevel)) {
				drawLevelDetailsFor(curLevel);
			}
		}
	});
</script>

<div class="grazer-level" onmouseleave={onMouseLeave}>
	<div class="grazer-level-container">
		<canvas
			bind:this={canvas}
			class="grazer-level-canvas"
		></canvas>
		<LevelCanvasMarkup {levelName} {idx} />
	</div>
</div>

{#if levelDef?.attributeDefinitions?.length > 1}
<div class="grazer-canvasSelectors">
	<ul>
		{#each levelDef.attributeDefinitions as attrDef, i}
			<li>
				<button
					onclick={() => changeCurAttrDef(attrDef.name, i)}
					style={getAttrDefBtnColor(attrDef.name)}
				></button>
			</li>
		{/each}
	</ul>
</div>
{/if}

