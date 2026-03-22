'use strict';

describe('Use Case: Validation Pipeline', function () {

  beforeEach(angular.mock.module('artic'));

  describe('valid configurations pass semCheck', function () {

    it('should pass semCheckLoadedConfigs for ae database', angular.mock.inject(function (ValidationService, ConfigProviderService) {
      var config = angular.copy(defaultArticConfig);
      config.perspectives = aeDbConfig.EMUwebAppConfig.perspectives;
      ConfigProviderService.setVals(config);
      ConfigProviderService.curDbConfig = angular.copy(aeDbConfig);
      var result = ValidationService.semCheckLoadedConfigs(ConfigProviderService.vals, ConfigProviderService.curDbConfig);
      expect(result).toBe(true);
    }));

    it('should pass semCheckLoadedConfigs for ema database', angular.mock.inject(function (ValidationService, ConfigProviderService) {
      var config = angular.copy(defaultArticConfig);
      config.perspectives = emaDbConfig.EMUwebAppConfig.perspectives;
      ConfigProviderService.setVals(config);
      ConfigProviderService.curDbConfig = angular.copy(emaDbConfig);
      var result = ValidationService.semCheckLoadedConfigs(ConfigProviderService.vals, ConfigProviderService.curDbConfig);
      expect(result).toBe(true);
    }));

    it('should pass semCheckLoadedConfigs for epgdorsal database', angular.mock.inject(function (ValidationService, ConfigProviderService) {
      var config = angular.copy(defaultArticConfig);
      config.perspectives = epgdorsalDbConfig.EMUwebAppConfig.perspectives;
      ConfigProviderService.setVals(config);
      ConfigProviderService.curDbConfig = angular.copy(epgdorsalDbConfig);
      var result = ValidationService.semCheckLoadedConfigs(ConfigProviderService.vals, ConfigProviderService.curDbConfig);
      expect(result).toBe(true);
    }));

  });

  describe('invalid mutations are caught', function () {

    it('should catch undefined signal track in perspective order', angular.mock.inject(function (ValidationService, ConfigProviderService) {
      var config = angular.copy(defaultArticConfig);
      config.perspectives = aeDbConfig.EMUwebAppConfig.perspectives;
      ConfigProviderService.setVals(config);
      var dbConfig = angular.copy(aeDbConfig);
      ConfigProviderService.curDbConfig = dbConfig;

      dbConfig.EMUwebAppConfig.perspectives[0].signalCanvases.order[0] = 'nonExistentTrack';
      var result = ValidationService.semCheckLoadedConfigs(dbConfig.EMUwebAppConfig, dbConfig);
      expect(typeof result).toBe('string');
      expect(result).toContain('Error');
    }));

    it('should catch self-assignment in signalCanvases assign', angular.mock.inject(function (ValidationService, ConfigProviderService) {
      var config = angular.copy(defaultArticConfig);
      config.perspectives = aeDbConfig.EMUwebAppConfig.perspectives;
      ConfigProviderService.setVals(config);
      var dbConfig = angular.copy(aeDbConfig);
      ConfigProviderService.curDbConfig = dbConfig;

      dbConfig.EMUwebAppConfig.perspectives[0].signalCanvases.assign[0] = {
        'signalCanvasName': 'fundFreq',
        'ssffTrackName': 'fundFreq'
      };
      var result = ValidationService.semCheckLoadedConfigs(dbConfig.EMUwebAppConfig, dbConfig);
      expect(typeof result).toBe('string');
      expect(result).toContain('Error');
    }));

    it('should catch undefined level in levelCanvases order', angular.mock.inject(function (ValidationService, ConfigProviderService) {
      var config = angular.copy(defaultArticConfig);
      config.perspectives = aeDbConfig.EMUwebAppConfig.perspectives;
      ConfigProviderService.setVals(config);
      var dbConfig = angular.copy(aeDbConfig);
      ConfigProviderService.curDbConfig = dbConfig;

      dbConfig.EMUwebAppConfig.perspectives[0].levelCanvases.order[0] = 'nonExistentLevel';
      var result = ValidationService.semCheckLoadedConfigs(dbConfig.EMUwebAppConfig, dbConfig);
      expect(typeof result).toBe('string');
      expect(result).toContain('Error');
    }));

    it('should catch ITEM type level in levelCanvases order', angular.mock.inject(function (ValidationService, ConfigProviderService) {
      var config = angular.copy(defaultArticConfig);
      config.perspectives = aeDbConfig.EMUwebAppConfig.perspectives;
      ConfigProviderService.setVals(config);
      var dbConfig = angular.copy(aeDbConfig);
      ConfigProviderService.curDbConfig = dbConfig;

      dbConfig.EMUwebAppConfig.perspectives[0].levelCanvases.order[0] = 'Syllable';
      var result = ValidationService.semCheckLoadedConfigs(dbConfig.EMUwebAppConfig, dbConfig);
      expect(typeof result).toBe('string');
      expect(result).toContain('Error');
    }));

  });

  describe('end-to-end validation', function () {

    it('should validate ae bundle annotation and config together', angular.mock.inject(function (ValidationService, ConfigProviderService) {
      ValidationService.setSchemas([
        { config: { url: 'schemaFiles/annotationFileSchema.json' }, data: annotationFileSchema }
      ]);

      var config = angular.copy(defaultArticConfig);
      config.perspectives = aeDbConfig.EMUwebAppConfig.perspectives;
      ConfigProviderService.setVals(config);
      var dbConfig = angular.copy(aeDbConfig);
      ConfigProviderService.curDbConfig = dbConfig;

      var annotation = angular.copy(msajc003_bndl.annotation);
      var schemaResult = ValidationService.validateJSO('annotationFileSchema', annotation);
      expect(schemaResult).toBe(true);

      var semResult = ValidationService.semCheckLoadedConfigs(ConfigProviderService.vals, ConfigProviderService.curDbConfig);
      expect(semResult).toBe(true);
    }));

    it('should detect error when perspective references removed level', angular.mock.inject(function (ValidationService, ConfigProviderService) {
      var config = angular.copy(defaultArticConfig);
      config.perspectives = aeDbConfig.EMUwebAppConfig.perspectives;
      ConfigProviderService.setVals(config);
      var dbConfig = angular.copy(aeDbConfig);
      ConfigProviderService.curDbConfig = dbConfig;

      // remove the first levelDefinition that is referenced in levelCanvases.order
      var referencedLevel = dbConfig.EMUwebAppConfig.perspectives[0].levelCanvases.order[0];
      dbConfig.levelDefinitions = dbConfig.levelDefinitions.filter(function (ld) {
        return ld.name !== referencedLevel;
      });

      var result = ValidationService.semCheckLoadedConfigs(dbConfig.EMUwebAppConfig, dbConfig);
      expect(typeof result).toBe('string');
      expect(result).toContain('Error');
    }));

  });

  describe('schema validation', function () {

    it('should validate the default artic config against its schema', angular.mock.inject(function (ValidationService) {
      ValidationService.setSchemas([
        { config: { url: 'schemaFiles/articConfigSchema.json' }, data: articConfigSchema }
      ]);

      var config = angular.copy(defaultArticConfig);
      var result = ValidationService.validateJSO('articConfigSchema', config);
      expect(result).toBe(true);
    }));

  });

});
