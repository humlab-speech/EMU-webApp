import * as angular from 'angular';
import { ConfigProviderService } from '../../core/services/config-provider.service';

angular.module('grazer')
.factory('ConfigProviderService', ['ViewStateService',
function(ViewStateService) {
	const instance = new ConfigProviderService();
	instance.initDeps({ ViewStateService });
	return instance;
}]);
