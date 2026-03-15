import * as angular from 'angular';
import { HierarchyLayoutService } from '../../core/services/hierarchy-layout.service';

angular.module('grazer')
.factory('HierarchyLayoutService', ['ViewStateService', 'ConfigProviderService', 'LevelService', 'DataService', 'StandardFuncsService',
function(ViewStateService, ConfigProviderService, LevelService, DataService, StandardFuncsService) {
	const instance = new HierarchyLayoutService();
	instance.initDeps({ ViewStateService, ConfigProviderService, LevelService, DataService, StandardFuncsService });
	return instance;
}]);
