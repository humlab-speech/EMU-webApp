'use strict';

describe('Directive: showMenu', function() {

    var elm, tpl, scope;
    beforeEach(angular.mock.module('artic'));

    beforeEach(angular.mock.inject(function($rootScope, $compile) {
        scope = $rootScope.$new();
    }));

    function compileDirective(val) {
        tpl = '<div show-menu="'+val+'"></div>';
        angular.mock.inject(function($compile) {
            elm = $compile(tpl)(scope);
        });
        scope.$digest();
    }

    it('should have correct css values', function() {
        compileDirective(true);
        expect(elm.prop('className')).toContain('artic-expandWidthTo200px');
        expect(elm.prop('className')).not.toContain('artic-shrinkWidthTo0px');
        compileDirective(false);
        expect(elm.prop('className')).toContain('artic-shrinkWidthTo0px');
        expect(elm.prop('className')).not.toContain('artic-expandWidthTo200px');
    });
});