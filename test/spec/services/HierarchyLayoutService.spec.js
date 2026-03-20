'use strict';

describe('Service: HierarchyLayoutService', function () {

  var scope;

   // load the service's module
   beforeEach(angular.mock.module('artic'));

  // instantiate service
    beforeEach(angular.mock.inject(function ($rootScope,
                                LevelService,
                                ModalService,
                                ViewStateService,
                                DataService,
                                ConfigProviderService,
                                HierarchyLayoutService) {
        // scopes
        scope = $rootScope.$new();
        scope.data = DataService;
        scope.cps = ConfigProviderService;
        scope.cps.setVals(defaultArticConfig);
        scope.cps.curDbConfig = aeDbConfig;
        scope.data.setData(msajc003_bndl.annotation);
        scope.hierarchy = HierarchyLayoutService;
        scope.lvl = LevelService;
        scope.modal = ModalService;
        scope.vs = ViewStateService;
    }));


  /**
   *
   */
  it('should findParents', function () {
    spyOn(scope.hierarchy, 'findChildren').mockReturnValue([{"_parents":[]},{"_parents":[]},{"_parents":[]}]);
    spyOn(scope.lvl, 'getLevelDetails').mockReturnValue({ items: [{id: 1}, {id: 2}, {id: 3}] });
    scope.hierarchy.findParents('Phonetic');
    expect(scope.hierarchy.findChildren).toHaveBeenCalled();
  });

  /**
   *
   */
  it('should findChildren', function () {
    spyOn(scope.lvl, 'getLevelDetails').mockReturnValue({ items: [1, 2, 3]});
    var children = scope.hierarchy.findChildren({id:147}, 'Phonetic');
    expect(children).toEqual([]);
  });

  /**
   *
   */
  it('should calculateWeightsBottomUp', function () {
    scope.hierarchy.calculateWeightsBottomUp(['Phonetic']);
    //todo: expect ?
  });

  /**
   * findAllNonPartialPaths with empty levelDefinitions
   */
  it('should return empty paths when levelDefinitions is empty', function () {
    scope.cps.curDbConfig = { levelDefinitions: [], linkDefinitions: [] };
    var result = scope.hierarchy.findAllNonPartialPaths();
    expect(result.possible).toEqual([]);
    expect(result.possibleAsStr).toEqual([]);
  });

  /**
   * findAllNonPartialPaths with a single level (no links)
   */
  it('should return single-level path when only one level exists', function () {
    scope.cps.curDbConfig = {
      levelDefinitions: [{ name: 'OnlyLevel' }],
      linkDefinitions: []
    };
    var result = scope.hierarchy.findAllNonPartialPaths();
    expect(result.possible.length).toBe(1);
    expect(result.possible[0]).toEqual(['OnlyLevel']);
    expect(result.possibleAsStr[0]).toBe('OnlyLevel');
  });

  /**
   * findChildren returns empty array when node has no children
   */
  it('should return empty array from findChildren when node has no outgoing links', function () {
    // Use real data; item id 0 is at Utterance level (top), selectedPath only includes Utterance
    var result = scope.hierarchy.findChildren({ id: 0 }, ['Utterance']);
    expect(result).toEqual([]);
  });

  /**
   * findParents sets empty _parents on top-level items
   */
  it('should set empty _parents on items with no parents', function () {
    // Utterance is the top level - its items should have _parents = []
    scope.hierarchy.findParents(['Utterance']);
    var level = scope.lvl.getLevelDetails('Utterance');
    level.items.forEach(function (item) {
      expect(item._parents).toEqual([]);
    });
  });

  /**
   * pathStartsWith edge cases
   */
  it('should correctly evaluate pathStartsWith for equal, prefix, and non-prefix paths', function () {
    // identical paths
    expect(scope.hierarchy.pathStartsWith(['A', 'B', 'C'], ['A', 'B', 'C'])).toBe(true);
    // subPath is a suffix (paths are compared from the end)
    expect(scope.hierarchy.pathStartsWith(['A', 'B', 'C'], ['B', 'C'])).toBe(true);
    // subPath longer than superPath
    expect(scope.hierarchy.pathStartsWith(['A'], ['A', 'B'])).toBe(false);
    // no match
    expect(scope.hierarchy.pathStartsWith(['A', 'B', 'C'], ['X', 'Y'])).toBe(false);
    // empty subPath is always a match
    expect(scope.hierarchy.pathStartsWith(['A', 'B'], [])).toBe(true);
  });

});
