import * as angular from 'angular';
import { parseWavHeader as parseWavHeaderShared } from './wav-header-parser';

class WavParserService{
    private $q;
    private $window;
    private AudioResamplerService;
    private ViewStateService;
    public _originalSampleRate: number;

    private defer;

    constructor($q, $window, AudioResamplerService, ViewStateService){
        this.$q = $q;
        this.$window = $window;
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
            this.defer = this.$q.defer();
            try {
                var ctx = new (this.$window.AudioContext || this.$window.webkitAudioContext)();
                ctx.decodeAudioData(buf.slice(0),
                    (decodedData) => {
                        ctx.close();
                        this.defer.resolve({ audioBuffer: decodedData, playbackBuffer: null });
                    },
                    (error) => {
                        ctx.close();
                        this.defer.reject({
                            'status': {
                                'type': 'ERROR',
                                'message': 'Unsupported audio format. Browser could not decode this file. ' +
                                    '(WAV parse error: ' + headerInfos.status.message + ')'
                            }
                        });
                    }
                );
            } catch (e) {
                this.defer.reject({
                    'status': {
                        'type': 'ERROR',
                        'message': 'AudioContext not available: ' + e.message
                    }
                });
            }
            return this.defer.promise;
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
                    });
            }

            try {
                var offlineCtx = new (this.$window.OfflineAudioContext || this.$window.webkitOfflineAudioContext)(
                    headerInfos.NumChannels,
                    headerInfos.dataChunkSize/headerInfos.NumChannels/(headerInfos.BitsPerSample/8),
                    headerInfos.SampleRate);

                this.defer = this.$q.defer();
                // using non promise version as Safari doesn't support it yet
                offlineCtx.decodeAudioData(buf,
                    (decodedData) => { this.defer.resolve({ audioBuffer: decodedData, playbackBuffer: null }); },
                    (error) => { this.defer.reject(error) });

                return this.defer.promise;

            }catch (e){
                var errObj = {} as any;
                errObj.exception = JSON.stringify(e, null, 4);
                errObj.EMUwebAppComment = 'This could be because you are using Safari (or another webkit based browser) and the audio sample rate is not in the interval >= 44100 and <= 96000 which seem to currently be the only sample rates supported by the webkitOfflineAudioContext';

                var err = {} as any;
                err.status = {} as any;
                err.status.message = JSON.stringify(errObj, null, 4);

                this.defer = this.$q.defer();
                this.defer.reject(err);
                return this.defer.promise;
            }
        }
    };

    private decodeResampledForPlayback(resampledWavBuf: ArrayBuffer, numChannels: number) {
        var defer = this.$q.defer();
        try {
            var byteRate = new DataView(resampledWavBuf).getUint32(28, true);
            var dataSize = resampledWavBuf.byteLength - 44;
            var frames = dataSize / (numChannels * 2); // 16-bit output
            var offlineCtx = new (this.$window.OfflineAudioContext || this.$window.webkitOfflineAudioContext)(
                numChannels, frames, 44100);
            offlineCtx.decodeAudioData(resampledWavBuf,
                (decoded) => { defer.resolve(decoded); },
                (error) => { defer.reject(error); });
        } catch (e) {
            defer.reject(e);
        }
        return defer.promise;
    }

}

angular.module('grazer')
.service('WavParserService', ['$q', '$window', 'AudioResamplerService', 'ViewStateService', WavParserService]);
