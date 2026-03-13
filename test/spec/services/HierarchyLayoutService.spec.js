'use strict';

describe('Service: HierarchyLayoutService', function () {

  var scope;

   // load the service's module
   beforeEach(angular.mock.module('grazer'));

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
        scope.cps.setVals(defaultGrazerConfig);
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
    spyOn(scope.hierarchy, 'findChildren').and.returnValue([{"_parents":[]},{"_parents":[]},{"_parents":[]}]);
    spyOn(scope.lvl, 'getLevelDetails').and.returnValue({ items: [{id: 1}, {id: 2}, {id: 3}] });
    scope.hierarchy.findParents('Phonetic');
    expect(scope.hierarchy.findChildren).toHaveBeenCalled();
  });

  /**
   *
   */
  it('should findChildren', function () {
    spyOn(scope.lvl, 'getLevelDetails').and.returnValue({ items: [1, 2, 3]});
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

});
