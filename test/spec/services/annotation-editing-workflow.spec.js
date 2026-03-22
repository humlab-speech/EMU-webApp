'use strict';

describe('Use Case: Annotation Editing Workflow', function () {

  beforeEach(angular.mock.module('artic'));

  beforeEach(angular.mock.inject(function (ConfigProviderService, ViewStateService, DataService, SoundHandlerService) {
    ConfigProviderService.setVals(defaultArticConfig);
    ConfigProviderService.curDbConfig = aeDbConfig;
    ViewStateService.setCurLevelAttrDefs(aeDbConfig.levelDefinitions);
    SoundHandlerService.audioBuffer = { length: 58089, sampleRate: 20000 };
    DataService.setData(angular.copy(msajc003_bndl.annotation));
  }));

  // ---------------------------------------------------------------
  // Boundary movement with undo/redo
  // ---------------------------------------------------------------
  describe('boundary movement with undo/redo', function () {

    // item 148 (index 1): sampleStart 5140, sampleDur 1664
    // left neighbour 147 (index 0): sampleStart 3750, sampleDur 1389

    it('should move segment boundary right and update durations', angular.mock.inject(function (LevelService) {
      var origItem = angular.copy(LevelService.getItemFromLevelById('Phonetic', 148));
      var origLeft = angular.copy(LevelService.getItemFromLevelById('Phonetic', 147));

      LevelService.moveBoundary('Phonetic', 148, 50, false, false);

      var moved = LevelService.getItemFromLevelById('Phonetic', 148);
      var left = LevelService.getItemFromLevelById('Phonetic', 147);

      // boundary moved right: item starts later, shorter duration
      expect(moved.sampleStart).toEqual(origItem.sampleStart + 50);
      expect(moved.sampleDur).toEqual(origItem.sampleDur - 50);
      // left neighbour grew
      expect(left.sampleDur).toEqual(origLeft.sampleDur + 50);
      expect(left.sampleStart).toEqual(origLeft.sampleStart);
    }));

    it('should undo boundary move and restore original durations', angular.mock.inject(function (LevelService, HistoryService) {
      var origItem = angular.copy(LevelService.getItemFromLevelById('Phonetic', 148));
      var origLeft = angular.copy(LevelService.getItemFromLevelById('Phonetic', 147));

      LevelService.moveBoundary('Phonetic', 148, 50, false, false);
      HistoryService.addObjToUndoStack({
        type: 'ANNOT', action: 'MOVEBOUNDARY', name: 'Phonetic',
        id: 148, movedBy: 50, position: 0
      });

      HistoryService.undo();

      var restored = LevelService.getItemFromLevelById('Phonetic', 148);
      var restoredLeft = LevelService.getItemFromLevelById('Phonetic', 147);
      expect(restored.sampleStart).toEqual(origItem.sampleStart);
      expect(restored.sampleDur).toEqual(origItem.sampleDur);
      expect(restoredLeft.sampleDur).toEqual(origLeft.sampleDur);
    }));

    it('should redo boundary move after undo', angular.mock.inject(function (LevelService, HistoryService) {
      var origItem = angular.copy(LevelService.getItemFromLevelById('Phonetic', 148));
      var origLeft = angular.copy(LevelService.getItemFromLevelById('Phonetic', 147));

      LevelService.moveBoundary('Phonetic', 148, 50, false, false);
      HistoryService.addObjToUndoStack({
        type: 'ANNOT', action: 'MOVEBOUNDARY', name: 'Phonetic',
        id: 148, movedBy: 50, position: 0
      });

      HistoryService.undo();
      HistoryService.redo();

      var item = LevelService.getItemFromLevelById('Phonetic', 148);
      var left = LevelService.getItemFromLevelById('Phonetic', 147);
      expect(item.sampleStart).toEqual(origItem.sampleStart + 50);
      expect(item.sampleDur).toEqual(origItem.sampleDur - 50);
      expect(left.sampleDur).toEqual(origLeft.sampleDur + 50);
    }));

    it('should undo multiple boundary moves to original state', angular.mock.inject(function (LevelService, HistoryService) {
      var origItem = angular.copy(LevelService.getItemFromLevelById('Phonetic', 148));
      var origLeft = angular.copy(LevelService.getItemFromLevelById('Phonetic', 147));

      // first move: +30
      LevelService.moveBoundary('Phonetic', 148, 30, false, false);
      HistoryService.addObjToUndoStack({
        type: 'ANNOT', action: 'MOVEBOUNDARY', name: 'Phonetic',
        id: 148, movedBy: 30, position: 0
      });

      // second move: +20
      LevelService.moveBoundary('Phonetic', 148, 20, false, false);
      HistoryService.addObjToUndoStack({
        type: 'ANNOT', action: 'MOVEBOUNDARY', name: 'Phonetic',
        id: 148, movedBy: 20, position: 0
      });

      expect(HistoryService.getNrOfPossibleUndos()).toEqual(2);

      HistoryService.undo();
      HistoryService.undo();

      var item = LevelService.getItemFromLevelById('Phonetic', 148);
      var left = LevelService.getItemFromLevelById('Phonetic', 147);
      expect(item.sampleStart).toEqual(origItem.sampleStart);
      expect(item.sampleDur).toEqual(origItem.sampleDur);
      expect(left.sampleDur).toEqual(origLeft.sampleDur);
    }));
  });

  // ---------------------------------------------------------------
  // Label renaming with undo/redo
  // ---------------------------------------------------------------
  describe('label renaming with undo/redo', function () {

    // item 154 (index 7): label value "@:"

    it('should rename a segment label', angular.mock.inject(function (LevelService) {
      LevelService.renameLabel('Phonetic', 154, 0, 'NEW');

      var item = LevelService.getItemFromLevelById('Phonetic', 154);
      expect(item.labels[0].value).toEqual('NEW');
    }));

    it('should undo label rename restoring original value', angular.mock.inject(function (LevelService, HistoryService) {
      var origValue = LevelService.getItemFromLevelById('Phonetic', 154).labels[0].value;

      LevelService.renameLabel('Phonetic', 154, 0, 'CHANGED');
      HistoryService.addObjToUndoStack({
        type: 'ANNOT', action: 'RENAMELABEL', name: 'Phonetic',
        id: 154, attrIndex: 0, oldValue: origValue, newValue: 'CHANGED'
      });

      HistoryService.undo();

      var item = LevelService.getItemFromLevelById('Phonetic', 154);
      expect(item.labels[0].value).toEqual(origValue);
    }));

    it('should redo label rename after undo', angular.mock.inject(function (LevelService, HistoryService) {
      var origValue = LevelService.getItemFromLevelById('Phonetic', 154).labels[0].value;

      LevelService.renameLabel('Phonetic', 154, 0, 'REDONE');
      HistoryService.addObjToUndoStack({
        type: 'ANNOT', action: 'RENAMELABEL', name: 'Phonetic',
        id: 154, attrIndex: 0, oldValue: origValue, newValue: 'REDONE'
      });

      HistoryService.undo();
      HistoryService.redo();

      var item = LevelService.getItemFromLevelById('Phonetic', 154);
      expect(item.labels[0].value).toEqual('REDONE');
    }));
  });

  // ---------------------------------------------------------------
  // Segment deletion with undo/redo
  // ---------------------------------------------------------------
  describe('segment deletion with undo/redo', function () {

    // delete item 148 (index 1, middle segment)
    // left neighbour 147, right neighbour 149

    it('should delete a segment and update neighbour durations', angular.mock.inject(function (LevelService) {
      var origLeft = angular.copy(LevelService.getItemFromLevelById('Phonetic', 147));
      var origRight = angular.copy(LevelService.getItemFromLevelById('Phonetic', 149));
      var deleted = angular.copy(LevelService.getItemFromLevelById('Phonetic', 148));

      // timeLeft = sampleDur + 1 = 1665; ceil(1665/2) = 833; timeRight = 832
      var timeTotal = deleted.sampleDur + 1;
      var expectedTimeLeft = Math.ceil(timeTotal / 2);
      var expectedTimeRight = expectedTimeLeft - 1;

      var ret = LevelService.deleteSegments('Phonetic', 148, 1);

      expect(LevelService.getLevelDetails('Phonetic').items.length).toEqual(33);
      expect(LevelService.getItemFromLevelById('Phonetic', 147).sampleDur).toEqual(origLeft.sampleDur + expectedTimeLeft);
      expect(LevelService.getItemFromLevelById('Phonetic', 149).sampleDur).toEqual(origRight.sampleDur + expectedTimeRight);
      expect(LevelService.getItemFromLevelById('Phonetic', 149).sampleStart).toEqual(origRight.sampleStart - expectedTimeRight);
    }));

    it('should undo segment deletion restoring the segment', angular.mock.inject(function (LevelService, HistoryService) {
      var origLength = LevelService.getLevelDetails('Phonetic').items.length;
      var origItem = angular.copy(LevelService.getItemFromLevelById('Phonetic', 148));
      var origLeft = angular.copy(LevelService.getItemFromLevelById('Phonetic', 147));
      var origRight = angular.copy(LevelService.getItemFromLevelById('Phonetic', 149));

      var ret = LevelService.deleteSegments('Phonetic', 148, 1);

      HistoryService.addObjToUndoStack({
        type: 'ANNOT', action: 'DELETESEGMENTS', name: 'Phonetic',
        id: 148, length: 1, deletedSegment: ret
      });

      HistoryService.undo();

      expect(LevelService.getLevelDetails('Phonetic').items.length).toEqual(origLength);
      var restored = LevelService.getItemFromLevelById('Phonetic', 148);
      expect(restored).toBeDefined();
      expect(restored.sampleStart).toEqual(origItem.sampleStart);
      expect(restored.sampleDur).toEqual(origItem.sampleDur);
      expect(LevelService.getItemFromLevelById('Phonetic', 147).sampleDur).toEqual(origLeft.sampleDur);
      expect(LevelService.getItemFromLevelById('Phonetic', 149).sampleDur).toEqual(origRight.sampleDur);
    }));
  });

  // ---------------------------------------------------------------
  // Segment insertion with undo/redo
  // ---------------------------------------------------------------
  describe('segment insertion with undo/redo', function () {

    it('should insert boundary splitting a segment', angular.mock.inject(function (LevelService, ConfigProviderService) {
      ConfigProviderService.curDbConfig = aeDbConfig;
      var origLength = LevelService.getLevelDetails('Phonetic').items.length;

      // insert boundary inside item 148 (sampleStart 5140, sampleDur 1664)
      // pick a point in the middle: 5900
      var ret = LevelService.insertSegment('Phonetic', 5900, 5900, 'NEW');

      expect(LevelService.getLevelDetails('Phonetic').items.length).toEqual(origLength + 1);
    }));

    it('should undo segment insertion', angular.mock.inject(function (LevelService, HistoryService, ConfigProviderService) {
      ConfigProviderService.curDbConfig = aeDbConfig;
      var origLength = LevelService.getLevelDetails('Phonetic').items.length;

      var ret = LevelService.insertSegment('Phonetic', 5900, 5900, 'NEW');
      var ids = ret ? ret.ids : undefined;

      HistoryService.addObjToUndoStack({
        type: 'ANNOT', action: 'INSERTSEGMENTS', name: 'Phonetic',
        start: 5900, end: 5900, segName: 'NEW', ids: ids
      });

      HistoryService.undo();

      expect(LevelService.getLevelDetails('Phonetic').items.length).toEqual(origLength);
    }));
  });

  // ---------------------------------------------------------------
  // Event operations (Tone level - EVENT type, linked items)
  // ---------------------------------------------------------------
  describe('event operations', function () {

    // Tone item 181: samplePoint 8381, linked
    // Tone item 182: samplePoint 18631, linked
    // neighbours of 181: left undefined, right 182

    it('should move event and verify position change', angular.mock.inject(function (LevelService) {
      var orig = angular.copy(LevelService.getItemFromLevelById('Tone', 181));

      LevelService.moveEvent('Tone', 181, 100);

      var moved = LevelService.getItemFromLevelById('Tone', 181);
      expect(moved.samplePoint).toEqual(orig.samplePoint + 100);
    }));

    it('should track movesAwayFromLastSave correctly across operations', angular.mock.inject(function (LevelService, HistoryService) {
      expect(HistoryService.movesAwayFromLastSave).toEqual(0);

      // operation 1: rename
      LevelService.renameLabel('Phonetic', 154, 0, 'X');
      HistoryService.addObjToUndoStack({
        type: 'ANNOT', action: 'RENAMELABEL', name: 'Phonetic',
        id: 154, attrIndex: 0, oldValue: '@:', newValue: 'X'
      });
      expect(HistoryService.movesAwayFromLastSave).toEqual(1);

      // operation 2: move boundary
      LevelService.moveBoundary('Phonetic', 148, 10, false, false);
      HistoryService.addObjToUndoStack({
        type: 'ANNOT', action: 'MOVEBOUNDARY', name: 'Phonetic',
        id: 148, movedBy: 10, position: 0
      });
      expect(HistoryService.movesAwayFromLastSave).toEqual(2);

      // undo decrements
      HistoryService.undo();
      expect(HistoryService.movesAwayFromLastSave).toEqual(1);

      // redo increments
      HistoryService.redo();
      expect(HistoryService.movesAwayFromLastSave).toEqual(2);

      // undo both
      HistoryService.undo();
      HistoryService.undo();
      expect(HistoryService.movesAwayFromLastSave).toEqual(0);
    }));
  });
});
