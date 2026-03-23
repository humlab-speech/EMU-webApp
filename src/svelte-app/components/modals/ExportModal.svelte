<script lang="ts">
	import { getConfigTick } from '../../stores/app-state.svelte';
	import { modalService } from '../../stores/services';

	let filename = $derived(getConfigTick() >= 0 ? (modalService.dataIn || '') : '');
	let content = $derived(getConfigTick() >= 0 ? modalService.dataExport : undefined);

	function doExport() {
		const blob = new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = filename;
		a.click();
		URL.revokeObjectURL(url);
		modalService.close();
	}
</script>

<div class="artic-modal-wrap">
	<div class="artic-modal-header-large artic-modal-header">
		<h3 id="modalHeading">Download {filename}</h3>
	</div>
	<div class="artic-modal-body">
		<div class="artic-text">
			<div>Do you wish to download "{filename}"?</div>
			<pre class="artic-exportdata">{JSON.stringify(content, null, 2)}</pre>
		</div>
	</div>
	<div class="artic-modal-footer">
		<button class="artic-mini-btn" id="modalCancelBtn" onclick={() => modalService.close()}>Cancel</button>
		<button class="artic-mini-btn" onclick={doExport}>Download</button>
	</div>
</div>
