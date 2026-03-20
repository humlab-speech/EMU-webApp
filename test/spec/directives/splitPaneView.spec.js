'use strict';

describe('Directive: splitPaneView', function() {

    var elm, scope;
    var $rootScope, $compile;
    beforeEach(angular.mock.module('artic'));

    beforeEach(angular.mock.inject(function(_$rootScope_, _$compile_, ViewStateService) {
        $rootScope = _$rootScope_;
        $compile = _$compile_;

        scope = $rootScope.$new();
        scope.vs = ViewStateService;

    }));

    function compileDirective(toggle) {
        angular.mock.inject(function($compile) {
            elm = $compile('<bg-splitter show-two-dim-cans="'+toggle+'">'+
                                '<bg-pane type="topPane" min-size="80">top</bg-pane>'+
                                '<bg-pane type="bottomPane" min-size="80"> bottom </bg-pane>'+
                                '<bg-pane type="artic-2d-map"> </bg-pane>'+
                            '</bg-splitter>')($rootScope);
        });
        $rootScope.$digest();
    }

   it('should have correct html with bottomRightResizePane', function () {
     compileDirective(true);
     expect(elm.isolateScope()).toBeDefined();
     expect(elm.find('div').length).toBe(7);
   });

   it('should have correct without bottomRightResizePane', function () {
     compileDirective(false);
     expect(elm.isolateScope()).toBeDefined();
     expect(elm.isolateScope().bottomRightResizePane.elem).toBeHidden();
     expect(elm.find('div').length).toBe(7);
   });

   it('should resize bottomRightResizePane via artic-split-handler', function () {
     compileDirective(true);
     expect(elm.isolateScope()).toBeDefined();
     var event = document.createEvent('Event');
     event.initEvent('mousedown', true, true);
     spyOn(scope.vs, 'setdragBarActive');
     var divs = elm.find('div');
     divs[1].dispatchEvent(event); // artic-split-handler
     expect(scope.vs.setdragBarActive).toHaveBeenCalledWith(true);
   });

   it('should watch element mousemove on dragSplitPaneResizer', function () {
     compileDirective(true);
     var event = document.createEvent('Event');
     event.initEvent('mousedown', true, true);
     spyOn(scope.vs, 'setdragBarActive');
     var divs = elm.find('div');
     divs[1].dispatchEvent(event); // artic-split-handler
     expect(scope.vs.setdragBarActive).toHaveBeenCalledWith(true);
     expect(elm.isolateScope()).toBeDefined();
     var event2 = document.createEvent('Event');
     event2.initEvent('mousemove', true, true);
     spyOn(scope.vs, 'setdragBarHeight');
     elm[0].dispatchEvent(event2);
     expect(scope.vs.setdragBarHeight).toHaveBeenCalled();
   });

   it('should resize bottomRightResizePane via artic-bottomRightResizePaneTopResizer', function () {
     compileDirective(true);
     expect(elm.isolateScope()).toBeDefined();
     var event = document.createEvent('Event');
     event.initEvent('mousedown', true, true);
     spyOn(scope.vs, 'setdragBarActive');
     var divs = elm.find('div');
     divs[5].dispatchEvent(event); // artic-bottomRightResizePaneTopResizer
     expect(scope.vs.setdragBarActive).toHaveBeenCalledWith(true);
   });

   it('should watch element mousemove on artic-bottomRightResizePaneTopResizer', function () {
     compileDirective(true);
     var event = document.createEvent('Event');
     event.initEvent('mousedown', true, true);
     spyOn(scope.vs, 'setdragBarActive');
     var divs = elm.find('div');
     divs[5].dispatchEvent(event); // artic-bottomRightResizePaneTopResizer
     expect(scope.vs.setdragBarActive).toHaveBeenCalledWith(true);
     expect(elm.isolateScope()).toBeDefined();
     var event2 = document.createEvent('Event');
     event2.initEvent('mousemove', true, true);
     elm[0].dispatchEvent(event2);
   });


   it('should resize bottomRightResizePane via artic-bottomRightResizePaneLeftResizer', function () {
     compileDirective(true);
     expect(elm.isolateScope()).toBeDefined();
     var event = document.createEvent('Event');
     event.initEvent('mousedown', true, true);
     spyOn(scope.vs, 'setdragBarActive');
     var divs = elm.find('div');
     divs[6].dispatchEvent(event); // artic-bottomRightResizePaneLeftResizer
     expect(scope.vs.setdragBarActive).toHaveBeenCalledWith(true);
   });

   it('should watch element mousemove on artic-bottomRightResizePaneLeftResizer', function () {
     compileDirective(true);
     var event = document.createEvent('Event');
     event.initEvent('mousedown', true, true);
     spyOn(scope.vs, 'setdragBarActive');
     var divs = elm.find('div');
     divs[6].dispatchEvent(event); // artic-bottomRightResizePaneLeftResizer
     expect(scope.vs.setdragBarActive).toHaveBeenCalledWith(true);
     expect(elm.isolateScope()).toBeDefined();
     var event2 = document.createEvent('Event');
     event2.initEvent('mousemove', true, true);
     elm[0].dispatchEvent(event2);
   });

   it('should resize bottomRightResizePane via artic-bottomRightResizePaneCornerResizer', function () {
     compileDirective(true);
     expect(elm.isolateScope()).toBeDefined();
     var event = document.createEvent('Event');
     event.initEvent('mousedown', true, true);
     spyOn(scope.vs, 'setdragBarActive');
     var divs = elm.find('div');
     divs[4].dispatchEvent(event); // artic-bottomRightResizePaneCornerResizer
     expect(scope.vs.setdragBarActive).toHaveBeenCalledWith(true);
   });

   it('should watch element mousemove on artic-bottomRightResizePaneCornerResizer', function () {
     compileDirective(true);
     var event = document.createEvent('Event');
     event.initEvent('mousedown', true, true);
     spyOn(scope.vs, 'setdragBarActive');
     var divs = elm.find('div');
     divs[4].dispatchEvent(event); // artic-bottomRightResizePaneCornerResizer
     expect(scope.vs.setdragBarActive).toHaveBeenCalledWith(true);
     expect(elm.isolateScope()).toBeDefined();
     var event2 = document.createEvent('Event');
     event2.initEvent('mousemove', true, true);
     elm[0].dispatchEvent(event2);
   });
   
   it('should watch document mouseup', function () {
     compileDirective(true);
     expect(elm.isolateScope()).toBeDefined();
     var event = document.createEvent('Event');
     event.initEvent('mouseup', true, true);
     spyOn(scope.vs, 'setdragBarActive');
     document.dispatchEvent(event);
     expect(scope.vs.setdragBarActive).toHaveBeenCalled();
   });
});
