import * as angular from 'angular';
import { ViewStateService } from '../../core/services/view-state.service';
import { setScheduleUpdate } from '../../core/util/schedule-update';

angular.module('grazer')
.factory('ViewStateService', ['$rootScope', 'SoundHandlerService', 'DataService', 'StandardFuncsService',
function($rootScope, SoundHandlerService, DataService, StandardFuncsService) {
	setScheduleUpdate((fn) => $rootScope.$apply(fn));
	const instance = new ViewStateService();
	instance.initDeps({ SoundHandlerService, DataService, StandardFuncsService });
	return instance;
}]);
