'use strict';

describe('Service: ModalService', function () {

  // load the controller's module
  beforeEach(angular.mock.module('grazer'));
  
  var scope;

  //Initialize the controller and a mock scope
  beforeEach(angular.mock.inject(function ($rootScope, ModalService, ViewStateService) {
    scope = $rootScope.$new();
    scope.modal = ModalService;
    scope.vs = ViewStateService;
  }));

  /**
   *
   */
  it('should confirmContent', function () {
    scope.modal.open();
    spyOn(scope.vs, 'setEditing');
    spyOn(scope.vs, 'setState');
    scope.modal.confirmContent();
    expect(scope.vs.setEditing).toHaveBeenCalled();
    expect(scope.vs.setState).toHaveBeenCalled();
  });
  
  /**
   *
   */
  it('should open', function () {
    spyOn(scope.vs, 'setState');
    scope.modal.open('template','dataIn','dataExport');
    expect(scope.modal.dataIn).toEqual('dataIn');
    expect(scope.modal.dataExport).toEqual('dataExport');
    expect(scope.modal.templateUrl).toEqual('template');
    expect(scope.vs.setState).toHaveBeenCalled();    
  });

  /**
   *
   */
  it('should confirm', function () {
    scope.modal.open();
    spyOn(scope.vs, 'setEditing');
    spyOn(scope.vs, 'setState');
    scope.modal.confirm();
    expect(scope.vs.setEditing).toHaveBeenCalled();
    expect(scope.vs.setState).toHaveBeenCalled();
  });
  
  /**
   *
   */
  it('should do error', function () {
    scope.modal.open();
    spyOn(scope.vs, 'setState');
    scope.modal.error('1');
    expect(scope.vs.setState).toHaveBeenCalled();
    expect(scope.modal.dataIn).toEqual('1');
  });
  
  /**
   *
   */
  it('should close', function () {
    scope.modal.open();
    spyOn(scope.vs, 'setEditing');
    spyOn(scope.vs, 'setState');
    scope.modal.close();
    expect(scope.vs.setEditing).toHaveBeenCalled();
    expect(scope.vs.setState).toHaveBeenCalled();
    expect(scope.modal.isOpen).toEqual(false);
  });  


});