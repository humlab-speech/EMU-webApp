<script lang="ts">
	import { getTick } from '../stores/app-state.svelte';
	import {
		viewStateService,
		loadedMetaDataService,
		dbObjLoadSaveService,
		historyService,
		configProviderService,
		modalService,
	} from '../stores/services';

	let filterText = $state('');

	// Reactive state from services
	let sideBarOpen = $derived.by(() => {
		getTick();
		return !viewStateService.bundleListSideBarDisabled && viewStateService.getBundleListSideBarOpen();
	});

	let groupedBundles = $derived.by(() => {
		getTick();
		const list = loadedMetaDataService.getBundleList();
		if (!list || list.length === 0) return [];
		const groups: Map<string, any[]> = new Map();
		for (const bndl of list) {
			const session = bndl.session || '';
			if (!groups.has(session)) groups.set(session, []);
			groups.get(session)!.push(bndl);
		}
		return Array.from(groups.entries()).map(([session, bundles]) => ({ session, bundles }));
	});

	let curBndl = $derived.by(() => {
		getTick();
		return loadedMetaDataService.getCurBndl();
	});

	function loadBundle(bndl: any) {
		if (historyService.movesAwayFromLastSave !== 0) {
			modalService.open('views/confirmModal.html', 'You have unsaved changes. Load new bundle anyway?').then((res: any) => {
				if (res) dbObjLoadSaveService.loadBundle(bndl);
			});
		} else {
			dbObjLoadSaveService.loadBundle(bndl);
		}
	}

	function toggleSession(session: string) {
		loadedMetaDataService.openCollapseSession(session);
	}

	function saveBundle(bndl: any, e: MouseEvent) {
		e.stopPropagation();
		dbObjLoadSaveService.saveBundle();
	}

	interface SessionGroup {
		session: string;
		bundles: any[];
	}

	function isFiltered(bndl: any): boolean {
		if (!filterText) return true;
		const search = filterText.toLowerCase();
		return (bndl.name?.toLowerCase().includes(search) || bndl.session?.toLowerCase().includes(search));
	}

	function isSessionOpen(session: string): boolean {
		return loadedMetaDataService.isSessionOpen ? loadedMetaDataService.isSessionOpen(session) : true;
	}
</script>

{#if sideBarOpen}
<div class="grazer-bundle-outer">
	<div>
		<h3>Bundles</h3>
		<div style="text-align: center; padding: 6px;">
			<input
				class="grazer-filter"
				type="text"
				placeholder="Filter..."
				bind:value={filterText}
			/>
		</div>
		<div class="grazer-bundle-container">
			{#each groupedBundles as group}
				<div class="grazer-bundle-session" onclick={() => toggleSession(group.session)} role="button" tabindex="0">
					<div>
						<i class="material-icons" style="font-size: 14px; vertical-align: middle;">
							{isSessionOpen(group.session) ? 'expand_more' : 'chevron_right'}
						</i>
						{group.session}
					</div>
				</div>
				{#if isSessionOpen(group.session)}
					<ul>
						{#each group.bundles as bndl, i}
							{#if isFiltered(bndl)}
								<li class="grazer-bundle-item"
									class:grazer-bundle-last={i === group.bundles.length - 1}
									onclick={() => loadBundle(bndl)}
									role="button"
									tabindex="0"
									style={curBndl === bndl ? 'background-color: var(--color-blue); color: var(--color-black);' : ''}
								>
									<b>{bndl.name}</b>
									{#if configProviderService.vals?.activeButtons?.saveBundle && curBndl === bndl}
										<button class="grazer-saveBundleButton" onclick={(e) => saveBundle(bndl, e)}>
											<i class="material-icons" style="font-size: 16px;">save</i>
										</button>
									{/if}
								</li>
							{/if}
						{/each}
					</ul>
				{/if}
			{/each}
		</div>
	</div>
</div>
{/if}
