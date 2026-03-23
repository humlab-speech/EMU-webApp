<script lang="ts">
	import SplitPane from './SplitPane.svelte';
	import Osci from './Osci.svelte';
	import Spectrogram from './Spectrogram.svelte';
	import SsffTrack from './SsffTrack.svelte';
	import Level from './Level.svelte';
	import HierarchyPathCanvas from './HierarchyPathCanvas.svelte';
	import {
		viewStateService,
		configProviderService,
		levelService,
		soundHandlerService,
	} from '../stores/services';
	import { getViewportTick } from '../stores/app-state.svelte';
	import { safeGetItem } from '../../core/util/safe-storage';

	// Read current perspective config reactively — spread to create new array refs
	let signalOrder = $derived.by(() => {
		getViewportTick();
		try {
			return [...(configProviderService.vals?.perspectives?.[viewStateService.curPerspectiveIdx]?.signalCanvases?.order ?? [])];
		} catch { return []; }
	});

	let levelOrder = $derived.by(() => {
		getViewportTick();
		try {
			return [...(configProviderService.vals?.perspectives?.[viewStateService.curPerspectiveIdx]?.levelCanvases?.order ?? [])];
		} catch { return []; }
	});

	let showHierarchy = $derived.by(() => {
		getViewportTick();
		return safeGetItem('showHierarchyPathCanvas') === 'true'
			&& viewStateService.getPermission('zoom')
			&& configProviderService.curDbConfig?.linkDefinitions?.length > 0;
	});
</script>

<SplitPane topMinSize={80} bottomMinSize={80}>
	{#snippet top()}
		<ul class="signal-list">
			{#each signalOrder as trackName, i (trackName)}
				<li class="signal-item">
					{#if trackName === 'OSCI'}
						<Osci {trackName} />
					{:else if trackName === 'SPEC'}
						<Spectrogram {trackName} />
					{:else}
						<SsffTrack {trackName} order={i} />
					{/if}
				</li>
			{/each}
		</ul>
	{/snippet}

	{#snippet bottom()}
		<div class="level-area" style="margin-top: 25px;">
			{#if showHierarchy}
				<HierarchyPathCanvas />
			{/if}
			<ul class="level-list">
				{#each levelOrder as levelName, i}
					<li>
						<Level levelName={levelName} idx={i} />
					</li>
				{/each}
			</ul>
		</div>
	{/snippet}
</SplitPane>

<style>
	.signal-list, .level-list {
		list-style: none;
		margin: 0;
		padding: 0;
		width: 100%;
		height: 100%;
	}

	.signal-item {
		width: 100%;
		min-height: 60px;
		position: relative;
	}

	.signal-list {
		display: flex;
		flex-direction: column;
	}

	.signal-item {
		flex: 1;
	}

	.level-area {
		width: 100%;
		height: 100%;
		overflow-y: auto;
	}

	.level-list li {
		width: 100%;
	}
</style>
