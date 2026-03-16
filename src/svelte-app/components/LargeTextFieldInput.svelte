<script lang="ts">
	import { getTick } from '../stores/app-state.svelte';
	import { viewStateService } from '../stores/services';

	let visible = $derived(getTick() >= 0 && viewStateService.largeTextFieldInputFieldVisable);
	let label = $derived(getTick() >= 0 ? (viewStateService.largeTextFieldInputFieldCurLabel || '') : '');

	function onInput(e: Event) {
		viewStateService.largeTextFieldInputFieldCurLabel = (e.target as HTMLTextAreaElement).value;
	}
</script>

{#if visible}
<div class="grazer-largetextinputfield">
	<textarea value={label} oninput={onInput}></textarea>
</div>
{/if}
// test change
