<script lang="ts">
	import {
		viewStateService,
		levelService,
		soundHandlerService,
		configProviderService,
	} from '../stores/services';

	function cmdZoomIn() {
		if (!viewStateService.getPermission('zoom')) return;
		levelService.deleteEditArea();
		viewStateService.zoomViewPort(true);
	}

	function cmdZoomOut() {
		if (!viewStateService.getPermission('zoom')) return;
		levelService.deleteEditArea();
		viewStateService.zoomViewPort(false);
	}

	function cmdZoomLeft() {
		if (!viewStateService.getPermission('zoom')) return;
		levelService.deleteEditArea();
		viewStateService.shiftViewPort(false);
	}

	function cmdZoomRight() {
		if (!viewStateService.getPermission('zoom')) return;
		levelService.deleteEditArea();
		viewStateService.shiftViewPort(true);
	}

	function cmdZoomAll() {
		if (!viewStateService.getPermission('zoom')) return;
		levelService.deleteEditArea();
		viewStateService.setViewPort(0, soundHandlerService.audioBuffer.length);
	}

	function cmdZoomSel() {
		if (!viewStateService.getPermission('zoom')) return;
		levelService.deleteEditArea();
		viewStateService.setViewPort(viewStateService.curViewPort.selectS, viewStateService.curViewPort.selectE);
	}

	function cmdPlayView() {
		if (!viewStateService.getPermission('playaudio')) return;
		soundHandlerService.playFromTo(viewStateService.curViewPort.sS, viewStateService.curViewPort.eS);
		viewStateService.animatePlayHead(viewStateService.curViewPort.sS, viewStateService.curViewPort.eS);
	}

	function cmdPlaySel() {
		if (!viewStateService.getPermission('playaudio')) return;
		soundHandlerService.playFromTo(viewStateService.curViewPort.selectS, viewStateService.curViewPort.selectE);
		viewStateService.animatePlayHead(viewStateService.curViewPort.selectS, viewStateService.curViewPort.selectE);
	}

	function cmdPlayAll() {
		if (!viewStateService.getPermission('playaudio')) return;
		soundHandlerService.playFromTo(0, soundHandlerService.audioBuffer.length);
		viewStateService.animatePlayHead(0, soundHandlerService.audioBuffer.length);
	}
</script>

<div class="grazer-bottom-menu">
	<div class="osci-overview-container">
		<!-- OsciOverview canvas will go here in Phase 3 -->
	</div>

	<div class="controls">
		<button class="grazer-mini-btn" id="zoomInBtn"
			disabled={!viewStateService.getPermission('zoom')}
			onclick={cmdZoomIn}>
			<i class="material-icons">expand_less</i>in
		</button>
		<button class="grazer-mini-btn" id="zoomOutBtn"
			disabled={!viewStateService.getPermission('zoom')}
			onclick={cmdZoomOut}>
			<i class="material-icons">expand_more</i>out
		</button>
		<button class="grazer-mini-btn" id="zoomLeftBtn"
			disabled={!viewStateService.getPermission('zoom')}
			onclick={cmdZoomLeft}>
			<i class="material-icons">chevron_left</i>left
		</button>
		<button class="grazer-mini-btn" id="zoomRightBtn"
			disabled={!viewStateService.getPermission('zoom')}
			onclick={cmdZoomRight}>
			<i class="material-icons">chevron_right</i>right
		</button>
		<button class="grazer-mini-btn" id="zoomAllBtn"
			disabled={!viewStateService.getPermission('zoom')}
			onclick={cmdZoomAll}>
			<i class="material-icons" style="transform: rotate(90deg)">unfold_less</i>all
		</button>
		<button class="grazer-mini-btn" id="zoomSelBtn"
			disabled={!viewStateService.getPermission('zoom')}
			onclick={cmdZoomSel}>
			<i class="material-icons" style="transform: rotate(90deg)">unfold_more</i>selection
		</button>

		{#if configProviderService.vals?.restrictions?.playback}
			<button class="grazer-mini-btn" id="playViewBtn"
				disabled={!viewStateService.getPermission('playaudio')}
				onclick={cmdPlayView}>
				<i class="material-icons">play_arrow</i>in view
			</button>
			<button class="grazer-mini-btn" id="playSelBtn"
				disabled={!viewStateService.getPermission('playaudio')}
				onclick={cmdPlaySel}>
				<i class="material-icons">play_circle_outline</i>selected
			</button>
			<button class="grazer-mini-btn" id="playAllBtn"
				disabled={!viewStateService.getPermission('playaudio')}
				onclick={cmdPlayAll}>
				<i class="material-icons">play_circle_filled</i>entire file
			</button>
		{/if}
	</div>
</div>

<style>
	.grazer-bottom-menu {
		display: flex;
		align-items: center;
		padding: 2px 4px;
		background: #333;
		color: #fff;
		min-height: 30px;
	}

	.osci-overview-container {
		flex: 1;
		height: 25px;
		margin-right: 8px;
	}

	.controls {
		display: flex;
		gap: 2px;
	}

	.grazer-mini-btn {
		background: #555;
		border: 1px solid #666;
		color: #fff;
		cursor: pointer;
		padding: 2px 8px;
		font-size: 12px;
		border-radius: 2px;
	}

	.grazer-mini-btn:hover:not(:disabled) {
		background: #666;
	}

	.grazer-mini-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
