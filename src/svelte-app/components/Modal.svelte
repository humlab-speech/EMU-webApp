<script lang="ts">
	import { getTick } from '../stores/app-state.svelte';
	import { modalService } from '../stores/services';

	import ErrorModal from './modals/ErrorModal.svelte';
	import ConfirmModal from './modals/ConfirmModal.svelte';
	import SaveChangesModal from './modals/SaveChangesModal.svelte';
	import ConnectModal from './modals/ConnectModal.svelte';
	import LoginModal from './modals/LoginModal.svelte';
	import RenameLevelModal from './modals/RenameLevelModal.svelte';
	import SearchModal from './modals/SearchModal.svelte';
	import ExportModal from './modals/ExportModal.svelte';
	import HelpModal from './modals/HelpModal.svelte';
	import LoadFilesModal from './modals/LoadFilesModal.svelte';
	import SelectLabelModal from './modals/SelectLabelModal.svelte';
	import SelectThresholdModal from './modals/SelectThresholdModal.svelte';
	import SettingsModal from './modals/SettingsModal.svelte';
	import HierarchyModal from './modals/HierarchyModal.svelte';

	let isOpen = $derived(getTick() >= 0 && modalService.isOpen);
	let url = $derived(getTick() >= 0 ? (modalService.getTemplateUrl() || '') : '');
</script>

{#if isOpen}
<div class="grazer-modal grazer-modal-open" role="dialog" aria-modal="true">
	<div class="grazer-modal-content">
		<button class="grazer-close-button" onclick={() => modalService.close()} aria-label="Close">&#x2715;</button>

		{#if url === 'views/error.html'}
			<ErrorModal />
		{:else if url === 'views/confirmModal.html'}
			<ConfirmModal />
		{:else if url === 'views/saveChanges.html'}
			<SaveChangesModal />
		{:else if url === 'views/connectModal.html'}
			<ConnectModal />
		{:else if url === 'views/loginModal.html'}
			<LoginModal />
		{:else if url === 'views/renameLevel.html'}
			<RenameLevelModal />
		{:else if url === 'views/searchAnnot.html'}
			<SearchModal />
		{:else if url === 'views/export.html'}
			<ExportModal />
		{:else if url === 'views/help.html'}
			<HelpModal />
		{:else if url === 'views/loadFiles.html'}
			<LoadFilesModal />
		{:else if url === 'views/SelectLabelModal.html'}
			<SelectLabelModal />
		{:else if url === 'views/SelectThresholdModal.html'}
			<SelectThresholdModal />
		{:else if url === 'views/settingsModal.html'}
			<SettingsModal />
		{:else if url === 'views/showHierarchyModal.html'}
			<HierarchyModal />
		{:else if url}
			<div class="grazer-modal-wrap">
				<div class="grazer-modal-body">
					<p>Modal: {url}</p>
				</div>
				<div class="grazer-modal-footer">
					<button class="grazer-mini-btn" onclick={() => modalService.close()}>Close</button>
				</div>
			</div>
		{/if}
	</div>
</div>
{/if}

<style>
	.grazer-modal {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.7);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
	}

	.grazer-modal-content {
		position: relative;
		background: #424242;
		color: #fff;
		min-width: 300px;
		max-width: 90vw;
		max-height: 90vh;
		overflow-y: auto;
		border-radius: 4px;
	}

	.grazer-close-button {
		position: absolute;
		top: 8px;
		right: 8px;
		background: transparent;
		border: none;
		color: #fff;
		font-size: 18px;
		cursor: pointer;
		z-index: 1;
		line-height: 1;
	}

	.grazer-close-button:hover {
		color: #0DC5FF;
	}
</style>
