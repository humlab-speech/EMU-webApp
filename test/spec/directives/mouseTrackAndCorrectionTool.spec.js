'use strict';

describe('Directive: mouseTrackAndCorrectionTool', function () {

  // load the directive's module
  beforeEach(angular.mock.module('artic'));

  var elm, scope;

   beforeEach(angular.mock.inject(function ($rootScope, SsffDataService, ConfigProviderService) {
     scope = $rootScope.$new();
     scope.ssff = SsffDataService;
     scope.ssff.data = [1, 2, 3];
     spyOn(ConfigProviderService, 'getSsffTrackConfig').and.returnValue({name: 'test', columnName: 'test'});
   }));

   function compile(track) {
     var tpl = '<canvas bundle-name="test" ssff-trackname="'+track+'" mouse-track-and-correction-tool width="10" height="10"></canvas>';
     angular.mock.inject(function ($compile) {
        elm = $compile(tpl)(scope);
     });
     scope.$digest();
   }

   it('should react to mousedown', angular.mock.inject(function ($compile, ViewStateService) {
     compile('test');
     spyOn(ViewStateService, 'select');
     spyOn(ViewStateService, 'getSamplesPerPixelVal').and.returnValue(5);
     spyOn(ViewStateService, 'getX').and.returnValue(5);
     spyOn(elm.isolateScope(), 'switchMarkupContext');
     var e = jQuery.Event('mousedown');
     $(elm).triggerHandler(e);
     expect(elm.isolateScope().switchMarkupContext).toHaveBeenCalled();
   }));

/*
   it('should react to mouseup', angular.mock.inject(function ($compile) {
     compile('test');
     spyOn(elm.isolateScope(), 'setSelectDrag');
     spyOn(elm.isolateScope(), 'switchMarkupContext');
     var e = jQuery.Event('mouseup');
     $(elm).trigger(e);
     expect(elm.isolateScope().setSelectDrag).toHaveBeenCalled();
     expect(elm.isolateScope().switchMarkupContext).toHaveBeenCalled();
   }));
  */

   it('should react to mouseleave', angular.mock.inject(function ($compile, SoundHandlerService, ViewStateService) {
     compile('test');
     spyOn(ViewStateService, 'getPermission').and.returnValue(true);
     SoundHandlerService.audioBuffer.length = 3;
     spyOn(elm.isolateScope(), 'switchMarkupContext');
     var e = jQuery.Event('mouseleave');
     $(elm).triggerHandler(e);
     expect(elm.isolateScope().switchMarkupContext).toHaveBeenCalled();
     expect(ViewStateService.getPermission).toHaveBeenCalledWith('labelAction');
   }));

   it('should react to mousemove (button 1)', angular.mock.inject(function ($compile, SoundHandlerService, ViewStateService) {
     compile('test');
     spyOn(elm.isolateScope(), 'setSelectDrag');
     spyOn(ViewStateService, 'getX').and.returnValue(500);
     var e = jQuery.Event('mousemove');
     e.buttons = 1;
     $(elm).triggerHandler(e);
     expect(elm.isolateScope().setSelectDrag).toHaveBeenCalled();
   }));

   it('should react to mousemove (button 0) -> early return', angular.mock.inject(function ($compile, SsffDataService, ConfigProviderService, SoundHandlerService, ViewStateService) {
     compile('test');
     ViewStateService.curPreselColumnSample = 0;
     ViewStateService.curCorrectionToolNr = 1;
     spyOn(ViewStateService, 'getPermission').and.returnValue(true);
     spyOn(ViewStateService, 'getX').and.returnValue(1);
     spyOn(ViewStateService, 'getViewPortStartTime').and.returnValue(1);
     spyOn(ViewStateService, 'getViewPortEndTime').and.returnValue(-3);
     spyOn(ConfigProviderService, 'getAssignment').and.returnValue({ data: [1, 2]});
     spyOn(SsffDataService, 'getColumnOfTrack').and.returnValue({ values: [[1, 2, 3], [1, 2, 3], [1, 2, 3]] });
     spyOn(SsffDataService, 'getSampleRateAndStartTimeOfTrack').and.returnValue({ sampleRate: 1, startTime: 0 });
     spyOn(elm.isolateScope(), 'switchMarkupContext');
     var e = jQuery.Event('mousemove');
     e.buttons = 0;
     e.originalEvent = {};
     e.originalEvent.target = {};
     e.originalEvent.target.width = 1000;
     $(elm).triggerHandler(e);
     expect(elm.isolateScope().switchMarkupContext).toHaveBeenCalled();
     expect(ViewStateService.getPermission).toHaveBeenCalledWith('labelAction');
   }));

   it('should react to mousemove (button 0)', angular.mock.inject(function ($compile, HistoryService, SsffDataService, ConfigProviderService, SoundHandlerService, ViewStateService) {
     compile('test');
     ViewStateService.curPreselColumnSample = 0;
     ViewStateService.curCorrectionToolNr = 1;
     spyOn(HistoryService, 'updateCurChangeObj').and.returnValue([{sampleBlockIdx: 0, newValue: 10}]);
     spyOn(ViewStateService, 'getPermission').and.returnValue(true);
     spyOn(ViewStateService, 'getX').and.returnValue(1);
     spyOn(ViewStateService, 'getViewPortStartTime').and.returnValue(0);
     spyOn(ViewStateService, 'getViewPortEndTime').and.returnValue(2);
     spyOn(ConfigProviderService, 'getAssignment').and.returnValue({ data: [1, 2]});
     spyOn(SsffDataService, 'getColumnOfTrack').and.returnValue({ values: [[1, 2, 3], [1, 2, 3], [1, 2, 3]] });
     spyOn(SsffDataService, 'getSampleRateAndStartTimeOfTrack').and.returnValue({ sampleRate: 100, startTime: 0 });
     spyOn(elm.isolateScope(), 'switchMarkupContext');
     var e = jQuery.Event('mousemove');
     e.buttons = 0;
     e.shiftKey = true;
     e.originalEvent = {};
     e.originalEvent.target = {};
     e.originalEvent.target.width = 100;
     $(elm).triggerHandler(e);
     expect(elm.isolateScope().switchMarkupContext).toHaveBeenCalled();
     expect(ViewStateService.getPermission).toHaveBeenCalledWith('labelAction');
     expect(HistoryService.updateCurChangeObj).toHaveBeenCalled();
   }));

   it('should setSelectDrag', angular.mock.inject(function ($compile, ViewStateService) {
     compile('test');
     spyOn(ViewStateService, 'select');
     spyOn(ViewStateService, 'getSamplesPerPixelVal').and.returnValue(5);
     spyOn(ViewStateService, 'getX').and.returnValue(5);
     elm.isolateScope().setSelectDrag();
     expect(ViewStateService.select).toHaveBeenCalled();
   }));

   it('should switchMarkupContext (OSCI)', angular.mock.inject(function ($compile, ConfigProviderService, ViewStateService, DrawHelperService) {
     compile('OSCI');
     ConfigProviderService.setVals(defaultArticConfig);
     ConfigProviderService.curDbConfig = aeDbConfig;
     spyOn(DrawHelperService, 'drawMovingBoundaryLine');
     spyOn(DrawHelperService, 'drawViewPortTimes');
     spyOn(DrawHelperService, 'drawCurViewPortSelected');
     spyOn(DrawHelperService, 'drawCrossHairs');
     elm.isolateScope().switchMarkupContext();
     expect(DrawHelperService.drawMovingBoundaryLine).toHaveBeenCalled();
     expect(DrawHelperService.drawViewPortTimes).toHaveBeenCalled();
     expect(DrawHelperService.drawCurViewPortSelected).toHaveBeenCalled();
     expect(DrawHelperService.drawCrossHairs).toHaveBeenCalled();
   }));

   it('should switchMarkupContext (SPEC)', angular.mock.inject(function ($compile, ConfigProviderService, ViewStateService, DrawHelperService) {
     compile('SPEC');
     ConfigProviderService.setVals(defaultArticConfig);
     ConfigProviderService.curDbConfig = aeDbConfig;
     spyOn(DrawHelperService, 'drawMovingBoundaryLine');
     spyOn(DrawHelperService, 'drawCurViewPortSelected');
     spyOn(DrawHelperService, 'drawMinMaxAndName');
     spyOn(DrawHelperService, 'drawCrossHairs');
     elm.isolateScope().switchMarkupContext();
     expect(DrawHelperService.drawMovingBoundaryLine).toHaveBeenCalled();
     expect(DrawHelperService.drawCurViewPortSelected).toHaveBeenCalled();
     expect(DrawHelperService.drawMinMaxAndName).toHaveBeenCalled();
     expect(DrawHelperService.drawCrossHairs).toHaveBeenCalled();
   }));

   it('should switchMarkupContext (other)', angular.mock.inject(function ($compile, SsffDataService, ConfigProviderService, ViewStateService, DrawHelperService) {
     compile('other');
     ConfigProviderService.setVals(defaultArticConfig);
     ConfigProviderService.curDbConfig = aeDbConfig;
     spyOn(DrawHelperService, 'drawMovingBoundaryLine');
     spyOn(DrawHelperService, 'drawCurViewPortSelected');
     spyOn(DrawHelperService, 'drawMinMaxAndName');
     spyOn(DrawHelperService, 'drawCrossHairs');
     spyOn(SsffDataService, 'getColumnOfTrack').and.returnValue({_minVal: 1, _maxVal: 2});
     elm.isolateScope().switchMarkupContext();
     expect(DrawHelperService.drawMovingBoundaryLine).toHaveBeenCalled();
     expect(DrawHelperService.drawCurViewPortSelected).toHaveBeenCalled();
     expect(DrawHelperService.drawMinMaxAndName).toHaveBeenCalled();
     expect(DrawHelperService.drawCrossHairs).toHaveBeenCalled();
     expect(ConfigProviderService.getSsffTrackConfig).toHaveBeenCalled();
     expect(SsffDataService.getColumnOfTrack).toHaveBeenCalled();
   }));

});
