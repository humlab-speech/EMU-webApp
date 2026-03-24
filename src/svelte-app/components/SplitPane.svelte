<script lang="ts">
	import type { Snippet } from 'svelte';
	import { invalidateViewport } from '../stores/app-state.svelte';

	let {
		topMinSize = 80,
		bottomMinSize = 80,
		top,
		bottom,
	}: {
		topMinSize?: number;
		bottomMinSize?: number;
		top: Snippet;
		bottom: Snippet;
	} = $props();

	let container: HTMLDivElement;
	let splitRatio = $state(0.5);
	let dragging = $state(false);

	function onMouseDown(e: MouseEvent) {
		e.preventDefault();
		dragging = true;
	}

	function onMouseMove(e: MouseEvent) {
		if (!dragging || !container) return;
		const rect = container.getBoundingClientRect();
		const y = e.clientY - rect.top;
		const ratio = Math.max(topMinSize / rect.height, Math.min(1 - bottomMinSize / rect.height, y / rect.height));
		splitRatio = ratio;
	}

	function onMouseUp() {
		if (dragging) {
			dragging = false;
			invalidateViewport();
		}
	}

	function onResize() {
		invalidateViewport();
	}
</script>

<svelte:window on:mousemove={onMouseMove} on:mouseup={onMouseUp} on:resize={onResize} />

<div class="split-container" bind:this={container}>
	<div class="split-top" style="height: {splitRatio * 100}%;">
		{@render top()}
	</div>
	<div class="split-handler"
		onmousedown={onMouseDown}
		role="separator"
		aria-orientation="horizontal"
		tabindex="0"
	>
		<span></span>
	</div>
	<div class="split-bottom" style="height: {(1 - splitRatio) * 100}%;">
		{@render bottom()}
	</div>
</div>

<style>
	.split-container {
		display: flex;
		flex-direction: column;
		width: 100%;
		height: 100%;
		overflow: hidden;
	}

	.split-top, .split-bottom {
		overflow: hidden;
		position: relative;
	}

	.split-handler {
		height: 6px;
		background: #444;
		cursor: row-resize;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.split-handler span {
		width: 30px;
		height: 2px;
		background: #888;
		border-radius: 1px;
	}
</style>
