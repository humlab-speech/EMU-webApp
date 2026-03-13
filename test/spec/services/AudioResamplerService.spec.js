'use strict';

describe('Service: AudioResamplerService', function () {

	beforeEach(angular.mock.module('grazer'));

	/**
	 * Build a minimal 16-bit mono WAV ArrayBuffer from a Float32Array of samples.
	 */
	function buildWav16(samples, sampleRate) {
		var numSamples = samples.length;
		var bytesPerSample = 2;
		var dataSize = numSamples * bytesPerSample;
		var buf = new ArrayBuffer(44 + dataSize);
		var v = new DataView(buf);
		// RIFF header
		writeStr(v, 0, 'RIFF');
		v.setUint32(4, 36 + dataSize, true);
		writeStr(v, 8, 'WAVE');
		writeStr(v, 12, 'fmt ');
		v.setUint32(16, 16, true);
		v.setUint16(20, 1, true); // PCM
		v.setUint16(22, 1, true); // mono
		v.setUint32(24, sampleRate, true);
		v.setUint32(28, sampleRate * bytesPerSample, true);
		v.setUint16(32, bytesPerSample, true);
		v.setUint16(34, 16, true);
		writeStr(v, 36, 'data');
		v.setUint32(40, dataSize, true);
		var off = 44;
		for (var i = 0; i < numSamples; i++) {
			var s = Math.max(-1, Math.min(1, samples[i]));
			v.setInt16(off, s < 0 ? s * 32768 : s * 32767, true);
			off += 2;
		}
		return buf;
	}

	function writeStr(view, offset, str) {
		for (var i = 0; i < str.length; i++) {
			view.setUint8(offset + i, str.charCodeAt(i));
		}
	}

	function makeHeaderInfos(sampleRate, numSamples) {
		return {
			SampleRate: sampleRate,
			NumChannels: 1,
			BitsPerSample: 16,
			AudioFormat: 1,
			dataChunkSize: numSamples * 2,
			offsetToDataChunk: 44
		};
	}

	it('should report needsResampling=true for Safari with low sample rate', angular.mock.inject(function (AudioResamplerService, BrowserDetectorService) {
		spyOn(BrowserDetectorService, 'isSafariOrWebKit').mockReturnValue(true);
		expect(AudioResamplerService.needsResampling(22050)).toBe(true);
		expect(AudioResamplerService.needsResampling(16000)).toBe(true);
	}));

	it('should report needsResampling=false for non-Safari or high sample rate', angular.mock.inject(function (AudioResamplerService, BrowserDetectorService) {
		spyOn(BrowserDetectorService, 'isSafariOrWebKit').mockReturnValue(false);
		expect(AudioResamplerService.needsResampling(22050)).toBe(false);

		BrowserDetectorService.isSafariOrWebKit.mockReturnValue(true);
		expect(AudioResamplerService.needsResampling(44100)).toBe(false);
		expect(AudioResamplerService.needsResampling(48000)).toBe(false);
	}));

	it('should resample a constant-value signal and preserve amplitude', angular.mock.inject(function ($rootScope, AudioResamplerService) {
		var srcRate = 22050;
		var targetRate = 44100;
		var numSamples = 100;
		var samples = new Float32Array(numSamples);
		for (var i = 0; i < numSamples; i++) {
			samples[i] = 0.5;
		}
		var wav = buildWav16(samples, srcRate);
		var headerInfos = makeHeaderInfos(srcRate, numSamples);

		var result;
		AudioResamplerService.resampleWavBuffer(wav, headerInfos, targetRate).then(function (r) {
			result = r;
		});
		$rootScope.$digest();

		expect(result).toBeDefined();
		expect(result.resampledWavBuf).toBeDefined();
		// Output WAV header should have target sample rate
		var outView = new DataView(result.resampledWavBuf);
		expect(outView.getUint32(24, true)).toBe(targetRate);
		// originalBuffer should have source rate
		expect(result.originalBuffer.sampleRate).toBe(srcRate);
		// Output length should be ~double the input
		var outDataSize = outView.getUint32(40, true);
		var outNumSamples = outDataSize / 2; // 16-bit mono
		expect(outNumSamples).toBe(Math.ceil(numSamples * (targetRate / srcRate)));
		// All output samples should be close to 0.5 (constant signal preserved)
		for (var i = 0; i < outNumSamples; i++) {
			var s = outView.getInt16(44 + i * 2, true) / 32767;
			expect(Math.abs(s - 0.5)).toBeLessThan(0.02);
		}
	}));

	it('should produce same-length output when source and target rates are equal', angular.mock.inject(function ($rootScope, AudioResamplerService) {
		var rate = 44100;
		var numSamples = 50;
		var samples = new Float32Array(numSamples);
		for (var i = 0; i < numSamples; i++) {
			samples[i] = i / numSamples; // linear ramp 0..1
		}
		var wav = buildWav16(samples, rate);
		var headerInfos = makeHeaderInfos(rate, numSamples);

		var result;
		AudioResamplerService.resampleWavBuffer(wav, headerInfos, rate).then(function (r) {
			result = r;
		});
		$rootScope.$digest();

		expect(result).toBeDefined();
		var outView = new DataView(result.resampledWavBuf);
		var outDataSize = outView.getUint32(40, true);
		var outNumSamples = outDataSize / 2;
		expect(outNumSamples).toBe(numSamples);
	}));

	it('should reject promise on invalid input', angular.mock.inject(function ($rootScope, AudioResamplerService) {
		var headerInfos = makeHeaderInfos(22050, 100);
		// Pass a too-small buffer to trigger DataView out-of-bounds
		var tinyBuf = new ArrayBuffer(10);

		var error;
		AudioResamplerService.resampleWavBuffer(tinyBuf, headerInfos, 44100).then(null, function (e) {
			error = e;
		});
		$rootScope.$digest();

		expect(error).toBeDefined();
		expect(error.status.type).toBe('ERROR');
	}));
});
