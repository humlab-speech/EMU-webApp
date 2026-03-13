'use strict';

describe('Service: SsffParserService', function () {
  var scope, deferred;

  // load the controller's module
  beforeEach(angular.mock.module('grazer'));

  beforeEach(angular.mock.inject(function (_$rootScope_, $q) {
     scope = _$rootScope_;
     deferred = $q.defer();
  }));

  // removed original tests as they where completely circular i.e. tested themselves... (spyon -> call -> got called?)


});