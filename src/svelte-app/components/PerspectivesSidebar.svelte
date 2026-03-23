<script lang="ts">
	import { getConfigTick, invalidate } from '../stores/app-state.svelte';
	import { viewStateService, configProviderService } from '../stores/services';

	let isOpen = $derived(getConfigTick() >= 0 && viewStateService.getPerspectivesSideBarOpen());
	let perspectives = $derived(getConfigTick() >= 0 ? (configProviderService.vals?.perspectives || []) : []);
	let showSidebar = $derived(getConfigTick() >= 0 && configProviderService.vals?.restrictions?.showPerspectivesSidebar);

	function changePerspective(persp: any) {
		const newIdx = configProviderService.vals.perspectives.findIndex((p: any) => p.name === persp.name);
		if (newIdx >= 0) {
			viewStateService.switchPerspective(newIdx, configProviderService.vals.perspectives);
			viewStateService.setPerspectivesSideBarOpen(false);
			invalidate();
		}
	}

	function toggleMenu() {
		viewStateService.setPerspectivesSideBarOpen(!viewStateService.getPerspectivesSideBarOpen());
		invalidate();
	}

	let curPerspIdx = $derived.by(() => { getConfigTick(); return viewStateService.curPerspectiveIdx; });
</script>

{#if showSidebar}
<nav class="artic-right-menu" class:artic-expandWidthTo200px={isOpen} class:artic-shrinkWidthTo0px={!isOpen}>
	<button onclick={toggleMenu}>
		<span class="material-icons">menu</span>
	</button>
	<h3>Perspectives</h3>
	<ul>
		{#each perspectives as persp}
			<li
				class={curPerspIdx === -1 || perspectives[curPerspIdx]?.name === persp.name ? 'artic-curSelPerspLi' : 'artic-perspLi'}
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
