'use strict';

describe('Service: SoundHandlerService', function () {
    var scope;

    // load the controller's module
    beforeEach(angular.mock.module('grazer'));

    beforeEach(angular.mock.inject(function ($rootScope) {
        scope = $rootScope.$new();
    }));

    /**
     *
     */
//    it('should extractRelPartOfWav of length 0 = only header', angular.mock.inject(function (SoundHandlerService) {
//        SoundHandlerService.wavJSO = parsedWavJSO;
//        var cutWav = SoundHandlerService.extractRelPartOfWav(0, 0);
//        expect(cutWav.byteLength).toEqual(44);
//    }));

    /**
     *
     */
/*
    it('should not play audio if wav is empty', angular.mock.inject(function (SoundHandlerService) {
        // TODO: spy on decodeAndPlay function and check that it isn't called
        //spyOn(SoundHandlerService, 'decodeAndPlay');

        SoundHandlerService.wavJSO = parsedWavJSO;
        SoundHandlerService.playFromTo(0,0);
        //expect(SoundHandlerService.decodeAndPlay).toNotHaveBeenCalled();

    }));
*/

});