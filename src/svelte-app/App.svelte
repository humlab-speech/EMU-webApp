<script lang="ts">
	import TopMenu from './components/TopMenu.svelte';
	import BottomMenu from './components/BottomMenu.svelte';
	import ProgressBar from './components/ProgressBar.svelte';
	import BundleListSidebar from './components/BundleListSidebar.svelte';
	import HistoryActionPopup from './components/HistoryActionPopup.svelte';
	import DropZone from './components/DropZone.svelte';
	import Modal from './components/Modal.svelte';
	import LargeTextFieldInput from './components/LargeTextFieldInput.svelte';
	import ToastNotification from './components/ToastNotification.svelte';
	import PerspectivesSidebar from './components/PerspectivesSidebar.svelte';
	import NewVersionHint from './components/NewVersionHint.svelte';
	import SignalArea from './components/SignalArea.svelte';
	import {
		initServices,
		viewStateService,
		configProviderService,
		loadedMetaDataService,
		validationService,
		ioHandlerService,
		appStateService,
		modalService,
		historyService,
		levelService,
		soundHandlerService,
		wavParserService,
		dataService,
		dbObjLoadSaveService,
		appcacheHandlerService,
		browserDetectorService,
		handleGlobalKeystrokesService,
		hierarchyLayoutService,
	} from './stores/services';
	import { eventBus } from '../core/util/event-bus';
	import { safeGetItem, safeSetItem } from '../core/util/safe-storage';
	import { styles } from '../core/util/styles';

	// Initialize all core services (wires up dependencies)
	initServices();

	// Parse URL params
	const params = new URLSearchParams(window.location.search);
	if (params.get('audioGetUrl') && params.get('labelGetUrl') && params.get('labelType')) {
		if (!configProviderService.validateGetUrl(params.get('audioGetUrl')!) ||
			!configProviderService.validateGetUrl(params.get('labelGetUrl')!)) {
			console.error('Invalid URL parameters: audioGetUrl and labelGetUrl must use http(s) protocol');
		} else {
			configProviderService.embeddedVals.audioGetUrl = params.get('audioGetUrl')!;
			configProviderService.embeddedVals.labelGetUrl = params.get('labelGetUrl')!;
			configProviderService.embeddedVals.labelType = params.get('labelType')!;
			configProviderService.embeddedVals.fromUrlParams = true;
		}
	}
	if (params.has('disableBundleListSidebar')) {
		viewStateService.bundleListSideBarDisabled = true;
	}

	// Check for new version
	appcacheHandlerService.checkForNewVersion();

	// Load default config + embedded files
	loadDefaultConfig();

	// Bind global keys
	handleGlobalKeystrokesService.bindGlobalKeys();

	// Init theme
	configProviderService.initTheme();

	// Event bus listeners
	eventBus.on('connectionDisrupted').subscribe(() => {
		appStateService.resetToInitState();
	});
	eventBus.on('resetToInitState').subscribe(() => {
		loadDefaultConfig();
	});
	eventBus.on('reloadToInitState').subscribe((data: any) => {
		loadDefaultConfig();
		viewStateService.url = data.url;
		viewStateService.somethingInProgressTxt = 'Connecting to server...';
		viewStateService.somethingInProgress = true;
		ioHandlerService.WebSocketHandlerService.initConnect(data.url).then((message: any) => {
			if (message.type === 'error') {
				modalService.open('views/error.html', 'Could not connect to websocket server: ' + data.url).then(() => {
					appStateService.resetToInitState();
				});
			} else {
				handleConnectedToWSserver(data);
			}
		}, (errMess: any) => {
			modalService.open('views/error.html', 'Could not connect to websocket server: ' + JSON.stringify(errMess, null, 4)).then(() => {
				appStateService.resetToInitState();
			});
		});
	});

	// Window resize
	function onResize() {
		levelService.deleteEditArea();
		viewStateService.setWindowWidth(window.outerWidth);
		if (viewStateService.hierarchyState.isShown()) {
			++viewStateService.hierarchyState.resize;
		}
	}

	// Shift/alt keyup for history
	function onKeyup(e: KeyboardEvent) {
		if (typeof configProviderService.vals.keyMappings !== 'undefined') {
			if (e.keyCode === configProviderService.vals.keyMappings.shift || e.keyCode === configProviderService.vals.keyMappings.alt) {
				historyService.addCurChangeObjToUndoStack();
			}
		}
	}

	// Prevent navigation away with unsaved changes
	function onBeforeUnload(): string | undefined {
		if (configProviderService.embeddedVals.audioGetUrl === '' &&
			loadedMetaDataService.getBundleList().length > 0 &&
			!configProviderService.vals.main.autoConnect &&
			historyService.movesAwayFromLastSave > 0) {
			return 'Do you really wish to leave/reload grazer? All unsaved changes will be lost...';
		}
		return undefined;
	}

	// --- Core init logic ported from grazer.component.ts ---

	function loadDefaultConfig() {
		viewStateService.somethingInProgress = true;
		viewStateService.somethingInProgressTxt = 'Loading schema files';
		validationService.loadSchemas().then((replies: any) => {
			validationService.setSchemas(replies);
			ioHandlerService.httpGetDefaultConfig().then((response: any) => {
				viewStateService.somethingInProgressTxt = 'Validating grazerConfig';
				const validRes = validationService.validateJSO('grazerConfigSchema', response.data);
				if (validRes === true) {
					configProviderService.setVals(response.data);
					Object.assign(configProviderService.initDbConfig, JSON.parse(JSON.stringify(configProviderService.vals)));
					handleDefaultConfigLoaded();
					loadFilesForEmbeddedApp();
					checkIfToShowWelcomeModal();
					viewStateService.somethingInProgress = false;
				} else {
					modalService.open('views/error.html', 'Error validating / checking grazerConfigSchema: ' + JSON.stringify(validRes, null, 4)).then(() => {
						appStateService.resetToInitState();
					});
				}
			}, (response: any) => {
				modalService.open('views/error.html', 'Could not get defaultConfig for grazer: status: ' + response.status).then(() => {
					appStateService.resetToInitState();
				});
			});
		}, (errMess: any) => {
			modalService.open('views/error.html', 'Error loading schema file: ' + JSON.stringify(errMess, null, 4)).then(() => {
				appStateService.resetToInitState();
			});
		});
	}

	function handleDefaultConfigLoaded() {
		if (!viewStateService.getBundleListSideBarOpen()) {
			viewStateService.toggleBundleListSideBar(styles.animationPeriod);
		}
		const searchParams = new URLSearchParams(window.location.search);
		if (configProviderService.vals.main.autoConnect || searchParams.get('autoConnect') === 'true') {
			const serverUrl = searchParams.get('serverUrl') ?? configProviderService.vals.main.serverUrl;
			if (searchParams.get('serverUrl')) {
				configProviderService.vals.main.serverUrl = serverUrl;
			}
			if (searchParams.get('comMode') !== 'GITLAB') {
				ioHandlerService.WebSocketHandlerService.initConnect(serverUrl).then((message: any) => {
					if (message.type === 'error') {
						modalService.open('views/error.html', 'Could not connect to websocket server: ' + serverUrl).then(() => {
							appStateService.resetToInitState();
						});
					} else {
						handleConnectedToWSserver({ session: null, reload: null });
					}
				}, (errMess: any) => {
					modalService.open('views/error.html', 'Could not connect to websocket server: ' + JSON.stringify(errMess, null, 4)).then(() => {
						appStateService.resetToInitState();
					});
				});
			} else {
				configProviderService.vals.main.comMode = 'GITLAB';
				handleConnectedToWSserver({ session: null, reload: null });
			}
		}
		viewStateService.setspectroSettings(
			configProviderService.vals.spectrogramSettings.windowSizeInSecs,
			configProviderService.vals.spectrogramSettings.rangeFrom,
			configProviderService.vals.spectrogramSettings.rangeTo,
			configProviderService.vals.spectrogramSettings.dynamicRange,
			configProviderService.vals.spectrogramSettings.window,
			configProviderService.vals.spectrogramSettings.drawHeatMapColors,
			configProviderService.vals.spectrogramSettings.preEmphasisFilterFactor,
			configProviderService.vals.spectrogramSettings.heatMapColorAnchors,
			configProviderService.vals.spectrogramSettings.invert,
		);
		viewStateService.setTransitionTime(styles.animationPeriod);
	}

	function handleConnectedToWSserver(data: any) {
		const session = data.session;
		const reload = data.reload;
		viewStateService.showDropZone = false;
		const searchParams = new URLSearchParams(window.location.search);
		if (searchParams.get('comMode') !== 'GITLAB') {
			configProviderService.vals.main.comMode = 'WS';
		}
		configProviderService.vals.activeButtons.openDemoDB = false;
		viewStateService.somethingInProgress = true;
		viewStateService.somethingInProgressTxt = 'Checking protocol...';
		ioHandlerService.getProtocol().then((res: any) => {
			if (res.protocol === 'EMU-webApp-websocket-protocol' && res.version === '0.0.2') {
				viewStateService.somethingInProgressTxt = 'Checking user management...';
				ioHandlerService.getDoUserManagement().then((doUsrData: any) => {
					if (doUsrData === 'NO') {
						innerHandleConnectedToWSserver({ session, reload });
					} else {
						modalService.open('views/loginModal.html').then((res: any) => {
							if (res) {
								innerHandleConnectedToWSserver({ session, reload });
							} else {
								appStateService.resetToInitState();
							}
						});
					}
				});
			} else {
				modalService.open('views/error.html',
					'Could not connect: protocol mismatch. Server: "' + res.protocol + '" v' + res.version
				).then(() => {
					appStateService.resetToInitState();
				});
			}
		});
	}

	function innerHandleConnectedToWSserver(data: any) {
		const session = data.session;
		const reload = data.reload;
		viewStateService.somethingInProgressTxt = 'Loading DB config...';
		ioHandlerService.getDBconfigFile().then((dbData: any) => {
			viewStateService.curPerspectiveIdx = 0;
			configProviderService.setVals(dbData.EMUwebAppConfig);
			const validRes = validationService.validateJSO('grazerConfigSchema', configProviderService.vals);
			if (validRes === true) {
				configProviderService.curDbConfig = dbData;
				viewStateService.setCurLevelAttrDefs(configProviderService.curDbConfig.levelDefinitions);
				viewStateService.setspectroSettings(
					configProviderService.vals.spectrogramSettings.windowSizeInSecs,
					configProviderService.vals.spectrogramSettings.rangeFrom,
					configProviderService.vals.spectrogramSettings.rangeTo,
					configProviderService.vals.spectrogramSettings.dynamicRange,
					configProviderService.vals.spectrogramSettings.window,
					configProviderService.vals.spectrogramSettings.drawHeatMapColors,
					configProviderService.vals.spectrogramSettings.preEmphasisFilterFactor,
					configProviderService.vals.spectrogramSettings.heatMapColorAnchors,
					configProviderService.vals.spectrogramSettings.invert,
				);
				viewStateService.setHierarchySettings(hierarchyLayoutService.findAllNonPartialPaths().possible[0]);
				const validRes2 = validationService.validateJSO('DBconfigFileSchema', dbData);
				if (validRes2 === true) {
					viewStateService.somethingInProgressTxt = 'Loading bundle list...';
					ioHandlerService.getBundleList().then((bdata: any) => {
						loadedMetaDataService.setBundleList(bdata);
						configProviderService.vals.activeButtons.clear = true;
						configProviderService.vals.activeButtons.specSettings = true;
						const firstSession = session ?? loadedMetaDataService.getBundleList()[0];
						dbObjLoadSaveService.loadBundle(firstSession);
						if (reload) {
							loadedMetaDataService.openCollapseSession(session.session);
						}
					});
				} else {
					modalService.open('views/error.html', 'Error validating DBconfig: ' + JSON.stringify(validRes2, null, 4)).then(() => {
						appStateService.resetToInitState();
					});
				}
			} else {
				modalService.open('views/error.html', 'Error validating grazerConfig: ' + JSON.stringify(validRes, null, 4)).then(() => {
					appStateService.resetToInitState();
				});
			}
		});
	}

	function loadFilesForEmbeddedApp() {
		const searchParams = new URLSearchParams(window.location.search);
		const audioGetUrl = searchParams.get('audioGetUrl');
		const bndlJsonGetUrl = searchParams.get('bndlJsonGetUrl');
		if (!audioGetUrl && !bndlJsonGetUrl) return;

		if (audioGetUrl) {
			if (!configProviderService.validateGetUrl(audioGetUrl)) {
				modalService.open('views/error.html', 'Invalid audioGetUrl: must use http(s) protocol');
				return;
			}
			configProviderService.embeddedVals.audioGetUrl = audioGetUrl;
			configProviderService.vals.activeButtons.openDemoDB = false;
			ioHandlerService.httpGetPath(audioGetUrl, 'arraybuffer').then((data: any) => {
				handleEmbeddedAudioLoaded(data, searchParams);
			}, (errMess: any) => {
				modalService.open('views/error.html', 'Could not get audio file: ' + audioGetUrl + ' ERROR: ' + JSON.stringify(errMess, null, 4));
			});
		} else if (bndlJsonGetUrl) {
			ioHandlerService.httpGetPath(bndlJsonGetUrl, 'application/json').then((data: any) => {
				handleEmbeddedAudioLoaded(data, searchParams);
			}, (errMess: any) => {
				modalService.open('views/error.html', 'Could not get bundle JSON: ' + JSON.stringify(errMess, null, 4));
			});
		}
	}

	function handleEmbeddedAudioLoaded(data: any, searchParams: URLSearchParams) {
		viewStateService.showDropZone = false;
		const audioUrl = configProviderService.embeddedVals.audioGetUrl;
		loadedMetaDataService.setCurBndlName(audioUrl.substring(audioUrl.lastIndexOf('/') + 1, audioUrl.lastIndexOf('.')));

		if (viewStateService.getBundleListSideBarOpen() && searchParams.get('saveToWindowParent') !== 'true') {
			viewStateService.toggleBundleListSideBar(styles.animationPeriod);
		}

		viewStateService.somethingInProgressTxt = 'Loading DB config...';
		const DBconfigGetUrl = searchParams.get('DBconfigGetUrl') || 'configFiles/embedded_grazerConfig.json';

		ioHandlerService.httpGetPath(DBconfigGetUrl).then((resp: any) => {
			viewStateService.curPerspectiveIdx = 0;
			configProviderService.setVals(resp.data.EMUwebAppConfig);
			const validRes = validationService.validateJSO('grazerConfigSchema', configProviderService.vals);
			if (validRes !== true) {
				modalService.open('views/error.html', 'Error validating grazerConfig: ' + JSON.stringify(validRes, null, 4));
				return;
			}
			if (configProviderService.embeddedVals.fromUrlParams) {
				configProviderService.vals.main.catchMouseForKeyBinding = false;
			}
			configProviderService.curDbConfig = resp.data;
			const validRes2 = validationService.validateJSO('DBconfigFileSchema', configProviderService.curDbConfig);
			if (validRes2 !== true) {
				modalService.open('views/error.html', 'Error validating DBconfig: ' + JSON.stringify(validRes2, null, 4));
				return;
			}
			if (searchParams.get('saveToWindowParent') === 'true') {
				configProviderService.vals.activeButtons.saveBundle = true;
			}
			const bndlList = [{ session: 'File(s)', name: 'from URL parameters' }];
			loadedMetaDataService.setBundleList(bndlList);
			loadedMetaDataService.setCurBndl(bndlList[0]);

			viewStateService.somethingInProgress = true;
			viewStateService.somethingInProgressTxt = 'Parsing WAV file...';

			const audioGetUrl = searchParams.get('audioGetUrl');
			if (audioGetUrl) {
				wavParserService.parseWavAudioBuf(data.data).then((result: any) => {
					viewStateService.curViewPort.sS = 0;
					viewStateService.curViewPort.eS = result.audioBuffer.length;
					viewStateService.resetSelect();
					soundHandlerService.audioBuffer = result.audioBuffer;
					soundHandlerService.playbackBuffer = result.playbackBuffer;

					const labelGetUrl = searchParams.get('labelGetUrl');
					if (labelGetUrl) {
						const respType = 'text';
						ioHandlerService.httpGetPath(labelGetUrl, respType).then((data2: any) => {
							viewStateService.somethingInProgressTxt = 'Parsing ' + configProviderService.embeddedVals.labelType + ' file...';
							ioHandlerService.parseLabelFile(data2.data, labelGetUrl, 'embeddedTextGrid', configProviderService.embeddedVals.labelType).then((annot: any) => {
								dataService.setData(annot);
								if (!searchParams.get('DBconfigGetUrl')) {
									generateLevelDefsFromAnnotation(annot);
								}
								viewStateService.setCurLevelAttrDefs(configProviderService.curDbConfig.levelDefinitions);
								viewStateService.somethingInProgressTxt = 'Done!';
								viewStateService.somethingInProgress = false;
								viewStateService.setState('labeling');
							});
						});
					} else {
						configProviderService.vals.activeButtons.downloadAnnotation = false;
						configProviderService.vals.activeButtons.downloadTextGrid = false;
						configProviderService.vals.activeButtons.search = false;
						viewStateService.somethingInProgressTxt = 'Done!';
						viewStateService.somethingInProgress = false;
						viewStateService.setState('labeling');
					}
				});
			} else {
				const bndlJsonGetUrl = searchParams.get('bndlJsonGetUrl');
				if (bndlJsonGetUrl) {
					dbObjLoadSaveService.loadBundle({ name: 'fromURLparams' }, bndlJsonGetUrl);
				}
			}
		}, (errMess: any) => {
			modalService.open('views/error.html', 'Could not get embedded_config.json: ' + errMess);
		});
	}

	async function generateLevelDefsFromAnnotation(annot: any) {
		const levelDefs: any[] = [];
		const lNamesWithTime: string[] = [];
		for (const l of annot.levels) {
			const attrDefs = l.items[0].labels.map((lab: any) => ({ name: lab.name, type: 'string' }));
			const ld = { name: l.name, type: l.type, attributeDefinitions: attrDefs };
			levelDefs.push(ld);
			if (l.type !== 'ITEM') lNamesWithTime.push(l.name);
		}
		configProviderService.curDbConfig.levelDefinitions = levelDefs;
		viewStateService.setCurLevelAttrDefs(levelDefs);
		configProviderService.vals.perspectives[viewStateService.curPerspectiveIdx].levelCanvases.order = lNamesWithTime;
		// Hierarchy worker — dynamic import to keep bundle size down
		const { HierarchyWorker } = await import('../app/workers/hierarchy.worker');
		const hierarchyWorker = await new (HierarchyWorker as any)();
		const linkDefs = await hierarchyWorker.guessLinkDefinitions(annot);
		configProviderService.curDbConfig.linkDefinitions = linkDefs;
		configProviderService.vals.activeButtons.showHierarchy = true;
	}

	function checkIfToShowWelcomeModal() {
		const curVal = safeGetItem('haveShownWelcomeModal');
		const searchParams = new URLSearchParams(window.location.search);
		if (!browserDetectorService.isBrowser.PhantomJS() && curVal === null && typeof searchParams.get('viewer_pane') !== 'undefined') {
			safeSetItem('haveShownWelcomeModal', 'true');
			// Show about hint briefly (3 seconds)
			setTimeout(() => {
				// hint auto-hides
			}, 3000);
		}
	}
