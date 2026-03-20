'use strict';

describe('Controller: TabbedCtrl', function () {

  var TabbedCtrl, scope, deferred, deferred2;
  
    // load the controller's module
  beforeEach(angular.mock.module('artic'));
  
     //Initialize the controller and a mock scope
     beforeEach(angular.mock.inject(function ($controller, $rootScope, ConfigProviderService, ModalService, ViewStateService, ValidationService) {
       // initiate the controller and mock the scope
       var tmpArticConfig = angular.copy(defaultArticConfig);
       var tmpArticDesign = angular.copy(defaultArticDesign);
       var tmpaeDbConfig = angular.copy(aeDbConfig);
       scope = $rootScope.$new();
       scope.valid = ValidationService;
       spyOn(scope.valid, 'getSchema').and.returnValue({ data: { properties: { spectrogramSettings: {properties: {}}, levelDefinitions: {items: { properties: {}}}, linkDefinitions: {items: { properties: {}}}}}});
       TabbedCtrl = $controller('TabbedCtrl', {
         $scope: scope
       });
       scope.cps = ConfigProviderService;
       scope.cps.setVals(tmpArticConfig);
       scope.cps.curDbConfig = tmpaeDbConfig;
       scope.cps.design = tmpArticDesign;
       scope.modal = ModalService;
       scope.vs = ViewStateService;
     }));  
     
   it('should set cursorInTextField', function () {
     spyOn(scope.vs, 'setEditing');
     spyOn(scope.vs, 'setcursorInTextField');
     scope.cursorInTextField();	
     expect(scope.vs.setEditing).toHaveBeenCalledWith(true);
     expect(scope.vs.setcursorInTextField).toHaveBeenCalledWith(true);
   });  

   it('should set cursorOutOfTextField', function () {
     spyOn(scope.vs, 'setEditing');
     spyOn(scope.vs, 'setcursorInTextField');
     scope.cursorOutOfTextField();	
     expect(scope.vs.setEditing).toHaveBeenCalledWith(false);
     expect(scope.vs.setcursorInTextField).toHaveBeenCalledWith(false);
   });  

   it('should set onClickTab', function () {
     scope.onClickTab({url: 'test'});	
     expect(scope.currentTabUrl).toEqual('test');
   });  
   
});
