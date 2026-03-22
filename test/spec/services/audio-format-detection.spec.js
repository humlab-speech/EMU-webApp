'use strict';

var wavBuilders = require('../../fixtures/wav-builders');

describe('Use Case: Audio Format Detection & Parsing', function () {

  beforeEach(angular.mock.module('artic'));

  describe('standard PCM WAV', function () {

    it('should parse 16-bit mono 16kHz WAV', angular.mock.inject(function (WavParserService) {
      var buf = wavBuilders.buildPcmWav({ numChannels: 1, sampleRate: 16000, bitsPerSample: 16, numSamples: 100 });
      var h = WavParserService.parseWavHeader(buf);

      expect(h.status).toBeUndefined();
      expect(h.NumChannels).toBe(1);
      expect(h.SampleRate).toBe(16000);
      expect(h.BitsPerSample).toBe(16);
      expect(h.BlockAlign).toBe(2);
      expect(h.ByteRate).toBe(32000);
    }));

    it('should parse 16-bit stereo 44100Hz WAV', angular.mock.inject(function (WavParserService) {
      var buf = wavBuilders.buildPcmWav({ numChannels: 2, sampleRate: 44100, bitsPerSample: 16, numSamples: 50 });
      var h = WavParserService.parseWavHeader(buf);

      expect(h.status).toBeUndefined();
      expect(h.NumChannels).toBe(2);
      expect(h.SampleRate).toBe(44100);
      expect(h.BitsPerSample).toBe(16);
      expect(h.BlockAlign).toBe(4);
    }));

    it('should parse 8-bit mono WAV', angular.mock.inject(function (WavParserService) {
      var buf = wavBuilders.buildPcmWav({ numChannels: 1, sampleRate: 16000, bitsPerSample: 8, numSamples: 200 });
      var h = WavParserService.parseWavHeader(buf);

      expect(h.status).toBeUndefined();
      expect(h.NumChannels).toBe(1);
      expect(h.BitsPerSample).toBe(8);
      expect(h.BlockAlign).toBe(1);
      expect(h.ByteRate).toBe(16000);
    }));
  });

  describe('extensible WAV format', function () {

    it('should parse extensible WAV with PCM subformat', angular.mock.inject(function (WavParserService) {
      var buf = wavBuilders.buildExtensibleWav({ subFormat: 1, sampleRate: 44100, numChannels: 2, bitsPerSample: 16, numSamples: 50 });
      var h = WavParserService.parseWavHeader(buf);

      expect(h.status).toBeUndefined();
      expect(h.AudioFormat).toBe(1);
      expect(h.NumChannels).toBe(2);
      expect(h.SampleRate).toBe(44100);
      expect(h.BitsPerSample).toBe(16);
    }));
  });

  describe('WAV with extra chunks', function () {

    it('should correctly parse WAV with LIST chunk before data', angular.mock.inject(function (WavParserService) {
      var buf = wavBuilders.buildWavWithExtraChunk({ numChannels: 1, sampleRate: 16000, bitsPerSample: 16, numSamples: 10 });
      var h = WavParserService.parseWavHeader(buf);

      expect(h.status).toBeUndefined();
      expect(h.NumChannels).toBe(1);
      expect(h.SampleRate).toBe(16000);
      expect(h.offsetToDataChunk).toBe(60);
    }));
  });

  describe('varied sample rates', function () {

    it('should report correct sampleRate for 22050Hz WAV', angular.mock.inject(function (WavParserService) {
      var buf = wavBuilders.buildPcmWav({ numChannels: 1, sampleRate: 22050, bitsPerSample: 16, numSamples: 50 });
      var h = WavParserService.parseWavHeader(buf);

      expect(h.status).toBeUndefined();
      expect(h.SampleRate).toBe(22050);
    }));

    it('should report correct sampleRate for 48000Hz WAV', angular.mock.inject(function (WavParserService) {
      var buf = wavBuilders.buildPcmWav({ numChannels: 1, sampleRate: 48000, bitsPerSample: 16, numSamples: 50 });
      var h = WavParserService.parseWavHeader(buf);

      expect(h.status).toBeUndefined();
      expect(h.SampleRate).toBe(48000);
    }));

    it('should report correct sampleRate for 8000Hz WAV', angular.mock.inject(function (WavParserService) {
      var buf = wavBuilders.buildPcmWav({ numChannels: 1, sampleRate: 8000, bitsPerSample: 16, numSamples: 50 });
      var h = WavParserService.parseWavHeader(buf);

      expect(h.status).toBeUndefined();
      expect(h.SampleRate).toBe(8000);
    }));
  });
});
