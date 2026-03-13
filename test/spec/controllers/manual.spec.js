'use strict';

describe('Controller: ManualctrlCtrl', function () {

  // load the controller's module
  beforeEach(angular.mock.module('emuWebApp'));

  var ManualctrlCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(angular.mock.inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ManualCtrl = $controller('ManualCtrl', {
      $scope: scope
    });
  }));

});
