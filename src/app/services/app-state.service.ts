import * as angular from 'angular';
import { AppStateService } from '../../core/services/app-state.service';

angular.module('grazer')
.factory('AppStateService', ['DragnDropService', 'DragnDropDataService', 'ViewStateService', 'IoHandlerService', 'LoadedMetaDataService', 'SoundHandlerService', 'DataService', 'SsffDataService', 'HistoryService',
function(DragnDropService, DragnDropDataService, ViewStateService, IoHandlerService, LoadedMetaDataService, SoundHandlerService, DataService, SsffDataService, HistoryService) {
	const instance = new AppStateService();
	instance.initDeps({ DragnDropService, DragnDropDataService, ViewStateService, IoHandlerService, LoadedMetaDataService, SoundHandlerService, DataService, SsffDataService, HistoryService });
	return instance;
}]);
