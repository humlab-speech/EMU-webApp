'use strict';



describe('Directive: epg', function () {

    var elm, scope, tpl;
    beforeEach(angular.mock.module('artic'));

    beforeEach(angular.mock.inject(function ($rootScope, $compile, ViewStateService, fontScaleService, ConfigProviderService, SsffDataService, SoundHandlerService) {
        scope = $rootScope.$new();
        scope.cps = ConfigProviderService;
        scope.ssffds = SsffDataService;
        scope.cps.setVals(defaultArticConfig);
        scope.cps.design = defaultArticDesign;
        scope.shs = SoundHandlerService;
        scope.shs.audioBuffer.sampleRate = 1000;
        scope.fontImage = fontScaleService;
        scope.vs = ViewStateService;
    }));

    function compileDirective() {
        tpl = "<epg></epg>";
        angular.mock.inject(function ($compile) {
            elm = $compile(tpl)(scope);
        });
        scope.$digest();
    }

    it('should have correct html', function () {
        compileDirective();
        expect(elm.find('canvas').length).toBe(1);
    });


    it('should watch vs.timelineSize', angular.mock.inject(function ($timeout) {
        scope.ssffds.data = [1];
		var img = document.createElement('canvas');
		img.setAttribute('width',Math.round(200));
		img.setAttribute('height',Math.round(100));
        spyOn(scope.cps, 'getSsffTrackConfig').and.returnValue({name: 'test', columnName: 'test'});
        spyOn(scope.ssffds, 'getColumnOfTrack').and.returnValue({values: [[1, 2, 3]]});
        spyOn(scope.ssffds, 'getSampleRateAndStartTimeOfTrack').and.returnValue({sampleRate: 2, startTime: 1});
        spyOn(scope.fontImage, 'drawUndistortedTextTwoLines').and.returnValue(img);
        scope.vs.curViewPort.eS = 10;
        compileDirective();
        scope.vs.curViewPort.eS = 100;
        scope.$apply();
        expect(scope.fontImage.drawUndistortedTextTwoLines).toHaveBeenCalled();
    }));

});
