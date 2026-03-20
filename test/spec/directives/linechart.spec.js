'use strict';

describe('Directive: lineChart', function () {

  // load the directive's module
  beforeEach(angular.mock.module('artic'));

  var element,
    scope;

   beforeEach(angular.mock.inject(function ($rootScope) {
     scope = $rootScope.$new();
   }));

   it('should make hidden element visible', angular.mock.inject(function ($compile) {
     element = angular.element('<line-chart></line-chart>');
     element = $compile(element)(scope);
     expect(element.text()).toBe('');
   }));
   
   it('should watch scope.data', angular.mock.inject(function ($compile) {
     scope.data = 0;
     element = angular.element('<line-chart></line-chart>');
     element = $compile(element)(scope);
     spyOn(element.isolateScope(), 'render');
     scope.data = 1;
     scope.$apply();
     expect(element.isolateScope().render).toHaveBeenCalled();
   })); 
   
   it('should render data', angular.mock.inject(function ($compile) {
     scope.data = 0;
     element = angular.element('<line-chart></line-chart>');
     element = $compile(element)(scope);
     element.isolateScope().render([1, 2, 3]);
   }));   
});
