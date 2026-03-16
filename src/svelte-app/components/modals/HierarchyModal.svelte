<script lang="ts">
	import { getTick } from '../../stores/app-state.svelte';
	import {
		viewStateService,
		historyService,
		modalService,
		hierarchyLayoutService,
		configProviderService,
		standardFuncsService,
	} from '../../stores/services';
	import EmuHierarchy from '../EmuHierarchy.svelte';

	const pathInfo = hierarchyLayoutService.findAllNonPartialPaths();
	const possiblePaths: string[][] = pathInfo.possible;
	const possiblePathsAsStr: string[] = pathInfo.possibleAsStr;

	// Reactive state
	let selectedPathIdx = $state(viewStateService.hierarchyState.curPathIdx || 0);

	$effect(() => {
		getTick();
		selectedPathIdx = viewStateService.hierarchyState.curPathIdx || 0;
	});

	function onPathChange(event: Event) {
		const idx = parseInt((event.target as HTMLSelectElement).value, 10);
		selectedPathIdx = idx;
		viewStateService.hierarchyState.curPathIdx = idx;
		viewStateService.hierarchyState.path = possiblePaths[idx];
	}

	function rotateHierarchy() {
		viewStateService.hierarchyState.toggleRotation();
	}

	function playSelection() {
		++viewStateService.hierarchyState.playing;
	}
</script>

<div class="grazer-modal-wrap">
	<div class="grazer-modal-header-large grazer-modal-header">
		{#each [...(viewStateService.hierarchyState.path || [])].reverse() as levelName (levelName)}
			<div class="grazer-nav-wrap" style="margin-left: 5px;">
				<button class="grazer-mini-btn full">{levelName}</button>
			</div>
		{/each}
	</div>
	<div class="grazer-modal-body grazer-modal-hierarchy">
		<div class="grazer-modal-select">
			<select id="grazer-selection" onchange={onPathChange} value={selectedPathIdx}>
				{#each possiblePathsAsStr as pathStr, idx (idx)}
					<option value={idx}>{pathStr}</option>
				{/each}
			</select>
		</div>
		<EmuHierarchy />
	</div>
	<div class="grazer-modal-footer">
		<button class="grazer-mini-btn" onclick={playSelection}>play selected</button>
		<button class="grazer-mini-btn" onclick={rotateHierarchy}>&#x21BB; rotate by 90&deg;</button>
		<button class="grazer-mini-btn" onclick={() => modalService.close()}>close hierarchy</button>
	</div>
</div>
