<script lang="ts">
	import { getTick } from '../../stores/app-state.svelte';
	import { modalService, viewStateService } from '../../stores/services';

	let placeholder = $derived(getTick() >= 0 ? (modalService.dataIn || '') : '');
	let inputVal = $state('');

	function onFocus() { viewStateService.cursorInTextField = true; }
	function onBlur() { viewStateService.cursorInTextField = false; }
</script>

<div class="grazer-modal-wrap">
	<div class="grazer-modal-header-large grazer-modal-header">
		<h3 id="modalHeading">Load Files</h3>
	</div>
	<div class="grazer-modal-body">
		<p>Load files</p>
		<p>
			<input
				type="text"
				bind:value={inputVal}
				{placeholder}
				onfocus={onFocus}
				onblur={onBlur}
			/>
		</p>
	</div>
	<div class="grazer-modal-footer">
		<button class="grazer-mini-btn" onclick={() => modalService.close()}>Cancel</button>
		<button class="grazer-mini-btn" onclick={() => { modalService.dataOut = inputVal; modalService.confirmContent(); }}>OK</button>
	</div>
</div>
