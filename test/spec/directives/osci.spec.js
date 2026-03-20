'use strict';



describe('Directive: osci', function () {

    var elm, tpl, scope, curLvl;
    var lvlName = 'Phonetic';
    beforeEach(angular.mock.module('artic', 'artic.templates'));

    beforeEach(angular.mock.inject(function ($rootScope, $compile, DrawHelperService, DataService, LevelService, ConfigProviderService, ViewStateService, SoundHandlerService) {
        scope = $rootScope.$new();
        scope.lvl = LevelService;
        scope.cps = ConfigProviderService;
        scope.shs = SoundHandlerService;
        scope.dhs = DrawHelperService;
        scope.cps.setVals(defaultArticConfig);
        scope.cps.curDbConfig = aeDbConfig;
        scope.cps.design = defaultArticDesign;
        scope.vs = ViewStateService;
        scope.data = DataService;
        scope.data.setData(msajc003_bndl.annotation);
        scope.level = curLvl;

        scope.shs.audioBuffer.getChannelData = function (n) {
            var res = new Float32Array([1,2,3,4]);
            return(res);
        };
    }));

    function compileDirective() {
        tpl = "<osci order='0' track-name='OSCI'></osci>";
        angular.mock.inject(function ($compile) {
            elm = $compile(tpl)(scope);
        });
        scope.$digest();
    }

   it('should have correct html', function () {
     compileDirective();
     expect(elm.isolateScope()).toBeDefined();
     expect(elm.find('canvas').length).toBe(3);
     expect(elm.find('div').length).toBe(3);
     expect(elm.find('img').length).toBe(1);
   });

   it('should watch ViewStateService.playHeadAnimationInfos', function () {
     scope.vs.playHeadAnimationInfos.sS = 1;
     compileDirective();
     scope.shs.audioBuffer.length = 3;
     expect(elm.isolateScope()).toBeDefined();
     spyOn(elm.isolateScope(), 'drawPlayHead');
     scope.vs.playHeadAnimationInfos.sS = 10;
     scope.$digest();
     expect(elm.isolateScope().drawPlayHead).toHaveBeenCalled();
   });

   it('should watch ViewStateService.movingBoundarySample', function () {
     scope.vs.movingBoundarySample = 1;
     compileDirective();
     scope.shs.audioBuffer.length = 3;
     expect(elm.isolateScope()).toBeDefined();
     spyOn(elm.isolateScope(), 'drawVpOsciMarkup');
     scope.vs.movingBoundarySample = 10;
     scope.$digest();
     expect(elm.isolateScope().drawVpOsciMarkup).toHaveBeenCalled();
   });
   
   it('should watch ViewStateService.movingBoundary', function () {
     scope.vs.movingBoundary = false;
     compileDirective();
     scope.shs.audioBuffer.length = 3;
     expect(elm.isolateScope()).toBeDefined();
     spyOn(elm.isolateScope(), 'drawVpOsciMarkup');
     scope.vs.movingBoundary = true;
     scope.$digest();
     expect(elm.isolateScope().drawVpOsciMarkup).toHaveBeenCalled();
   });
   
   it('should watch ViewStateService.curViewPort (same value)', function () {
     scope.vs.curViewPort.sS = 1;
     scope.vs.curViewPort.eS = 2;
     compileDirective();
     scope.shs.audioBuffer.length = 3;
     expect(elm.isolateScope()).toBeDefined();
     spyOn(elm.isolateScope(), 'drawVpOsciMarkup');
     spyOn(scope.dhs, 'freshRedrawDrawOsciOnCanvas');
     scope.vs.curViewPort.sS = 2;
     scope.vs.curViewPort.eS = 3;
     scope.$digest();
     expect(elm.isolateScope().drawVpOsciMarkup).toHaveBeenCalled();
     expect(scope.dhs.freshRedrawDrawOsciOnCanvas).toHaveBeenCalled();
   });
});
