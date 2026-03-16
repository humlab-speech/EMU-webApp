<script lang="ts">
	import { getTick } from '../../stores/app-state.svelte';
	import { modalService, configProviderService, viewStateService } from '../../stores/services';
	import { safeGetItem, safeSetItem } from '../../../core/util/safe-storage';

	function getStoredUrls(): string[] {
		try {
			const stored = safeGetItem('serverUrls');
			return stored ? JSON.parse(stored) : [];
		} catch {
			return [];
		}
	}

	let urls = $state<string[]>(getStoredUrls());
	let currentUrl = $state(getTick() >= 0 ? configProviderService.vals.main.serverUrl : '');

	$effect(() => {
		getTick();
		if (!currentUrl) currentUrl = configProviderService.vals.main.serverUrl || '';
		modalService.dataOut = currentUrl;
	});

	function saveUrl() {
		if (currentUrl && !urls.includes(currentUrl)) {
			urls = [...urls, currentUrl];
			safeSetItem('serverUrls', JSON.stringify(urls));
		}
	}

	function deleteUrl(url: string) {
		urls = urls.filter(u => u !== url);
		safeSetItem('serverUrls', JSON.stringify(urls));
	}

	function setCurrentUrl(url: string) {
		currentUrl = url;
		modalService.dataOut = url;
	}

	function onInput(e: Event) {
		currentUrl = (e.target as HTMLInputElement).value;
		modalService.dataOut = currentUrl;
	}

	function onFocus() { viewStateService.cursorInTextField = true; }
	function onBlur() { viewStateService.cursorInTextField = false; }
</script>

<div class="grazer-modal-wrap">
	<div class="grazer-modal-header-large grazer-modal-header">
		<h3 id="modalHeading">Connect to Server</h3>
	</div>
	<div class="grazer-modal-body">
		<div class="grazer-text">
			<div>
				Please enter URL:<br />&nbsp;<br />
				<input
					class="grazer-modal-URL-input"
					type="text"
					value={currentUrl}
					oninput={onInput}
					onfocus={onFocus}
					onblur={onBlur}
				/>
				<button class="grazer-mini-btn-save" onclick={saveUrl}>(+)</button>
				<button class="grazer-mini-btn-save" onclick={() => deleteUrl(currentUrl)}>(-)</button>
				<br />&nbsp;<br />
				<select
					size="10"
					class="grazer-modal-list"
					ondblclick={() => modalService.confirmContent()}
				>
					{#each urls as url}
						<option onclick={() => setCurrentUrl(url)}>{url}</option>
					{/each}
				</select>
			</div>
		</div>
	</div>
	<div class="grazer-modal-footer">
		<button id="grazer-modal-cancel" class="grazer-mini-btn" onclick={() => modalService.close()}>Cancel</button>
		<button id="grazer-modal-confirm" class="grazer-mini-btn" onclick={() => modalService.confirmContent()}>Connect</button>
	</div>
</div>
