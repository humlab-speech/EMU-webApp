<script lang="ts">
	import TopMenu from './components/TopMenu.svelte';
	import BottomMenu from './components/BottomMenu.svelte';
	import ProgressBar from './components/ProgressBar.svelte';
	import BundleListSidebar from './components/BundleListSidebar.svelte';
	import HistoryActionPopup from './components/HistoryActionPopup.svelte';
	import DropZone from './components/DropZone.svelte';
	import Modal from './components/Modal.svelte';
	import { initServices } from './stores/services';

	// Initialize all core services (wires up dependencies)
	initServices();
</script>

<div class="grazer-main" id="MainCtrl">
	<Modal />
	<BundleListSidebar />

	<div class="grazer-window" id="mainWindow">
		<ProgressBar />

		<TopMenu />

		<div class="grazer-canvas">
			<HistoryActionPopup />
			<!-- Signal canvases (osci, spectrogram, ssff tracks) will go here -->
			<div class="grazer-signal-area">
				<p style="color: #666; text-align: center; padding: 2em;">
					Canvas components will be ported in Phase 3
				</p>
			</div>
		</div>

		<BottomMenu />
	</div>

	<DropZone />
</div>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
		overflow: hidden;
	}

	.grazer-main {
		position: relative;
		width: 100%;
		height: 100vh;
		display: flex;
	}

	.grazer-window {
		flex: 1;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.grazer-canvas {
		flex: 1;
		position: relative;
		overflow: hidden;
	}

	.grazer-signal-area {
		width: 100%;
		height: 100%;
	}
</style>
