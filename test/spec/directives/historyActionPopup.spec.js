'use strict';

describe('Directive: historyActionPopup', function() {

    var elm, scope;
    beforeEach(angular.mock.module('artic'));

    beforeEach(angular.mock.inject(function($rootScope, $q, $compile, ViewStateService, ModalService) {
        scope = $rootScope.$new();
        scope.vs = ViewStateService;
        scope.modal = ModalService;
    }));

    function compileDirective(tpl) {
        angular.mock.inject(function($compile) {
            elm = $compile('<history-action-popup></history-action-popup>')(scope);
        });
        scope.$digest();
    }

    it('should be replaced correctly', function() {
        compileDirective(true);
        expect(elm.hasClass('artic-history')).toBe(true);
    });

});
