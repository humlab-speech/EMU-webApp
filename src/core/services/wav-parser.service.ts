import { parseWavHeader as parseWavHeaderShared } from '../../app/services/wav-header-parser';

export class WavParserService {
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

	public parseWavAudioBuf(buf) {
		var headerInfos = this.parseWavHeader(buf);
		if(typeof headerInfos.status !== 'undefined' && headerInfos.status.type === 'ERROR'){
			return new Promise((resolve, reject) => {
				try {
					var ctx = new ((window as any).AudioContext || (window as any).webkitAudioContext)();
					ctx.decodeAudioData(buf.slice(0),
						(decodedData) => { ctx.close(); resolve({ audioBuffer: decodedData, playbackBuffer: null }); },
						(error) => {
							ctx.close();
							reject({ 'status': { 'type': 'ERROR', 'message': 'Unsupported audio format. Browser could not decode this file. (WAV parse error: ' + headerInfos.status.message + ')' } });
						}
					);
				} catch (e) {
					reject({ 'status': { 'type': 'ERROR', 'message': 'AudioContext not available: ' + e.message } });
				}
			});
		}else{
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
	};

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

export const wavParserService = new WavParserService();
