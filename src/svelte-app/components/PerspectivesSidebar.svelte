<script lang="ts">
	import { getTick } from '../stores/app-state.svelte';
	import { viewStateService, configProviderService } from '../stores/services';

	let isOpen = $derived(getTick() >= 0 && viewStateService.getPerspectivesSideBarOpen());
	let perspectives = $derived(getTick() >= 0 ? (configProviderService.vals?.perspectives || []) : []);
	let showSidebar = $derived(getTick() >= 0 && configProviderService.vals?.restrictions?.showPerspectivesSidebar);

	function changePerspective(persp: any) {
		const newIdx = configProviderService.vals.perspectives.findIndex((p: any) => p.name === persp.name);
		if (newIdx >= 0) {
			viewStateService.switchPerspective(newIdx, configProviderService.vals.perspectives);
			viewStateService.setPerspectivesSideBarOpen(false);
		}
	}

	function toggleMenu() {
		viewStateService.setPerspectivesSideBarOpen(!viewStateService.getPerspectivesSideBarOpen());
	}

	function isCurrentPerspective(persp: any) {
		const idx = viewStateService.curPerspectiveIdx;
		return idx === -1 || persp.name === configProviderService.vals.perspectives[idx]?.name;
	}
</script>

{#if showSidebar}
<nav class="grazer-right-menu" class:grazer-expandWidthTo200px={isOpen} class:grazer-shrinkWidthTo0px={!isOpen}>
	<button onclick={toggleMenu}>
		<span class="material-icons">menu</span>
	</button>
	<h3>Perspectives</h3>
	<ul>
		{#each perspectives as persp}
			<li
				class={isCurrentPerspective(persp) ? 'grazer-curSelPerspLi' : 'grazer-perspLi'}
				onclick={() => changePerspective(persp)}
				role="button"
				tabindex="0"
				onkeydown={(e) => e.key === 'Enter' && changePerspective(persp)}
			>
				{persp.name}
			</li>
		{/each}
	</ul>
</nav>
{/if}
