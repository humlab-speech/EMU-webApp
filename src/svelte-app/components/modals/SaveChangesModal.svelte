<script lang="ts">
	import { getConfigTick } from '../../stores/app-state.svelte';
	import { modalService } from '../../stores/services';

	let bundleName = $derived(getConfigTick() >= 0 ? modalService.dataIn : '');
</script>

<div class="artic-modal-wrap">
	<div class="artic-modal-header-large artic-modal-header">
		<h3 id="modalHeading">Save changes</h3>
	</div>
	<div class="artic-modal-body">
		<p>Changes made to: "{bundleName}". Do you wish to save them?</p>
	</div>
	<div class="artic-modal-footer">
		<button class="artic-mini-btn" onclick={() => modalService.closeAndResolve('saveChanges')}>Save Changes</button>
		<button class="artic-mini-btn" onclick={() => modalService.closeAndResolve('discardChanges')}>Discard Changes</button>
		<button class="artic-mini-btn" id="modalCancelBtn" onclick={() => modalService.close()}>Cancel</button>
	</div>
</div>
