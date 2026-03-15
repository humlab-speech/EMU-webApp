<script lang="ts">
	import { viewStateService } from '../stores/services';
</script>

{#if viewStateService.historyActionTxt}
<div class="history-popup">{viewStateService.historyActionTxt}</div>
{/if}

<style>
	.history-popup {
		position: absolute;
		top: 4px;
		right: 4px;
		background: rgba(0, 0, 0, 0.8);
		color: #0f0;
		padding: 4px 8px;
		border-radius: 4px;
		font-size: 12px;
		z-index: 50;
		pointer-events: none;
	}
</style>
