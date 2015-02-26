'use strict';

describe('Service: dbObjLoadSaveService', function () {
  var scope, deferred, deferred2, deferred3;

  // load the controller's module
  beforeEach(module('emuwebApp'));

  beforeEach(inject(function (_$rootScope_, $q, dbObjLoadSaveService, viewState, ConfigProviderService) {
     scope = _$rootScope_;
     deferred = $q.defer();
     deferred2 = $q.defer();
     deferred3 = $q.defer();
     scope.dbo = dbObjLoadSaveService;
     scope.vs = viewState;
     scope.cps = ConfigProviderService;
     scope.cps.setVals(defaultEmuwebappConfig);
     scope.cps.curDbConfig = aeDbConfig;   
  }));

  /**
   *
   */
   it('should getAnnotationAndSaveBndl', inject(function (Iohandlerservice, loadedMetaDataService) {
     var result;
     spyOn(Iohandlerservice, 'saveBundle').and.returnValue(deferred.promise);
     spyOn(loadedMetaDataService, 'getCurBndl').and.returnValue({session: 'test', finishedEditing: false, comment: 'test comment'});
     scope.dbo.getAnnotationAndSaveBndl({},deferred);
     deferred.resolve('called');
     scope.$apply();
     expect(Iohandlerservice.saveBundle).toHaveBeenCalled();
   }));

  /**
   *
   */
   it('should saveBundle', inject(function (Binarydatamaniphelper, Ssffdataservice, Ssffparserservice, Iohandlerservice, loadedMetaDataService) {
     spyOn(scope.vs, 'getPermission').and.returnValue(true);
     spyOn(scope.dbo, 'getAnnotationAndSaveBndl');
     spyOn(Ssffparserservice, 'asyncJso2ssff').and.returnValue(deferred.promise);
     Ssffdataservice.data = [{ssffTrackName: 'FORMANTS'}];
     scope.dbo.saveBundle();
     expect(scope.vs.getPermission).toHaveBeenCalledWith('saveBndlBtnClick');
     deferred.resolve({data: []});
     scope.$apply();
   }));

  /**
   *
   */
   it('should saveBundle', inject(function (Binarydatamaniphelper, Ssffdataservice, Ssffparserservice, Iohandlerservice, loadedMetaDataService) {
     spyOn(scope.vs, 'getPermission').and.returnValue(true);
     spyOn(scope.dbo, 'getAnnotationAndSaveBndl');
     spyOn(Ssffparserservice, 'asyncJso2ssff').and.returnValue(deferred.promise);
     Ssffdataservice.data = [];
     scope.dbo.saveBundle();
     expect(scope.vs.getPermission).toHaveBeenCalledWith('saveBndlBtnClick');
     expect(scope.dbo.getAnnotationAndSaveBndl).toHaveBeenCalled();
     deferred.resolve({data: []});
     scope.$apply();
   }));

  /**
   *
   */
   it('should loadBundle', inject(function (DataService, Validationservice, Binarydatamaniphelper, Ssffparserservice, Wavparserservice, Iohandlerservice, loadedMetaDataService) {
     spyOn(loadedMetaDataService, 'getCurBndl').and.returnValue({name: 'test1'});
     spyOn(Iohandlerservice, 'getBundle').and.returnValue(deferred.promise);
     spyOn(Wavparserservice, 'parseWavArrBuf').and.returnValue(deferred2.promise);
     spyOn(Ssffparserservice, 'asyncParseSsffArr').and.returnValue(deferred3.promise);
     spyOn(Validationservice, 'validateJSO').and.returnValue(true);
     spyOn(DataService, 'setData');
     spyOn(loadedMetaDataService, 'setCurBndl');
     spyOn(Binarydatamaniphelper, 'base64ToArrayBuffer');
     scope.dbo.loadBundle({name: 'test'});
     expect(loadedMetaDataService.getCurBndl).toHaveBeenCalled();
     deferred.resolve({status: 200, data: { mediaFile: { data: [1, 2, 3]}}});
     scope.$apply();
     expect(Iohandlerservice.getBundle).toHaveBeenCalled();
     deferred2.resolve({Data: []});
     scope.$apply();
     expect(Wavparserservice.parseWavArrBuf).toHaveBeenCalled();
     deferred3.resolve({Data: []});
     scope.$apply();
     expect(Validationservice.validateJSO).toHaveBeenCalled();
     expect(Ssffparserservice.asyncParseSsffArr).toHaveBeenCalled();
     expect(Binarydatamaniphelper.base64ToArrayBuffer).toHaveBeenCalled();
     expect(DataService.setData).toHaveBeenCalled();
     expect(loadedMetaDataService.setCurBndl).toHaveBeenCalled();
   }));

  /**
   *
   */
   it('should loadBundle (-> discardChanges)', inject(function (modalService, ConfigProviderService, loadedMetaDataService, HistoryService) {
     spyOn(modalService, 'open').and.returnValue(deferred.promise);
     ConfigProviderService.vals.main.comMode = 'embedded';
     HistoryService.movesAwayFromLastSave = 1;
     scope.dbo.loadBundle({name: 'test'});
     deferred.resolve('discardChanges');
     scope.$apply();
     expect(modalService.open).toHaveBeenCalled();
   }));
});