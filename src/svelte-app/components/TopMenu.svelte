<script lang="ts">
	import {
		configProviderService,
		viewStateService,
		dbObjLoadSaveService,
		modalService,
		historyService,
		levelService,
		dataService,
		textGridParserService,
		loadedMetaDataService,
		ioHandlerService,
		appStateService,
		validationService,
		hierarchyLayoutService,
	} from '../stores/services';
	import { styles } from '../../core/util/styles';

	let dropdown = $state(false);

	function toggleSidebar() {
		viewStateService.toggleBundleListSideBar(styles.animationPeriod);
	}

	function saveBundle() {
		dbObjLoadSaveService.saveBundle();
	}

	function addLevelSeg() {
		if (!viewStateService.getPermission('addLevelSegBtnClick')) return;
		const length = dataService.data.levels?.length ?? 0;
		const newName = 'levelNr' + length;
		const level = { items: [], name: newName, type: 'SEGMENT' };
		if (viewStateService.getCurAttrDef(newName) === undefined) {
			viewStateService.setCurLevelAttrDefs([{ name: newName, type: 'EVENT', attributeDefinitions: { name: newName, type: 'string' } }]);
		}
		levelService.insertLevel(level, length, viewStateService.curPerspectiveIdx);
		historyService.addObjToUndoStack({ type: 'ANNOT', action: 'INSERTLEVEL', level, id: length, curPerspectiveIdx: viewStateService.curPerspectiveIdx });
		viewStateService.selectLevel(false, configProviderService.vals.perspectives[viewStateService.curPerspectiveIdx].levelCanvases.order, levelService);
	}

	function addLevelEvent() {
		if (!viewStateService.getPermission('addLevelPointBtnClick')) return;
		const length = dataService.data.levels?.length ?? 0;
		const newName = 'levelNr' + length;
		const level = { items: [], name: newName, type: 'EVENT' };
		if (viewStateService.getCurAttrDef(newName) === undefined) {
			viewStateService.setCurLevelAttrDefs([{ name: newName, type: 'EVENT', attributeDefinitions: { name: newName, type: 'string' } }]);
		}
		levelService.insertLevel(level, length, viewStateService.curPerspectiveIdx);
		historyService.addObjToUndoStack({ type: 'ANNOT', action: 'INSERTLEVEL', level, id: length, curPerspectiveIdx: viewStateService.curPerspectiveIdx });
		viewStateService.selectLevel(false, configProviderService.vals.perspectives[viewStateService.curPerspectiveIdx].levelCanvases.order, levelService);
	}

	function renameSelLevel() {
		if (!viewStateService.getPermission('renameSelLevelBtnClick')) return;
		if (viewStateService.getcurClickLevelName() !== undefined) {
			modalService.open('views/renameLevel.html', viewStateService.getcurClickLevelName());
		} else {
			modalService.open('views/error.html', 'Rename Error: Please choose a Level first!');
		}
	}

	function downloadTextGrid() {
		if (!viewStateService.getPermission('downloadTextGridBtnClick')) return;
		textGridParserService.asyncToTextGrid().then((parseMess: string) => {
			parseMess = parseMess.replace(/\t/g, '    ');
			modalService.open('views/export.html', loadedMetaDataService.getCurBndl().name + '.TextGrid', parseMess);
		});
	}

	function downloadAnnotation() {
		if (!viewStateService.getPermission('downloadAnnotationBtnClick')) return;
		if (validationService.validateJSO('grazerConfigSchema', dataService.getData())) {
			modalService.open('views/export.html', loadedMetaDataService.getCurBndl().name + '_annot.json', JSON.stringify(dataService.getData(), null, 2));
		}
	}

	function openSettings() {
		if (viewStateService.getPermission('spectSettingsChange')) {
			modalService.open('views/settingsModal.html');
		}
	}

	function openDemoDB(name: string) {
		if (!viewStateService.getPermission('openDemoBtnDBclick')) return;
		dropdown = false;
		configProviderService.vals.activeButtons.openDemoDB = false;
		loadedMetaDataService.setDemoDbName(name);
		viewStateService.showDropZone = false;
		viewStateService.somethingInProgress = true;
		viewStateService.setState('loadingSaving');
		configProviderService.vals.main.comMode = 'DEMO';
		viewStateService.somethingInProgressTxt = 'Loading DB config...';
		ioHandlerService.getDBconfigFile(name).then((res: any) => {
			viewStateService.curPerspectiveIdx = 0;
			configProviderService.setVals(res.data.EMUwebAppConfig);
			const validRes = validationService.validateJSO('grazerConfigSchema', configProviderService.vals);
			if (validRes === true) {
				configProviderService.curDbConfig = res.data;
				viewStateService.setCurLevelAttrDefs(configProviderService.curDbConfig.levelDefinitions);
				const validRes2 = validationService.validateJSO('DBconfigFileSchema', configProviderService.curDbConfig);
				if (validRes2 === true) {
					viewStateService.somethingInProgressTxt = 'Loading bundle list...';
					ioHandlerService.getBundleList(name).then((bRes: any) => {
						loadedMetaDataService.setBundleList(bRes.data);
						configProviderService.vals.activeButtons.clear = true;
						configProviderService.vals.activeButtons.specSettings = true;
						dbObjLoadSaveService.loadBundle(loadedMetaDataService.getBundleList()[0]);
					});
				} else {
					modalService.open('views/error.html', 'Error validating DBconfig: ' + JSON.stringify(validRes2, null, 4)).then(() => appStateService.resetToInitState());
				}
			} else {
				modalService.open('views/error.html', 'Error validating grazerConfig: ' + JSON.stringify(validRes, null, 4)).then(() => appStateService.resetToInitState());
			}
		}, (err: any) => {
			modalService.open('views/error.html', 'Error loading DB config of ' + name + ': ' + err.data).then(() => appStateService.resetToInitState());
		});
	}

	function connectBtn() {
		if (!viewStateService.getPermission('connectBtnClick')) return;
		modalService.open('views/connectModal.html').then((url: string) => {
			if (!url) return;
			viewStateService.somethingInProgressTxt = 'Connecting to server...';
			viewStateService.somethingInProgress = true;
			viewStateService.url = url;
			ioHandlerService.WebSocketHandlerService.initConnect(url).then((message: any) => {
				if (message.type === 'error') {
					modalService.open('views/error.html', 'Could not connect to websocket server: ' + url).then(() => appStateService.resetToInitState());
				}
				// WS connection success handled by event bus
			});
		});
	}

	function showHierarchy() {
		if (!viewStateService.hierarchyState.isShown()) {
			viewStateService.hierarchyState.toggleHierarchy();
			modalService.open('views/showHierarchyModal.html');
		}
	}

	function searchBtn() {
		if (viewStateService.getPermission('searchBtnClick')) {
			modalService.open('views/searchAnnot.html');
		}
	}

	function clearBtn() {
		let modalText: string;
		if (historyService.movesAwayFromLastSave !== 0 && configProviderService.vals.main.comMode !== 'DEMO') {
			modalText = 'Do you wish to clear all loaded data and disconnect? CAUTION: YOU HAVE UNSAVED CHANGES!';
		} else {
			modalText = 'Do you wish to clear all loaded data and disconnect? No unsaved changes will be lost.';
		}
		modalService.open('views/confirmModal.html', modalText).then((res: any) => {
			if (res) appStateService.resetToInitState();
		});
	}

	function aboutBtn() {
		if (viewStateService.getPermission('aboutBtnClick')) {
			modalService.open('views/help.html');
		}
	}

	function getUnsavedChangesStyle(): string {
		return historyService.movesAwayFromLastSave !== 0 ? 'background-color: #f00; color: white;' : '';
	}
