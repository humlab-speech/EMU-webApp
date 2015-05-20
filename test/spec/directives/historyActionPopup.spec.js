'use strict';

describe('Directive: historyActionPopup', function() {

    var elm, scope;
    beforeEach(module('emuwebApp'));

    beforeEach(inject(function($rootScope, $q, $compile, viewState, modalService) {
        scope = $rootScope.$new();
        scope.vs = viewState;
        scope.modal = modalService;
    }));

    function compileDirective(tpl) {
        inject(function($compile) {
            elm = $compile('<history-action-popup ng-show="vs.historyActionTxt !=\'\'"></history-action-popup>')(scope);
        });
        scope.$digest();
    }
    
    it('should be replaced correctly', function() {
        compileDirective(true);
        expect(elm.hasClass('emuwebapp-history')).toBe(true);
    });
   
   it('should watch vs.historyActionTxt', inject(function ($timeout, $animate) {
        scope.vs.historyActionTxt = '';
        compileDirective();
        scope.vs.historyActionTxt = 'warning';
        scope.$apply();
        $timeout.flush();
        expect(elm.hasClass('emuwebapp-history')).toBe(true);
   }));
});
