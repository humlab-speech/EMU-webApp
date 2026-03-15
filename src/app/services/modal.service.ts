import * as angular from 'angular';
import { ModalService } from '../../core/services/modal.service';

angular.module('grazer')
.factory('ModalService', ['ArrayHelperService', 'ViewStateService',
function(ArrayHelperService, ViewStateService) {
	const instance = new ModalService();
	instance.initDeps({ ArrayHelperService, ViewStateService });
	return instance;
}]);
