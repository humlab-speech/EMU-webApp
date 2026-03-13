'use strict';

describe('Directive: bundleListSideBar', function() {

    var elm, tpl, scope;
    beforeEach(angular.mock.module('grazer', 'grazer.templates'));

    beforeEach(angular.mock.inject(function($rootScope, $compile) {
        scope = $rootScope.$new();
    }));

    function compileDirective(val) {
        tpl = '<bundle-list-side-bar is-open="{{vs.submenuOpen}}"></bundle-list-side-bar>';
        angular.mock.inject(function($compile) {
            elm = $compile(tpl)(scope);
        });
        scope.$digest();
    }

    it('should have correct css values', angular.mock.inject(function (ViewStateService) {
        scope.filterText = '';
        scope.bundleList = [];
        scope.vs = ViewStateService;
        scope.vs.submenuOpen = true;
        compileDirective();
        expect(elm.prop('className')).not.toContain('ng-hide');
        scope.vs.submenuOpen = false;
        compileDirective();
        expect(elm.prop('className')).not.toContain('ng-hide');
    }));
    

    it('should have correct html values', angular.mock.inject(function (ViewStateService) {
        scope.filterText = '';
        scope.bundleList = [];
        scope.vs = ViewStateService;
        scope.vs.submenuOpen = true;
        compileDirective();
        expect(elm.html()).toContain('grazer-filter');
        expect(elm.html()).toContain('input');
        expect(elm.html()).toContain('my-drop-zone');
        expect(elm.html()).toContain('my-drop-zone-input');
    }));
    
});
