'use strict';

describe('Use Case: Cross-Level Boundary Consistency', function () {

  beforeEach(angular.mock.module('artic'));

  var annotCopy;

  beforeEach(angular.mock.inject(function (ConfigProviderService, ViewStateService, DataService, SoundHandlerService) {
    ConfigProviderService.setVals(angular.copy(defaultArticConfig));
    ConfigProviderService.curDbConfig = angular.copy(aeDbConfig);
    if (aeDbConfig.EMUwebAppConfig && aeDbConfig.EMUwebAppConfig.perspectives) {
      ConfigProviderService.vals.perspectives = aeDbConfig.EMUwebAppConfig.perspectives;
    }
    ViewStateService.setCurLevelAttrDefs(aeDbConfig.levelDefinitions);
    ViewStateService.curPerspectiveIdx = 0;
    annotCopy = angular.copy(msajc003_bndl.annotation);
    DataService.setData(annotCopy);
    DataService.setLinkData(angular.copy(msajc003_bndl.annotation.links));
    SoundHandlerService.audioBuffer = { sampleRate: 20000, length: 58089 };
  }));

  describe('boundary move preserves link integrity', function () {

    it('should not change link count after moving a Phonetic boundary', angular.mock.inject(function (DataService, LevelService, HistoryService) {
      var linksBefore = DataService.getLinkData().length;

      LevelService.moveBoundary('Phonetic', 154, 10, 0);
      HistoryService.addObjToUndoStack({
        type: 'ANNOT', action: 'MOVEBOUNDARY', name: 'Phonetic',
        id: 154, movedBy: 10, position: 0
      });

      expect(DataService.getLinkData().length).toBe(linksBefore);
    }));

    it('should preserve all link fromID/toID references after boundary move', angular.mock.inject(function (DataService, LevelService, HistoryService) {
      var linksBefore = angular.copy(DataService.getLinkData());

      LevelService.moveBoundary('Phonetic', 154, 20, 0);
      HistoryService.addObjToUndoStack({
        type: 'ANNOT', action: 'MOVEBOUNDARY', name: 'Phonetic',
        id: 154, movedBy: 20, position: 0
      });

      var linksAfter = DataService.getLinkData();
      expect(linksAfter.length).toBe(linksBefore.length);
      for (var i = 0; i < linksBefore.length; i++) {
        expect(linksAfter[i].fromID).toBe(linksBefore[i].fromID);
        expect(linksAfter[i].toID).toBe(linksBefore[i].toID);
      }
    }));
  });

  describe('segment operations and link state', function () {

    it('should maintain link count after label rename', angular.mock.inject(function (DataService, LevelService, HistoryService) {
      var linksBefore = DataService.getLinkData().length;

      LevelService.renameLabel('Phonetic', 154, 0, 'RENAMED');
      HistoryService.addObjToUndoStack({
        type: 'ANNOT', action: 'RENAMELABEL', name: 'Phonetic',
        id: 154, attrIndex: 0, oldValue: LevelService.getItemFromLevelById('Phonetic', 154).labels[0].value, newValue: 'RENAMED'
      });

      expect(DataService.getLinkData().length).toBe(linksBefore);
    }));

    it('should maintain data integrity after move + rename + undo all', angular.mock.inject(function (DataService, LevelService, HistoryService) {
      var origItem = angular.copy(LevelService.getItemFromLevelById('Phonetic', 154));

      LevelService.moveBoundary('Phonetic', 154, 15, 0);
      HistoryService.addObjToUndoStack({
        type: 'ANNOT', action: 'MOVEBOUNDARY', name: 'Phonetic',
        id: 154, movedBy: 15, position: 0
      });

      LevelService.renameLabel('Phonetic', 154, 0, 'EDITED');
      HistoryService.addObjToUndoStack({
        type: 'ANNOT', action: 'RENAMELABEL', name: 'Phonetic',
        id: 154, attrIndex: 0, oldValue: origItem.labels[0].value, newValue: 'EDITED'
      });

      HistoryService.undo();
      HistoryService.undo();

      var restored = LevelService.getItemFromLevelById('Phonetic', 154);
      expect(restored.labels[0].value).toBe(origItem.labels[0].value);
      expect(restored.sampleStart).toBe(origItem.sampleStart);
    }));
  });

  describe('multi-operation undo restores full state', function () {

    it('should restore exact original annotation after multiple edits and full undo', angular.mock.inject(function (DataService, LevelService, HistoryService) {
      var snapshot = angular.copy(DataService.getData());

      LevelService.moveBoundary('Phonetic', 154, 25, 0);
      HistoryService.addObjToUndoStack({
        type: 'ANNOT', action: 'MOVEBOUNDARY', name: 'Phonetic',
        id: 154, movedBy: 25, position: 0
      });

      LevelService.renameLabel('Phonetic', 147, 0, 'ZZZ');
      HistoryService.addObjToUndoStack({
        type: 'ANNOT', action: 'RENAMELABEL', name: 'Phonetic',
        id: 147, attrIndex: 0, oldValue: getItemFromJSON(msajc003_bndl.annotation, 147).labels[0].value, newValue: 'ZZZ'
      });

      LevelService.moveBoundary('Phonetic', 148, -10, 0);
      HistoryService.addObjToUndoStack({
        type: 'ANNOT', action: 'MOVEBOUNDARY', name: 'Phonetic',
        id: 148, movedBy: -10, position: 0
      });

      HistoryService.undo();
      HistoryService.undo();
      HistoryService.undo();

      expect(DataService.getData()).toEqual(snapshot);
    }));

    it('should have movesAwayFromLastSave=0 after full undo', angular.mock.inject(function (LevelService, HistoryService) {
      LevelService.moveBoundary('Phonetic', 154, 5, 0);
      HistoryService.addObjToUndoStack({
        type: 'ANNOT', action: 'MOVEBOUNDARY', name: 'Phonetic',
        id: 154, movedBy: 5, position: 0
      });

      LevelService.renameLabel('Phonetic', 154, 0, 'TMP');
      HistoryService.addObjToUndoStack({
        type: 'ANNOT', action: 'RENAMELABEL', name: 'Phonetic',
        id: 154, attrIndex: 0, oldValue: 'V', newValue: 'TMP'
      });

      expect(HistoryService.movesAwayFromLastSave).toBe(2);

      HistoryService.undo();
      HistoryService.undo();

      expect(HistoryService.movesAwayFromLastSave).toBe(0);
    }));
  });
});
