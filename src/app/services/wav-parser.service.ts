import * as angular from 'angular';
import { parseWavHeader as parseWavHeaderShared } from './wav-header-parser';

class WavParserService{
    private AudioResamplerService;
    private ViewStateService;
    public _originalSampleRate: number;

    constructor(AudioResamplerService, ViewStateService){
        this.AudioResamplerService = AudioResamplerService;
        this.ViewStateService = ViewStateService;
        this._originalSampleRate = 0;
    }

    /**
    * parse header of wav file
    * @param buf ArrayBuffer containing entire wav file
    * @returns headerInfos object, or { status: { type: 'ERROR', message } } on failure
    */
    public parseWavHeader(buf): any {
        try {
            return parseWavHeaderShared(buf);
        } catch (e) {
            return ({
                'status': {
                    'type': 'ERROR',
                    'message': e.message
                }
            });
        }
    };

    /**
    * parse buffer containing audio file
    * For WAV files: parses header and uses OfflineAudioContext with exact frame count.
    * For non-WAV files (MP3, FLAC, AAC, OGG): falls back to native AudioContext.decodeAudioData().
    * @param buf ArrayBuffer containing audio file
    * @returns promise resolving to AudioBuffer
    */
    public parseWavAudioBuf(buf) {
        var headerInfos = this.parseWavHeader(buf);
        if(typeof headerInfos.status !== 'undefined' && headerInfos.status.type === 'ERROR'){
            // Not a valid WAV — try native decodeAudioData (supports MP3, FLAC, AAC, OGG, etc.)
            return new Promise((resolve, reject) => {
                try {
                    var ctx = new ((window as any).AudioContext || (window as any).webkitAudioContext)();
                    ctx.decodeAudioData(buf.slice(0),
                        (decodedData) => {
                            ctx.close();
                            resolve({ audioBuffer: decodedData, playbackBuffer: null });
                        },
                        (error) => {
                            ctx.close();
                            reject({
                                'status': {
                                    'type': 'ERROR',
                                    'message': 'Unsupported audio format. Browser could not decode this file. ' +
                                        '(WAV parse error: ' + headerInfos.status.message + ')'
                                }
                            });
                        }
                    );
                } catch (e) {
                    reject({
                        'status': {
                            'type': 'ERROR',
                            'message': 'AudioContext not available: ' + e.message
                        }
                    });
                }
            });
        }else{
            // Check if Safari resampling is needed before creating OfflineAudioContext
            if (this.AudioResamplerService.needsResampling(headerInfos.SampleRate)) {
                var origRate = headerInfos.SampleRate;
                return this.AudioResamplerService.resampleWavBuffer(buf, headerInfos, 44100)
                    .then((result) => {
                        this._originalSampleRate = origRate;
                        this.ViewStateService.showToast(
                            'Audio resampled from ' + origRate + ' Hz to 44100 Hz (Safari compatibility)');
                        return this.decodeResampledForPlayback(result.resampledWavBuf, headerInfos.NumChannels)
                            .then((playbackAudioBuffer) => {
                                return {
                                    audioBuffer: result.originalBuffer,
                                    playbackBuffer: playbackAudioBuffer
                                };
                            });
                    }).catch((err) => {
                        console.error('Error resampling audio:', err);
                        throw err;
                    });
            }

            return new Promise((resolve, reject) => {
                try {
                    var offlineCtx = new ((window as any).OfflineAudioContext || (window as any).webkitOfflineAudioContext)(
                        headerInfos.NumChannels,
                        headerInfos.dataChunkSize/headerInfos.NumChannels/(headerInfos.BitsPerSample/8),
                        headerInfos.SampleRate);

                    // using non promise version as Safari doesn't support it yet
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
                var frames = dataSize / (numChannels * 2); // 16-bit output
                var offlineCtx = new ((window as any).OfflineAudioContext || (window as any).webkitOfflineAudioContext)(
                    numChannels, frames, 44100);
                offlineCtx.decodeAudioData(resampledWavBuf, resolve, reject);
            } catch (e) {
                reject(e);
            }
        });
    }

}

angular.module('grazer')
.service('WavParserService', ['AudioResamplerService', 'ViewStateService', WavParserService]);
