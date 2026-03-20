'use strict';

describe('Controller: bundleListSideBarCtrl', function () {

  var ctrl, $componentController, $rootScope;

  // load the controller's module
  beforeEach(angular.mock.module('artic'));

  //Initialize the controller and a mock scope
  beforeEach(angular.mock.inject(function (_$componentController_, _$rootScope_, ViewStateService, LoadedMetaDataService, DbObjLoadSaveService, ConfigProviderService, HistoryService) {
    $componentController = _$componentController_;
    $rootScope = _$rootScope_;

    ctrl = $componentController('bundleListSideBar', {$scope: $rootScope, $element: angular.element('<div><div></div></div>')}, {});
    ConfigProviderService.setVals(defaultArticConfig);
    ConfigProviderService.curDbConfig = aeDbConfig;
  }));

  it('should check if isSessionDefined', function () {
    expect(ctrl.isSessionDefined('undefined')).toBe(false);
    expect(ctrl.isSessionDefined('test')).toBe(true);
  });

  it('should get getBndlColor', function () {
    var res;
    expect(ctrl.getBndlColor({name: 'test'})).toBe(undefined);
    ctrl.LoadedMetaDataService.setCurBndlName('test1');
    res = ctrl.getBndlColor({name: 'test1'});
    expect(res.color).toBe('black');
    ctrl.HistoryService.movesAwayFromLastSave = 1;
    res = ctrl.getBndlColor({name: 'test1'});
    expect(res.color).toBe('white');

  });
  //TODO add check for isCurBndl function

});
