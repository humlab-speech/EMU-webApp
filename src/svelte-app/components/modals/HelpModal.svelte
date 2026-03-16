<script lang="ts">
	import { modalService } from '../../stores/services';
	import showdown from 'showdown';

	const converter = new showdown.Converter();

	const tabs = [
		{ title: 'Introduction', url: 'views/helpTabs/intro.html' },
		{ title: 'Keys', url: 'views/helpTabs/keys.html' },
		{ title: 'Manual', url: 'views/helpTabs/manual.html' },
	];

	let activeTab = $state(0);
	let htmlContent = $state('');

	async function loadTab(idx: number) {
		activeTab = idx;
		try {
			const res = await fetch(tabs[idx].url);
			const text = await res.text();
			htmlContent = text;
		} catch {
			htmlContent = '<p>Could not load help content.</p>';
		}
	}

	// Load first tab on mount
	$effect(() => {
		loadTab(0);
	});
</script>

<div class="grazer-modal-wrap">
	<div class="grazer-modal-header-large grazer-modal-header">
		<h3 id="modalHeading">EMU-webApp Help</h3>
	</div>
	<div class="grazer-modal-body">
		<div id="tabs" class="grazer-tabbed">
			<ul class="grazer-tabbed-menu">
				{#each tabs as tab, idx}
					<li>
						<a class="grazer-tabbed-link" href="#"
							class:active={activeTab === idx}
							onclick={(e) => { e.preventDefault(); loadTab(idx); }}
						>{tab.title}</a>
					</li>
				{/each}
			</ul>
			<div class="grazer-tabbed-view">
				<!-- eslint-disable-next-line svelte/no-at-html-tags -->
				<div class="grazer-text">{@html htmlContent}</div>
			</div>
		</div>
	</div>
	<div class="grazer-modal-footer">
		<button id="modalCancelBtn" class="grazer-mini-btn" onclick={() => modalService.close()}>Cancel</button>
	</div>
</div>
