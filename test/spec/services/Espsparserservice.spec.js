'use strict';

describe('Service: EspsParserService', function () {
  var scope, deferred;

  // load the controller's module
  beforeEach(angular.mock.module('artic'));

  beforeEach(angular.mock.inject(function (_$rootScope_, $q) {
     scope = _$rootScope_;
     deferred = $q.defer();
     // deferred.resolve('called');  // always resolved, you can do it from your spec
  }));

  /**
   *
   */
   it('should resolve asyncParseJSO', angular.mock.inject(function (EspsParserService, DataService) {
     DataService.setData(msajc003_bndl.annotation);
     spyOn(EspsParserService, 'asyncParseJSO').mockReturnValue(deferred.promise);
     EspsParserService.asyncParseJSO('Utterance').then(function (res) {
       expect(res).toEqual('called');
     });
     deferred.resolve('called');
     scope.$apply();
   }));
   
  /**
   *
   */
   it('should do asyncParseEsps', angular.mock.inject(function (EspsParserService, DataService) {
     DataService.setData(msajc003_bndl.annotation);
     spyOn(EspsParserService, 'asyncParseEsps').mockReturnValue(deferred.promise);
     EspsParserService.asyncParseEsps('','','').then(function (res) {
       expect(res).toEqual('called');
     });
     deferred.resolve('called');
     scope.$apply();
   }));

  /**
   *
   */
   it('should resolve asyncParseEsps', angular.mock.inject(function (EspsParserService, DataService) {
   DataService.setData(msajc003_bndl.annotation);
   spyOn(EspsParserService, 'asyncParseEsps').mockReturnValue(deferred.promise);
   EspsParserService.asyncParseEsps('','','').then(function (res) { //esps, annotates, name
    expect(res).toEqual('called');
   });
   deferred.resolve('called');
   scope.$apply();
   }));

  /**
   *
   */
   it('should resolve asyncParseJSO', angular.mock.inject(function (EspsParserService, DataService) {
   var result;
   DataService.setData(msajc003_bndl.annotation);
   spyOn(EspsParserService, 'asyncParseJSO').mockReturnValue(deferred.promise);
   var ret = EspsParserService.asyncParseJSO('').then(function (res) { //name
    expect(res).toEqual('called');
   });
   deferred.resolve('called');
   scope.$apply();
   }));

  /**
   *
   */
   it('should do asyncParseJSO', angular.mock.inject(function (EspsParserService, DataService) {
   DataService.setData(msajc003_bndl.annotation);
   spyOn(EspsParserService, 'asyncParseJSO').mockReturnValue(deferred.promise);
   EspsParserService.asyncParseJSO('').then(function (res) { //name
    expect(res).toEqual('called');
   });
   deferred.resolve('called');
   scope.$apply();
   }));

});