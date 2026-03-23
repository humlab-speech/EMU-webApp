<script lang="ts">
	import { getConfigTick } from '../stores/app-state.svelte';
	import { viewStateService } from '../stores/services';

	let visible = $derived(getConfigTick() >= 0 && viewStateService.largeTextFieldInputFieldVisable);
	let label = $derived(getConfigTick() >= 0 ? (viewStateService.largeTextFieldInputFieldCurLabel || '') : '');

	function onInput(e: Event) {
		viewStateService.largeTextFieldInputFieldCurLabel = (e.target as HTMLTextAreaElement).value;
	}
</script>

{#if visible}
<div class="artic-largetextinputfield">
	<textarea value={label} oninput={onInput}></textarea>
</div>
{/if}
