<script lang="ts">
	// TODO: Wire to viewStateService.bundleListSideBarOpen
	let open = $state(false);
</script>

{#if open}
<div class="bundle-list-sidebar">
	<div class="sidebar-header">
		<span>Bundles</span>
	</div>
	<div class="sidebar-content">
		<!-- Bundle list will go here -->
	</div>
</div>
{/if}

<style>
	.bundle-list-sidebar {
		width: 250px;
		background: #2a2a2a;
		color: #fff;
		display: flex;
		flex-direction: column;
		border-right: 1px solid #444;
	}

	.sidebar-header {
		padding: 8px 16px;
		background: #333;
		border-bottom: 1px solid #444;
		font-weight: bold;
	}

	.sidebar-content {
		flex: 1;
		overflow-y: auto;
		padding: 4px;
	}
</style>
