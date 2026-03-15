import * as angular from 'angular';
import { LevelService } from '../../core/services/level.service';

angular.module('grazer')
.factory('LevelService', ['DataService', 'LinkService', 'ConfigProviderService', 'SoundHandlerService', 'ViewStateService',
function(DataService, LinkService, ConfigProviderService, SoundHandlerService, ViewStateService) {
	const instance = new LevelService();
	instance.initDeps({ DataService, LinkService, ConfigProviderService, SoundHandlerService, ViewStateService });
	return instance;
}]);
