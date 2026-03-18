import { parseWavHeader as parseWavHeaderShared } from '../../app/services/wav-header-parser';

export function detectAudioFormat(buf: ArrayBuffer): string {
	var bytes = new Uint8Array(buf, 0, Math.min(12, buf.byteLength));
	if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46) return 'wav';
	if (bytes[0] === 0xFF && (bytes[1] === 0xFB || bytes[1] === 0xF3 || bytes[1] === 0xF2)) return 'mp3';
	if (bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33) return 'mp3'; // ID3
	if (bytes[0] === 0x66 && bytes[1] === 0x4C && bytes[2] === 0x61 && bytes[3] === 0x43) return 'flac';
	if (bytes[0] === 0x4F && bytes[1] === 0x67 && bytes[2] === 0x67 && bytes[3] === 0x53) return 'ogg';
	if (bytes.length >= 8 && bytes[4] === 0x66 && bytes[5] === 0x74 && bytes[6] === 0x79 && bytes[7] === 0x70) return 'mp4';
	if (bytes[0] === 0x1A && bytes[1] === 0x45 && bytes[2] === 0xDF && bytes[3] === 0xA3) return 'webm';
	return 'unknown';
}

function isActuallyMKV(buf: ArrayBuffer): boolean {
	// EBML container: scan first 64 bytes for DocType "matroska"
	var text = String.fromCharCode.apply(null, new Uint8Array(buf, 0, Math.min(64, buf.byteLength)) as any);
	return text.indexOf('matroska') !== -1;
}

export class AudioParserService {
	AudioResamplerService!: any;
	ViewStateService!: any;
	public _originalSampleRate: number;

	constructor() {
		this._originalSampleRate = 0;
	}

	initDeps(deps: { AudioResamplerService: any; ViewStateService: any }) {
		Object.assign(this, deps);
	}

	public parseWavHeader(buf): any {
		try {
			return parseWavHeaderShared(buf);
		} catch (e) {
			return ({ 'status': { 'type': 'ERROR', 'message': e.message } });
		}
	};

	public parseAudioBuf(buf) {
		var format = detectAudioFormat(buf);

		if (format === 'wav') {
			return this.parseWavPath(buf);
		}

		if (format === 'webm' && isActuallyMKV(buf)) {
			return Promise.reject({ 'status': { 'type': 'ERROR', 'message': 'MKV format is not supported. Please convert to MP4 or WebM.' } });
		}

		return this.decodeNonWav(buf);
	}

	public parseWavAudioBuf(buf) {
		return this.parseAudioBuf(buf);
	}

	private parseWavPath(buf) {
		var headerInfos = this.parseWavHeader(buf);
		if (typeof headerInfos.status !== 'undefined' && headerInfos.status.type === 'ERROR') {
			// WAV header parse failed — try browser decoding as fallback
			return this.decodeNonWav(buf);
		}

		if (this.AudioResamplerService.needsResampling(headerInfos.SampleRate)) {
			var origRate = headerInfos.SampleRate;
			return this.AudioResamplerService.resampleWavBuffer(buf, headerInfos, 44100)
				.then((result) => {
					this._originalSampleRate = origRate;
					this.ViewStateService.showToast('Audio resampled from ' + origRate + ' Hz to 44100 Hz (Safari compatibility)');
					return this.decodeResampledForPlayback(result.resampledWavBuf, headerInfos.NumChannels)
						.then((playbackAudioBuffer) => ({
							audioBuffer: result.originalBuffer,
							playbackBuffer: playbackAudioBuffer
						}));
				}).catch((err) => { console.error('Error resampling audio:', err); throw err; });
		}

		return new Promise((resolve, reject) => {
			try {
				var offlineCtx = new ((window as any).OfflineAudioContext || (window as any).webkitOfflineAudioContext)(
					headerInfos.NumChannels,
					headerInfos.dataChunkSize/headerInfos.NumChannels/(headerInfos.BitsPerSample/8),
					headerInfos.SampleRate);
				offlineCtx.decodeAudioData(buf,
					(decodedData) => { resolve({ audioBuffer: decodedData, playbackBuffer: null }); },
					(error) => { reject(error) });
			}catch (e){
				var errObj = {} as any;
				errObj.exception = JSON.stringify(e, null, 4);
				errObj.EMUwebAppComment = 'This could be because you are using Safari (or another webkit based browser) and the audio sample rate is not in the interval >= 44100 and <= 96000 which seem to currently be the only sample rates supported by the webkitOfflineAudioContext';
				var err = {} as any;
				err.status = {} as any;
				err.status.message = JSON.stringify(errObj, null, 4);
				reject(err);
			}
		});
	}

	private decodeNonWav(buf) {
		return new Promise((resolve, reject) => {
			try {
				var ctx = new ((window as any).AudioContext || (window as any).webkitAudioContext)();
				ctx.decodeAudioData(buf.slice(0),
					(decoded) => {
						ctx.close();
						if (this.AudioResamplerService.needsResampling(decoded.sampleRate)) {
							this.AudioResamplerService.resampleAudioBuffer(decoded, 44100).then((result) => {
								this._originalSampleRate = decoded.sampleRate;
								this.ViewStateService.showToast('Audio resampled from ' + decoded.sampleRate + ' Hz to 44100 Hz (Safari compatibility)');
								this.decodeResampledForPlayback(result.resampledWavBuf, decoded.numberOfChannels)
									.then((playbackBuffer) => {
										resolve({ audioBuffer: result.originalBuffer, playbackBuffer: playbackBuffer });
									});
							}).catch((err) => { reject(err); });
						} else {
							resolve({ audioBuffer: decoded, playbackBuffer: null });
						}
					},
					(error) => {
						ctx.close();
						reject({ 'status': { 'type': 'ERROR', 'message': 'Unsupported audio format. Browser could not decode this file.' } });
					}
				);
			} catch (e) {
				reject({ 'status': { 'type': 'ERROR', 'message': 'AudioContext not available: ' + e.message } });
			}
		});
	}

	private decodeResampledForPlayback(resampledWavBuf: ArrayBuffer, numChannels: number) {
		return new Promise((resolve, reject) => {
			try {
				var byteRate = new DataView(resampledWavBuf).getUint32(28, true);
				var dataSize = resampledWavBuf.byteLength - 44;
				var frames = dataSize / (numChannels * 2);
				var offlineCtx = new ((window as any).OfflineAudioContext || (window as any).webkitOfflineAudioContext)(
					numChannels, frames, 44100);
				offlineCtx.decodeAudioData(resampledWavBuf, resolve, reject);
			} catch (e) { reject(e); }
		});
	}
}

// New canonical name
export const audioParserService = new AudioParserService();
// Backward-compat alias
export const wavParserService = audioParserService;
// Legacy class alias
export { AudioParserService as WavParserService };
