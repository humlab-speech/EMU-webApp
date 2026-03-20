'use strict';

describe('Service: loadedMetaDataService', function () {

  // // load the service's module
   beforeEach(angular.mock.module('artic'));

  // // instantiate service
   var loadedMetaDataService;
   beforeEach(angular.mock.inject(function (_loadedMetaDataService_) {
     loadedMetaDataService = _loadedMetaDataService_;
   }));

   /*
   it('should getSessionCollapseState', function () {
     expect(loadedMetaDataService.getSessionCollapseState(0)).toBe(true);
   });
   */
});
