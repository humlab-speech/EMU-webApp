'use strict';

describe('Use Case: Bundle Load → Edit → Save Roundtrip', function () {

  var aetmpDBconfig, defaultArticConfigTmp, annotationCopy;

  beforeEach(angular.mock.module('artic'));

  beforeEach(angular.mock.inject(function (SoundHandlerService, ConfigProviderService, ViewStateService, DataService) {
    aetmpDBconfig = angular.copy(aeDbConfig);
    defaultArticConfigTmp = angular.copy(defaultArticConfig);
    ConfigProviderService.setVals(defaultArticConfigTmp);
    ConfigProviderService.curDbConfig = aetmpDBconfig;
    if (aetmpDBconfig.EMUwebAppConfig && aetmpDBconfig.EMUwebAppConfig.perspectives) {
      ConfigProviderService.vals.perspectives = aetmpDBconfig.EMUwebAppConfig.perspectives;
    }
    SoundHandlerService.audioBuffer = { length: 58089, sampleRate: 20000 };
    ViewStateService.setCurLevelAttrDefs(aetmpDBconfig.levelDefinitions);
    ViewStateService.curPerspectiveIdx = 0;
    annotationCopy = angular.copy(msajc003_bndl.annotation);
    DataService.setData(annotationCopy);
  }));

  describe('load and verify initial state', function () {

    it('should load bundle and verify 9 levels', angular.mock.inject(function (DataService) {
      expect(DataService.getLevelData().length).toEqual(9);
    }));

    it('should load bundle and verify link count', angular.mock.inject(function (DataService) {
      expect(DataService.getLinkData().length).toEqual(557);
    }));

    it('should compute correct maxItemID after load', angular.mock.inject(function (DataService) {
      expect(DataService.maxItemID).toEqual(187);
    }));
  });

  describe('edit tracking via movesAwayFromLastSave', function () {

    var renameChangeObj = {
      'type': 'ANNOT',
      'action': 'RENAMELABEL',
      'name': 'Phonetic',
      'id': 154,
      'attrIndex': 0,
      'oldValue': '@:',
      'newValue': 'X'
    };

    var moveChangeObj = {
      'type': 'ANNOT',
      'action': 'MOVEBOUNDARY',
      'name': 'Phonetic',
      'id': 155,
      'movedBy': 20,
      'position': 0
    };

    it('should start at movesAwayFromLastSave=0', angular.mock.inject(function (HistoryService) {
      expect(HistoryService.movesAwayFromLastSave).toEqual(0);
    }));

    it('should increment on label rename', angular.mock.inject(function (HistoryService, LevelService) {
      LevelService.renameLabel('Phonetic', 154, 0, 'X');
      HistoryService.addObjToUndoStack(angular.copy(renameChangeObj));
      expect(HistoryService.movesAwayFromLastSave).toEqual(1);
    }));

    it('should increment again on boundary move', angular.mock.inject(function (HistoryService, LevelService) {
      LevelService.renameLabel('Phonetic', 154, 0, 'X');
      HistoryService.addObjToUndoStack(angular.copy(renameChangeObj));
      HistoryService.addObjToUndoStack(angular.copy(moveChangeObj));
      expect(HistoryService.movesAwayFromLastSave).toEqual(2);
    }));

    it('should decrement on undo back to 0', angular.mock.inject(function (HistoryService, LevelService) {
      LevelService.renameLabel('Phonetic', 154, 0, 'X');
      HistoryService.addObjToUndoStack(angular.copy(renameChangeObj));
      HistoryService.addObjToUndoStack(angular.copy(moveChangeObj));
      expect(HistoryService.movesAwayFromLastSave).toEqual(2);
      HistoryService.undo();
      expect(HistoryService.movesAwayFromLastSave).toEqual(1);
      HistoryService.undo();
      expect(HistoryService.movesAwayFromLastSave).toEqual(0);
    }));
  });

  describe('save payload correctness', function () {

    it('should produce unchanged annotation after edit+undo cycle', angular.mock.inject(function (HistoryService, DataService, LevelService) {
      var originalAnnotation = angular.copy(DataService.getData());

      var changeObj = {
        'type': 'ANNOT',
        'action': 'RENAMELABEL',
        'name': 'Phonetic',
        'id': 154,
        'attrIndex': 0,
        'oldValue': '@:',
        'newValue': 'Z'
      };

      LevelService.renameLabel('Phonetic', 154, 0, 'Z');
      HistoryService.addObjToUndoStack(angular.copy(changeObj));
      expect(HistoryService.movesAwayFromLastSave).toEqual(1);

      HistoryService.undo();
      expect(HistoryService.movesAwayFromLastSave).toEqual(0);

      expect(DataService.getData()).toEqual(originalAnnotation);
    }));
  });
});
