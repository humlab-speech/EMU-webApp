import * as angular from 'angular';
import { HandleGlobalKeyStrokes } from '../../core/services/handleglobalkeystrokes.service';
import { setScheduleUpdate } from '../../core/util/schedule-update';

angular.module('grazer')
.factory('HandleGlobalKeyStrokes', [
	'$rootScope',
	'ViewStateService',
	'ModalService',
	'HierarchyManipulationService',
	'SoundHandlerService',
	'ConfigProviderService',
	'HistoryService',
	'LevelService',
	'DataService',
	'LinkService',
	'AnagestService',
	'DbObjLoadSaveService',
	'BrowserDetectorService',
	function($rootScope, ViewStateService, ModalService, HierarchyManipulationService, SoundHandlerService, ConfigProviderService, HistoryService, LevelService, DataService, LinkService, AnagestService, DbObjLoadSaveService, BrowserDetectorService) {
		setScheduleUpdate((fn) => $rootScope.$apply(fn));
		const instance = new HandleGlobalKeyStrokes();
		instance.initDeps({ ViewStateService, ModalService, HierarchyManipulationService, SoundHandlerService, ConfigProviderService, HistoryService, LevelService, DataService, LinkService, AnagestService, DbObjLoadSaveService, BrowserDetectorService });
		return instance;
	}
]);
