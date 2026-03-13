'use strict';

describe('Service: DrawHelperService', function () {

  // load the controller's module
  beforeEach(angular.mock.module('grazer'));
  
  var scope;

  //Initialize the controller and a mock scope
  beforeEach(angular.mock.inject(function ($rootScope, DrawHelperService, ViewStateService, ConfigProviderService) {
    scope = $rootScope.$new();
    scope.dhs = DrawHelperService;
    scope.vs = ViewStateService;
    scope.cps = ConfigProviderService;
    scope.cps.design = defaultGrazerDesign;    
    scope.cps.vals = {};
    scope.cps.vals.restrictions = {};
    scope.cps.vals.colors = {};
    scope.cps.vals.font = {};
    scope.cps.vals.restrictions.drawCrossHairs = true;
    scope.cps.vals.colors.crossHairsColor = '#00f';
    scope.cps.vals.fontPxSize = 10;
    scope.cps.vals.fontType = 'Verdana';
  }));

  /**
   *
   */
  it('should drawCrossHairs (trackname undefined)', angular.mock.inject(function (ConfigProviderService, SsffDataService) {
    // add mock track definition
    scope.cps.curDbConfig.ssffTrackDefinitions = [{
      'name': 'test',
      'columnName': 'test',
      'fileExtension': 'testFileExt'
    }];
    spyOn(scope.cps, 'getSsffTrackConfig').and.returnValue({name: 'test', columnName: 'test'});
    spyOn(SsffDataService, 'getColumnOfTrack').and.returnValue({_maxVal: 0, _minVal: 0});
    spyOn(scope.vs, 'getX').and.returnValue(512);
    spyOn(scope.vs, 'getY').and.returnValue(128);
    var canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 256;
    var ctx = canvas.getContext('2d');
    scope.dhs.drawCrossHairs(ctx, {}, 0, 1, 1, 'test');
    expect(scope.vs.getX).toHaveBeenCalled();
    expect(scope.vs.getY).toHaveBeenCalled();
    expect(ConfigProviderService.getSsffTrackConfig).toHaveBeenCalled();
    expect(SsffDataService.getColumnOfTrack).toHaveBeenCalled();
  }));
  
  /**
   *
   */
  it('should drawCrossHairs (trackname OSCI)', angular.mock.inject(function (ConfigProviderService) {
    spyOn(scope.vs, 'getX').and.returnValue(512);
    spyOn(scope.vs, 'getY').and.returnValue(128);
    var canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 256;
    var ctx = canvas.getContext('2d');
    scope.dhs.drawCrossHairs(ctx, {}, 0, 1, 1, 'OSCI');
    expect(scope.vs.getX).toHaveBeenCalled();
    expect(scope.vs.getY).toHaveBeenCalled();
  }));
  
  /**
   *
   */
  it('should drawCrossHairs (trackname SPEC)', angular.mock.inject(function (ConfigProviderService) {
    spyOn(scope.vs, 'getX').and.returnValue(512);
    spyOn(scope.vs, 'getY').and.returnValue(128);
    var canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 256;
    var ctx = canvas.getContext('2d');
    scope.dhs.drawCrossHairs(ctx, {}, 0, 1, 1, 'SPEC');
    expect(scope.vs.getX).toHaveBeenCalled();
    expect(scope.vs.getY).toHaveBeenCalled();
  }));
  
});
