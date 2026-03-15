import * as angular from 'angular';
import { HistoryService } from '../../core/services/history.service';

angular.module('grazer')
.factory('HistoryService', ['SsffDataService', 'LevelService', 'LinkService', 'ConfigProviderService', 'ViewStateService', 'SoundHandlerService', 'LoadedMetaDataService', 'PublisherService',
function(SsffDataService, LevelService, LinkService, ConfigProviderService, ViewStateService, SoundHandlerService, LoadedMetaDataService, PublisherService) {
	const instance = new HistoryService();
	instance.initDeps({ SsffDataService, LevelService, LinkService, ConfigProviderService, ViewStateService, SoundHandlerService, LoadedMetaDataService, PublisherService });
	return instance;
}]);
