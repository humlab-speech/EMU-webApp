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
   it('should call IoHandlerService.saveBundle getAnnotationAndSaveBndl if validation returns true', angular.mock.inject(function (IoHandlerService, LoadedMetaDataService, ValidationService) {
     spyOn(IoHandlerService, 'saveBundle').mockReturnValue(deferred.promise);
     spyOn(LoadedMetaDataService, 'getCurBndl').mockReturnValue({session: 'test', finishedEditing: false, comment: 'test comment'});
     spyOn(ValidationService, 'validateJSO').mockReturnValue(true);
     scope.dbo.getAnnotationAndSaveBndl({},deferred);
     deferred.resolve('called');
     scope.$apply();
     expect(IoHandlerService.saveBundle).toHaveBeenCalledWith({ annotation : { levels: [] }, mediaFile : { encoding : 'BASE64', data : '' }, session : 'test', finishedEditing : false, comment : 'test comment' });
   }));

  /**
   *
   */
   it('should saveBundle', angular.mock.inject(function (BinaryDataManipHelperService, SsffDataService, SsffParserService, IoHandlerService, LoadedMetaDataService) {
     spyOn(scope.vs, 'getPermission').mockReturnValue(true);
     spyOn(scope.dbo, 'getAnnotationAndSaveBndl').mockImplementation(() => {});
     spyOn(SsffParserService, 'asyncJso2ssff').mockReturnValue(deferred.promise);
     SsffDataService.data = [{ssffTrackName: 'FORMANTS'}];
     scope.dbo.saveBundle();
     expect(scope.vs.getPermission).toHaveBeenCalledWith('saveBndlBtnClick');
     deferred.resolve({data: []});
     scope.$apply();
   }));

  /**
   *
   */
   it('should saveBundle', angular.mock.inject(function (BinaryDataManipHelperService, SsffDataService, SsffParserService, IoHandlerService, LoadedMetaDataService) {
     spyOn(scope.vs, 'getPermission').mockReturnValue(true);
     spyOn(scope.dbo, 'getAnnotationAndSaveBndl').mockImplementation(() => {});
     spyOn(SsffParserService, 'asyncJso2ssff').mockReturnValue(deferred.promise);
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
   it('should loadBundle', angular.mock.inject(function (DataService, ValidationService, BinaryDataManipHelperService, SsffParserService, WavParserService, IoHandlerService, LoadedMetaDataService, ViewStateService) {
     spyOn(LoadedMetaDataService, 'getCurBndl').mockReturnValue({name: 'test1', ssffFiles: []});
     spyOn(IoHandlerService, 'getBundle').mockReturnValue(deferred.promise);
     spyOn(WavParserService, 'parseWavAudioBuf').mockReturnValue(deferred2.promise);
     spyOn(SsffParserService, 'asyncParseSsffArr').mockReturnValue(deferred3.promise);
     spyOn(ValidationService, 'validateJSO').mockReturnValue(true);
     spyOn(ViewStateService, 'selectLevel').mockReturnValue(true);
     spyOn(DataService, 'setData').mockImplementation(() => {});
     spyOn(LoadedMetaDataService, 'setCurBndl').mockImplementation(() => {});
     spyOn(BinaryDataManipHelperService, 'base64ToArrayBuffer').mockReturnValue(new ArrayBuffer(6));
     scope.dbo.loadBundle({name: 'test'});
     expect(LoadedMetaDataService.getCurBndl).toHaveBeenCalled();
     deferred.resolve({status: 200, data: { mediaFile: { encoding: 'BASE64', data: [1, 2, 3]}, ssffFiles: []}});
     scope.$apply();
     expect(IoHandlerService.getBundle).toHaveBeenCalled();
     // The loadBundle callback is async, so flush microtasks before checking
     return Promise.resolve().then(function () {
       scope.$apply();
       expect(WavParserService.parseWavAudioBuf).toHaveBeenCalled();
       deferred2.resolve({audioBuffer: {length: 100}, playbackBuffer: null});
       scope.$apply();
       return Promise.resolve();
     }).then(function () {
       scope.$apply();
       deferred3.resolve({data: []});
       scope.$apply();
       return Promise.resolve();
     }).then(function () {
       scope.$apply();
       expect(SsffParserService.asyncParseSsffArr).toHaveBeenCalled();
       expect(ViewStateService.selectLevel).toHaveBeenCalled();
       expect(ValidationService.validateJSO).toHaveBeenCalled();
       expect(BinaryDataManipHelperService.base64ToArrayBuffer).toHaveBeenCalled();
       expect(DataService.setData).toHaveBeenCalled();
       expect(LoadedMetaDataService.setCurBndl).toHaveBeenCalled();
     });
   }));

  /**
   *
   */
   it('should NOT loadBundle (ssff error)', angular.mock.inject(function (AppStateService, ModalService, DataService, ValidationService, BinaryDataManipHelperService, SsffParserService, WavParserService, IoHandlerService, LoadedMetaDataService) {
     spyOn(LoadedMetaDataService, 'getCurBndl').mockReturnValue({name: 'test1', ssffFiles: []});
     spyOn(IoHandlerService, 'getBundle').mockReturnValue(deferred.promise);
     spyOn(WavParserService, 'parseWavAudioBuf').mockReturnValue(deferred2.promise);
     spyOn(SsffParserService, 'asyncParseSsffArr').mockReturnValue(deferred3.promise);
     spyOn(ValidationService, 'validateJSO').mockReturnValue(true);
     spyOn(ModalService, 'open').mockReturnValue(deferred4.promise);
     spyOn(AppStateService, 'resetToInitState').mockImplementation(() => {});
     spyOn(DataService, 'setData').mockImplementation(() => {});
     spyOn(LoadedMetaDataService, 'setCurBndl').mockImplementation(() => {});
     spyOn(BinaryDataManipHelperService, 'base64ToArrayBuffer').mockReturnValue(new ArrayBuffer(6));
     scope.dbo.loadBundle({name: 'test'});
     expect(LoadedMetaDataService.getCurBndl).toHaveBeenCalled();
     deferred.resolve({status: 200, data: { mediaFile: { encoding: 'BASE64', data: [1, 2, 3]}, ssffFiles: []}});
     scope.$apply();
     expect(IoHandlerService.getBundle).toHaveBeenCalled();
     return Promise.resolve().then(function () {
       scope.$apply();
       expect(WavParserService.parseWavAudioBuf).toHaveBeenCalled();
       deferred2.resolve({audioBuffer: {length: 100}, playbackBuffer: null});
       scope.$apply();
       return Promise.resolve();
     }).then(function () {
       scope.$apply();
       deferred3.reject({ status: { message: 'error_msg1' }});
       scope.$apply();
       return Promise.resolve();
     }).then(function () {
       scope.$apply();
       expect(ValidationService.validateJSO).toHaveBeenCalled();
       expect(SsffParserService.asyncParseSsffArr).toHaveBeenCalled();
       expect(BinaryDataManipHelperService.base64ToArrayBuffer).toHaveBeenCalled();
       deferred4.resolve();
       scope.$apply();
       expect(ModalService.open).toHaveBeenCalledWith('views/error.html', 'Error parsing SSFF file: error_msg1');
       expect(AppStateService.resetToInitState).toHaveBeenCalled();
     });
   }));


  /**
   *
   */
   it('should NOT loadBundle (wav file error)', angular.mock.inject(function (AppStateService, ModalService, DataService, ValidationService, BinaryDataManipHelperService, SsffParserService, WavParserService, IoHandlerService, LoadedMetaDataService) {
     // two bundles (one loaded (bndl1) one to be loaded (bndl2))
     var bndl1 = {name: 'test', mediaFile: {encoding: 'BASE64'}, ssffFiles: []};
     var bndl2 = {name: 'test1', mediaFile: {encoding: 'BASE64'}, ssffFiles: []};
     spyOn(LoadedMetaDataService, 'getCurBndl').mockReturnValue(bndl1);
     spyOn(IoHandlerService, 'getBundle').mockReturnValue(deferred.promise);
     spyOn(WavParserService, 'parseWavAudioBuf').mockReturnValue(deferred2.promise);
     spyOn(ValidationService, 'validateJSO').mockReturnValue(true);
     spyOn(ModalService, 'open').mockReturnValue(deferred3.promise);
     spyOn(AppStateService, 'resetToInitState').mockImplementation(() => {});
     spyOn(DataService, 'setData').mockImplementation(() => {});
     spyOn(LoadedMetaDataService, 'setCurBndl').mockImplementation(() => {});
     spyOn(BinaryDataManipHelperService, 'base64ToArrayBuffer').mockReturnValue(new ArrayBuffer(6));
     scope.dbo.loadBundle(bndl2);
     expect(LoadedMetaDataService.getCurBndl).toHaveBeenCalled();
     deferred.resolve({status: 200, data: { mediaFile: { encoding: 'BASE64', data: [1, 2, 3]}}});
     scope.$apply();
     expect(IoHandlerService.getBundle).toHaveBeenCalled();
     return Promise.resolve().then(function () {
       scope.$apply();
       expect(WavParserService.parseWavAudioBuf).toHaveBeenCalled();
       deferred2.reject({ status: { message: 'error_msg2' }});
       scope.$apply();
       return Promise.resolve();
     }).then(function () {
       scope.$apply();
       expect(ValidationService.validateJSO).toHaveBeenCalled();
       expect(BinaryDataManipHelperService.base64ToArrayBuffer).toHaveBeenCalled();
       deferred3.resolve();
       scope.$apply();
       expect(ModalService.open).toHaveBeenCalledWith('views/error.html', 'Error decoding audio file: error_msg2');
       expect(AppStateService.resetToInitState).toHaveBeenCalled();
     });
   }));

  /**
   *
   */
   it('should NOT loadBundle (annotation error)', angular.mock.inject(function (AppStateService, ModalService, DataService, ValidationService, BinaryDataManipHelperService, SsffParserService, WavParserService, IoHandlerService, LoadedMetaDataService) {
     spyOn(LoadedMetaDataService, 'getCurBndl').mockReturnValue({name: 'test1'});
     spyOn(IoHandlerService, 'getBundle').mockReturnValue(deferred.promise);
     spyOn(ValidationService, 'validateJSO').mockReturnValue(false);
     spyOn(ModalService, 'open').mockReturnValue(deferred2.promise);
     spyOn(AppStateService, 'resetToInitState').mockImplementation(() => {});     
     scope.dbo.loadBundle({name: 'test'});
     expect(LoadedMetaDataService.getCurBndl).toHaveBeenCalled();
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
   it('should loadBundle (-> discardChanges)', angular.mock.inject(function (ModalService, ConfigProviderService, LoadedMetaDataService, HistoryService) {
     spyOn(ModalService, 'open').mockReturnValue(deferred.promise);
     ConfigProviderService.vals.main.comMode = 'embedded';
     ConfigProviderService.vals.activeButtons.saveBundle = true;
     HistoryService.movesAwayFromLastSave = 1;
     scope.dbo.loadBundle({name: 'test'});
     deferred.resolve('discardChanges');
     //scope.$apply();
     expect(ModalService.open).toHaveBeenCalled();
   }));
});