</script>

<div class="grazer-top-menu">
	{#if configProviderService.vals?.activeButtons?.openMenu && !viewStateService.bundleListSideBarDisabled}
		<button class="grazer-button-icon" id="bundleListSideBarOpen" style="float:left" onclick={toggleSidebar}>
			<i class="material-icons">menu</i>
		</button>
	{/if}

	{#if configProviderService.vals?.activeButtons?.saveBundle && viewStateService.bundleListSideBarDisabled}
		<button class="grazer-mini-btn left" onclick={saveBundle} style="float:left; {getUnsavedChangesStyle()}">
			<i class="material-icons">save</i> Save
		</button>
	{/if}

	{#if configProviderService.vals?.activeButtons?.addLevelSeg}
		<button class="grazer-mini-btn left"
			disabled={!viewStateService.getPermission('addLevelSegBtnClick')}
			onclick={addLevelSeg}>add level (SEG.)</button>
	{/if}

	{#if configProviderService.vals?.activeButtons?.addLevelEvent}
		<button class="grazer-mini-btn left"
			disabled={!viewStateService.getPermission('addLevelPointBtnClick')}
			onclick={addLevelEvent}>add level (EVENT)</button>
	{/if}

	{#if configProviderService.vals?.activeButtons?.renameSelLevel}
		<button class="grazer-mini-btn left"
			disabled={!viewStateService.getPermission('renameSelLevelBtnClick')}
			onclick={renameSelLevel}>rename sel. level</button>
	{/if}

	{#if configProviderService.vals?.activeButtons?.downloadTextGrid}
		<button class="grazer-mini-btn left" id="downloadTextgrid"
			disabled={!viewStateService.getPermission('downloadTextGridBtnClick')}
			onclick={downloadTextGrid}><i class="material-icons">save</i>TextGrid</button>
	{/if}

	{#if configProviderService.vals?.activeButtons?.downloadAnnotation}
		<button class="grazer-mini-btn left" id="downloadAnnotation"
			disabled={!viewStateService.getPermission('downloadAnnotationBtnClick')}
			onclick={downloadAnnotation}><i class="material-icons">save</i>annotJSON</button>
	{/if}

	{#if configProviderService.vals?.activeButtons?.specSettings}
		<button class="grazer-mini-btn left" id="spectSettingsBtn"
			disabled={!viewStateService.getPermission('spectSettingsChange')}
			onclick={openSettings}><i class="material-icons">settings</i> settings</button>
	{/if}

	{#if configProviderService.vals?.activeButtons?.openDemoDB}
		<div class="grazer-nav-wrap"
			onmouseenter={() => dropdown = true}
			onmouseleave={() => dropdown = false}
			role="menu"
			tabindex="-1"
		>
			<button class="grazer-mini-btn full" id="demoDB"
				disabled={!viewStateService.getPermission('openDemoBtnDBclick')}
				onclick={() => dropdown = !dropdown}>open demo <span id="grazer-dropdown-arrow"></span></button>
			{#if dropdown}
				<ul class="grazer-dropdown-menu">
					{#each configProviderService.vals.demoDBs as curDB, i}
						<li onclick={() => openDemoDB(curDB)} id="demo{i}" role="menuitem">{curDB}</li>
					{/each}
				</ul>
			{/if}
		</div>
	{/if}

	{#if configProviderService.vals?.activeButtons?.connect}
		<button class="grazer-mini-btn left"
			disabled={!viewStateService.getPermission('connectBtnClick')}
			onclick={connectBtn}><i class="material-icons">input</i>connect</button>
	{/if}

	{#if configProviderService.vals?.activeButtons?.showHierarchy}
		<button class="grazer-mini-btn left" id="showHierarchy"
			disabled={!viewStateService.getPermission('showHierarchyBtnClick')}
			onclick={showHierarchy}><i class="material-icons" style="transform: rotate(180deg)">details</i>hierarchy</button>
	{/if}

	{#if configProviderService.vals?.activeButtons?.search}
		<button class="grazer-mini-btn left"
			disabled={!viewStateService.getPermission('searchBtnClick')}
			onclick={searchBtn}><i class="material-icons">search</i>search</button>
	{/if}

	{#if configProviderService.vals?.activeButtons?.clear}
		<button class="grazer-mini-btn left" id="clear"
			disabled={!viewStateService.getPermission('clearBtnClick')}
			onclick={clearBtn}><i class="material-icons">clear_all</i>clear</button>
	{/if}

	<button class="grazer-button-icon" id="aboutBtn" style="float: right;" onclick={aboutBtn}>
		<img src="/assets/EMU-webAppEmu.svg" class="_35px" alt="About" />
	</button>
</div>

<style>
	:global(._35px) {
		height: 35px;
	}
</style>
