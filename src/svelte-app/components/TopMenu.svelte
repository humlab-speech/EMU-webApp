<script lang="ts">
	import { getTick, invalidate } from '../stores/app-state.svelte';
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
	import { eventBus } from '../../core/util/event-bus';

	let dropdown = $state(false);

	function toggleSidebar() {
		viewStateService.toggleBundleListSideBar(styles.animationPeriod);
		invalidate();
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
		if (validationService.validateJSO('articConfigSchema', dataService.getData())) {
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
		invalidate();
		ioHandlerService.getDBconfigFile(name).then((res: any) => {
			viewStateService.curPerspectiveIdx = 0;
			configProviderService.setVals(res.data.EMUwebAppConfig);
			const validRes = validationService.validateJSO('articConfigSchema', configProviderService.vals);
			if (validRes === true) {
				configProviderService.curDbConfig = res.data;
				viewStateService.setCurLevelAttrDefs(configProviderService.curDbConfig.levelDefinitions);
				const validRes2 = validationService.validateJSO('DBconfigFileSchema', configProviderService.curDbConfig);
				if (validRes2 === true) {
					viewStateService.somethingInProgressTxt = 'Loading bundle list...';
					invalidate();
					ioHandlerService.getBundleList(name).then((bRes: any) => {
						loadedMetaDataService.setBundleList(bRes.data);
						configProviderService.vals.activeButtons.clear = true;
						configProviderService.vals.activeButtons.specSettings = true;
						invalidate();
						const bndl = loadedMetaDataService.getBundleList()[0];
						dbObjLoadSaveService.loadBundle(bndl);
					});
				} else {
					modalService.open('views/error.html', 'Error validating DBconfig: ' + JSON.stringify(validRes2, null, 4)).then(() => appStateService.resetToInitState());
				}
			} else {
				modalService.open('views/error.html', 'Error validating articConfig: ' + JSON.stringify(validRes, null, 4)).then(() => appStateService.resetToInitState());
			}
			invalidate();
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
				} else {
					eventBus.emit('connectedToWSserver', { session: null, reload: null });
				}
			}, (errMess: any) => {
				modalService.open('views/error.html', 'Could not connect to websocket server: ' + JSON.stringify(errMess, null, 4)).then(() => appStateService.resetToInitState());
			});
		});
	}

	function showHierarchy() {
		if (!viewStateService.hierarchyState.isShown()) {
			// Initialize path if empty (before modal opens)
			if (!viewStateService.hierarchyState.path || viewStateService.hierarchyState.path.length === 0) {
				const pathInfo = hierarchyLayoutService.findAllNonPartialPaths();
				if (pathInfo?.possible?.[0]) {
					viewStateService.hierarchyState.path = pathInfo.possible[0];
					viewStateService.hierarchyState.curPathIdx = 0;
				}
			}
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
			if (res) { appStateService.resetToInitState(); invalidate(); }
		});
	}

	function aboutBtn() {
		if (viewStateService.getPermission('aboutBtnClick')) {
			modalService.open('views/help.html');
		}
	}

	// Reactive bridge: spread to create new object references so Svelte detects changes
	let activeButtons = $derived(getTick() >= 0 && configProviderService.vals?.activeButtons ? {...configProviderService.vals.activeButtons} : undefined);
	let restrictions = $derived(getTick() >= 0 && configProviderService.vals?.restrictions ? {...configProviderService.vals.restrictions} : undefined);
	let demoDBs = $derived(getTick() >= 0 ? configProviderService.vals?.demoDBs : undefined);
	let bundleListSideBarDisabled = $derived(getTick() >= 0 ? viewStateService.bundleListSideBarDisabled : true);
	let unsavedChangesStyle = $derived(getTick() >= 0 && historyService.movesAwayFromLastSave !== 0 ? 'background-color: #f00; color: white;' : '');

	// Reactive permission map — getTick() triggers re-evaluation on state changes
	let perms = $derived.by(() => {
		getTick();
		return {
			addLevelSeg: viewStateService.getPermission('addLevelSegBtnClick'),
			addLevelEvent: viewStateService.getPermission('addLevelPointBtnClick'),
			renameSel: viewStateService.getPermission('renameSelLevelBtnClick'),
			downloadTextGrid: viewStateService.getPermission('downloadTextGridBtnClick'),
			downloadAnnotation: viewStateService.getPermission('downloadAnnotationBtnClick'),
			spectSettings: viewStateService.getPermission('spectSettingsChange'),
			openDemo: viewStateService.getPermission('openDemoBtnDBclick'),
			connect: viewStateService.getPermission('connectBtnClick'),
			showHierarchy: viewStateService.getPermission('showHierarchyBtnClick'),
			search: viewStateService.getPermission('searchBtnClick'),
			clear: viewStateService.getPermission('clearBtnClick'),
		};
	});
