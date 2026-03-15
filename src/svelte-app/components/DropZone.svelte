<script lang="ts">
	// TODO: Wire to viewStateService.showDropZone + drag-n-drop service
	let showDropZone = $state(false);
</script>

{#if showDropZone}
<div class="drop-zone">
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
