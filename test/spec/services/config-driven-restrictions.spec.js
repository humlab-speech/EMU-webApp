'use strict';

describe('Use Case: Config-Driven Behavior', function () {

  beforeEach(angular.mock.module('artic'));

  beforeEach(angular.mock.inject(function (ConfigProviderService, ViewStateService) {
    ConfigProviderService.setVals(angular.copy(defaultArticConfig));
    ConfigProviderService.curDbConfig = angular.copy(aeDbConfig);
    if (aeDbConfig.EMUwebAppConfig && aeDbConfig.EMUwebAppConfig.perspectives) {
      ConfigProviderService.vals.perspectives = aeDbConfig.EMUwebAppConfig.perspectives;
    }
    ViewStateService.curPerspectiveIdx = 0;
  }));

  describe('DB config properties', function () {

    it('should expose ssffTrackDefinitions from ae config', angular.mock.inject(function (ConfigProviderService) {
      expect(ConfigProviderService.curDbConfig.ssffTrackDefinitions).toBeDefined();
      expect(ConfigProviderService.curDbConfig.ssffTrackDefinitions.length).toBeGreaterThan(0);
    }));

    it('should expose levelDefinitions from ae config', angular.mock.inject(function (ConfigProviderService) {
      expect(ConfigProviderService.curDbConfig.levelDefinitions).toBeDefined();
      expect(ConfigProviderService.curDbConfig.levelDefinitions.length).toBeGreaterThan(0);
    }));

    it('should return correct ssffTrackConfig by name', angular.mock.inject(function (ConfigProviderService) {
      var track = ConfigProviderService.getSsffTrackConfig('FORMANTS');
      expect(track.name).toBe('FORMANTS');
      expect(track.columnName).toBe('fm');
      expect(track.fileExtension).toBe('fms');
    }));
  });

  describe('perspective-based level configuration', function () {

    it('should have perspectives defined in ae EMUwebAppConfig', angular.mock.inject(function (ConfigProviderService) {
      expect(ConfigProviderService.vals.perspectives).toBeDefined();
      expect(ConfigProviderService.vals.perspectives.length).toBeGreaterThan(0);
      expect(ConfigProviderService.vals.perspectives[0].name).toBe('default');
    }));

    it('should have levelCanvases order listing displayable levels', angular.mock.inject(function (ConfigProviderService) {
      var order = ConfigProviderService.vals.perspectives[0].levelCanvases.order;
      expect(order).toBeDefined();
      expect(order.length).toBeGreaterThan(0);
      expect(order).toContain('Phonetic');
      expect(order).toContain('Tone');
    }));

    it('should have signalCanvases order listing displayable signals', angular.mock.inject(function (ConfigProviderService) {
      var order = ConfigProviderService.vals.perspectives[0].signalCanvases.order;
      expect(order).toBeDefined();
      expect(order.length).toBeGreaterThan(0);
      expect(order).toContain('OSCI');
      expect(order).toContain('SPEC');
    }));
  });
});
