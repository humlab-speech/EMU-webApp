<script lang="ts">
	import { modalService } from '../stores/services';

	// Modal service manages open/close state and content.
	// In Phase 2 we provide basic structure; full modal views
	// (settings, connect, export, etc.) will be ported incrementally.

	// For now, check modalService.isOpen and display its content
	// The AngularJS modal used template URLs (views/*.html) —
	// in Svelte these become component variants rendered here.
</script>

<!-- Modal renders when modalService has active modal -->
<!-- Full modal view implementations deferred to later phases -->

<style>
	/* Modal styles ready for when views are ported */
</style>
