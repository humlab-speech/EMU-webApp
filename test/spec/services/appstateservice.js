'use strict';

describe('Service: AppStateService', function () {

  beforeEach(angular.mock.module('artic'));
  
  var scope;
  var deferred;
  
  beforeEach(angular.mock.inject(function ($q, $rootScope, AppStateService, IoHandlerService, ViewStateService) {
    scope = $rootScope.$new();
    scope.io = IoHandlerService;
    scope.vs = ViewStateService;
    scope.app = AppStateService;
    deferred =  $q.defer();
  }));


   it('should resetToInitState (connected)', function () {
     spyOn(scope.io.wsH, 'disconnectWarning').and.returnValue(deferred.promise);
     spyOn(scope.io.wsH, 'isConnected').and.returnValue(true);
     spyOn(scope.io.wsH, 'closeConnect');
     scope.app.resetToInitState();
     deferred.resolve();
     scope.$apply();
     expect(scope.io.wsH.isConnected).toHaveBeenCalled();
     expect(scope.io.wsH.closeConnect).toHaveBeenCalled();
   });

});
