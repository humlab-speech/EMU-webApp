<script lang="ts">
	import { viewStateService, dragnDropService } from '../stores/services';

	function onDragOver(e: DragEvent) {
		e.preventDefault();
		viewStateService.showDropZone = true;
	}

	function onDragLeave() {
		viewStateService.showDropZone = false;
	}

	function onDrop(e: DragEvent) {
		e.preventDefault();
		viewStateService.showDropZone = false;
		if (e.dataTransfer?.files) {
			dragnDropService.handleDrop(e.dataTransfer.files);
		}
	}
</script>

<svelte:window on:dragover={onDragOver} />

{#if viewStateService.showDropZone}
<div class="drop-zone"
	ondragleave={onDragLeave}
	ondrop={onDrop}
	role="region"
	aria-label="Drop zone"
>
	<div class="drop-zone-text">Drop audio/annotation files here</div>
</div>
{/if}

<style>
	.drop-zone {
		position: absolute;
		inset: 0;
		background: rgba(0, 120, 255, 0.3);
		border: 3px dashed #0078ff;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 200;
	}

	.drop-zone-text {
		color: #fff;
		font-size: 24px;
		font-weight: bold;
		text-shadow: 0 1px 3px rgba(0,0,0,0.5);
	}
</style>
