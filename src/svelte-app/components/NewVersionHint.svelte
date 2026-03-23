<script lang="ts">
	import { getConfigTick } from '../stores/app-state.svelte';
	import { appcacheHandlerService } from '../stores/services';
	import { version } from '../../../package.json';

	let show = $derived(getConfigTick() >= 0 && appcacheHandlerService.newVersionAvailable);

	interface Props {
		onAboutClick?: () => void;
	}
	let { onAboutClick }: Props = $props();
</script>

{#if show}
<div class="artic-aboutHint">
	<button class="artic-aboutHint-hidden" onclick={onAboutClick}></button>
	Welcome to the artic Version {version}
	<div class="artic-aboutHint-arrow">click here for more information ⇧</div>
</div>
{/if}
