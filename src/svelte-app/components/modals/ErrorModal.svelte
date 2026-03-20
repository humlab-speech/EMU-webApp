<script lang="ts">
	import { getTick } from '../../stores/app-state.svelte';
	import { modalService } from '../../stores/services';

	let message = $derived(getTick() >= 0 ? modalService.dataIn : '');
</script>

<div class="artic-modal-wrap">
	<div class="artic-modal-header-large artic-modal-header">
		<h3 id="modalHeading">Error</h3>
	</div>
	<div class="artic-modal-body">
		<div class="artic-text">
			<div id="artic-error-text">{message}</div>
		</div>
	</div>
	<div class="artic-modal-footer">
		<button id="artic-modal-cancel" class="artic-mini-btn" onclick={() => modalService.close()}>Cancel</button>
	</div>
</div>

