<script lang="ts">
	import { getTick } from '../../stores/app-state.svelte';
	import { modalService } from '../../stores/services';

	let options = $derived(getTick() >= 0 ? (modalService.dataIn || []) : []);
</script>

<div class="artic-modal-wrap">
	<div class="artic-modal-header-large artic-modal-header">
		<h3 id="modalHeading">Select label to link to</h3>
	</div>
	<div class="artic-modal-body">
		<b>Please select one of the following options:</b>
		<ul class="artic-modalUl">
			{#each options as opt, idx}
				<li>
					<div class="artic-card" role="button" tabindex="0"
						onclick={() => { modalService.dataOut = idx; modalService.confirmContent(); }}
						onkeydown={(e) => e.key === 'Enter' && (modalService.dataOut = idx, modalService.confirmContent())}
					>
						{opt}
					</div>
				</li>
			{/each}
		</ul>
	</div>
	<div class="artic-modal-footer"></div>
</div>
