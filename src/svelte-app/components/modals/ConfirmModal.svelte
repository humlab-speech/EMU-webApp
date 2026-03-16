<script lang="ts">
	import { getTick } from '../../stores/app-state.svelte';
	import { modalService } from '../../stores/services';

	let message = $derived(getTick() >= 0 ? modalService.dataIn : '');
</script>

<div class="grazer-modal-wrap">
	<div class="grazer-modal-header-large grazer-modal-header">
		<h3 id="modalHeading">Confirm</h3>
	</div>
	<div class="grazer-modal-body">
		<div class="grazer-text">
			<div>{message}</div>
		</div>
	</div>
	<div class="grazer-modal-footer">
		<button id="grazer-modal-cancel" class="grazer-mini-btn" onclick={() => modalService.close()}>Cancel</button>
		<button id="grazer-modal-confirm" class="grazer-mini-btn" onclick={() => modalService.confirm()}>Confirm</button>
	</div>
</div>
