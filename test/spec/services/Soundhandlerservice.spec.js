'use strict';

describe('Service: SoundHandlerService', function () {
    var scope, SoundHandlerService;

    beforeEach(angular.mock.module('grazer'));

    beforeEach(angular.mock.inject(function ($rootScope, _SoundHandlerService_) {
        scope = $rootScope.$new();
        SoundHandlerService = _SoundHandlerService_;
    }));

    // ================================================================
    // audioBuffer getter — returns current audio buffer
    // ================================================================

    describe('audioBuffer getter', function () {

        it('should return audioBuffer property', function () {
            expect(SoundHandlerService.audioBuffer).toBeDefined();
        });

        it('should allow setting audioBuffer', function () {
            var mockBuffer = {
                sampleRate: 16000,
                length: 1000,
                getChannelData: function() { return new Float32Array(1000); }
            };
            SoundHandlerService.audioBuffer = mockBuffer;
            expect(SoundHandlerService.audioBuffer).toBe(mockBuffer);
        });

    });

    // ================================================================
    // playFromTo — sample range playback
    // ================================================================

    describe('playFromTo', function () {

        it('should not throw with valid sample range', function () {
            var mockBuffer = {
                sampleRate: 16000,
                length: 1000,
                getChannelData: function() { return new Float32Array(1000); }
            };
            SoundHandlerService.audioBuffer = mockBuffer;

            expect(function () {
                SoundHandlerService.playFromTo(0, 100);
            }).not.toThrow();
        });

        it('should not throw with empty range (start === end)', function () {
            var mockBuffer = {
                sampleRate: 16000,
                length: 1000,
                getChannelData: function() { return new Float32Array(1000); }
            };
            SoundHandlerService.audioBuffer = mockBuffer;

            expect(function () {
                SoundHandlerService.playFromTo(500, 500);
            }).not.toThrow();
        });

    });

});