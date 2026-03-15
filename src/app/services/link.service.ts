import * as angular from 'angular';
import { LinkService } from '../../core/services/link.service';

angular.module('grazer')
.factory('LinkService', ['DataService', 'ConfigProviderService',
function(DataService, ConfigProviderService) {
	const instance = new LinkService();
	instance.initDeps({ DataService, ConfigProviderService });
	return instance;
}]);
