'use strict';

describe('Service: HierarchyManipulationService', function () {

  beforeEach(angular.mock.module('artic'));

  beforeEach(angular.mock.inject(function (ConfigProviderService) {
    ConfigProviderService.curDbConfig = aeDbConfig;
  }));

  /**
   * checkLinkValidity - reason 1: from === to
   */
  it('should reject link where from equals to', angular.mock.inject(function (HierarchyManipulationService) {
    var result = HierarchyManipulationService.checkLinkValidity(['Phonetic', 'Syllable'], 5, 5);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe(1);
  }));

  /**
   * checkLinkValidity - reason 2: duplicate link
   */
  it('should reject duplicate link', angular.mock.inject(function (HierarchyManipulationService, DataService) {
    DataService.setData(msajc003_bndl.annotation);
    DataService.setLinkData([{fromID: 10, toID: 20}]);
    var result = HierarchyManipulationService.checkLinkValidity(['Phonetic', 'Syllable'], 10, 20);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe(2);
  }));

  /**
   * checkLinkValidity - reason 3: not along path
   */
  it('should reject link not along hierarchy path', angular.mock.inject(function (HierarchyManipulationService, DataService, LevelService) {
    DataService.setData(msajc003_bndl.annotation);
    DataService.setLinkData([]);
    // Use IDs from different levels that don't match the path
    spyOn(LevelService, 'getLevelName').mockImplementation(function (id) {
      if (id === 10) return 'Syllable';
      if (id === 20) return 'Word';
      return undefined;
    });
    var result = HierarchyManipulationService.checkLinkValidity(['Phonetic', 'Syllable'], 10, 20);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe(3);
  }));

  /**
   * addLink - returns null for invalid link
   */
  it('should return null when adding invalid link', angular.mock.inject(function (HierarchyManipulationService) {
    var result = HierarchyManipulationService.addLink(['Phonetic', 'Syllable'], 5, 5);
    expect(result).toBeNull();
  }));

  /**
   * addLink - adds valid link (using Phoneme->Phonetic which is MANY_TO_MANY)
   */
  it('should add valid link and return link object', angular.mock.inject(function (HierarchyManipulationService, DataService, LevelService, HierarchyLayoutService) {
    DataService.setData(msajc003_bndl.annotation);
    DataService.setLinkData([]);

    spyOn(LevelService, 'getLevelName').mockImplementation(function (id) {
      if (id === 100) return 'Phoneme';
      if (id === 200) return 'Phonetic';
      return undefined;
    });
    spyOn(LevelService, 'getLevelAndItem').mockReturnValue({
      level: { items: [{id: 100, labels: [{name: 'Phoneme', value: 'a'}]}] }
    });
    spyOn(LevelService, 'getOrderById').mockReturnValue(0);
    spyOn(LevelService, 'getItemByID').mockReturnValue({_parents: []});
    spyOn(HierarchyLayoutService, 'findChildren').mockReturnValue([]);
    spyOn(DataService, 'insertLinkData').mockImplementation(function () {});

    // path: sublevel first, then superlevel (right to left)
    var result = HierarchyManipulationService.addLink(['Phonetic', 'Phoneme'], 100, 200);
    expect(result).toEqual({fromID: 100, toID: 200});
    expect(DataService.insertLinkData).toHaveBeenCalledWith({fromID: 100, toID: 200});
  }));

  /**
   * addLink - tries reverse link when direction is wrong (reason 3)
   */
  it('should try reverse link when direction is wrong', angular.mock.inject(function (HierarchyManipulationService, DataService, LevelService, HierarchyLayoutService) {
    DataService.setData(msajc003_bndl.annotation);
    DataService.setLinkData([]);

    spyOn(LevelService, 'getLevelName').mockImplementation(function (id) {
      if (id === 100) return 'Phoneme';
      if (id === 200) return 'Phonetic';
      return undefined;
    });
    spyOn(LevelService, 'getLevelAndItem').mockReturnValue({
      level: { items: [{id: 100, labels: [{name: 'Phoneme', value: 'a'}]}] }
    });
    spyOn(LevelService, 'getOrderById').mockReturnValue(0);
    spyOn(LevelService, 'getItemByID').mockReturnValue({_parents: []});
    spyOn(HierarchyLayoutService, 'findChildren').mockReturnValue([]);
    spyOn(DataService, 'insertLinkData').mockImplementation(function () {});

    // Pass reversed: from=Phonetic(200), to=Phoneme(100) — wrong direction
    // Should fail with reason 3, then try reverse (from=100, to=200) which is valid
    var result = HierarchyManipulationService.addLink(['Phonetic', 'Phoneme'], 200, 100);
    expect(result).toEqual({fromID: 100, toID: 200});
  }));
});
