import { AudioBufferLike } from '../../app/services/audio-buffer-like';

export class AudioResamplerService {
	// Dependencies — set via initDeps()
	BrowserDetectorService!: any;

	initDeps(deps: { BrowserDetectorService: any }) {
		Object.assign(this, deps);
	}

	public needsResampling(sampleRate: number): boolean {
		return sampleRate < 44100 && this.BrowserDetectorService.isSafariOrWebKit();
	}

	public resampleWavBuffer(buf: ArrayBuffer, headerInfos: any, targetRate: number) {
		return new Promise((resolve, reject) => {
		try {
			var srcRate = headerInfos.SampleRate;
			var numChannels = headerInfos.NumChannels;
			var bitsPerSample = headerInfos.BitsPerSample;
			var bytesPerSample = bitsPerSample / 8;
			var headerSize = headerInfos.offsetToDataChunk || 44;
			var dataView = new DataView(buf);
			var numSamples = headerInfos.dataChunkSize / (numChannels * bytesPerSample);
			var channelData: Float32Array[] = [];
			for (var ch = 0; ch < numChannels; ch++) { channelData.push(new Float32Array(numSamples)); }
			var offset = headerSize;
			for (var i = 0; i < numSamples; i++) {
				for (var ch = 0; ch < numChannels; ch++) {
					var sample: number;
					if (bitsPerSample === 16) { sample = dataView.getInt16(offset, true) / 32768; }
					else if (bitsPerSample === 24) { var b0 = dataView.getUint8(offset); var b1 = dataView.getUint8(offset + 1); var b2 = dataView.getInt8(offset + 2); sample = ((b2 << 16) | (b1 << 8) | b0) / 8388608; }
					else if (bitsPerSample === 32) { if (headerInfos.AudioFormat === 3) { sample = dataView.getFloat32(offset, true); } else { sample = dataView.getInt32(offset, true) / 2147483648; } }
					else { sample = (dataView.getUint8(offset) - 128) / 128; }
					channelData[ch][i] = sample;
					offset += bytesPerSample;
				}
			}
			var ratio = targetRate / srcRate;
			var outLength = Math.ceil(numSamples * ratio);
			var resampledChannels: Float32Array[] = [];
			for (var ch = 0; ch < numChannels; ch++) { resampledChannels.push(this.resampleChannel(channelData[ch], srcRate, targetRate, outLength)); }
			var outBytesPerSample = 2;
			var outDataSize = outLength * numChannels * outBytesPerSample;
			var outBufSize = 44 + outDataSize;
			var outBuf = new ArrayBuffer(outBufSize);
			var outView = new DataView(outBuf);
			this.writeString(outView, 0, 'RIFF');
			outView.setUint32(4, outBufSize - 8, true);
			this.writeString(outView, 8, 'WAVE');
			this.writeString(outView, 12, 'fmt ');
			outView.setUint32(16, 16, true);
			outView.setUint16(20, 1, true);
			outView.setUint16(22, numChannels, true);
			outView.setUint32(24, targetRate, true);
			outView.setUint32(28, targetRate * numChannels * outBytesPerSample, true);
			outView.setUint16(32, numChannels * outBytesPerSample, true);
			outView.setUint16(34, outBytesPerSample * 8, true);
			this.writeString(outView, 36, 'data');
			outView.setUint32(40, outDataSize, true);
			var writeOffset = 44;
			for (var i = 0; i < outLength; i++) {
				for (var ch = 0; ch < numChannels; ch++) {
					var s = Math.max(-1, Math.min(1, resampledChannels[ch][i]));
					outView.setInt16(writeOffset, s < 0 ? s * 32768 : s * 32767, true);
					writeOffset += 2;
				}
			}
			var originalBuffer = new AudioBufferLike(channelData, srcRate);
			resolve({ originalBuffer: originalBuffer, resampledWavBuf: outBuf });
		} catch (e) {
			reject({ 'status': { 'type': 'ERROR', 'message': 'Resampling failed: ' + e.message } });
		}
		});
	}

	private resampleChannel(input: Float32Array, srcRate: number, targetRate: number, outLength: number): Float32Array {
		var output = new Float32Array(outLength);
		var ratio = srcRate / targetRate;
		var a = 3;
		for (var i = 0; i < outLength; i++) {
			var srcPos = i * ratio;
			var srcIndex = Math.floor(srcPos);
			var sum = 0; var weightSum = 0;
			var start = Math.max(0, srcIndex - a + 1);
			var end = Math.min(input.length - 1, srcIndex + a);
			for (var j = start; j <= end; j++) { var x = srcPos - j; var w = this.lanczos(x, a); sum += input[j] * w; weightSum += w; }
			output[i] = weightSum > 0 ? sum / weightSum : 0;
		}
		return output;
	}

	private lanczos(x: number, a: number): number {
		if (x === 0) return 1;
		if (Math.abs(x) >= a) return 0;
		var px = Math.PI * x;
		return (a * Math.sin(px) * Math.sin(px / a)) / (px * px);
	}

	private writeString(view: DataView, offset: number, str: string) {
		for (var i = 0; i < str.length; i++) { view.setUint8(offset + i, str.charCodeAt(i)); }
	}
}

export const audioResamplerService = new AudioResamplerService();
