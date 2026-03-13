'use strict';

describe('Service: DragnDropService', function () {
  var $scope;
  var $q;

  // load the controller's module
  beforeEach(angular.mock.module('grazer'));

  beforeEach(angular.mock.inject(function(_$rootScope_, _$q_) {
    $q = _$q_;
    $scope = _$rootScope_.$new();
  }));

  var testData = [
      ['test1','wavData1','annotationData1'],
      ['test2','wavData2','annotationData2']
  ];

  it('should resetToInitState', angular.mock.inject(function (DragnDropService) {
    // set any data
    DragnDropService.drandropBundles.push('test');
    DragnDropService.bundleList.push('test');
    DragnDropService.resetToInitState();
    expect(DragnDropService.drandropBundles.length).toBe(0);
    expect(DragnDropService.bundleList.length).toBe(0);
  }));

  it('should setData', angular.mock.inject(function (DragnDropService, loadedMetaDataService) {
    // set according data
    var def = $q.defer();
    spyOn(loadedMetaDataService, 'setBundleList');
    spyOn(loadedMetaDataService, 'setCurBndlName');
    spyOn(loadedMetaDataService, 'setDemoDbName');
    spyOn(DragnDropService, 'handleLocalFiles');
    spyOn(DragnDropService, 'setDragnDropData');
    spyOn(DragnDropService, 'convertDragnDropData').and.returnValue(def.promise);
    DragnDropService.setData(testData);
    expect(DragnDropService.setDragnDropData).toHaveBeenCalled();
    expect(DragnDropService.convertDragnDropData).toHaveBeenCalledWith([  ], 0);
    def.resolve();
    $scope.$apply();
    expect(loadedMetaDataService.setBundleList).toHaveBeenCalled();
    expect(loadedMetaDataService.setCurBndlName).toHaveBeenCalled();
    expect(loadedMetaDataService.setDemoDbName).toHaveBeenCalled();
    expect(DragnDropService.handleLocalFiles).toHaveBeenCalled();
  }));


  it('should getBlob', angular.mock.inject(function (DragnDropService) {
     expect(DragnDropService.getBlob().toString()).toBe('[object Blob]');
  }));

  it('should generateDrop', angular.mock.inject(function (DragnDropService) {
     expect(DragnDropService.generateDrop().toString().substr(0, 12)).toBe('blob:http://');
  }));

  it('should setDragnDropData', angular.mock.inject(function (DragnDropService, DragnDropDataService) {
    spyOn(DragnDropDataService, 'setDefaultSession');
    var pak1 = 0;
    var pak2 = 1;
    DragnDropService.setDragnDropData(testData[pak1][0], pak1, 'wav', testData[pak1][1]);
    DragnDropService.setDragnDropData(testData[pak1][0], pak1, 'annotation', testData[pak1][2]);
    DragnDropService.setDragnDropData(testData[pak2][0], pak2, 'wav', testData[pak2][1]);
    DragnDropService.setDragnDropData(testData[pak2][0], pak2, 'annotation', testData[pak2][2]);
    expect(DragnDropDataService.convertedBundles.length).toBe(2);
    expect(DragnDropDataService.setDefaultSession).toHaveBeenCalled();
  }));

  it('should getDragnDropData', angular.mock.inject(function (DragnDropService, DragnDropDataService) {
    spyOn(DragnDropDataService, 'setDefaultSession');
    var pak1 = 0;
    var pak2 = 1;
    DragnDropService.setDragnDropData(testData[pak1][0], pak1, 'wav', testData[pak1][1]);
    DragnDropService.setDragnDropData(testData[pak1][0], pak1, 'annotation', testData[pak1][2]);
    DragnDropService.setDragnDropData(testData[pak2][0], pak2, 'wav', testData[pak2][1]);
    DragnDropService.setDragnDropData(testData[pak2][0], pak2, 'annotation', testData[pak2][2]);
    expect(DragnDropService.getDragnDropData(pak1, 'wav')).toEqual(testData[pak1][1]);
    expect(DragnDropService.getDragnDropData(pak1, 'annotation')).toEqual(testData[pak1][2]);
    expect(DragnDropService.getDragnDropData(pak2, 'wav')).toEqual(testData[pak2][1]);
    expect(DragnDropService.getDragnDropData(pak2, 'annotation')).toEqual(testData[pak2][2]);
    expect(DragnDropService.getDragnDropData(pak2, 'annotation12')).toEqual(false);
  }));

  it('should handleLocalFiles', angular.mock.inject(function (WavParserService,
                                                 ValidationService,
                                                 IoHandlerService,
                                                 DragnDropService,
                                                 ModalService,
                                                 AppStateService,
                                                 DragnDropDataService,
                                                 ViewStateService) {
    var defio = $q.defer();
    var defwav = $q.defer();
    DragnDropDataService.sessionDefault = 0;
    DragnDropDataService.convertedBundles[0] = {};
    DragnDropDataService.convertedBundles[0].mediaFile = {};
    DragnDropDataService.convertedBundles[0].mediaFile.data = msajc003_bndl.mediaFile.data;
    DragnDropDataService.convertedBundles[0].annotation = msajc003_bndl.annotation;
    ViewStateService.curPerspectiveIdx = 0;
    spyOn(ViewStateService, 'selectLevel').and.returnValue(true);
    spyOn(IoHandlerService, 'httpGetPath').and.returnValue(defio.promise);
    spyOn(ValidationService, 'validateJSO').and.returnValue(true);
    DragnDropService.handleLocalFiles();
    expect(IoHandlerService.httpGetPath).toHaveBeenCalled();
    defio.resolve({data: defaultGrazerConfig});
    $scope.$apply();
  }));

});
