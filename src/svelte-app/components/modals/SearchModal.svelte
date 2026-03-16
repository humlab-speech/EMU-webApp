<script lang="ts">
	import { modalService, viewStateService, hierarchyLayoutService, levelService, loadedMetaDataService, configProviderService, standardFuncsService, dataService } from '../../stores/services';

	const hierPaths = hierarchyLayoutService.findAllNonPartialPaths();

	let curHierPathIdx = $state(0);
	let curLevels = $state<string[]>(hierPaths.possible[0] || []);
	let curLevel = $state(curLevels[0] || '');
	let curAttrDefs = $state<string[]>(configProviderService.getAttrDefsNames(curLevel) || []);
	let curAttrDef = $state(curAttrDefs[0] || '');
	let curAttrIdx = $state(0);
	let searchString = $state('');
	let useRegExSearch = $state(false);
	let resultTimeAnchors = $state<any[]>([]);

	function changedHierPath() {
		curLevels = hierPaths.possible[curHierPathIdx] || [];
		curLevel = curLevels[0] || '';
		curAttrDefs = configProviderService.getAttrDefsNames(curLevel) || [];
		curAttrDef = curAttrDefs[0] || '';
		curAttrIdx = 0;
	}

	function changedLevel() {
		curAttrDefs = configProviderService.getAttrDefsNames(curLevel) || [];
		curAttrDef = curAttrDefs[0] || '';
		curAttrIdx = 0;
	}

	function changedAttrDef() {
		curAttrIdx = curAttrDefs.indexOf(curAttrDef);
	}

	function search() {
		hierarchyLayoutService.findParents(hierPaths.possible[curHierPathIdx]);
		const curLevelDetails = levelService.getLevelDetails(curLevel);
		resultTimeAnchors = [];
		for (let itemIdx = 0; itemIdx < curLevelDetails.items.length; itemIdx++) {
			const val = curLevelDetails.items[itemIdx].labels[curAttrIdx].value;
			const match = useRegExSearch
				? val.match(searchString)
				: val === searchString;
			if (match) {
				resultTimeAnchors.push({
					label: val,
					sample_start: curLevelDetails.items[itemIdx]._derivedSampleStart,
					sample_end: curLevelDetails.items[itemIdx]._derivedSampleEnd,
				});
			}
		}
	}

	function saveTimeAnchors() {
		loadedMetaDataService.setTimeAnchors(resultTimeAnchors);
		standardFuncsService.traverseAndClean(dataService.getData());
		modalService.close();
	}

	function onFocus() { viewStateService.setEditing(true); viewStateService.setcursorInTextField(true); }
	function onBlur() { viewStateService.setEditing(false); viewStateService.setcursorInTextField(false); }
</script>

<div class="grazer-modal-wrap">
	<div class="grazer-modal-header-large grazer-modal-header">
		<h3 id="modalHeading">Search Current Bundle Annotation</h3>
	</div>
	<div class="grazer-modal-body">
		<div class="grazer-text">
			<h2>Select hierarchy path to search in</h2>
			<select bind:value={curHierPathIdx} onchange={changedHierPath}>
				{#each hierPaths.possibleAsStr as pathStr, idx}
					<option value={idx}>{pathStr}</option>
				{/each}
			</select>

			<h2>Select level in path</h2>
			<select bind:value={curLevel} onchange={changedLevel}>
				{#each curLevels as lvl}
					<option value={lvl}>{lvl}</option>
				{/each}
			</select>

			<h2>Select attribute definition</h2>
			<select bind:value={curAttrDef} onchange={changedAttrDef}>
				{#each curAttrDefs as ad}
					<option value={ad}>{ad}</option>
				{/each}
			</select>

			<h2>Search string</h2>
			<input type="text" bind:value={searchString} onfocus={onFocus} onblur={onBlur} /><br />
			Use RegEx Search: <input type="checkbox" bind:checked={useRegExSearch} /><br />
			<button onclick={search}>Search</button>

			{#if resultTimeAnchors.length > 0}
				<h2>Search result</h2>
				<table class="grazer-modalTable"><tbody>
					<tr><td>search string</td><td>sample_start</td><td>sample_end</td></tr>
					{#each resultTimeAnchors as ta}
						<tr><td>{ta.label}</td><td>{ta.sample_start}</td><td>{ta.sample_end}</td></tr>
					{/each}
				</tbody></table>
			{/if}
		</div>
	</div>
	<div class="grazer-modal-footer">
		<button class="grazer-mini-btn" onclick={() => modalService.close()}>Cancel</button>
		<button class="grazer-mini-btn" id="grazer-modal-save" onclick={saveTimeAnchors}>Save search result as time anchors</button>
	</div>
</div>
