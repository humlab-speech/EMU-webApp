import * as angular from 'angular';
import { HierarchyManipulationService } from '../../core/services/hierarchy-manipulation.service';

angular.module('grazer')
.factory('HierarchyManipulationService', ['HierarchyLayoutService', 'DataService', 'LevelService', 'ConfigProviderService',
function(HierarchyLayoutService, DataService, LevelService, ConfigProviderService) {
	const instance = new HierarchyManipulationService();
	instance.initDeps({ HierarchyLayoutService, DataService, LevelService, ConfigProviderService });
	return instance;
}]);
