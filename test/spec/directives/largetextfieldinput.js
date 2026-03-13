'use strict';

describe('Directive: largeTextFieldInput', function () {

  // load the directive's module
  beforeEach(angular.mock.module('grazer'));

  var element,
    scope;

  beforeEach(angular.mock.inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', angular.mock.inject(function ($compile) {
    // element = angular.element('<large-text-field-input></large-text-field-input>');
    // element = $compile(element)(scope);
    // expect(element.text()).toBe('this is the largeTextFieldInput directive');
  }));
});
