import * as angular from 'angular';
import { ValidationService } from '../../core/services/validation.service';

angular.module('grazer')
.factory('ValidationService', ['ConfigProviderService',
function(ConfigProviderService) {
	const instance = new ValidationService();
	instance.initDeps({ ConfigProviderService });
	return instance;
}]);