</script>

<div class="artic-top-menu">
	{#if activeButtons?.openMenu && !bundleListSideBarDisabled}
		<button class="artic-button-icon" id="bundleListSideBarOpen" style="float:left" onclick={toggleSidebar}>
			<i class="material-icons">menu</i>
		</button>
	{/if}

	{#if activeButtons?.saveBundle && bundleListSideBarDisabled}
		<button class="artic-mini-btn left" onclick={saveBundle} style="float:left; {unsavedChangesStyle}">
			<i class="material-icons">save</i> Save
		</button>
	{/if}

	{#if activeButtons?.addLevelSeg}
		<button class="artic-mini-btn left"
			disabled={!perms.addLevelSeg}
			onclick={addLevelSeg}>add level (SEG.)</button>
	{/if}

	{#if activeButtons?.addLevelEvent}
		<button class="artic-mini-btn left"
			disabled={!perms.addLevelEvent}
			onclick={addLevelEvent}>add level (EVENT)</button>
	{/if}

	{#if activeButtons?.renameSelLevel}
		<button class="artic-mini-btn left"
			disabled={!perms.renameSel}
			onclick={renameSelLevel}>rename sel. level</button>
	{/if}

	{#if activeButtons?.downloadTextGrid}
		<button class="artic-mini-btn left" id="downloadTextgrid"
			disabled={!perms.downloadTextGrid}
			onclick={downloadTextGrid}><i class="material-icons">save</i>TextGrid</button>
	{/if}

	{#if activeButtons?.downloadAnnotation}
		<button class="artic-mini-btn left" id="downloadAnnotation"
			disabled={!perms.downloadAnnotation}
			onclick={downloadAnnotation}><i class="material-icons">save</i>annotJSON</button>
	{/if}

	{#if activeButtons?.specSettings}
		<button class="artic-mini-btn left" id="spectSettingsBtn"
			disabled={!perms.spectSettings}
			onclick={openSettings}><i class="material-icons">settings</i> settings</button>
	{/if}

	{#if activeButtons?.openDemoDB}
		<div class="artic-nav-wrap"
			onmouseenter={() => dropdown = true}
			onmouseleave={() => dropdown = false}
			role="menu"
			tabindex="-1"
		>
			<ul class="artic-dropdown-container">
				<li class="left">
					<button type="button" class="artic-mini-btn full" id="demoDB"
						disabled={!perms.openDemo}
						onclick={() => dropdown = !dropdown}>open demo <span id="artic-dropdown-arrow"></span></button>
					{#if dropdown}
						<ul class="artic-dropdown-menu"
							onmouseenter={() => dropdown = true}
							onmouseleave={() => dropdown = false}
						>
							{#each demoDBs as curDB, i}
								<li onclick={() => openDemoDB(curDB)} id="demo{i}" role="menuitem">{curDB}</li>
							{/each}
						</ul>
					{/if}
				</li>
			</ul>
		</div>
	{/if}

	{#if activeButtons?.connect}
		<button class="artic-mini-btn left"
			disabled={!perms.connect}
			onclick={connectBtn}><i class="material-icons">input</i>connect</button>
	{/if}

	{#if activeButtons?.showHierarchy}
		<button class="artic-mini-btn left" id="showHierarchy"
			disabled={!perms.showHierarchy}
			onclick={showHierarchy}><i class="material-icons" style="transform: rotate(180deg)">details</i>hierarchy</button>
	{/if}

	{#if activeButtons?.search}
		<button class="artic-mini-btn left"
			disabled={!perms.search}
			onclick={searchBtn}><i class="material-icons">search</i>search</button>
	{/if}

	{#if activeButtons?.clear}
		<button class="artic-mini-btn left" id="clear"
			disabled={!perms.clear}
			onclick={clearBtn}><i class="material-icons">clear_all</i>clear</button>
	{/if}

	<button class="artic-button-icon" id="aboutBtn" style="float: right;" onclick={aboutBtn}>
		<img src="/assets/artic-emu.svg" class="_35px" alt="About" />
	</button>
</div>

<style>
	:global(._35px) {
		height: 35px;
	}
</style>
