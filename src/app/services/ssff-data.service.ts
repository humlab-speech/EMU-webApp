import * as angular from 'angular';
import { SsffDataService } from '../../core/services/ssff-data.service';

angular.module('grazer')
.factory('SsffDataService', ['SoundHandlerService', 'ConfigProviderService',
function(SoundHandlerService, ConfigProviderService) {
	const instance = new SsffDataService();
	instance.initDeps({ SoundHandlerService, ConfigProviderService });
	return instance;
}]);
