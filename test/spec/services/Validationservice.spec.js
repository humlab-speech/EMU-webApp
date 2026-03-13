'use strict';

describe('Service: ValidationService', function () {

  var scope;

  // load the controller's module
  beforeEach(angular.mock.module('grazer'));

  beforeEach(angular.mock.inject(function ($httpBackend, $rootScope, ValidationService) {
    scope = $rootScope.$new();
    $httpBackend.whenGET("schemaFiles/annotationFileSchema.json").respond(annotationFileSchema);
    $httpBackend.whenGET("schemaFiles/grazerConfigSchema.json").respond(grazerConfigSchema);
    $httpBackend.whenGET("schemaFiles/DBconfigFileSchema.json").respond(DBconfigFileSchema);
    $httpBackend.whenGET("schemaFiles/bundleListSchema.json").respond(bundleListSchema);
    $httpBackend.whenGET("schemaFiles/bundleSchema.json").respond(bundleSchema);
    $httpBackend.whenGET("schemaFiles/designSchema.json").respond(designSchema);
    ValidationService.loadSchemas();
    $rootScope.$apply();
  }));

  /**
   *
   */
  it('should validateJSO', angular.mock.inject(function (ValidationService) {
    spyOn(ValidationService, 'getSchema').and.returnValue({
      name: 'test',
      data: {}
    });
    expect(ValidationService.validateJSO('grazerConfigSchema', 'test')).toEqual(true);
  }));

  /**
   *
   */
  it('should validateJSO', angular.mock.inject(function (ValidationService) {
    spyOn(ValidationService, 'getSchema').and.returnValue(undefined);
    expect(ValidationService.validateJSO('grazerConfigSchema', 'test')).toEqual('Schema: grazerConfigSchema is currently undefined! This is probably due to a misnamed schema file on the server...');
  }));

  /**
   *
   */
  it('should getSchema', angular.mock.inject(function (ValidationService) {
    // schema's not loaded yet... mabye write test with loaded schema too
    expect(ValidationService.getSchema('grazerConfigSchema')).toEqual(undefined);
  }));

  /**
   *
   */
  it('should semCheckLoadedConfig', angular.mock.inject(function (ValidationService, ConfigProviderService) {
    // set default
    ConfigProviderService.setVals(defaultGrazerConfig);

    // console.log(JSON.stringify(emaDbConfig.levelDefinitions, undefined, 1));
    var tmpDBconfig = angular.copy(aeDbConfig);

    var res;

    ConfigProviderService.curDbConfig = tmpDBconfig;

    // should pass checks if not manipulated
    res = ValidationService.semCheckLoadedConfigs(tmpDBconfig.EMUwebAppConfig, tmpDBconfig);
    expect(res).toEqual(true);

    // fail on undefined track name
    tmpDBconfig = angular.copy(aeDbConfig);
    tmpDBconfig.EMUwebAppConfig.perspectives[0].signalCanvases.order[0] = 'undefinedTrackName';
    res = ValidationService.semCheckLoadedConfigs(tmpDBconfig.EMUwebAppConfig, tmpDBconfig);
    expect(res).toMatch('.*EMUwebAppConfig/perspectives/signalCanvases/order.*');

    // fail on self assignment
    tmpDBconfig = angular.copy(aeDbConfig);
    tmpDBconfig.EMUwebAppConfig.perspectives[0].signalCanvases.assign[0] = {
      'signalCanvasName': 'fundFreq',
      'ssffTrackName': 'fundFreq'
    };
    res = ValidationService.semCheckLoadedConfigs(tmpDBconfig.EMUwebAppConfig, tmpDBconfig);
    expect(res).toMatch('.*EMUwebAppConfig/perspectives/signalCanvases/assign.*');
    
    // fail on OSCI or SPEC assignment
    tmpDBconfig = angular.copy(aeDbConfig);
    tmpDBconfig.EMUwebAppConfig.perspectives[0].signalCanvases.assign[0] = {
      'signalCanvasName': 'OSCI',
      'ssffTrackName': 'SPEC'
    };
    res = ValidationService.semCheckLoadedConfigs(tmpDBconfig.EMUwebAppConfig, tmpDBconfig);
    expect(res).toMatch('.*EMUwebAppConfig/perspectives/signalCanvases/assign.*');

    tmpDBconfig = angular.copy(aeDbConfig);
    tmpDBconfig.EMUwebAppConfig.perspectives[0].signalCanvases.assign[0] = {
      'signalCanvasName': 'SPEC',
      'ssffTrackName': 'OSCI'
    };
    res = ValidationService.semCheckLoadedConfigs(tmpDBconfig.EMUwebAppConfig, tmpDBconfig);
    expect(res).toMatch('.*EMUwebAppConfig/perspectives/signalCanvases/assign.*');


    // fail on undefined assignment
    tmpDBconfig = angular.copy(aeDbConfig);
    tmpDBconfig.EMUwebAppConfig.perspectives[0].signalCanvases.assign[0] = {
      'signalCanvasName': 'fundFreq',
      'ssffTrackName': 'fundFreqsadf'
    };
    res = ValidationService.semCheckLoadedConfigs(tmpDBconfig.EMUwebAppConfig, tmpDBconfig);
    expect(res).toMatch('.*EMUwebAppConfig/perspectives/signalCanvases/assign.*');

    // fail on not displayed assignment
    tmpDBconfig = angular.copy(aeDbConfig);
    tmpDBconfig.EMUwebAppConfig.perspectives[0].signalCanvases.assign[0] = {
      'signalCanvasName': 'dftSpec',
      'ssffTrackName': 'fundFreq'
    };
    res = ValidationService.semCheckLoadedConfigs(tmpDBconfig.EMUwebAppConfig, tmpDBconfig);
    expect(res).toMatch('.*EMUwebAppConfig/perspectives/signalCanvases/assign.*');

    // fail on undefined contourLims
    tmpDBconfig = angular.copy(aeDbConfig);
    tmpDBconfig.EMUwebAppConfig.perspectives[0].signalCanvases.contourLims[0].ssffTrackName = 'undefinedTrackName';
    res = ValidationService.semCheckLoadedConfigs(tmpDBconfig.EMUwebAppConfig, tmpDBconfig);
    expect(res).toMatch('.*EMUwebAppConfig/perspectives/signalCanvases/contourLims.*');
  
    // fail on not displayed contourLims
    tmpDBconfig = angular.copy(aeDbConfig);
    tmpDBconfig.EMUwebAppConfig.perspectives[0].signalCanvases.contourLims[0].ssffTrackName = 'dftSpec';
    res = ValidationService.semCheckLoadedConfigs(tmpDBconfig.EMUwebAppConfig, tmpDBconfig);
    expect(res).toMatch('.*EMUwebAppConfig/perspectives/signalCanvases/contourLims.*');

    // fail on undefined level name
    tmpDBconfig = angular.copy(aeDbConfig);
    tmpDBconfig.EMUwebAppConfig.perspectives[0].levelCanvases.order[0] = 'undefinedLevelName';
    res = ValidationService.semCheckLoadedConfigs(tmpDBconfig.EMUwebAppConfig, tmpDBconfig);
    expect(res).toMatch('.*EMUwebAppConfig/perspectives/levelCanvases/order.*');

    // fail on ITEM level displayed
    tmpDBconfig = angular.copy(aeDbConfig);
    tmpDBconfig.EMUwebAppConfig.perspectives[0].levelCanvases.order[0] = 'Syllable';
    res = ValidationService.semCheckLoadedConfigs(tmpDBconfig.EMUwebAppConfig, tmpDBconfig);
    expect(res).toMatch('.*EMUwebAppConfig/perspectives/levelCanvases/order.*');
    
    // fail on undefined track in twoDimCanvases
    tmpDBconfig = angular.copy(emaDbConfig);
    ConfigProviderService.curDbConfig = tmpDBconfig;
    tmpDBconfig.EMUwebAppConfig.perspectives[0].twoDimCanvases.twoDimDrawingDefinitions[0].dots[0].xSsffTrack = 'undefinedTrackName';
    res = ValidationService.semCheckLoadedConfigs(tmpDBconfig.EMUwebAppConfig, tmpDBconfig);
    expect(res).toMatch('.*EMUwebAppConfig/perspectives/twoDimCanvases/twoDimDrawingDefinitions/dots.*');

    // fail on undefined dot in connectLines
    tmpDBconfig = angular.copy(emaDbConfig);
    ConfigProviderService.curDbConfig = tmpDBconfig;
    tmpDBconfig.EMUwebAppConfig.perspectives[0].twoDimCanvases.twoDimDrawingDefinitions[0].connectLines[0].fromDot = 'undefinedDotName';
    res = ValidationService.semCheckLoadedConfigs(tmpDBconfig.EMUwebAppConfig, tmpDBconfig);
    expect(res).toMatch('.*EMUwebAppConfig/perspectives/twoDimCanvases/twoDimDrawingDefinitions/connectLines.*');

    // fail on static dots array of not the same length
    tmpDBconfig = angular.copy(emaDbConfig);
    ConfigProviderService.curDbConfig = tmpDBconfig;
    tmpDBconfig.EMUwebAppConfig.perspectives[1].twoDimCanvases.twoDimDrawingDefinitions[0].staticDots[0].xCoordinates = [1,2,3,4];
    res = ValidationService.semCheckLoadedConfigs(tmpDBconfig.EMUwebAppConfig, tmpDBconfig);
    expect(res).toMatch('.*EMUwebAppConfig/perspectives/twoDimCanvases/twoDimDrawingDefinitions/staticDots.*');

  }));


});