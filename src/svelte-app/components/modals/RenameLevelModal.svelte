<script lang="ts">
	import { getConfigTick } from '../../stores/app-state.svelte';
	import { modalService, levelService, historyService, viewStateService } from '../../stores/services';

	let originalName = $derived(getConfigTick() >= 0 ? (modalService.dataIn || '') : '');
	let newName = $state('');

	function renameLevel() {
		const name = newName.trim() || originalName;
		levelService.renameLevel(originalName, name);
		historyService.addCurChangeObjToUndoStack();
		modalService.close();
	}

	function onFocus() { viewStateService.cursorInTextField = true; }
	function onBlur() { viewStateService.cursorInTextField = false; }
</script>

<div class="artic-modal-wrap">
	<div class="artic-modal-header-large artic-modal-header">
		<h3 id="modalHeading">Rename Level</h3>
	</div>
	<div class="artic-modal-body">
		<p>Do you really wish to <i>rename</i> the level "{originalName}"?</p>
		<p>
			<input
				type="text"
				bind:value={newName}
				placeholder={originalName}
				onfocus={onFocus}
				onblur={onBlur}
			/>
		</p>
	</div>
	<div class="artic-modal-footer">
		<button class="artic-mini-btn" id="modalCancelBtn" onclick={() => modalService.close()}>Cancel</button>
		<button class="artic-mini-btn" onclick={renameLevel}>Rename</button>
	</div>
</div>
