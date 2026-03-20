'use strict';

describe('Factory: ViewStateService', function () {

  // load the controller's module
  beforeEach(angular.mock.module('artic'));

  /**
   *
   */
  it('should initialize ViewStateService correctly', angular.mock.inject(function (ViewStateService) {
    ViewStateService.initialize();

    // curViewPort
    expect(ViewStateService.curViewPort.sS).toEqual(0);
    expect(ViewStateService.curViewPort.eS).toEqual(0);
    expect(ViewStateService.curViewPort.selectS).toEqual(-1);
    expect(ViewStateService.curViewPort.selectE).toEqual(-1);
    expect(ViewStateService.curViewPort.dragBarActive).toEqual(false);
    expect(ViewStateService.curViewPort.dragBarHeight).toEqual(-1);

    // spectroSettings
    expect(ViewStateService.spectroSettings.windowSizeInSecs).toBe(-1);
    expect(ViewStateService.spectroSettings.rangeFrom).toBe(-1);
    expect(ViewStateService.spectroSettings.rangeTo).toBe(-1);
    expect(ViewStateService.spectroSettings.dynamicRange).toBe(-1);
    expect(ViewStateService.spectroSettings.window).toBe(-1);
    expect(ViewStateService.spectroSettings.drawHeatMapColors).toBe(-1);
    expect(ViewStateService.spectroSettings.preEmphasisFilterFactor).toBe(-1);

    // playHeadAnimationInfos
    expect(ViewStateService.playHeadAnimationInfos.sS).toEqual(-1);
    expect(ViewStateService.playHeadAnimationInfos.eS).toEqual(-1);
    expect(ViewStateService.playHeadAnimationInfos.curS).toEqual(null);
    expect(ViewStateService.playHeadAnimationInfos.endFreezeSample).toEqual(-1);
  }));

  /**
   *
   */
  it('should resetToInitState', angular.mock.inject(function (ViewStateService) {
    ViewStateService.resetToInitState();

    // curViewPort
    expect(ViewStateService.curViewPort.sS).toEqual(0);
    expect(ViewStateService.curViewPort.eS).toEqual(0);
    expect(ViewStateService.curViewPort.selectS).toEqual(-1);
    expect(ViewStateService.curViewPort.selectE).toEqual(-1);
    expect(ViewStateService.curViewPort.dragBarActive).toEqual(false);
    expect(ViewStateService.curViewPort.dragBarHeight).toEqual(-1);

    // spectroSettings
    expect(ViewStateService.spectroSettings.windowSizeInSecs).toBe(-1);
    expect(ViewStateService.spectroSettings.rangeFrom).toBe(-1);
    expect(ViewStateService.spectroSettings.rangeTo).toBe(-1);
    expect(ViewStateService.spectroSettings.dynamicRange).toBe(-1);
    expect(ViewStateService.spectroSettings.window).toBe(-1);
    expect(ViewStateService.spectroSettings.drawHeatMapColors).toBe(-1);
    expect(ViewStateService.spectroSettings.preEmphasisFilterFactor).toBe(-1);

    // playHeadAnimationInfos
    expect(ViewStateService.playHeadAnimationInfos.sS).toEqual(-1);
    expect(ViewStateService.playHeadAnimationInfos.eS).toEqual(-1);
    expect(ViewStateService.playHeadAnimationInfos.curS).toEqual(null);
    expect(ViewStateService.playHeadAnimationInfos.endFreezeSample).toEqual(-1);
  }));

  /**
   *
   */
  it('should select viewPort', angular.mock.inject(function (ViewStateService) {
    ViewStateService.select(10, 100);
    expect(ViewStateService.curViewPort.selectS).toEqual(10);
    expect(ViewStateService.curViewPort.selectE).toEqual(100);
  }));

  /**
   *
   */
  it('should resetSelect viewPort', angular.mock.inject(function (ViewStateService) {
    ViewStateService.resetSelect()
    expect(ViewStateService.curViewPort.selectS).toEqual(-1);
    expect(ViewStateService.curViewPort.selectE).toEqual(-1);
  }));

  /**
   *
   */
  it('should getViewPort', angular.mock.inject(function (ViewStateService) {
    var vp = ViewStateService.getViewPort()
    expect(ViewStateService.curViewPort.selectS).toBeDefined();
    expect(ViewStateService.curViewPort.selectE).toBeDefined();
  }));

  /**
   *
   */
  it('should setspectroSettings', angular.mock.inject(function (ViewStateService) {
    var vp = ViewStateService.setspectroSettings(0.01, '10', '100', '10', 'HANN', true, 1)
    expect(ViewStateService.spectroSettings.windowSizeInSecs).toBe(0.01);
    expect(ViewStateService.spectroSettings.rangeFrom).toBe(10);
    expect(ViewStateService.spectroSettings.rangeTo).toBe(100);
    expect(ViewStateService.spectroSettings.dynamicRange).toBe(10);
    expect(ViewStateService.spectroSettings.window).toBe(7); // 7 equals HANN
    expect(ViewStateService.spectroSettings.drawHeatMapColors).toBe(true);
    expect(ViewStateService.spectroSettings.preEmphasisFilterFactor).toBe(1);
  }));

  /**
   *
   */
  it('should getSelect as array', angular.mock.inject(function (ViewStateService) {
    ViewStateService.select(10, 100);
    expect(ViewStateService.getSelect()).toEqual([10, 100]);
  }));

  /**
   *
   */
  it('should selectDependent', angular.mock.inject(function (ViewStateService) {
    ViewStateService.select(10, 100);
    ViewStateService.selectDependent(50, 100);
    expect(ViewStateService.getSelect()).toEqual([10, 100]);
    ViewStateService.selectDependent(5, 50);
    expect(ViewStateService.getSelect()).toEqual([5, 100]);
    ViewStateService.selectDependent(5, 200);
    expect(ViewStateService.getSelect()).toEqual([5, 200]);
  }));

  /**
   *
   */
  it('should selectLevel', angular.mock.inject(function (ViewStateService, LevelService, DataService) {
    DataService.setData(msajc003_bndl.annotation);
    ViewStateService.selectLevel(true, ["Phonetic", "Tone"], LevelService);
    expect(ViewStateService.curClickLevelName).toEqual('Tone');
    expect(ViewStateService.curClickLevelType).toEqual('EVENT');
    ViewStateService.selectLevel(false, ["Phonetic", "Tone"], LevelService);
    expect(ViewStateService.curClickLevelName).toEqual('Phonetic');
    expect(ViewStateService.curClickLevelType).toEqual('SEGMENT');
    ViewStateService.selectLevel(false, ["Phonetic", "Tone"], LevelService);
    ViewStateService.selectLevel(false, ["Phonetic", "Tone"], LevelService);
    ViewStateService.selectLevel(false, ["Phonetic", "Tone"], LevelService);
    expect(ViewStateService.curClickLevelName).toEqual('Phonetic');
    expect(ViewStateService.curClickLevelType).toEqual('SEGMENT');
  }));

  /**
   *
   */
  it('should selectItemsInSelection', angular.mock.inject(function (ViewStateService, LevelService, DataService) {
    DataService.setData(msajc003_bndl.annotation);
    ViewStateService.selectLevel(false, ["Phonetic", "Tone"], LevelService);
    ViewStateService.select(3300, 7000);
    var curClickItems = [];
    var min = Infinity;
    var max = -Infinity;
    var itemInSel = ViewStateService.getItemsInSelection(DataService.data.levels);
    var prev = null;
    angular.forEach(itemInSel, function (item) {
      if ((item.sampleStart || item.samplePoint) < min) {
        min = item.sampleStart || item.samplePoint;
      }
      if (((item.sampleStart + item.sampleDur + 1) || item.samplePoint) > max) {
        max = (item.sampleStart + item.sampleDur + 1) || item.samplePoint;
      }
      if(prev === null) {
      	ViewStateService.setcurClickItem(item);
      }
      else {
        ViewStateService.setcurClickItemMultiple(item, prev);
      }
      prev = item;
    });
    ViewStateService.selectBoundary();
    expect(ViewStateService.curClickItems.length).toEqual(2);
    expect(ViewStateService.curClickItems[0].labels[0].value).toEqual('V');
    expect(ViewStateService.curClickItems[1].labels[0].value).toEqual('m');
  }));


  /**
   *
   */
  it('should getselectedRange', angular.mock.inject(function (ViewStateService, LevelService, DataService) {
    var range = ViewStateService.getselectedRange();
    expect(range.start).toEqual(-1);
    expect(range.end).toEqual(-1);
    DataService.setData(msajc003_bndl.annotation);
    ViewStateService.selectLevel(false, ['Phonetic', 'Tone'], LevelService);
    ViewStateService.select(10, 9700);
    var curClickItems = [];
    var min = Infinity;
    var max = -Infinity;
    var itemInSel = ViewStateService.getItemsInSelection(DataService.data.levels);
    var prev = null;
    angular.forEach(itemInSel, function (item) {
      if ((item.sampleStart || item.samplePoint) < min) {
        min = item.sampleStart || item.samplePoint;
      }
      if (((item.sampleStart + item.sampleDur + 1) || item.samplePoint) > max) {
        max = (item.sampleStart + item.sampleDur + 1) || item.samplePoint;
      }
      if(prev === null) {
      	ViewStateService.setcurClickItem(item);
      }
      else {
      	ViewStateService.setcurClickItemMultiple(item, prev);
      }
      prev = item;
    });
    ViewStateService.selectBoundary();
    range = ViewStateService.getselectedRange();
    expect(range.start).toEqual(3750);
    expect(range.end).toEqual(9669);
  }));

  /**
   *
   */
  it('should setViewPort', angular.mock.inject(function (ViewStateService, LevelService, SoundHandlerService) {
    SoundHandlerService.audioBuffer.length = 58089;
    ViewStateService.setViewPort(20156, 34679);
    expect(ViewStateService.curViewPort.sS).toEqual(20156);
    expect(ViewStateService.curViewPort.eS).toEqual(34679);
    // too small
    ViewStateService.setViewPort(20156, 20158);
    expect(ViewStateService.curViewPort.sS).toEqual(20156);
    expect(ViewStateService.curViewPort.eS).toEqual(34679);
    // out of rang
    ViewStateService.setViewPort(-100000000000, 100000000000);
    expect(ViewStateService.curViewPort.sS).toEqual(0);
    expect(ViewStateService.curViewPort.eS).toEqual(58089);
  }));

  /**
   *
   */
  it('should zoomViewPort', angular.mock.inject(function (ViewStateService, DataService, LevelService, SoundHandlerService) {
    DataService.setData(msajc003_bndl.annotation);
    SoundHandlerService.audioBuffer.length = 58089;

    ViewStateService.setViewPort(0, 58089);
    ViewStateService.zoomViewPort(true, LevelService);
    ViewStateService.zoomViewPort(true, LevelService);
    expect(ViewStateService.curViewPort.sS).toEqual(21783);
    expect(ViewStateService.curViewPort.eS).toEqual(36306);
    ViewStateService.zoomViewPort(false, LevelService);
    ViewStateService.zoomViewPort(false, LevelService);
    ViewStateService.zoomViewPort(false, LevelService);
    ViewStateService.zoomViewPort(false, LevelService);
    expect(ViewStateService.curViewPort.sS).toEqual(0);
    expect(ViewStateService.curViewPort.eS).toEqual(58089);
  }));

  /**
   *
   */
  it('should shiftViewPort', angular.mock.inject(function (ViewStateService, DataService, LevelService) {
    DataService.setData(msajc003_bndl.annotation);
    ViewStateService.setViewPort(0, 58089);
    ViewStateService.zoomViewPort(true, LevelService);
    ViewStateService.zoomViewPort(true, LevelService);
    expect(ViewStateService.curViewPort.sS).toEqual(21783);
    expect(ViewStateService.curViewPort.eS).toEqual(36306);
    ViewStateService.shiftViewPort(true);
    expect(ViewStateService.curViewPort.sS).toEqual(25413);
    expect(ViewStateService.curViewPort.eS).toEqual(39936);
    ViewStateService.shiftViewPort(false);
    expect(ViewStateService.curViewPort.sS).toEqual(21783);
    expect(ViewStateService.curViewPort.eS).toEqual(36306);
  }));

  /**
   *
   */
  it('should calculate correct samplesPerPxl value', angular.mock.inject(function (ViewStateService) {
    ViewStateService.initialize();
    ViewStateService.curViewPort.eS = 100;
    // mock event:
    var evt = {};
    evt.originalEvent = {};
    evt.originalEvent.target = {};
    evt.originalEvent.target.width = 50;
    expect(ViewStateService.getSamplesPerPixelVal(evt)).toEqual(2);
    evt.originalEvent.target.width = 200;
    expect(ViewStateService.getSamplesPerPixelVal(evt)).toEqual(0.5);
  }));

  /**
   *
   */
  it('should setCurAttrDef', angular.mock.inject(function (ViewStateService) {
    ViewStateService.initialize();
    ViewStateService.curLevelAttrDefs = [{
      levelName: 'test',
      curAttrDefName: '',
      curAttrDefIndex: -1
    }];
    ViewStateService.setCurAttrDef('test', 'test1', 1)
    expect(ViewStateService.curLevelAttrDefs[0].curAttrDefName).toEqual('test1');
    expect(ViewStateService.curLevelAttrDefs[0].curAttrDefIndex).toEqual(1);
  }));


  /**
   *
   */
  it('should setWindowFunction', angular.mock.inject(function (ViewStateService) {
    /*
        BARTLETT: 1,
        BARTLETTHANN: 2,
        BLACKMAN: 3,
        COSINE: 4,
        GAUSS: 5,
        HAMMING: 6,
        HANN: 7,
        LANCZOS: 8,
        RECTANGULAR: 9,
        TRIANGULAR: 10
      */
    ViewStateService.initialize();
    ViewStateService.setWindowFunction('BARTLETT');
    expect(ViewStateService.spectroSettings.window).toEqual(1);
    ViewStateService.setWindowFunction('BARTLETTHANN');
    expect(ViewStateService.spectroSettings.window).toEqual(2);
    ViewStateService.setWindowFunction('BLACKMAN');
    expect(ViewStateService.spectroSettings.window).toEqual(3);
    ViewStateService.setWindowFunction('COSINE');
    expect(ViewStateService.spectroSettings.window).toEqual(4);
    ViewStateService.setWindowFunction('GAUSS');
    expect(ViewStateService.spectroSettings.window).toEqual(5);
    ViewStateService.setWindowFunction('HAMMING');
    expect(ViewStateService.spectroSettings.window).toEqual(6);
    ViewStateService.setWindowFunction('HANN');
    expect(ViewStateService.spectroSettings.window).toEqual(7);
    ViewStateService.setWindowFunction('LANCZOS');
    expect(ViewStateService.spectroSettings.window).toEqual(8);
    ViewStateService.setWindowFunction('RECTANGULAR');
    expect(ViewStateService.spectroSettings.window).toEqual(9);
    ViewStateService.setWindowFunction('TRIANGULAR');
    expect(ViewStateService.spectroSettings.window).toEqual(10);

  }));

  /**
   *
   */
  it('should zoomViewPort with seg', angular.mock.inject(function (ViewStateService, DataService, LevelService, SoundHandlerService) {
    ViewStateService.initialize();
    DataService.setData(msajc003_bndl.annotation);
    ViewStateService.setViewPort(0, 58089);
    spyOn(ViewStateService, 'setViewPort');
    var lastEventMove = LevelService.getClosestItem(5000, 'Phonetic', 58089);
    var lastNeighboursMove = LevelService.getItemNeighboursFromLevel('Phonetic', lastEventMove.nearest.id, lastEventMove.nearest.id);
    ViewStateService.setcurMouseItem(lastEventMove.nearest, lastNeighboursMove, 5000, lastEventMove.isFirst, lastEventMove.isLast);
    ViewStateService.zoomViewPort(true, LevelService);
  }));


});
