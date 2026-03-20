'use strict';

describe('Directive: preview', function () {

    var elm, tpl, scope;
    beforeEach(angular.mock.module('artic', 'artic.templates'));

    beforeEach(angular.mock.inject(function ($rootScope, $compile, ConfigProviderService) {
        scope = $rootScope.$new();
        ConfigProviderService.setVals(defaultArticConfig);
    }));

    function compileDirective(val) {
        tpl = '<preview current-bundle-name="' + val + '"></preview>  ';
        angular.mock.inject(function ($compile) {
            elm = $compile(tpl)(scope);
        });
        scope.$digest();
    }

    it('should have correct html', angular.mock.inject(function (ViewStateService, SoundHandlerService, DrawHelperService) {
        compileDirective('ae');
        expect(elm.find('canvas').length).toBe(2);
        expect(elm.html()).toContain('artic-preview-canvas');
        expect(elm.html()).toContain('artic-preview-canvas-markup');
    }));

    it('should watch curViewPort', angular.mock.inject(function (ViewStateService, SoundHandlerService, DataService, DrawHelperService) {
        var spy1 = spyOn(DrawHelperService,'freshRedrawDrawOsciOnCanvas');
        DataService.setData(msajc003_bndl.annotation);
        SoundHandlerService.audioBuffer.length = 58089;
        SoundHandlerService.audioBuffer.getChannelData = function (n) {
            return(new Float32Array([1,2,3,4]));
        };

        compileDirective('ae');
        ViewStateService.curViewPort = {
            sS: 10,
            eS: 20
        }
        scope.$apply();
        expect(spy1).toHaveBeenCalled();
    }));

    it('should watch currentBundleName', angular.mock.inject(function (ViewStateService, SoundHandlerService, DataService, DrawHelperService) {
        var spy1 = spyOn(DrawHelperService,'freshRedrawDrawOsciOnCanvas');
        DataService.setData(msajc003_bndl.annotation);
        SoundHandlerService.audioBuffer.length = 58089;
        SoundHandlerService.audioBuffer.getChannelData = function (n) {
            return(new Float32Array([1,2,3,4]));
        };

        compileDirective('ae');
        scope.currentBundleName = 'msajc010';
        scope.$apply();
        expect(spy1).toHaveBeenCalled();
    }));

    it('should render selectedAreaColor in the middle of the canvas', angular.mock.inject(function (ViewStateService, DataService, ConfigProviderService) {
        DataService.setData(msajc003_bndl.annotation);
        compileDirective('ae');
        ViewStateService.curViewPort = {
            sS: 0,
            eS: 57989
        }
        scope.$apply();
        var markup = elm.find('canvas')[1];
        var ctx = markup.getContext('2d');
        var colorMiddle = ctx.getImageData(1, 1, 1, 1).data;
        expect(parseInt(colorMiddle[0])).toBe(0); // Hardcode for now
        expect(parseInt(colorMiddle[1])).toBe(0); // Hardcode for now
        expect(parseInt(colorMiddle[2])).toBe(0); // Hardcode for now
    }));
});
