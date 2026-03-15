import * as angular from 'angular';
import { IoHandlerService } from '../../core/services/io-handler.service';

angular.module('grazer')
.factory('IoHandlerService', ['$rootScope', 'HistoryService', 'ViewStateService', 'SoundHandlerService', 'SsffParserService', 'WavParserService', 'TextGridParserService', 'ConfigProviderService', 'EspsParserService', 'SsffDataService', 'WebSocketHandlerService', 'DragnDropDataService', 'LoadedMetaDataService',
function($rootScope, HistoryService, ViewStateService, SoundHandlerService, SsffParserService, WavParserService, TextGridParserService, ConfigProviderService, EspsParserService, SsffDataService, WebSocketHandlerService, DragnDropDataService, LoadedMetaDataService) {
	const instance = new IoHandlerService();
	instance.initDeps({ HistoryService, ViewStateService, SoundHandlerService, SsffParserService, WavParserService, TextGridParserService, ConfigProviderService, EspsParserService, SsffDataService, WebSocketHandlerService, DragnDropDataService, LoadedMetaDataService });
	return instance;
}]);
