<script lang="ts">
	let { open = false, txt = '' }: { open?: boolean; txt?: string } = $props();
</script>

{#if open}
<div class="grazer-progressBar">
	{txt}
</div>
{/if}
