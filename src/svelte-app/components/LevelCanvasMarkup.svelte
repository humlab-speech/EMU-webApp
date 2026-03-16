<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { getTick, invalidate } from '../stores/app-state.svelte';
	import {
		viewStateService,
		soundHandlerService,
		configProviderService,
		levelService,
		historyService,
	} from '../stores/services';

	let { level, idx }: { level: any; idx: number } = $props();

	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D;

	let lastEventClick: any = undefined;
	let lastEventMove: any = undefined;
	let lastNeighboursMove: any = undefined;
	let lastPCM: number | undefined = undefined;
	let curMouseSampleNrInView: number | undefined = undefined;

	// touch state
	let _touchStartTime = 0;
	let _touchStartX = 0;
	let _touchStartY = 0;
	let _lastTapTime = 0;

	// --- helpers ---

	function setLastClick(x: MouseEvent | TouchEvent) {
		curMouseSampleNrInView = viewStateService.getX(x) * viewStateService.getSamplesPerPixelVal(x);
		levelService.deleteEditArea();
		viewStateService.setEditing(false);
		lastEventClick = levelService.getClosestItem(
			curMouseSampleNrInView + viewStateService.curViewPort.sS,
			level.name,
			soundHandlerService.audioBuffer.length
		);
		viewStateService.setcurClickLevel(level.name, level.type, idx);
		if (lastEventClick.current !== undefined && lastEventClick.nearest !== undefined) {
			levelService.setlasteditArea('_' + lastEventClick.current.id);
			levelService.setlasteditAreaElem(canvas.parentElement);
			viewStateService.setcurClickItem(lastEventClick.current);
			viewStateService.selectBoundary();
		}
		lastPCM = curMouseSampleNrInView;
		viewStateService.setLastPcm(lastPCM);
		invalidate();
	}

	function setLastRightClick(x: MouseEvent | TouchEvent) {
		if (viewStateService.getcurClickLevelName() !== level.name) {
			setLastClick(x);
		}
		curMouseSampleNrInView = viewStateService.getX(x) * viewStateService.getSamplesPerPixelVal(x);
		levelService.deleteEditArea();
		lastEventClick = levelService.getClosestItem(
			curMouseSampleNrInView + viewStateService.curViewPort.sS,
			level.name,
			soundHandlerService.audioBuffer.length
		);
		if (lastEventClick.current !== undefined && lastEventClick.nearest !== undefined) {
			const next = levelService.getItemInTime(viewStateService.getcurClickLevelName(), lastEventClick.current.id, true);
			const prev = levelService.getItemInTime(viewStateService.getcurClickLevelName(), lastEventClick.current.id, false);
			viewStateService.setcurClickLevel(level.name, level.type, idx);
			viewStateService.setcurClickItemMultiple(lastEventClick.current, next, prev);
			viewStateService.selectBoundary();
		}
		lastPCM = curMouseSampleNrInView;
		viewStateService.setLastPcm(lastPCM);
		invalidate();
	}

	function setLastDblClick(x: MouseEvent | TouchEvent) {
		curMouseSampleNrInView = viewStateService.getX(x) * viewStateService.getSamplesPerPixelVal(x);
		lastEventClick = levelService.getClosestItem(
			curMouseSampleNrInView + viewStateService.curViewPort.sS,
			level.name,
			soundHandlerService.audioBuffer.length
		);
		if (lastEventClick.current !== undefined && lastEventClick.nearest !== undefined && viewStateService.getPermission('labelAction')) {
			if (level.type === 'SEGMENT') {
				if (lastEventClick.current.sampleStart >= viewStateService.curViewPort.sS) {
					if ((lastEventClick.current.sampleStart + lastEventClick.current.sampleDur) <= viewStateService.curViewPort.eS) {
						viewStateService.setcurClickLevel(level.name, level.type, idx);
						viewStateService.setcurClickItem(lastEventClick.current);
						levelService.setlasteditArea('_' + lastEventClick.current.id);
						levelService.setlasteditAreaElem(canvas.parentElement);
						viewStateService.setEditing(true);
						levelService.openEditArea(lastEventClick.current, canvas.parentElement, level.type);
					}
				}
			} else {
				viewStateService.setcurClickLevel(level.name, level.type, idx);
				viewStateService.setcurClickItem(lastEventClick.current);
				levelService.setlasteditArea('_' + lastEventClick.current.id);
				levelService.setlasteditAreaElem(canvas.parentElement);
				viewStateService.setEditing(true);
				levelService.openEditArea(lastEventClick.current, canvas.parentElement, level.type);
			}
		}
		lastPCM = curMouseSampleNrInView;
		viewStateService.setLastPcm(lastPCM);
		invalidate();
	}

	function setLastMove(x: MouseEvent | TouchEvent, doChange: boolean) {
		curMouseSampleNrInView = viewStateService.getX(x) * viewStateService.getSamplesPerPixelVal(x);
		lastEventMove = levelService.getClosestItem(
			curMouseSampleNrInView + viewStateService.curViewPort.sS,
			level.name,
			soundHandlerService.audioBuffer.length
		);
		if (doChange) {
			if (lastEventMove.current !== undefined && lastEventMove.nearest !== undefined) {
				lastNeighboursMove = levelService.getItemNeighboursFromLevel(level.name, lastEventMove.nearest.id, lastEventMove.nearest.id);
				viewStateService.setcurMouseItem(lastEventMove.nearest, lastNeighboursMove, viewStateService.getX(x), lastEventMove.isFirst, lastEventMove.isLast);
			}
		}
		viewStateService.setcurMouseLevelName(level.name);
		viewStateService.setcurMouseLevelType(level.type);
		lastPCM = curMouseSampleNrInView;
		viewStateService.setLastPcm(lastPCM);
		invalidate();
	}

	// --- event handlers ---

	function onClick(event: MouseEvent) {
		event.preventDefault();
		setLastMove(event, true);
		setLastClick(event);
	}

	function onContextMenu(event: MouseEvent) {
		event.preventDefault();
		setLastMove(event, true);
		setLastRightClick(event);
	}

	function onDblClick(event: MouseEvent) {
		setLastMove(event, true);
		if (configProviderService.vals.restrictions.editItemName) {
			setLastDblClick(event);
		} else {
			setLastClick(event);
		}
	}

	function onMouseMove(event: MouseEvent) {
		let moveLine: boolean | undefined;
		let moveBy: number;
		if (!document.hasFocus()) return;

		if (!viewStateService.getdragBarActive()) {
			moveLine = true;
			const samplesPerPixel = viewStateService.getSamplesPerPixelVal(event);
			curMouseSampleNrInView = viewStateService.getX(event) * samplesPerPixel;
			moveBy = (curMouseSampleNrInView - (lastPCM ?? 0));

			if (samplesPerPixel <= 1) {
				const zoomEventMove = levelService.getClosestItem(
					curMouseSampleNrInView + viewStateService.curViewPort.sS,
					level.name,
					soundHandlerService.audioBuffer.length
				);
				if (level.type === 'SEGMENT') {
					if (zoomEventMove.isFirst === true && zoomEventMove.isLast === false) {
						moveBy = Math.ceil(
							(curMouseSampleNrInView + viewStateService.curViewPort.sS) -
							levelService.getItemDetails(level.name, 0).sampleStart
						);
					} else if (zoomEventMove.isFirst === false && zoomEventMove.isLast === true) {
						const lastItem = levelService.getLastItem(level.name);
						moveBy = Math.ceil(
							(curMouseSampleNrInView + viewStateService.curViewPort.sS) -
							lastItem.sampleStart - lastItem.sampleDur
						);
					} else {
						moveBy = Math.ceil(
							(curMouseSampleNrInView + viewStateService.curViewPort.sS) -
							levelService.getItemFromLevelById(level.name, zoomEventMove.nearest.id).sampleStart
						);
					}
				} else {
					moveBy = Math.ceil(
						(curMouseSampleNrInView + viewStateService.curViewPort.sS) -
						levelService.getItemFromLevelById(level.name, zoomEventMove.nearest.id).samplePoint - 0.5
					);
				}
			} else {
				moveBy = Math.round(curMouseSampleNrInView - (lastPCM ?? 0));
			}
		}

		let mbutton = 0;
		if (event.buttons === undefined) {
			mbutton = event.which;
		} else {
			mbutton = event.buttons;
		}

		switch (mbutton) {
			case 1:
			case 2:
			case 3:
				break;
			default:
				if (!viewStateService.getdragBarActive()) {
					const curMouseItem = viewStateService.getcurMouseItem();
					let seg: any;
					if (configProviderService.vals.restrictions.editItemSize && event.shiftKey) {
						levelService.deleteEditArea();
						if (curMouseItem !== undefined) {
							viewStateService.movingBoundary = true;
							if (level.type === 'SEGMENT') {
								if (viewStateService.getcurMouseisFirst() || viewStateService.getcurMouseisLast()) {
									if (viewStateService.getcurMouseisFirst()) {
										seg = levelService.getItemDetails(level.name, 0);
										viewStateService.movingBoundarySample = seg.sampleStart + moveBy!;
									} else if (viewStateService.getcurMouseisLast()) {
										seg = levelService.getLastItem(level.name);
										viewStateService.movingBoundarySample = seg.sampleStart + seg.sampleDur + moveBy!;
									}
								} else {
									viewStateService.movingBoundarySample = curMouseItem.sampleStart + moveBy!;
									seg = curMouseItem;
								}
								levelService.moveBoundary(level.name, seg.id, moveBy!, viewStateService.getcurMouseisFirst(), viewStateService.getcurMouseisLast());
								historyService.updateCurChangeObj({
									type: 'ANNOT',
									action: 'MOVEBOUNDARY',
									name: level.name,
									id: seg.id,
									movedBy: moveBy!,
									isFirst: viewStateService.getcurMouseisFirst(),
									isLast: viewStateService.getcurMouseisLast(),
								});
							} else {
								seg = curMouseItem;
								viewStateService.movingBoundarySample = curMouseItem.samplePoint + moveBy!;
								levelService.moveEvent(level.name, seg.id, moveBy!);
								historyService.updateCurChangeObj({
									type: 'ANNOT',
									action: 'MOVEEVENT',
									name: level.name,
									id: seg.id,
									movedBy: moveBy!,
								});
							}
							lastPCM = curMouseSampleNrInView;
							viewStateService.setLastPcm(lastPCM!);
							viewStateService.selectBoundary();
							moveLine = false;
						}
					} else if (configProviderService.vals.restrictions.editItemSize && event.altKey) {
						levelService.deleteEditArea();
						if (level.type === 'SEGMENT') {
							seg = viewStateService.getcurClickItems();
							if (seg[0] !== undefined) {
								levelService.moveSegment(level.name, seg[0].id, seg.length, moveBy!);
								historyService.updateCurChangeObj({
									type: 'ANNOT',
									action: 'MOVESEGMENT',
									name: level.name,
									id: seg[0].id,
									length: seg.length,
									movedBy: moveBy!,
								});
							}
							lastPCM = curMouseSampleNrInView;
							viewStateService.setLastPcm(lastPCM!);
							viewStateService.selectBoundary();
						} else if (level.type === 'EVENT') {
							seg = viewStateService.getcurClickItems();
							if (seg[0] !== undefined) {
								seg.forEach((s: any) => {
									levelService.moveEvent(level.name, s.id, moveBy!);
									historyService.updateCurChangeObj({
										type: 'ANNOT',
										action: 'MOVEEVENT',
										name: level.name,
										id: s.id,
										movedBy: moveBy!,
									});
								});
							}
							lastPCM = curMouseSampleNrInView;
							viewStateService.setLastPcm(lastPCM!);
							viewStateService.selectBoundary();
						}
					} else {
						viewStateService.movingBoundary = false;
					}
				}
				break;
		}

		if (!viewStateService.getdragBarActive()) {
			setLastMove(event, moveLine!);
		}
	}

	function onMouseDown(event: MouseEvent) {
		viewStateService.movingBoundary = true;
		setLastMove(event, true);
	}

	function onMouseUp(event: MouseEvent) {
		viewStateService.movingBoundary = false;
		setLastMove(event, true);
	}

	function onMouseOut(event: MouseEvent) {
		viewStateService.movingBoundary = false;
		setLastMove(event, true);
	}

	// --- touch handlers ---

	function onTouchStart(event: TouchEvent) {
		event.preventDefault();
		_touchStartTime = Date.now();
		const t = (event.touches || [])[0];
		if (t) {
			_touchStartX = t.clientX;
			_touchStartY = t.clientY;
		}
		viewStateService.movingBoundary = true;
		setLastMove(event, true);
	}

	function onTouchMove(event: TouchEvent) {
		event.preventDefault();
		if (!document.hasFocus()) return;

		if (!viewStateService.getdragBarActive()) {
			const samplesPerPixel = viewStateService.getSamplesPerPixelVal(event);
			curMouseSampleNrInView = viewStateService.getX(event) * samplesPerPixel;
			const moveBy = Math.round(curMouseSampleNrInView - (lastPCM ?? 0));

			const curMouseItem = viewStateService.getcurMouseItem();
			if (configProviderService.vals.restrictions.editItemSize && curMouseItem !== undefined) {
				viewStateService.movingBoundary = true;
				let seg: any;
				if (level.type === 'SEGMENT') {
					if (viewStateService.getcurMouseisFirst() || viewStateService.getcurMouseisLast()) {
						if (viewStateService.getcurMouseisFirst()) {
							seg = levelService.getItemDetails(level.name, 0);
							viewStateService.movingBoundarySample = seg.sampleStart + moveBy;
						} else if (viewStateService.getcurMouseisLast()) {
							seg = levelService.getLastItem(level.name);
							viewStateService.movingBoundarySample = seg.sampleStart + seg.sampleDur + moveBy;
						}
					} else {
						viewStateService.movingBoundarySample = curMouseItem.sampleStart + moveBy;
						seg = curMouseItem;
					}
					levelService.moveBoundary(level.name, seg.id, moveBy, viewStateService.getcurMouseisFirst(), viewStateService.getcurMouseisLast());
					historyService.updateCurChangeObj({
						type: 'ANNOT',
						action: 'MOVEBOUNDARY',
						name: level.name,
						id: seg.id,
						movedBy: moveBy,
						isFirst: viewStateService.getcurMouseisFirst(),
						isLast: viewStateService.getcurMouseisLast(),
					});
				} else {
					seg = curMouseItem;
					viewStateService.movingBoundarySample = curMouseItem.samplePoint + moveBy;
					levelService.moveEvent(level.name, seg.id, moveBy);
					historyService.updateCurChangeObj({
						type: 'ANNOT',
						action: 'MOVEEVENT',
						name: level.name,
						id: seg.id,
						movedBy: moveBy,
					});
				}
				lastPCM = curMouseSampleNrInView;
				viewStateService.setLastPcm(lastPCM);
				viewStateService.selectBoundary();
			}
		}
		setLastMove(event, true);
	}

	function onTouchEnd(event: TouchEvent) {
		event.preventDefault();
		viewStateService.movingBoundary = false;
		const elapsed = Date.now() - _touchStartTime;
		const t = (event.changedTouches || [])[0];
		if (!t) return;
		const dx = Math.abs(t.clientX - _touchStartX);
		const dy = Math.abs(t.clientY - _touchStartY);

		if (elapsed < 300 && dx < 10 && dy < 10) {
			const now = Date.now();
			if (now - _lastTapTime < 300) {
				// double-tap
				setLastMove(event, true);
				if (configProviderService.vals.restrictions.editItemName) {
					setLastDblClick(event);
				} else {
					setLastClick(event);
				}
				_lastTapTime = 0;
			} else {
				// single tap
				setLastMove(event, true);
				setLastClick(event);
				_lastTapTime = now;
			}
		}
		setLastMove(event, true);
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

	onMount(() => {
		ctx = canvas.getContext('2d')!;
		syncCanvasSize();
	});

	// Keep canvas size synced reactively
	$effect(() => {
		getTick();
		if (!canvas) return;
		if (!ctx) ctx = canvas.getContext('2d')!;
		syncCanvasSize();
	});
</script>

<canvas
	bind:this={canvas}
	class="grazer-level-canvas-markup"
	onclick={onClick}
	oncontextmenu={onContextMenu}
	ondblclick={onDblClick}
	onmousemove={onMouseMove}
	onmousedown={onMouseDown}
	onmouseup={onMouseUp}
	onmouseout={onMouseOut}
	ontouchstart={onTouchStart}
	ontouchmove={onTouchMove}
	ontouchend={onTouchEnd}
></canvas>

<style>
	.grazer-level-canvas-markup {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		z-index: 2;
		cursor: pointer;
	}
</style>
