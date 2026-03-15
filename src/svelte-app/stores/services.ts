/**
 * Service initialization — wires up dependencies between core services.
 * Replaces Angular's DI container.
 *
 * Call initServices() once at app startup.
 */

// Tier 0: no dependencies
import { arrayHelperService } from '../../core/services/array-helper.service';
import { binaryDataManipHelperService } from '../../core/services/binary-data-manip-helper.service';
import { browserDetectorService } from '../../core/services/browser-detector.service';
import { dataService } from '../../core/services/data.service';
import { dragnDropDataService } from '../../core/services/drag-n-drop-data.service';
import { fontScaleService } from '../../core/services/font-scale.service';
import { loadedMetaDataService } from '../../core/services/loaded-meta-data.service';
import { mathHelperService } from '../../core/services/math-helper.service';
import { soundHandlerService } from '../../core/services/sound-handler.service';
import { standardFuncsService } from '../../core/services/standard-funcs.service';
import { uuidService } from '../../core/services/uuid.service';
import { ssffParserService } from '../../core/services/ssff-parser.service';

// Tier 1
import { audioResamplerService } from '../../core/services/audio-resampler.service';
import { viewStateService } from '../../core/services/view-state.service';

// Tier 2
import { configProviderService } from '../../core/services/config-provider.service';
import { modalService } from '../../core/services/modal.service';
import { wavParserService } from '../../core/services/wav-parser.service';

// Tier 3
import { linkService } from '../../core/services/link.service';
import { ssffDataService } from '../../core/services/ssff-data.service';
import { validationService } from '../../core/services/validation.service';

// Tier 4
import { levelService } from '../../core/services/level.service';
import { textGridParserService } from '../../core/services/textgrid-parser.service';
import { publisherService } from '../../core/services/publisher.service';
import { appcacheHandlerService } from '../../core/services/app-cache-handler.service';
import { drawHelperService } from '../../core/services/draw-helper.service';

// Tier 5
import { espsParserService } from '../../core/services/esps-parser.service';
import { historyService } from '../../core/services/history.service';
import { hierarchyLayoutService } from '../../core/services/hierarchy-layout.service';
import { anagestService } from '../../core/services/anagest.service';

// Tier 6
import { webSocketHandlerService } from '../../core/services/websocket-handler.service';
import { hierarchyManipulationService } from '../../core/services/hierarchy-manipulation.service';

// Tier 7
import { ioHandlerService } from '../../core/services/io-handler.service';

// Tier 8
import { dragnDropService } from '../../core/services/drag-n-drop.service';

// Tier 9
import { appStateService } from '../../core/services/app-state.service';

// Tier 10
import { dbObjLoadSaveService } from '../../core/services/db-obj-load-save.service';

// Tier 11
import { handleGlobalKeystrokesService } from '../../core/services/handleglobalkeystrokes.service';

// Re-export all singletons for component access
export {
	arrayHelperService,
	binaryDataManipHelperService,
	browserDetectorService,
	dataService,
	dragnDropDataService,
	fontScaleService,
	loadedMetaDataService,
	mathHelperService,
	soundHandlerService,
	standardFuncsService,
	uuidService,
	ssffParserService,
	audioResamplerService,
	viewStateService,
	configProviderService,
	modalService,
	wavParserService,
	linkService,
	ssffDataService,
	validationService,
	levelService,
	textGridParserService,
	publisherService,
	appcacheHandlerService,
	drawHelperService,
	espsParserService,
	historyService,
	hierarchyLayoutService,
	anagestService,
	webSocketHandlerService,
	hierarchyManipulationService,
	ioHandlerService,
	dragnDropService,
	appStateService,
	dbObjLoadSaveService,
	handleGlobalKeystrokesService,
};

let initialized = false;

