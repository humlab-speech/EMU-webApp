<script lang="ts">
	import { getTick } from '../stores/app-state.svelte';
	import { viewStateService, soundHandlerService, mathHelperService, hierarchyLayoutService, configProviderService, standardFuncsService, dataService, modalService } from '../stores/services';
	import { safeGetItem, safeSetItem } from '../../core/util/safe-storage';

	const windowOptions = Object.keys(viewStateService.getWindowFunctions());
	const pathInfo = hierarchyLayoutService.findAllNonPartialPaths();

	// Local editable copy of spectro settings
	let modalVals = $state({
		rangeFrom: viewStateService.spectroSettings.rangeFrom,
		rangeTo: viewStateService.spectroSettings.rangeTo,
		dynamicRange: viewStateService.spectroSettings.dynamicRange,
		windowSizeInSecs: viewStateService.spectroSettings.windowSizeInSecs,
		window: viewStateService.spectroSettings.window,
		drawHeatMapColors: viewStateService.spectroSettings.drawHeatMapColors,
		preEmphasisFilterFactor: viewStateService.spectroSettings.preEmphasisFilterFactor,
		heatMapColorAnchors: viewStateService.spectroSettings.heatMapColorAnchors,
		_fftN: 512,
		_windowSizeInSamples: (soundHandlerService.audioBuffer?.sampleRate ?? 0) * viewStateService.spectroSettings.windowSizeInSecs,
		invert: viewStateService.spectroSettings.invert,
	});

	let selWindowName = $state(windowOptions[viewStateService.spectroSettings.window - 1] || windowOptions[0]);
	let errorID = $state<boolean[]>([]);
	let upperBoundary = $state('');

	let osciChannel = $state(viewStateService.osciSettings.curChannel);
	let osciAvailableChannels = $derived(
		typeof soundHandlerService.audioBuffer?.numberOfChannels === 'number'
			? Array.from(Array(soundHandlerService.audioBuffer.numberOfChannels).keys())
			: []
	);

	let hierarchySettings = $state({
		paths: {
			possible: pathInfo.possible,
			possibleAsStr: pathInfo.possibleAsStr,
			selected: pathInfo.possibleAsStr[viewStateService.hierarchyState.curPathIdx] || pathInfo.possibleAsStr[0] || '',
			curVisAttributeDefs: {} as Record<string, string>,
		},
		showHierarchyPathCanvas: safeGetItem('showHierarchyPathCanvas') === 'true',
	});

	let levelCanvasesFontScalingFactor = $state(
		Number(safeGetItem('levelCanvasesFontScalingFactor')) || 100
	);

	function getSelHierarchyPathIdx() {
		return hierarchySettings.paths.possibleAsStr.indexOf(hierarchySettings.paths.selected);
	}

	function getCurVisAttributes() {
		hierarchySettings.paths.curVisAttributeDefs = {};
		const idx = getSelHierarchyPathIdx();
		if (typeof hierarchySettings.paths.possible[idx] !== 'undefined') {
			const curLevelNames = [...hierarchySettings.paths.possible[idx]].reverse();
			curLevelNames.forEach(ln => {
				hierarchySettings.paths.curVisAttributeDefs[ln] = viewStateService.getCurAttrDef(ln);
			});
		}
	}

	getCurVisAttributes();

	function calcWindowSizeVals() {
		modalVals._windowSizeInSamples = (soundHandlerService.audioBuffer?.sampleRate ?? 0) * modalVals.windowSizeInSecs;
		const fftN = mathHelperService.calcClosestPowerOf2Gt(modalVals._windowSizeInSamples);
		modalVals._fftN = fftN < 512 ? 512 : fftN;
	}

	function checkSpectroSettings() {
		const sr = soundHandlerService.audioBuffer?.sampleRate ?? 0;
		const hca = modalVals.heatMapColorAnchors;
		const allInts = [[0,0],[0,1],[0,2],[1,0],[1,1],[1,2],[2,0],[2,1],[2,2]]
			.every(([i,j]) => hca[i][j] % 1 === 0);
		errorID[8] = !allInts;
		errorID[7] = isNaN(modalVals.preEmphasisFilterFactor * sr);
		errorID[6] = isNaN(sr * modalVals.windowSizeInSecs);
		errorID[5] = modalVals.dynamicRange % 1 !== 0;
		errorID[4] = modalVals.rangeFrom % 1 !== 0;
		errorID[3] = modalVals.rangeTo % 1 !== 0;
		errorID[2] = modalVals.rangeFrom < 0;
		upperBoundary = String(dataService.getData()?.sampleRate ? dataService.getData().sampleRate / 2 : '');
		errorID[1] = upperBoundary ? modalVals.rangeTo > Number(upperBoundary) : false;
	}

	function cssError(id: number, id2?: number) {
		return (errorID[id] || (id2 !== undefined && errorID[id2])) ? 'background: #f00' : '';
	}

	function saveSettings() {
		checkSpectroSettings();
		if (errorID.some(e => e === true)) return;

		viewStateService.setspectroSettings(
			modalVals.windowSizeInSecs,
			modalVals.rangeFrom,
			modalVals.rangeTo,
			modalVals.dynamicRange,
			selWindowName,
			modalVals.drawHeatMapColors,
			modalVals.preEmphasisFilterFactor,
			modalVals.heatMapColorAnchors,
			modalVals.invert,
		);
		viewStateService.setOsciSettings(osciChannel);

		const pathIdx = getSelHierarchyPathIdx();
		viewStateService.hierarchyState.path = hierarchySettings.paths.possible[pathIdx];
		viewStateService.hierarchyState.curPathIdx = pathIdx;

		Object.keys(hierarchySettings.paths.curVisAttributeDefs).forEach(levelName => {
			const attrDef = hierarchySettings.paths.curVisAttributeDefs[levelName];
			viewStateService.setCurAttrDef(
				levelName,
				attrDef,
				configProviderService.getAttrDefsNames(levelName).indexOf(attrDef),
			);
		});

		safeSetItem('showHierarchyPathCanvas', String(hierarchySettings.showHierarchyPathCanvas));
		safeSetItem('levelCanvasesFontScalingFactor', String(levelCanvasesFontScalingFactor));

		modalService.close();
	}

	function reset() {
		errorID = [];
		const ss = viewStateService.spectroSettings;
		const sr = soundHandlerService.audioBuffer?.sampleRate ?? 0;
		modalVals = {
			rangeFrom: ss.rangeFrom,
			rangeTo: ss.rangeTo,
			dynamicRange: ss.dynamicRange,
			windowSizeInSecs: ss.windowSizeInSecs,
			window: ss.window,
			drawHeatMapColors: ss.drawHeatMapColors,
			preEmphasisFilterFactor: ss.preEmphasisFilterFactor,
			heatMapColorAnchors: ss.heatMapColorAnchors,
			_fftN: 512,
			_windowSizeInSamples: sr * ss.windowSizeInSecs,
			invert: ss.invert,
		};
		modalService.close();
	}

	function onFocus() { viewStateService.setEditing(true); viewStateService.setcursorInTextField(true); }
	function onBlur() { viewStateService.setEditing(false); viewStateService.setcursorInTextField(false); }

	const hasHierarchy = $derived(getTick() >= 0 && configProviderService.curDbConfig?.linkDefinitions?.length > 0);
