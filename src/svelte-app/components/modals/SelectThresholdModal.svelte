<script lang="ts">
	import { getTick } from '../../stores/app-state.svelte';
	import { modalService } from '../../stores/services';

	let dataIn = $derived(getTick() >= 0 ? (modalService.dataIn || {}) : {});
</script>

<div class="grazer-modal-wrap">
	<div class="grazer-modal-header-large grazer-modal-header">
		<h3 id="modalHeading">Please select a threshold</h3>
	</div>
	<div class="grazer-modal-body">
		<b>{dataIn.description}</b><br />&nbsp;<br />
		<p>find threshold options are:</p>
		<ul class="grazer-modalUl">
			<li>minimum value: {dataIn.minVal}</li>
			<li>maximum value: {dataIn.maxVal}</li>
			<li>threshold value: {dataIn.threshold}</li>
		</ul>
		<b>Please select one of the following options:</b>
		<ul class="grazer-modalUl">
			{#each (dataIn.options || []) as opt, idx}
				<li>
					<div class="grazer-card" role="button" tabindex="0"
						onclick={() => modalService.select(idx)}
						onkeydown={(e) => e.key === 'Enter' && modalService.select(idx)}
					>
						<ul class="grazer-modalUl">
							<li>Threshold index: {opt.thresholdIdx}</li>
							<li>Threshold value: {opt.thresholdValue}</li>
						</ul>
					</div>
				</li>
			{/each}
		</ul>
	</div>
	<div class="grazer-modal-footer"></div>
</div>
