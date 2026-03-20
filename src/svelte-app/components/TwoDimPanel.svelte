<script lang="ts">
	import { getTick } from '../stores/app-state.svelte';
	import {
		viewStateService,
		configProviderService,
	} from '../stores/services';
	import DotsCanvas from './DotsCanvas.svelte';
	import EpgGridCanvas from './EpgGridCanvas.svelte';

	let w = $state(200);
	let h = $state(200);
	const MIN_SIZE = 100;

	let dragging = $state<'corner' | 'top' | 'left' | null>(null);

	function onMouseDown(type: 'corner' | 'top' | 'left') {
		return (e: MouseEvent) => {
			e.preventDefault();
			dragging = type;
			viewStateService.setdragBarActive(true);
		};
	}

	function onMouseMove(e: MouseEvent) {
		if (!dragging) return;

		if (dragging === 'top' || dragging === 'corner') {
			const newH = Math.max(MIN_SIZE, window.innerHeight - e.clientY);
			h = newH;
		}
		if (dragging === 'left' || dragging === 'corner') {
			const newW = Math.max(MIN_SIZE, window.innerWidth - e.clientX);
			w = newW;
		}
	}

	function onMouseUp() {
		if (dragging) {
			dragging = null;
			viewStateService.setdragBarActive(false);
		}
	}

	// Visibility: only show when twoDimCanvases.order has entries
	let visible = $derived.by(() => {
		getTick();
		const persp = configProviderService.vals?.perspectives?.[viewStateService.curPerspectiveIdx];
		return persp?.twoDimCanvases?.order?.length > 0;
	});

	let canvasType = $derived.by(() => {
		getTick();
		const persp = configProviderService.vals?.perspectives?.[viewStateService.curPerspectiveIdx];
		return persp?.twoDimCanvases?.order?.[0] ?? '';
	});
</script>

<svelte:window onmousemove={onMouseMove} onmouseup={onMouseUp} />

{#if visible}
	<div
		class="artic-2d-map"
		style="width: {w}px; height: {h}px; top: calc(100% - {h}px);"
	>
		<!-- Corner resizer -->
		<div class="corner" onmousedown={onMouseDown('corner')}></div>
		<!-- Top border resizer -->
		<div class="topBorder" onmousedown={onMouseDown('top')}></div>
		<!-- Left border resizer -->
		<div class="leftBorder" onmousedown={onMouseDown('left')}></div>

		{#if canvasType === 'DOTS'}
			<DotsCanvas />
		{:else if canvasType === 'EPG'}
			<EpgGridCanvas />
		{/if}
	</div>
{/if}
