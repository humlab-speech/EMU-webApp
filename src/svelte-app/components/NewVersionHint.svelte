<script lang="ts">
	import { getTick } from '../stores/app-state.svelte';
	import { appcacheHandlerService } from '../stores/services';
	import { version } from '../../../package.json';

	let show = $derived(getTick() >= 0 && appcacheHandlerService.newVersionAvailable);

	interface Props {
		onAboutClick?: () => void;
	}
	let { onAboutClick }: Props = $props();
</script>

{#if show}
<div class="grazer-aboutHint">
	<button class="grazer-aboutHint-hidden" onclick={onAboutClick}></button>
	Welcome to the grazer Version {version}
	<div class="grazer-aboutHint-arrow">click here for more information ⇧</div>
</div>
{/if}
