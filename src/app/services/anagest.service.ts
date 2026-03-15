import * as angular from 'angular';
import { AnagestService } from '../../core/services/anagest.service';

angular.module('grazer')
.factory('AnagestService', ['ViewStateService', 'LevelService', 'LinkService', 'ConfigProviderService', 'SsffDataService', 'ArrayHelperService', 'ModalService', 'HistoryService', 'DataService',
function(ViewStateService, LevelService, LinkService, ConfigProviderService, SsffDataService, ArrayHelperService, ModalService, HistoryService, DataService) {
	const instance = new AnagestService();
	instance.initDeps({ ViewStateService, LevelService, LinkService, ConfigProviderService, SsffDataService, ArrayHelperService, ModalService, HistoryService, DataService });
	return instance;
}]);
