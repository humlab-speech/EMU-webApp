<script lang="ts">
	import { getTick, invalidate } from '../stores/app-state.svelte';
	import {
		viewStateService,
		levelService,
		soundHandlerService,
		configProviderService,
	} from '../stores/services';
	import OsciOverview from './OsciOverview.svelte';

	function cmdZoomIn() {
		if (!viewStateService.getPermission('zoom')) return;
		levelService.deleteEditArea();
		viewStateService.zoomViewPort(true, levelService);
		invalidate();
	}

	function cmdZoomOut() {
		if (!viewStateService.getPermission('zoom')) return;
		levelService.deleteEditArea();
		viewStateService.zoomViewPort(false, levelService);
		invalidate();
	}

	function cmdZoomLeft() {
		if (!viewStateService.getPermission('zoom')) return;
		levelService.deleteEditArea();
		viewStateService.shiftViewPort(false);
		invalidate();
	}

	function cmdZoomRight() {
		if (!viewStateService.getPermission('zoom')) return;
		levelService.deleteEditArea();
		viewStateService.shiftViewPort(true);
		invalidate();
	}

	function cmdZoomAll() {
		if (!viewStateService.getPermission('zoom')) return;
		levelService.deleteEditArea();
		viewStateService.setViewPort(0, soundHandlerService.audioBuffer.length);
		invalidate();
	}

	function cmdZoomSel() {
		if (!viewStateService.getPermission('zoom')) return;
		levelService.deleteEditArea();
		viewStateService.setViewPort(viewStateService.curViewPort.selectS, viewStateService.curViewPort.selectE);
		invalidate();
	}

	function cmdPlayView() {
		if (!viewStateService.getPermission('playaudio')) return;
		soundHandlerService.playFromTo(viewStateService.curViewPort.sS, viewStateService.curViewPort.eS);
		viewStateService.animatePlayHead(viewStateService.curViewPort.sS, viewStateService.curViewPort.eS);
		invalidate();
	}

	function cmdPlaySel() {
		if (!viewStateService.getPermission('playaudio')) return;
		soundHandlerService.playFromTo(viewStateService.curViewPort.selectS, viewStateService.curViewPort.selectE);
		viewStateService.animatePlayHead(viewStateService.curViewPort.selectS, viewStateService.curViewPort.selectE);
		invalidate();
	}

	function cmdPlayAll() {
		if (!viewStateService.getPermission('playaudio')) return;
		soundHandlerService.playFromTo(0, soundHandlerService.audioBuffer.length);
		viewStateService.animatePlayHead(0, soundHandlerService.audioBuffer.length);
		invalidate();
	}

	let restrictions = $derived(getTick() >= 0 && configProviderService.vals?.restrictions ? {...configProviderService.vals.restrictions} : undefined);

	let canZoom = $derived.by(() => { getTick(); return viewStateService.getPermission('zoom'); });
	let canPlay = $derived.by(() => { getTick(); return viewStateService.getPermission('playaudio'); });
</script>

<div class="grazer-bottom-menu">
	<div>
		<OsciOverview />
	</div>

	<button class="grazer-mini-btn left" id="zoomInBtn"
		disabled={!canZoom}
		onclick={cmdZoomIn}>
		<i class="material-icons">expand_less</i>in
	</button>
	<button class="grazer-mini-btn left" id="zoomOutBtn"
		disabled={!canZoom}
		onclick={cmdZoomOut}>
		<i class="material-icons">expand_more</i>out
	</button>
	<button class="grazer-mini-btn left" id="zoomLeftBtn"
		disabled={!canZoom}
		onclick={cmdZoomLeft}>
		<i class="material-icons">chevron_left</i>left
	</button>
	<button class="grazer-mini-btn left" id="zoomRightBtn"
		disabled={!canZoom}
		onclick={cmdZoomRight}>
		<i class="material-icons">chevron_right</i>right
	</button>
	<button class="grazer-mini-btn left" id="zoomAllBtn"
		disabled={!canZoom}
		onclick={cmdZoomAll}>
		<i class="material-icons" style="transform: rotate(90deg)">unfold_less</i>all
	</button>
	<button class="grazer-mini-btn left" id="zoomSelBtn"
		disabled={!canZoom}
		onclick={cmdZoomSel}>
		<i class="material-icons" style="transform: rotate(90deg)">unfold_more</i>selection
	</button>

	{#if restrictions?.playback}
		<button class="grazer-mini-btn left" id="playViewBtn"
			disabled={!canPlay}
			onclick={cmdPlayView}>
			<i class="material-icons">play_arrow</i>in view
		</button>
		<button class="grazer-mini-btn left" id="playSelBtn"
			disabled={!canPlay}
			onclick={cmdPlaySel}>
			<i class="material-icons">play_circle_outline</i>selected
		</button>
		<button class="grazer-mini-btn left" id="playAllBtn"
			disabled={!canPlay}
			onclick={cmdPlayAll}>
			<i class="material-icons">play_circle_filled</i>entire file
		</button>
	{/if}
</div>