</script>

<div class="grazer-text">
	{#if hasHierarchy}
	<h1>Hierarchy Settings</h1>
	<span>Show hierarchy path canvas:
		<input type="checkbox" bind:checked={hierarchySettings.showHierarchyPathCanvas} />
	</span>

	<h2>Visible Path</h2>
	<select bind:value={hierarchySettings.paths.selected} onchange={getCurVisAttributes}>
		{#each hierarchySettings.paths.possibleAsStr as pathStr}
			<option value={pathStr}>{pathStr}</option>
		{/each}
	</select>

	<h2>Visible Attribute Definitions</h2>
	{#each [...(hierarchySettings.paths.possible[getSelHierarchyPathIdx()] || [])].reverse() as levelName}
		<div class="grazer-nav-wrap">
			{levelName}:
			<select bind:value={hierarchySettings.paths.curVisAttributeDefs[levelName]}>
				{#each configProviderService.getAttrDefsNames(levelName) || [] as attrDef}
					<option value={attrDef}>{attrDef}</option>
				{/each}
			</select>
		</div>
	{/each}
	{/if}

	<h1>Level Canvas Settings</h1>
	<span>Font scaling factor:
		<input type="range" bind:value={levelCanvasesFontScalingFactor} min="1" max="200" />
		{levelCanvasesFontScalingFactor}%
	</span>

	<h1>OSCI Settings</h1>
	<h2>Current channel</h2>
	<select bind:value={osciChannel}>
		{#each osciAvailableChannels as ch}
			<option value={ch}>{ch}</option>
		{/each}
	</select>

	<h1>SPEC Settings</h1>
	<h2>View Range (Hz)</h2>
	From: <input type="text" style={cssError(2, 4)} bind:value={modalVals.rangeFrom} onkeyup={checkSpectroSettings} onfocus={onFocus} onblur={onBlur} />
	To: <input type="text" style={cssError(1, 3)} bind:value={modalVals.rangeTo} onkeyup={checkSpectroSettings} onfocus={onFocus} onblur={onBlur} /><br />
	{#if errorID[1]}<div><b style="color:#f00">Error:</b> Upper Range is bigger than {upperBoundary}</div>{/if}
	{#if errorID[2]}<div><b style="color:#f00">Error:</b> Only positive Integers are allowed.</div>{/if}
	{#if errorID[3]}<div><b style="color:#f00">Error:</b> Only Integers allowed inside 'To'.</div>{/if}
	{#if errorID[4]}<div><b style="color:#f00">Error:</b> Only Integers allowed inside 'From'.</div>{/if}

	<h2>Window Size (seconds)</h2>
	<span>resulting number of samples <em>{modalVals._windowSizeInSamples}</em> zero-padded to <em>{modalVals._fftN} (min. = 512)</em></span>
	<input type="text" style={cssError(6)} bind:value={modalVals.windowSizeInSecs} onkeyup={() => { calcWindowSizeVals(); checkSpectroSettings(); }} onfocus={onFocus} onblur={onBlur} /><br />
	{#if errorID[6]}<div><b style="color:#f00">Error:</b> Only Floats are allowed.</div>{/if}

	<h2>Dynamic Range for Maximum (dB)</h2>
	<input type="text" style={cssError(5)} bind:value={modalVals.dynamicRange} onkeyup={checkSpectroSettings} onfocus={onFocus} onblur={onBlur} /><br />
	{#if errorID[5]}<div><b style="color:#f00">Error:</b> Only Integers are allowed.</div>{/if}

	<h2>Pre-emphasis filter factor</h2>
	<span>resulting high pass filter function: <em>ŝ(k) = s(k)-{modalVals.preEmphasisFilterFactor}*s(k-1)</em></span>
	<input type="text" style={cssError(7)} bind:value={modalVals.preEmphasisFilterFactor} onkeyup={checkSpectroSettings} onfocus={onFocus} onblur={onBlur} /><br />
	{#if errorID[7]}<div><b style="color:#f00">Error:</b> Only Floats are allowed.</div>{/if}

	<h2>Window Function</h2>
	<select bind:value={selWindowName}>
		{#each windowOptions as opt}
			<option value={opt}>{opt}</option>
		{/each}
	</select>

	<h2>Invert</h2>
	<span>Invert colors of spectrogram: <input type="checkbox" bind:checked={modalVals.invert} /></span>

	<h2>Color Options</h2>
	<span>Draw spectrogram in heat map colors: <input type="checkbox" bind:checked={modalVals.drawHeatMapColors} /></span>
	<table class="grazer-modalTable" style={cssError(8)}><tbody>
		<tr><th></th><th>red</th><th>green</th><th>blue</th><th>resulting color</th></tr>
		{#each [0, 1, 2] as anchorIdx}
			<tr>
				<td>{['First', 'Second', 'Third'][anchorIdx]} spectrogram color anchor:</td>
				<td>r: <input type="text" class="grazer-rgbTextInput" bind:value={modalVals.heatMapColorAnchors[anchorIdx][0]} onkeyup={checkSpectroSettings} onfocus={onFocus} onblur={onBlur} /></td>
				<td>g: <input type="text" class="grazer-rgbTextInput" bind:value={modalVals.heatMapColorAnchors[anchorIdx][1]} onkeyup={checkSpectroSettings} onfocus={onFocus} onblur={onBlur} /></td>
				<td>b: <input type="text" class="grazer-rgbTextInput" bind:value={modalVals.heatMapColorAnchors[anchorIdx][2]} onkeyup={checkSpectroSettings} onfocus={onFocus} onblur={onBlur} /></td>
				<td><div style={viewStateService.getColorOfAnchor(modalVals.heatMapColorAnchors, anchorIdx)}></div></td>
			</tr>
		{/each}
	</tbody></table>
	{#if errorID[8]}<div><b style="color:#f00">Error:</b> Only Integers allowed.</div>{/if}
</div>

<div class="grazer-inline-modal-footer">
	<button class="grazer-mini-btn" onclick={reset}>Cancel</button>
	<button id="grazer-modal-save" class="grazer-mini-btn" onclick={saveSettings}>Save</button>
</div>
