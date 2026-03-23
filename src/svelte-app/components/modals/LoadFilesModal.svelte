<script lang="ts">
	import { getConfigTick } from '../../stores/app-state.svelte';
	import { modalService, viewStateService } from '../../stores/services';

	let placeholder = $derived(getConfigTick() >= 0 ? (modalService.dataIn || '') : '');
	let inputVal = $state('');

	function onFocus() { viewStateService.cursorInTextField = true; }
	function onBlur() { viewStateService.cursorInTextField = false; }
</script>

<div class="artic-modal-wrap">
	<div class="artic-modal-header-large artic-modal-header">
		<h3 id="modalHeading">Load Files</h3>
	</div>
	<div class="artic-modal-body">
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
	<div class="artic-modal-footer">
		<button class="artic-mini-btn" onclick={() => modalService.close()}>Cancel</button>
		<button class="artic-mini-btn" onclick={() => { modalService.dataOut = inputVal; modalService.confirmContent(); }}>OK</button>
	</div>
</div>
