'use strict';

describe('Directive: progressBar', function() {

    var elm, scope;
    
    beforeEach(angular.mock.module('artic', 'artic.templates'));
    
    beforeEach(angular.mock.inject(function($rootScope, $compile) {
        scope = $rootScope.$new();
    }));

    function compileDirective(val) {
        var tpl = '<progress-thing show-thing="'+val+'"></progress-thing>';
        angular.mock.inject(function($compile) {
            elm = $compile(tpl)(scope);
        });
        scope.$apply();
    }

    it('should have correct css classes', function() {
        compileDirective(true);
        expect(elm.prop('className')).toContain('artic-progressBar');
        expect(elm.prop('className')).toContain('artic-expandHeightTo20px');
        expect(elm.prop('className')).not.toContain('artic-shrinkHeightTo0px');
        compileDirective(false);
        expect(elm.prop('className')).toContain('artic-progressBar');
        expect(elm.prop('className')).toContain('artic-shrinkHeightTo0px');
        expect(elm.prop('className')).not.toContain('artic-expandHeightTo20px');
    });

       
});