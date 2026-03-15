<script lang="ts">
	let { open = false, txt = '' }: { open?: boolean; txt?: string } = $props();
</script>

{#if open}
<div class="grazer-progress-bar">
	<div class="progress-spinner"></div>
	<div class="progress-text">{txt}</div>
</div>
{/if}

<style>
	.grazer-progress-bar {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		background: rgba(0, 0, 0, 0.7);
		color: #fff;
		padding: 8px 16px;
		display: flex;
		align-items: center;
		gap: 8px;
		z-index: 100;
	}

	.progress-spinner {
		width: 16px;
		height: 16px;
		border: 2px solid #fff;
		border-top-color: transparent;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}
</style>
