<script lang="ts">
	import { getConfigTick } from '../stores/app-state.svelte';
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

	let isOpen = $derived(getConfigTick() >= 0 && modalService.isOpen);
	let url = $derived(getConfigTick() >= 0 ? (modalService.getTemplateUrl() || '') : '');
</script>

{#if isOpen}
<div class="artic-modal artic-modal-open" role="dialog" aria-modal="true">
	<div class="artic-modal-content">
		<button class="artic-close-button" onclick={() => modalService.close()} aria-label="Close">&#x2715;</button>

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
			<div class="artic-modal-wrap">
				<div class="artic-modal-body">
					<p>Modal: {url}</p>
				</div>
				<div class="artic-modal-footer">
					<button class="artic-mini-btn" onclick={() => modalService.close()}>Close</button>
				</div>
			</div>
		{/if}
	</div>
</div>
{/if}

