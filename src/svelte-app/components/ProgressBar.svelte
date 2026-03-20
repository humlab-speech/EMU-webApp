<script lang="ts">
	let { open = false, txt = '' }: { open?: boolean; txt?: string } = $props();
</script>

{#if open}
<div class="artic-progressBar">
	{txt}
</div>
{/if}
