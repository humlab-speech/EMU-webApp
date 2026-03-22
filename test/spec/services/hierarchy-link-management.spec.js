'use strict';

describe('Use Case: Hierarchy Link Management', function () {

  beforeEach(angular.mock.module('artic'));

  beforeEach(angular.mock.inject(function (ConfigProviderService, DataService) {
    ConfigProviderService.setVals(defaultArticConfig);
    ConfigProviderService.curDbConfig = aeDbConfig;
    DataService.setData(angular.copy(msajc003_bndl.annotation));
  }));

  describe('querying links on loaded annotation data', function () {

    it('should have loaded the full link set from msajc003', angular.mock.inject(function (DataService) {
      expect(DataService.getLinkData().length).toEqual(557);
    }));

    it('should find parent links for a known Phonetic item', angular.mock.inject(function (LinkService, LevelService) {
      // Phonetic items[0] has id 147; it has 6 parent links in the fixture
      var phoneticID = LevelService.getLevelDetails('Phonetic').items[0].id;
      expect(phoneticID).toEqual(147);
      var parents = LinkService.getLinksTo(phoneticID);
      expect(parents.length).toEqual(6);
      parents.forEach(function (entry) {
        expect(entry.link.toID).toEqual(147);
      });
    }));

    it('should find child links from a known Word item', angular.mock.inject(function (LinkService, LevelService) {
      // Word items[0] has id 2; it has 15 child links in the fixture
      var wordID = LevelService.getLevelDetails('Word').items[0].id;
      expect(wordID).toEqual(2);
      var children = LinkService.getLinksFrom(wordID);
      expect(children.length).toEqual(15);
      children.forEach(function (entry) {
        expect(entry.link.fromID).toEqual(2);
      });
    }));

    it('should report isLinked=true for linked items', angular.mock.inject(function (LinkService, LevelService) {
      var phoneticID = LevelService.getLevelDetails('Phonetic').items[0].id;
      var wordID = LevelService.getLevelDetails('Word').items[0].id;
      expect(LinkService.isLinked(phoneticID)).toEqual(true);
      expect(LinkService.isLinked(wordID)).toEqual(true);
    }));

    it('should report hasParents and hasChildren correctly', angular.mock.inject(function (LinkService, LevelService) {
      // Phonetic item has parents (linked from above) but no children (bottom level)
      var phoneticID = LevelService.getLevelDetails('Phonetic').items[0].id;
      expect(LinkService.hasParents(phoneticID)).toEqual(true);
      expect(LinkService.hasChildren(phoneticID)).toEqual(false);

      // Word item has both parents and children (mid-hierarchy)
      var wordID = LevelService.getLevelDetails('Word').items[0].id;
      expect(LinkService.hasParents(wordID)).toEqual(true);
      expect(LinkService.hasChildren(wordID)).toEqual(true);

      // Utterance item has children but no parents (top level)
      var uttID = LevelService.getLevelDetails('Utterance').items[0].id;
      expect(LinkService.hasParents(uttID)).toEqual(false);
      expect(LinkService.hasChildren(uttID)).toEqual(true);
    }));
  });

  describe('link insertion and deletion', function () {

    it('should insert a single link and verify with linkExists', angular.mock.inject(function (LinkService, DataService) {
      var origCount = DataService.getLinkData().length;
      LinkService.insertLink(9999, 8888);
      expect(DataService.getLinkData().length).toEqual(origCount + 1);
      expect(LinkService.linkExists(9999, 8888)).toEqual(true);
      expect(LinkService.linkExists(8888, 9999)).toEqual(false);
    }));

    it('should insert links to multiple children and query back', angular.mock.inject(function (LinkService, DataService) {
      DataService.setLinkData([]);
      var parentID = 5000;
      var childIDs = [5001, 5002, 5003];
      LinkService.insertLinksTo(parentID, childIDs);
      expect(DataService.getLinkData().length).toEqual(3);

      var children = LinkService.getLinksFrom(parentID);
      expect(children.length).toEqual(3);
      expect(children[0].link).toEqual({fromID: 5000, toID: 5001});
      expect(children[1].link).toEqual({fromID: 5000, toID: 5002});
      expect(children[2].link).toEqual({fromID: 5000, toID: 5003});

      expect(LinkService.linkExists(5000, 5001)).toEqual(true);
      expect(LinkService.linkExists(5000, 5002)).toEqual(true);
      expect(LinkService.linkExists(5000, 5003)).toEqual(true);
    }));

    it('should delete links and verify removal', angular.mock.inject(function (LinkService, DataService) {
      DataService.setLinkData([]);
      LinkService.insertLinksTo(100, [200, 201, 202]);
      expect(DataService.getLinkData().length).toEqual(3);

      LinkService.deleteLinksTo(100, [200, 202]);
      expect(DataService.getLinkData().length).toEqual(1);
      expect(LinkService.linkExists(100, 200)).toEqual(false);
      expect(LinkService.linkExists(100, 201)).toEqual(true);
      expect(LinkService.linkExists(100, 202)).toEqual(false);
    }));

    it('should roundtrip insert+delete returning to original link count', angular.mock.inject(function (LinkService, DataService) {
      var origCount = DataService.getLinkData().length;
      var parentID = 7000;
      var childIDs = [7001, 7002, 7003, 7004];

      LinkService.insertLinksTo(parentID, childIDs);
      expect(DataService.getLinkData().length).toEqual(origCount + 4);

      LinkService.deleteLinksTo(parentID, childIDs);
      expect(DataService.getLinkData().length).toEqual(origCount);
    }));
  });

  describe('link operations with fresh link data', function () {

    it('should build hierarchy links from scratch', angular.mock.inject(function (LinkService, DataService) {
      DataService.setLinkData([]);
      expect(DataService.getLinkData().length).toEqual(0);

      //     10
      //    /  \
      //   20   21
      //   |   / \
      //  30  31  32
      LinkService.insertLinksTo(10, [20, 21]);
      LinkService.insertLinksTo(20, [30]);
      LinkService.insertLinksTo(21, [31, 32]);
      expect(DataService.getLinkData().length).toEqual(5);

      expect(LinkService.hasChildren(10)).toEqual(true);
      expect(LinkService.hasParents(10)).toEqual(false);
      expect(LinkService.hasChildren(20)).toEqual(true);
      expect(LinkService.hasParents(20)).toEqual(true);
      expect(LinkService.hasChildren(30)).toEqual(false);
      expect(LinkService.hasParents(30)).toEqual(true);

      expect(LinkService.getLinksFrom(10).length).toEqual(2);
      expect(LinkService.getLinksFrom(21).length).toEqual(2);
      expect(LinkService.getLinksTo(32)).toEqual([{link: {fromID: 21, toID: 32}, order: 4}]);
    }));

    it('should handle insertLinksFrom (many parents to one child)', angular.mock.inject(function (LinkService, DataService) {
      DataService.setLinkData([]);

      //  40  41  42
      //   \  |  /
      //    50
      LinkService.insertLinksFrom([40, 41, 42], 50);
      expect(DataService.getLinkData().length).toEqual(3);

      expect(LinkService.getLinksTo(50).length).toEqual(3);
      expect(LinkService.hasParents(50)).toEqual(true);
      expect(LinkService.hasChildren(40)).toEqual(true);
      expect(LinkService.hasChildren(41)).toEqual(true);
      expect(LinkService.hasChildren(42)).toEqual(true);

      expect(LinkService.linkExists(40, 50)).toEqual(true);
      expect(LinkService.linkExists(41, 50)).toEqual(true);
      expect(LinkService.linkExists(42, 50)).toEqual(true);
    }));
  });

  describe('link undo/redo via HistoryService', function () {

    it('should undo INSERTLINKSTO and remove the inserted links', angular.mock.inject(function (LinkService, DataService, HistoryService) {
      DataService.setLinkData([]);

      var parentID = 300;
      var childIDs = [301, 302];
      LinkService.insertLinksTo(parentID, childIDs);
      expect(DataService.getLinkData().length).toEqual(2);

      var changeObj = {
        'type': 'ANNOT',
        'action': 'INSERTLINKSTO',
        'name': 'Phonetic',
        'id': 1,
        'parentID': parentID,
        'childIDs': childIDs
      };

      HistoryService.updateCurChangeObj(changeObj);
      HistoryService.addCurChangeObjToUndoStack();
      expect(HistoryService.getNrOfPossibleUndos()).toEqual(1);

      // undo should remove the inserted links
      HistoryService.undo();
      expect(HistoryService.getNrOfPossibleUndos()).toEqual(0);
      expect(DataService.getLinkData().length).toEqual(0);
      expect(LinkService.linkExists(300, 301)).toEqual(false);
      expect(LinkService.linkExists(300, 302)).toEqual(false);

      // redo should re-insert them
      HistoryService.redo();
      expect(HistoryService.getNrOfPossibleUndos()).toEqual(1);
      expect(DataService.getLinkData().length).toEqual(2);
      expect(LinkService.linkExists(300, 301)).toEqual(true);
      expect(LinkService.linkExists(300, 302)).toEqual(true);
    }));
  });
});