</script>

<svelte:window on:resize={onResize} on:keyup={onKeyup} on:beforeunload={onBeforeUnload} />

<div class="grazer-main" id="MainCtrl"
	on:mouseenter={() => viewStateService.mouseInEmuWebApp = true}
	on:mouseleave={() => viewStateService.mouseInEmuWebApp = false}
	role="application"
>
	<Modal />
	<LargeTextFieldInput />
	<ToastNotification />
	<NewVersionHint />
	<BundleListSidebar />

	<div class="grazer-window" id="mainWindow">
		<ProgressBar
			open={viewStateService.somethingInProgress}
			txt={viewStateService.somethingInProgressTxt}
		/>

		<div class="printTitle">grazer : {loadedMetaDataService.getCurBndlName()}</div>

		<TopMenu />

		<div class="grazer-canvas">
			<HistoryActionPopup />
			<SignalArea />
		</div>

		<BottomMenu />
	</div>

	<PerspectivesSidebar />
	<DropZone />
</div>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
		overflow: hidden;
	}

	.grazer-main {
		position: relative;
		width: 100%;
		height: 100vh;
		display: flex;
	}

	.grazer-window {
		flex: 1;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.grazer-canvas {
		flex: 1;
		position: relative;
		overflow: hidden;
	}

	.printTitle {
		display: none;
	}

	@media print {
		.printTitle {
			display: block;
			font-size: 18px;
			font-weight: bold;
			padding: 8px;
		}
	}
</style>
