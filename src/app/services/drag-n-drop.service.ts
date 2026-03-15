import * as angular from 'angular';
import { DragnDropService } from '../../core/services/drag-n-drop.service';

angular.module('grazer')
.factory('DragnDropService', ['$rootScope', 'ModalService', 'DataService', 'ValidationService', 'ConfigProviderService', 'DragnDropDataService', 'IoHandlerService', 'ViewStateService', 'SoundHandlerService', 'BinaryDataManipHelperService', 'BrowserDetectorService', 'WavParserService', 'TextGridParserService', 'LoadedMetaDataService', 'LevelService',
function($rootScope, ModalService, DataService, ValidationService, ConfigProviderService, DragnDropDataService, IoHandlerService, ViewStateService, SoundHandlerService, BinaryDataManipHelperService, BrowserDetectorService, WavParserService, TextGridParserService, LoadedMetaDataService, LevelService) {
	const instance = new DragnDropService();
	instance.initDeps({ ModalService, DataService, ValidationService, ConfigProviderService, DragnDropDataService, IoHandlerService, ViewStateService, SoundHandlerService, BinaryDataManipHelperService, BrowserDetectorService, WavParserService, TextGridParserService, LoadedMetaDataService, LevelService });
	return instance;
}]);
