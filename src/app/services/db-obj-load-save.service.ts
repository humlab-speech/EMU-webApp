import * as angular from 'angular';
import { DbObjLoadSaveService } from '../../core/services/db-obj-load-save.service';

angular.module('grazer')
.factory('DbObjLoadSaveService', ['DataService', 'ViewStateService', 'HistoryService', 'LoadedMetaDataService', 'SsffDataService', 'IoHandlerService', 'BinaryDataManipHelperService', 'WavParserService', 'SoundHandlerService', 'SsffParserService', 'ValidationService', 'LevelService', 'ModalService', 'ConfigProviderService', 'AppStateService', 'StandardFuncsService',
function(DataService, ViewStateService, HistoryService, LoadedMetaDataService, SsffDataService, IoHandlerService, BinaryDataManipHelperService, WavParserService, SoundHandlerService, SsffParserService, ValidationService, LevelService, ModalService, ConfigProviderService, AppStateService, StandardFuncsService) {
	const instance = new DbObjLoadSaveService();
	instance.initDeps({ DataService, ViewStateService, HistoryService, LoadedMetaDataService, SsffDataService, IoHandlerService, BinaryDataManipHelperService, WavParserService, SoundHandlerService, SsffParserService, ValidationService, LevelService, ModalService, ConfigProviderService, AppStateService, StandardFuncsService });
	return instance;
}]);
