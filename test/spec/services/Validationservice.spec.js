'use strict';

describe('Service: ValidationService', function () {

  var scope;

  // load the controller's module
  beforeEach(angular.mock.module('artic'));

  beforeEach(angular.mock.inject(function ($httpBackend, $rootScope, ValidationService) {
    scope = $rootScope.$new();
    $httpBackend.whenGET("schemaFiles/annotationFileSchema.json").respond(annotationFileSchema);
    $httpBackend.whenGET("schemaFiles/articConfigSchema.json").respond(articConfigSchema);
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
    spyOn(ValidationService, 'getSchema').mockReturnValue({
      name: 'test',
      data: {}
    });
    expect(ValidationService.validateJSO('articConfigSchema', 'test')).toEqual(true);
  }));

  /**
   *
   */
  it('should validateJSO', angular.mock.inject(function (ValidationService) {
    spyOn(ValidationService, 'getSchema').mockReturnValue(undefined);
    expect(ValidationService.validateJSO('articConfigSchema', 'test')).toEqual('Schema: articConfigSchema is currently undefined! This is probably due to a misnamed schema file on the server...');
  }));

  /**
   *
   */
  it('should getSchema', angular.mock.inject(function (ValidationService) {
    // schema's not loaded yet... mabye write test with loaded schema too
    expect(ValidationService.getSchema('articConfigSchema')).toEqual(undefined);
  }));

  /**
   *
   */
  it('should semCheckLoadedConfig', angular.mock.inject(function (ValidationService, ConfigProviderService) {
    // set default
    ConfigProviderService.setVals(defaultArticConfig);

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
    expect(res).toMatch(/EMUwebAppConfig\/perspectives\/signalCanvases\/order/);

    // fail on self assignment
    tmpDBconfig = angular.copy(aeDbConfig);
    tmpDBconfig.EMUwebAppConfig.perspectives[0].signalCanvases.assign[0] = {
      'signalCanvasName': 'fundFreq',
      'ssffTrackName': 'fundFreq'
    };
    res = ValidationService.semCheckLoadedConfigs(tmpDBconfig.EMUwebAppConfig, tmpDBconfig);
    expect(res).toMatch(/EMUwebAppConfig\/perspectives\/signalCanvases\/assign/);
    
    // fail on OSCI or SPEC assignment
    tmpDBconfig = angular.copy(aeDbConfig);
    tmpDBconfig.EMUwebAppConfig.perspectives[0].signalCanvases.assign[0] = {
      'signalCanvasName': 'OSCI',
      'ssffTrackName': 'SPEC'
    };
    res = ValidationService.semCheckLoadedConfigs(tmpDBconfig.EMUwebAppConfig, tmpDBconfig);
    expect(res).toMatch(/EMUwebAppConfig\/perspectives\/signalCanvases\/assign/);

    tmpDBconfig = angular.copy(aeDbConfig);
    tmpDBconfig.EMUwebAppConfig.perspectives[0].signalCanvases.assign[0] = {
      'signalCanvasName': 'SPEC',
      'ssffTrackName': 'OSCI'
    };
    res = ValidationService.semCheckLoadedConfigs(tmpDBconfig.EMUwebAppConfig, tmpDBconfig);
    expect(res).toMatch(/EMUwebAppConfig\/perspectives\/signalCanvases\/assign/);


    // fail on undefined assignment
    tmpDBconfig = angular.copy(aeDbConfig);
    tmpDBconfig.EMUwebAppConfig.perspectives[0].signalCanvases.assign[0] = {
      'signalCanvasName': 'fundFreq',
      'ssffTrackName': 'fundFreqsadf'
    };
    res = ValidationService.semCheckLoadedConfigs(tmpDBconfig.EMUwebAppConfig, tmpDBconfig);
    expect(res).toMatch(/EMUwebAppConfig\/perspectives\/signalCanvases\/assign/);

    // fail on not displayed assignment
    tmpDBconfig = angular.copy(aeDbConfig);
    tmpDBconfig.EMUwebAppConfig.perspectives[0].signalCanvases.assign[0] = {
      'signalCanvasName': 'dftSpec',
      'ssffTrackName': 'fundFreq'
    };
    res = ValidationService.semCheckLoadedConfigs(tmpDBconfig.EMUwebAppConfig, tmpDBconfig);
    expect(res).toMatch(/EMUwebAppConfig\/perspectives\/signalCanvases\/assign/);

    // fail on undefined contourLims
    tmpDBconfig = angular.copy(aeDbConfig);
    tmpDBconfig.EMUwebAppConfig.perspectives[0].signalCanvases.contourLims[0].ssffTrackName = 'undefinedTrackName';
    res = ValidationService.semCheckLoadedConfigs(tmpDBconfig.EMUwebAppConfig, tmpDBconfig);
    expect(res).toMatch(/EMUwebAppConfig\/perspectives\/signalCanvases\/contourLims/);
  
    // fail on not displayed contourLims
    tmpDBconfig = angular.copy(aeDbConfig);
    tmpDBconfig.EMUwebAppConfig.perspectives[0].signalCanvases.contourLims[0].ssffTrackName = 'dftSpec';
    res = ValidationService.semCheckLoadedConfigs(tmpDBconfig.EMUwebAppConfig, tmpDBconfig);
    expect(res).toMatch(/EMUwebAppConfig\/perspectives\/signalCanvases\/contourLims/);

    // fail on undefined level name
    tmpDBconfig = angular.copy(aeDbConfig);
    tmpDBconfig.EMUwebAppConfig.perspectives[0].levelCanvases.order[0] = 'undefinedLevelName';
    res = ValidationService.semCheckLoadedConfigs(tmpDBconfig.EMUwebAppConfig, tmpDBconfig);
    expect(res).toMatch(/EMUwebAppConfig\/perspectives\/levelCanvases\/order/);

    // fail on ITEM level displayed
    tmpDBconfig = angular.copy(aeDbConfig);
    tmpDBconfig.EMUwebAppConfig.perspectives[0].levelCanvases.order[0] = 'Syllable';
    res = ValidationService.semCheckLoadedConfigs(tmpDBconfig.EMUwebAppConfig, tmpDBconfig);
    expect(res).toMatch(/EMUwebAppConfig\/perspectives\/levelCanvases\/order/);
    
    // fail on undefined track in twoDimCanvases
    tmpDBconfig = angular.copy(emaDbConfig);
    ConfigProviderService.curDbConfig = tmpDBconfig;
    tmpDBconfig.EMUwebAppConfig.perspectives[0].twoDimCanvases.twoDimDrawingDefinitions[0].dots[0].xSsffTrack = 'undefinedTrackName';
    res = ValidationService.semCheckLoadedConfigs(tmpDBconfig.EMUwebAppConfig, tmpDBconfig);
    expect(res).toMatch(/EMUwebAppConfig\/perspectives\/twoDimCanvases\/twoDimDrawingDefinitions\/dots/);

    // fail on undefined dot in connectLines
    tmpDBconfig = angular.copy(emaDbConfig);
    ConfigProviderService.curDbConfig = tmpDBconfig;
    tmpDBconfig.EMUwebAppConfig.perspectives[0].twoDimCanvases.twoDimDrawingDefinitions[0].connectLines[0].fromDot = 'undefinedDotName';
    res = ValidationService.semCheckLoadedConfigs(tmpDBconfig.EMUwebAppConfig, tmpDBconfig);
    expect(res).toMatch(/EMUwebAppConfig\/perspectives\/twoDimCanvases\/twoDimDrawingDefinitions\/connectLines/);

    // fail on static dots array of not the same length
    tmpDBconfig = angular.copy(emaDbConfig);
    ConfigProviderService.curDbConfig = tmpDBconfig;
    tmpDBconfig.EMUwebAppConfig.perspectives[1].twoDimCanvases.twoDimDrawingDefinitions[0].staticDots[0].xCoordinates = [1,2,3,4];
    res = ValidationService.semCheckLoadedConfigs(tmpDBconfig.EMUwebAppConfig, tmpDBconfig);
    expect(res).toMatch(/EMUwebAppConfig\/perspectives\/twoDimCanvases\/twoDimDrawingDefinitions\/staticDots/);

  }));

  /**
   * Test duplicate attributeDefinition names in levelDefinitions
   */
  it('should fail semCheckLoadedConfigs on duplicate attributeDefinition names', angular.mock.inject(function (ValidationService, ConfigProviderService) {
    ConfigProviderService.setVals(defaultArticConfig);
    var tmpDBconfig = angular.copy(aeDbConfig);
    ConfigProviderService.curDbConfig = tmpDBconfig;

    // inject a duplicate attributeDefinition name into the first levelDefinition
    var firstLevel = tmpDBconfig.levelDefinitions[0];
    var dupName = firstLevel.attributeDefinitions[0].name;
    firstLevel.attributeDefinitions.push({ name: dupName, type: 'STRING' });

    var res = ValidationService.semCheckLoadedConfigs(tmpDBconfig.EMUwebAppConfig, tmpDBconfig);
    expect(res).toMatch(/duplicate attribute definitions/);
  }));

  /**
   * Test validateJSO returns tv4 error object when schema validation fails
   */
  it('should return tv4 error when schema validation fails against a real schema', angular.mock.inject(function (ValidationService) {
    // set a schema with a required property
    var strictSchema = {
      name: 'schemaFiles/testStrictSchema.json',
      data: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string' }
        }
      }
    };
    spyOn(ValidationService, 'getSchema').mockReturnValue(strictSchema);

    // pass an object missing the required 'name' field
    var res = ValidationService.validateJSO('testStrictSchema', { notName: 123 });
    // tv4 returns an error object with a message property
    expect(res).not.toEqual(true);
    expect(res.message).toBeDefined();
    expect(res.message).toMatch(/name/);
  }));

  /**
   * Test semCheckLoadedConfigs with undefined toDot in connectLines
   */
  it('should fail semCheckLoadedConfigs on undefined toDot in connectLines', angular.mock.inject(function (ValidationService, ConfigProviderService) {
    ConfigProviderService.setVals(defaultArticConfig);
    var tmpDBconfig = angular.copy(emaDbConfig);
    ConfigProviderService.curDbConfig = tmpDBconfig;

    tmpDBconfig.EMUwebAppConfig.perspectives[0].twoDimCanvases.twoDimDrawingDefinitions[0].connectLines[0].toDot = 'nonExistentDot';
    var res = ValidationService.semCheckLoadedConfigs(tmpDBconfig.EMUwebAppConfig, tmpDBconfig);
    expect(res).toMatch(/toDot that are not defined/);
  }));


});