import * as angular from 'angular';
import { AppcacheHandlerService } from '../../core/services/app-cache-handler.service';

angular.module('grazer')
.factory('AppcacheHandlerService', ['ModalService', function(ModalService) {
	const instance = new AppcacheHandlerService();
	instance.initDeps({ ModalService });
	return instance;
}]);
