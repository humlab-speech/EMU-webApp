'use strict';

describe('Use Case: Viewport & Selection Navigation', function () {

  beforeEach(angular.mock.module('artic'));

  beforeEach(angular.mock.inject(function (SoundHandlerService) {
    SoundHandlerService.audioBuffer = { length: 58089, sampleRate: 20000 };
  }));

  describe('viewport management', function () {

    it('should initialize viewport to default values', angular.mock.inject(function (ViewStateService) {
      ViewStateService.initialize();
      expect(ViewStateService.curViewPort.sS).toEqual(0);
      expect(ViewStateService.curViewPort.eS).toEqual(0);
      expect(ViewStateService.curViewPort.selectS).toEqual(-1);
      expect(ViewStateService.curViewPort.selectE).toEqual(-1);
      expect(ViewStateService.curViewPort.movingS).toEqual(-1);
      expect(ViewStateService.curViewPort.movingE).toEqual(-1);
      expect(ViewStateService.curViewPort.dragBarActive).toEqual(false);
      expect(ViewStateService.curViewPort.dragBarHeight).toEqual(-1);
    }));

    it('should set and read viewport start/end', angular.mock.inject(function (ViewStateService) {
      ViewStateService.setViewPort(100, 5000);
      expect(ViewStateService.curViewPort.sS).toEqual(100);
      expect(ViewStateService.curViewPort.eS).toEqual(5000);
    }));

    it('should store viewport with fractional positions (rounds to int)', angular.mock.inject(function (ViewStateService) {
      ViewStateService.setViewPort(100.7, 5000.3);
      expect(ViewStateService.curViewPort.sS).toEqual(101);
      expect(ViewStateService.curViewPort.eS).toEqual(5000);
    }));
  });

  describe('selection', function () {

    it('should set selection start and end', angular.mock.inject(function (ViewStateService) {
      ViewStateService.select(200, 3000);
      expect(ViewStateService.curViewPort.selectS).toEqual(200);
      expect(ViewStateService.curViewPort.selectE).toEqual(3000);
    }));

    it('should have default selection at initial values', angular.mock.inject(function (ViewStateService) {
      ViewStateService.initialize();
      expect(ViewStateService.curViewPort.selectS).toEqual(-1);
      expect(ViewStateService.curViewPort.selectE).toEqual(-1);
    }));

    it('should reset selection via resetSelect', angular.mock.inject(function (ViewStateService) {
      ViewStateService.select(200, 3000);
      ViewStateService.resetSelect();
      expect(ViewStateService.curViewPort.selectS).toEqual(-1);
      expect(ViewStateService.curViewPort.selectE).toEqual(-1);
    }));
  });

  describe('cursor and click tracking', function () {

    it('should track current perspective index', angular.mock.inject(function (ViewStateService) {
      ViewStateService.initialize();
      expect(ViewStateService.curPerspectiveIdx).toEqual(-1);
      ViewStateService.curPerspectiveIdx = 2;
      expect(ViewStateService.curPerspectiveIdx).toEqual(2);
    }));

    it('should set and get curLevelAttrDefs', angular.mock.inject(function (ViewStateService) {
      ViewStateService.setCurLevelAttrDefs(angular.copy(aeDbConfig.levelDefinitions));
      expect(ViewStateService.curLevelAttrDefs.length).toBeGreaterThan(0);
      expect(ViewStateService.curLevelAttrDefs[0].levelName).toBeDefined();
      expect(ViewStateService.curLevelAttrDefs[0].curAttrDefName).toBeDefined();
    }));
  });

  describe('state transitions', function () {

    it('should track editing state changes', angular.mock.inject(function (ViewStateService) {
      ViewStateService.initialize();
      expect(ViewStateService.editing).toBe(false);
      ViewStateService.editing = true;
      expect(ViewStateService.editing).toBe(true);
      ViewStateService.editing = false;
      expect(ViewStateService.editing).toBe(false);
    }));

    it('should maintain viewport across level selections', angular.mock.inject(function (ViewStateService, DataService, LevelService) {
      DataService.setData(angular.copy(msajc003_bndl.annotation));
      ViewStateService.setViewPort(500, 10000);
      ViewStateService.selectLevel(true, ['Phonetic', 'Tone'], LevelService);
      expect(ViewStateService.curViewPort.sS).toEqual(500);
      expect(ViewStateService.curViewPort.eS).toEqual(10000);
    }));
  });
});
