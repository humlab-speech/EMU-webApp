import * as angular from 'angular';
import { WebSocketHandlerService } from '../../core/services/websocket-handler.service';

angular.module('grazer')
.factory('WebSocketHandlerService', ['$rootScope', 'HistoryService', 'SsffParserService', 'ConfigProviderService', 'ViewStateService', 'WavParserService', 'SoundHandlerService', 'EspsParserService', 'UuidService', 'BinaryDataManipHelperService', 'SsffDataService', 'ModalService',
function($rootScope, HistoryService, SsffParserService, ConfigProviderService, ViewStateService, WavParserService, SoundHandlerService, EspsParserService, UuidService, BinaryDataManipHelperService, SsffDataService, ModalService) {
	const instance = new WebSocketHandlerService();
	instance.initDeps({ HistoryService, SsffParserService, ConfigProviderService, ViewStateService, WavParserService, SoundHandlerService, EspsParserService, UuidService, BinaryDataManipHelperService, SsffDataService, ModalService });
	return instance;
}]);
