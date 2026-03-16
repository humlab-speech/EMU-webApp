<script lang="ts">
	import { getTick } from '../../stores/app-state.svelte';
	import { modalService } from '../../stores/services';

	let filename = $derived(getTick() >= 0 ? (modalService.dataIn || '') : '');
	let content = $derived(getTick() >= 0 ? modalService.dataExport : undefined);

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

<div class="grazer-modal-wrap">
	<div class="grazer-modal-header-large grazer-modal-header">
		<h3 id="modalHeading">Download {filename}</h3>
	</div>
	<div class="grazer-modal-body">
		<div class="grazer-text">
			<div>Do you wish to download "{filename}"?</div>
			<pre class="grazer-exportdata">{JSON.stringify(content, null, 2)}</pre>
		</div>
	</div>
	<div class="grazer-modal-footer">
		<button class="grazer-mini-btn" id="modalCancelBtn" onclick={() => modalService.close()}>Cancel</button>
		<button class="grazer-mini-btn" onclick={doExport}>Download</button>
	</div>
</div>
