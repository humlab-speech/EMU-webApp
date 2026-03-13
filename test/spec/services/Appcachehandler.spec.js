'use strict';

describe('Service: AppcacheHandlerService', function () {


	var deferred, $rootScope;
	var mockDialogService = {};


	// load the controller's module
	beforeEach(angular.mock.module('grazer'));

	/**
	 *
	 */
	it('should checkForNewVersion', angular.mock.inject(function (AppcacheHandlerService) {
		// AppcacheHandlerService.checkForNewVersion();
	}));
	

	/**
	 *
	 */
	it('should handleUpdatereadyEvent', angular.mock.inject(function ($rootScope, $q, AppcacheHandlerService, ModalService) {
		// this test causes infinite loop in karma test runner!!!

		// var scope = $rootScope.$new();
		// var def = $q.defer();
		// spyOn(window.applicationCache, 'swapCache');
		// // spyOn(window.location, 'reload'); // can't spyOn read only property in chrome
		// spyOn(ModalService, 'open').mockReturnValue(def.promise);
		// AppcacheHandlerService.handleUpdatereadyEvent();
		// def.resolve(false);
		// scope.$apply();
		// expect(window.applicationCache.swapCache).toHaveBeenCalled();
		// // expect(window.location.reload).toHaveBeenCalled();
		// expect(ModalService.open).toHaveBeenCalled();
	}));	

});