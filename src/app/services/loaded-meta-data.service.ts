import * as angular from 'angular';
import { LoadedMetaDataService } from '../../core/services/loaded-meta-data.service';

angular.module('grazer')
.factory('LoadedMetaDataService', ['ValidationService', function(ValidationService) {
	var instance = new LoadedMetaDataService();
	instance.init(ValidationService);
	return instance;
}]);
