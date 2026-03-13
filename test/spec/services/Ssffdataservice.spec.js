'use strict';

describe('Service: SsffDataService', function () {
  var scope, deferred;

  // load the controller's module
  beforeEach(angular.mock.module('grazer'));

  beforeEach(angular.mock.inject(function (_$rootScope_, $q, SsffDataService) {
    scope = _$rootScope_;
    deferred = $q.defer();
    //deferred.resolve('called');
  }));

  /**
   *
   */
  it('should calculateSamplePosInVP', angular.mock.inject(function (SsffDataService, SoundHandlerService) {
      SoundHandlerService.audioBuffer.sampleRate = 1000;
    expect(SsffDataService.calculateSamplePosInVP(2, 1, 1)).toEqual(3000);
    expect(SsffDataService.calculateSamplePosInVP(10, 3, 1)).toEqual(4333);
  }));

  /**
   *
   */
  it('should getSampleRateAndStartTimeOfTrack', angular.mock.inject(function (SsffDataService, ConfigProviderService) {
    // add mock track definition
    ConfigProviderService.curDbConfig.ssffTrackDefinitions = [{
      'name': 'test',
      'columnName': 'XXX',
      'fileExtension': 'testFileExt'
    }];
    // add data
    SsffDataService.data.push({
      fileExtension: 'testFileExt',
      sampleRate: 10,
      startTime: 10
    });

    expect(SsffDataService.getSampleRateAndStartTimeOfTrack('test').sampleRate).toEqual(10);
    expect(SsffDataService.getSampleRateAndStartTimeOfTrack('test').startTime).toEqual(10);
    expect(SsffDataService.getSampleRateAndStartTimeOfTrack('false')).toEqual(undefined);
  }));

  /**
   *
   */
  it('should getColumnOfTrack', angular.mock.inject(function (SsffDataService, ConfigProviderService) {
    
    // add mock track definition
    ConfigProviderService.curDbConfig.ssffTrackDefinitions = [{
      'name': 'test',
      'columnName': 'XXX',
      'fileExtension': 'testFileExt'
    }];

    //add data
    SsffDataService.data.push({
      fileExtension: 'testFileExt',
      Columns: [{
        name: 'col1',
        value: 'test1'
      }]
    });
    expect(SsffDataService.getColumnOfTrack('test', 'col1').value).toEqual('test1');
    expect(SsffDataService.getColumnOfTrack('test', 'col2')).toEqual(undefined);
  }));

});