export function initServices() {
	if (initialized) return;
	initialized = true;

	// Tier 1
	audioResamplerService.initDeps({ BrowserDetectorService: browserDetectorService });
	viewStateService.initDeps({
		SoundHandlerService: soundHandlerService,
		DataService: dataService,
		StandardFuncsService: standardFuncsService,
	});

	// Tier 2
	configProviderService.initDeps({ ViewStateService: viewStateService });
	modalService.initDeps({ ArrayHelperService: arrayHelperService, ViewStateService: viewStateService });
	wavParserService.initDeps({ AudioResamplerService: audioResamplerService, ViewStateService: viewStateService });

	// Tier 3
	linkService.initDeps({ DataService: dataService, ConfigProviderService: configProviderService });
	ssffDataService.initDeps({ SoundHandlerService: soundHandlerService, ConfigProviderService: configProviderService });
	validationService.initDeps({ ConfigProviderService: configProviderService });

	// Tier 4
	levelService.initDeps({
		DataService: dataService,
		LinkService: linkService,
		ConfigProviderService: configProviderService,
		SoundHandlerService: soundHandlerService,
		ViewStateService: viewStateService,
	});
	textGridParserService.initDeps({
		DataService: dataService,
		ViewStateService: viewStateService,
		SoundHandlerService: soundHandlerService,
	});
	publisherService.initDeps({
		SsffDataService: ssffDataService,
		SsffParserService: ssffParserService,
		BinaryDataManipHelperService: binaryDataManipHelperService,
		ValidationService: validationService,
		DataService: dataService,
		StandardFuncsService: standardFuncsService,
		LoadedMetaDataService: loadedMetaDataService,
		ConfigProviderService: configProviderService,
	});
	appcacheHandlerService.initDeps({ ModalService: modalService });
	drawHelperService.initDeps({
		ViewStateService: viewStateService,
		ConfigProviderService: configProviderService,
		SoundHandlerService: soundHandlerService,
		FontScaleService: fontScaleService,
		SsffDataService: ssffDataService,
		MathHelperService: mathHelperService,
	});

	// Tier 5
	espsParserService.initDeps({ LevelService: levelService, SoundHandlerService: soundHandlerService });
	historyService.initDeps({
		SsffDataService: ssffDataService,
		LevelService: levelService,
		LinkService: linkService,
		ConfigProviderService: configProviderService,
		ViewStateService: viewStateService,
		SoundHandlerService: soundHandlerService,
		LoadedMetaDataService: loadedMetaDataService,
		PublisherService: publisherService,
	});
	hierarchyLayoutService.initDeps({
		ViewStateService: viewStateService,
		ConfigProviderService: configProviderService,
		LevelService: levelService,
		DataService: dataService,
		StandardFuncsService: standardFuncsService,
	});
	anagestService.initDeps({
		ViewStateService: viewStateService,
		LevelService: levelService,
		LinkService: linkService,
		ConfigProviderService: configProviderService,
		SsffDataService: ssffDataService,
		ArrayHelperService: arrayHelperService,
		ModalService: modalService,
		HistoryService: historyService,
		DataService: dataService,
	});

	// Tier 6
	webSocketHandlerService.initDeps({
		HistoryService: historyService,
		SsffParserService: ssffParserService,
		ConfigProviderService: configProviderService,
		ViewStateService: viewStateService,
		WavParserService: wavParserService,
		SoundHandlerService: soundHandlerService,
		EspsParserService: espsParserService,
		UuidService: uuidService,
		BinaryDataManipHelperService: binaryDataManipHelperService,
		SsffDataService: ssffDataService,
		ModalService: modalService,
	});
	hierarchyManipulationService.initDeps({
		HierarchyLayoutService: hierarchyLayoutService,
		DataService: dataService,
		LevelService: levelService,
		ConfigProviderService: configProviderService,
	});

	// Tier 7
	ioHandlerService.initDeps({
		HistoryService: historyService,
		ViewStateService: viewStateService,
		SoundHandlerService: soundHandlerService,
		SsffParserService: ssffParserService,
		WavParserService: wavParserService,
		TextGridParserService: textGridParserService,
		ConfigProviderService: configProviderService,
		EspsParserService: espsParserService,
		SsffDataService: ssffDataService,
		WebSocketHandlerService: webSocketHandlerService,
		DragnDropDataService: dragnDropDataService,
		LoadedMetaDataService: loadedMetaDataService,
	});

	// Tier 8
	dragnDropService.initDeps({
		ModalService: modalService,
		DataService: dataService,
		ValidationService: validationService,
		ConfigProviderService: configProviderService,
		DragnDropDataService: dragnDropDataService,
		IoHandlerService: ioHandlerService,
		ViewStateService: viewStateService,
		SoundHandlerService: soundHandlerService,
		BinaryDataManipHelperService: binaryDataManipHelperService,
		BrowserDetectorService: browserDetectorService,
		WavParserService: wavParserService,
		TextGridParserService: textGridParserService,
		LoadedMetaDataService: loadedMetaDataService,
		LevelService: levelService,
	});

	// Tier 9
	appStateService.initDeps({
		DragnDropService: dragnDropService,
		DragnDropDataService: dragnDropDataService,
		ViewStateService: viewStateService,
		IoHandlerService: ioHandlerService,
		LoadedMetaDataService: loadedMetaDataService,
		SoundHandlerService: soundHandlerService,
		DataService: dataService,
		SsffDataService: ssffDataService,
		HistoryService: historyService,
	});

	// Tier 10
	dbObjLoadSaveService.initDeps({
		DataService: dataService,
		ViewStateService: viewStateService,
		HistoryService: historyService,
		LoadedMetaDataService: loadedMetaDataService,
		SsffDataService: ssffDataService,
		IoHandlerService: ioHandlerService,
		BinaryDataManipHelperService: binaryDataManipHelperService,
		WavParserService: wavParserService,
		SoundHandlerService: soundHandlerService,
		SsffParserService: ssffParserService,
		ValidationService: validationService,
		LevelService: levelService,
		ModalService: modalService,
		ConfigProviderService: configProviderService,
		AppStateService: appStateService,
		StandardFuncsService: standardFuncsService,
	});

	// Tier 11
	handleGlobalKeystrokesService.initDeps({
		ViewStateService: viewStateService,
		ModalService: modalService,
		HierarchyManipulationService: hierarchyManipulationService,
		SoundHandlerService: soundHandlerService,
		ConfigProviderService: configProviderService,
		HistoryService: historyService,
		LevelService: levelService,
		DataService: dataService,
		LinkService: linkService,
		AnagestService: anagestService,
		DbObjLoadSaveService: dbObjLoadSaveService,
		BrowserDetectorService: browserDetectorService,
	});

	console.log('[grazer] Core services initialized (38 services wired)');
}
