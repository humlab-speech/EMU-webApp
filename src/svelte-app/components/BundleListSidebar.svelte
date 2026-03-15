<script lang="ts">
	import {
		viewStateService,
		loadedMetaDataService,
		dbObjLoadSaveService,
		historyService,
		configProviderService,
		modalService,
	} from '../stores/services';

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
</script>

{#if !viewStateService.bundleListSideBarDisabled && viewStateService.getBundleListSideBarOpen()}
<div class="bundle-list-sidebar">
	<div class="sidebar-header">
		<span>Bundles</span>
	</div>
	<div class="sidebar-content">
		{#each loadedMetaDataService.getBundleList() as bndl, i}
			<div class="bundle-item"
				class:active={loadedMetaDataService.getCurBndl() === bndl}
				onclick={() => loadBundle(bndl)}
				role="button"
				tabindex="0"
			>
				{#if bndl.session}
					<span class="session-name">{bndl.session} /</span>
				{/if}
				<span class="bundle-name">{bndl.name}</span>
			</div>
		{/each}
	</div>
</div>
{/if}

<style>
	.bundle-list-sidebar {
		width: 250px;
		min-width: 250px;
		background: #2a2a2a;
		color: #fff;
		display: flex;
		flex-direction: column;
		border-right: 1px solid #444;
		height: 100%;
	}

	.sidebar-header {
		padding: 8px 16px;
		background: #333;
		border-bottom: 1px solid #444;
		font-weight: bold;
	}

	.sidebar-content {
		flex: 1;
		overflow-y: auto;
		padding: 4px;
	}

	.bundle-item {
		padding: 4px 8px;
		cursor: pointer;
		border-radius: 2px;
		font-size: 12px;
	}

	.bundle-item:hover {
		background: #444;
	}

	.bundle-item.active {
		background: #0DC5FF;
		color: #000;
	}

	.session-name {
		opacity: 0.7;
		font-size: 11px;
	}
</style>
