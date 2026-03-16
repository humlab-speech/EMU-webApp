<script lang="ts">
	import { getTick } from '../../stores/app-state.svelte';
	import { modalService } from '../../stores/services';

	let bundleName = $derived(getTick() >= 0 ? modalService.dataIn : '');
</script>

<div class="grazer-modal-wrap">
	<div class="grazer-modal-header-large grazer-modal-header">
		<h3 id="modalHeading">Save changes</h3>
	</div>
	<div class="grazer-modal-body">
		<p>Changes made to: "{bundleName}". Do you wish to save them?</p>
	</div>
	<div class="grazer-modal-footer">
		<button class="grazer-mini-btn" onclick={() => modalService.closeAndResolve('saveChanges')}>Save Changes</button>
		<button class="grazer-mini-btn" onclick={() => modalService.closeAndResolve('discardChanges')}>Discard Changes</button>
		<button class="grazer-mini-btn" id="modalCancelBtn" onclick={() => modalService.close()}>Cancel</button>
	</div>
</div>
