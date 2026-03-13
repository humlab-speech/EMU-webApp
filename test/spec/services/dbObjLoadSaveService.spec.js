'use strict';

describe('Service: DbObjLoadSaveService', function () {
  var scope, deferred, deferred2, deferred3, deferred4;

  // load the controller's module
  beforeEach(angular.mock.module('grazer'));

  beforeEach(angular.mock.inject(function (_$rootScope_, $q, DbObjLoadSaveService, ViewStateService, ConfigProviderService) {
     scope = _$rootScope_;
     deferred = $q.defer();
     deferred2 = $q.defer();
     deferred3 = $q.defer();
     deferred4 = $q.defer();
     scope.dbo = DbObjLoadSaveService;
     scope.vs = ViewStateService;
     scope.cps = ConfigProviderService;
     scope.cps.setVals(defaultGrazerConfig);
     scope.cps.curDbConfig = aeDbConfig;   
     scope.vs.curPerspectiveIdx = 0;
  }));

  /**
   *
   */
   it('should call IoHandlerService.saveBundle getAnnotationAndSaveBndl if validation returns true', angular.mock.inject(function (IoHandlerService, loadedMetaDataService, ValidationService) {
     spyOn(IoHandlerService, 'saveBundle').and.returnValue(deferred.promise);
     spyOn(loadedMetaDataService, 'getCurBndl').and.returnValue({session: 'test', finishedEditing: false, comment: 'test comment'});
     spyOn(ValidationService, 'validateJSO').and.returnValue(true);
     scope.dbo.getAnnotationAndSaveBndl({},deferred);
     deferred.resolve('called');
     scope.$apply();
     expect(IoHandlerService.saveBundle).toHaveBeenCalledWith({ annotation : {  }, mediaFile : { encoding : 'BASE64', data : '' }, session : 'test', finishedEditing : false, comment : 'test comment' });
   }));

  /**
   *
   */
   it('should saveBundle', angular.mock.inject(function (BinaryDataManipHelperService, SsffDataService, SsffParserService, IoHandlerService, loadedMetaDataService) {
     spyOn(scope.vs, 'getPermission').and.returnValue(true);
     spyOn(scope.dbo, 'getAnnotationAndSaveBndl');
     spyOn(SsffParserService, 'asyncJso2ssff').and.returnValue(deferred.promise);
     SsffDataService.data = [{ssffTrackName: 'FORMANTS'}];
     scope.dbo.saveBundle();
     expect(scope.vs.getPermission).toHaveBeenCalledWith('saveBndlBtnClick');
     deferred.resolve({data: []});
     scope.$apply();
   }));

  /**
   *
   */
   it('should saveBundle', angular.mock.inject(function (BinaryDataManipHelperService, SsffDataService, SsffParserService, IoHandlerService, loadedMetaDataService) {
     spyOn(scope.vs, 'getPermission').and.returnValue(true);
     spyOn(scope.dbo, 'getAnnotationAndSaveBndl');
     spyOn(SsffParserService, 'asyncJso2ssff').and.returnValue(deferred.promise);
     SsffDataService.data = [];
     scope.dbo.saveBundle();
     expect(scope.vs.getPermission).toHaveBeenCalledWith('saveBndlBtnClick');
     expect(scope.dbo.getAnnotationAndSaveBndl).toHaveBeenCalled();
     deferred.resolve({data: []});
     scope.$apply();
   }));

  /**
   *
   */
   it('should loadBundle', angular.mock.inject(function (DataService, ValidationService, BinaryDataManipHelperService, SsffParserService, WavParserService, IoHandlerService, loadedMetaDataService, ViewStateService) {
     spyOn(loadedMetaDataService, 'getCurBndl').and.returnValue({name: 'test1', ssffFiles: []});
     spyOn(IoHandlerService, 'getBundle').and.returnValue(deferred.promise);
     spyOn(WavParserService, 'parseWavAudioBuf').and.returnValue(deferred2.promise);
     spyOn(SsffParserService, 'asyncParseSsffArr').and.returnValue(deferred3.promise);
     spyOn(ValidationService, 'validateJSO').and.returnValue(true);
     spyOn(ViewStateService, 'selectLevel').and.returnValue(true);
     spyOn(DataService, 'setData');
     spyOn(loadedMetaDataService, 'setCurBndl');
     spyOn(BinaryDataManipHelperService, 'base64ToArrayBuffer');
     scope.dbo.loadBundle({name: 'test'});
     expect(loadedMetaDataService.getCurBndl).toHaveBeenCalled();
     deferred.resolve({status: 200, data: { mediaFile: { encoding: 'BASE64', data: [1, 2, 3]}, ssffFiles: []}});
     scope.$apply();
     expect(IoHandlerService.getBundle).toHaveBeenCalled();
     deferred2.resolve({Data: []});
     scope.$apply();
     expect(WavParserService.parseWavAudioBuf).toHaveBeenCalled();
     deferred3.resolve({Data: []});
     scope.$apply();
     expect(SsffParserService.asyncParseSsffArr).toHaveBeenCalled();
     expect(ViewStateService.selectLevel).toHaveBeenCalled();
     expect(ValidationService.validateJSO).toHaveBeenCalled();
     expect(BinaryDataManipHelperService.base64ToArrayBuffer).toHaveBeenCalled();
     expect(DataService.setData).toHaveBeenCalled();
     expect(loadedMetaDataService.setCurBndl).toHaveBeenCalled();
   }));

  /**
   *
   */
   it('should NOT loadBundle (ssff error)', angular.mock.inject(function (AppStateService, ModalService, DataService, ValidationService, BinaryDataManipHelperService, SsffParserService, WavParserService, IoHandlerService, loadedMetaDataService) {
     spyOn(loadedMetaDataService, 'getCurBndl').and.returnValue({name: 'test1', ssffFiles: []});
     spyOn(IoHandlerService, 'getBundle').and.returnValue(deferred.promise);
     spyOn(WavParserService, 'parseWavAudioBuf').and.returnValue(deferred2.promise);
     spyOn(SsffParserService, 'asyncParseSsffArr').and.returnValue(deferred3.promise);
     spyOn(ValidationService, 'validateJSO').and.returnValue(true);
     spyOn(ModalService, 'open').and.returnValue(deferred4.promise);
     spyOn(AppStateService, 'resetToInitState');
     spyOn(DataService, 'setData');
     spyOn(loadedMetaDataService, 'setCurBndl');
     spyOn(BinaryDataManipHelperService, 'base64ToArrayBuffer');
     scope.dbo.loadBundle({name: 'test'});
     expect(loadedMetaDataService.getCurBndl).toHaveBeenCalled();
     deferred.resolve({status: 200, data: { mediaFile: { encoding: 'BASE64', data: [1, 2, 3]}, ssffFiles: []}});
     scope.$apply();
     expect(IoHandlerService.getBundle).toHaveBeenCalled();
     deferred2.resolve({Data: []});
     scope.$apply();
     expect(WavParserService.parseWavAudioBuf).toHaveBeenCalled();
     deferred3.reject({ status: { message: 'error_msg1' }});
     scope.$apply();
     expect(ValidationService.validateJSO).toHaveBeenCalled();
     expect(SsffParserService.asyncParseSsffArr).toHaveBeenCalled();
     expect(BinaryDataManipHelperService.base64ToArrayBuffer).toHaveBeenCalled();
     deferred4.resolve();
     scope.$apply();
     expect(ModalService.open).toHaveBeenCalledWith('views/error.html', 'Error parsing SSFF file: error_msg1');
     expect(AppStateService.resetToInitState).toHaveBeenCalled();
   }));


  /**
   *
   */
   it('should NOT loadBundle (wav file error)', angular.mock.inject(function (AppStateService, ModalService, DataService, ValidationService, BinaryDataManipHelperService, SsffParserService, WavParserService, IoHandlerService, loadedMetaDataService) {
     // two bundles (one loaded (bndl1) one to be loaded (bndl2))
     var bndl1 = {name: 'test', mediaFile: {encoding: 'BASE64'}, ssffFiles: []};
     var bndl2 = {name: 'test1', mediaFile: {encoding: 'BASE64'}, ssffFiles: []};
     spyOn(loadedMetaDataService, 'getCurBndl').and.returnValue(bndl1);
     spyOn(IoHandlerService, 'getBundle').and.returnValue(deferred.promise);
     spyOn(WavParserService, 'parseWavAudioBuf').and.returnValue(deferred2.promise);
     spyOn(ValidationService, 'validateJSO').and.returnValue(true);
     spyOn(ModalService, 'open').and.returnValue(deferred3.promise);
     spyOn(AppStateService, 'resetToInitState');
     spyOn(DataService, 'setData');
     spyOn(loadedMetaDataService, 'setCurBndl');
     spyOn(BinaryDataManipHelperService, 'base64ToArrayBuffer');
     scope.dbo.loadBundle(bndl2);
     expect(loadedMetaDataService.getCurBndl).toHaveBeenCalled();
     deferred.resolve({status: 200, data: { mediaFile: { encoding: 'BASE64', data: [1, 2, 3]}}});
     scope.$apply();
     expect(IoHandlerService.getBundle).toHaveBeenCalled();
     deferred2.reject({ status: { message: 'error_msg2' }});
     scope.$apply();
     expect(WavParserService.parseWavAudioBuf).toHaveBeenCalled();
     expect(ValidationService.validateJSO).toHaveBeenCalled();
     expect(BinaryDataManipHelperService.base64ToArrayBuffer).toHaveBeenCalled();
     deferred3.resolve();
     scope.$apply();
     expect(ModalService.open).toHaveBeenCalledWith('views/error.html', 'Error parsing wav file: error_msg2');
     expect(AppStateService.resetToInitState).toHaveBeenCalled();     
   }));

  /**
   *
   */
   it('should NOT loadBundle (annotation error)', angular.mock.inject(function (AppStateService, ModalService, DataService, ValidationService, BinaryDataManipHelperService, SsffParserService, WavParserService, IoHandlerService, loadedMetaDataService) {
     spyOn(loadedMetaDataService, 'getCurBndl').and.returnValue({name: 'test1'});
     spyOn(IoHandlerService, 'getBundle').and.returnValue(deferred.promise);
     spyOn(ValidationService, 'validateJSO').and.returnValue(false);
     spyOn(ModalService, 'open').and.returnValue(deferred2.promise);
     spyOn(AppStateService, 'resetToInitState');     
     scope.dbo.loadBundle({name: 'test'});
     expect(loadedMetaDataService.getCurBndl).toHaveBeenCalled();
     deferred.resolve({status: 200, data: { mediaFile: { data: [1, 2, 3]}}});
     deferred2.resolve();
     scope.$apply();
     expect(IoHandlerService.getBundle).toHaveBeenCalled();
     expect(ValidationService.validateJSO).toHaveBeenCalled();
     expect(ModalService.open).toHaveBeenCalledWith('views/error.html', 'Error validating annotation file: false');
     expect(AppStateService.resetToInitState).toHaveBeenCalled();          
   }));

  /**
   *
   */
   it('should loadBundle (-> discardChanges)', angular.mock.inject(function (ModalService, ConfigProviderService, loadedMetaDataService, HistoryService) {
     spyOn(ModalService, 'open').and.returnValue(deferred.promise);
     ConfigProviderService.vals.main.comMode = 'embedded';
     ConfigProviderService.vals.activeButtons.saveBundle = true;
     HistoryService.movesAwayFromLastSave = 1;
     scope.dbo.loadBundle({name: 'test'});
     deferred.resolve('discardChanges');
     //scope.$apply();
     expect(ModalService.open).toHaveBeenCalled();
   }));
});