<script lang="ts">
	import { getConfigTick, invalidate } from '../../stores/app-state.svelte';
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

	// Initialize path if not yet set (RC1)
	if ((!viewStateService.hierarchyState.path || viewStateService.hierarchyState.path.length === 0) && possiblePaths.length > 0) {
		viewStateService.hierarchyState.path = possiblePaths[0];
		viewStateService.hierarchyState.curPathIdx = 0;
	}

	// Reactive state
	let selectedPathIdx = $state(viewStateService.hierarchyState.curPathIdx || 0);

	// Reactive bridge: derive current path from tick so Svelte detects changes (RC3)
	let currentPath = $derived.by(() => {
		getConfigTick();
		return [...(viewStateService.hierarchyState.path || [])];
	});

	$effect(() => {
		getConfigTick();
		selectedPathIdx = viewStateService.hierarchyState.curPathIdx || 0;
	});

	// Dropdown state for attribute definition selectors per level (RC4)
	let dropdownOpen: Record<string, boolean> = $state({});

	function onPathChange(event: Event) {
		const idx = parseInt((event.target as HTMLSelectElement).value, 10);
		selectedPathIdx = idx;
		viewStateService.hierarchyState.curPathIdx = idx;
		viewStateService.hierarchyState.path = possiblePaths[idx];
		invalidate(); // RC2: trigger EmuHierarchy re-render
	}

	function rotateHierarchy() {
		viewStateService.hierarchyState.toggleRotation();
		invalidate();
	}

	function playSelection() {
		++viewStateService.hierarchyState.playing;
		invalidate();
	}

	function toggleViewportSync() {
		viewStateService.hierarchyState.toggleViewportSync();
		invalidate();
	}

	let viewportSyncLabel = $derived.by(() => {
		getConfigTick();
		return viewStateService.hierarchyState.viewportSync ? 'synced to zoom' : 'show all';
	});

	function setCurrentAttrDef(levelName: string, attrName: string, index: number) {
		viewStateService.setCurAttrDef(levelName, attrName, index);
		dropdownOpen[levelName] = false;
		invalidate();
	}
</script>

<div class="artic-modal-wrap">
	<div class="artic-modal-header-large artic-modal-header">
		{#each [...currentPath].reverse() as levelName (levelName)}
			<div class="artic-nav-wrap" style="margin-left: 5px;">
				<ul class="artic-dropdown-container">
					<li class="left">
						<button class="artic-mini-btn full"
							onmouseenter={() => dropdownOpen[levelName] = true}
							onmouseleave={() => dropdownOpen[levelName] = false}
							onclick={() => dropdownOpen[levelName] = !dropdownOpen[levelName]}
						>
							{levelName} <span id="artic-dropdown-arrow"></span>
						</button>
						{#if dropdownOpen[levelName]}
							<ul class="artic-dropdown-menu"
								onmouseenter={() => dropdownOpen[levelName] = true}
								onmouseleave={() => dropdownOpen[levelName] = false}
							>
								{#each configProviderService.getAttrDefsNames(levelName) || [] as attrName, i}
									<li onclick={() => setCurrentAttrDef(levelName, attrName, i)}>
										&rarr; {attrName}
									</li>
								{/each}
							</ul>
						{/if}
					</li>
				</ul>
			</div>
		{/each}
	</div>
	<div class="artic-modal-body artic-modal-hierarchy">
		<div class="artic-modal-select">
			<select id="artic-selection" onchange={onPathChange} value={selectedPathIdx}>
				{#each possiblePathsAsStr as pathStr, idx (idx)}
					<option value={idx}>{pathStr}</option>
				{/each}
			</select>
		</div>
		<EmuHierarchy />
	</div>
	<div class="artic-modal-footer">
		<button class="artic-mini-btn" onclick={playSelection}>play selected</button>
		<button class="artic-mini-btn" onclick={toggleViewportSync}>{viewportSyncLabel}</button>
		<button class="artic-mini-btn" onclick={rotateHierarchy}>&#x21BB; rotate by 90&deg;</button>
		<button class="artic-mini-btn" onclick={() => modalService.close()}>close hierarchy</button>
	</div>
</div>
