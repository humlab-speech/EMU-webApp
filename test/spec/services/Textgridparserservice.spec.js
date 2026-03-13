'use strict';

describe('Service: TextGridParserService', function () {
  var scope, deferred;

  // load the controller's module
  beforeEach(angular.mock.module('grazer'));

  beforeEach(angular.mock.inject(function (_$rootScope_, $q, TextGridParserService) {
     scope = _$rootScope_;
     deferred = $q.defer();
     deferred.resolve('called');  // always resolved, you can do it from your spec
  }));

  /**
   *
   */
   it('should resolve asyncToTextGrid', angular.mock.inject(function (TextGridParserService, DataService) {
     var result;
     DataService.setData(msajc003_bndl.annotation);
     spyOn(TextGridParserService, 'asyncToTextGrid').mockReturnValue(deferred.promise);
     TextGridParserService.asyncToTextGrid().then(function (res) {
       expect(res).toEqual('called');
     });
     scope.$apply();
   }));

  /**
   *
   */
   it('should do asyncToTextGrid', angular.mock.inject(function (TextGridParserService, DataService, SoundHandlerService) {
     var result;
     SoundHandlerService.audioBuffer.length = 1000;
     DataService.setData(msajc003_bndl.annotation);
     TextGridParserService.asyncToTextGrid().then(function (res) {
       expect(res).toEqual('');
     });
     scope.$apply();
   }));

  /**
   *
   */
   it('should resolve asyncParseTextGrid', angular.mock.inject(function (TextGridParserService, DataService) {
   var result;
   DataService.setData(msajc003_bndl.annotation);
   spyOn(TextGridParserService, 'asyncParseTextGrid').mockReturnValue(deferred.promise);
   var ret = TextGridParserService.asyncParseTextGrid('','','').then(function (res) { //esps, annotates, name
    expect(res).toEqual('called');
   });
   scope.$apply();
   }));

  /**
   *
   */
   it('should do asyncParseTextGrid', angular.mock.inject(function (TextGridParserService, DataService) {
   var result;
   DataService.setData(msajc003_bndl.annotation);
   TextGridParserService.asyncParseTextGrid('','','').then(function (res) { //esps, annotates, name
    expect(res).toEqual('');
   });
   scope.$apply();
   }));


});