<script lang="ts">
	// TODO: Wire to modalService for showing modals
	let open = $state(false);
	let title = $state('');
	let content = $state('');
</script>

{#if open}
<div class="modal-backdrop" onclick={() => open = false} role="presentation">
	<div class="modal-dialog" onclick={(e) => e.stopPropagation()} role="dialog">
		<div class="modal-header">
			<h3>{title}</h3>
			<button class="modal-close" onclick={() => open = false}>&times;</button>
		</div>
		<div class="modal-body">
			{content}
		</div>
	</div>
</div>
{/if}

<style>
	.modal-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
	}

	.modal-dialog {
		background: #fff;
		border-radius: 4px;
		min-width: 400px;
		max-width: 80vw;
		max-height: 80vh;
		overflow-y: auto;
		box-shadow: 0 4px 20px rgba(0,0,0,0.3);
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 12px 16px;
		border-bottom: 1px solid #ddd;
	}

	.modal-header h3 {
		margin: 0;
		font-size: 16px;
	}

	.modal-close {
		background: none;
		border: none;
		font-size: 20px;
		cursor: pointer;
		color: #666;
	}

	.modal-body {
		padding: 16px;
	}
</style>
