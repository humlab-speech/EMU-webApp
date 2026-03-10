import * as angular from 'angular';
import { parseWavHeader as parseWavHeaderShared } from './wav-header-parser';

class WavParserService{
    private $q;
    private $window;

    private defer;

    constructor($q, $window){
        this.$q = $q;
        this.$window = $window;
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
    * parse buffer containing wav file using webworker
    * @param buf
    * @returns promise
    */
    public parseWavAudioBuf(buf) {
        var headerInfos = this.parseWavHeader(buf);
        if(typeof headerInfos.status !== 'undefined' && headerInfos.status.type === 'ERROR'){
            this.defer = this.$q.defer();
            this.defer.reject(headerInfos); // headerInfos now contains only error message
            return this.defer.promise;
        }else{
            try {
                var offlineCtx = new (this.$window.OfflineAudioContext || this.$window.webkitOfflineAudioContext)(
                    headerInfos.NumChannels,
                    headerInfos.dataChunkSize/headerInfos.NumChannels/(headerInfos.BitsPerSample/8),
                    headerInfos.SampleRate);

                    this.defer = this.$q.defer();
                    // using non promise version as Safari doesn't support it yet
                    offlineCtx.decodeAudioData(buf,
                        (decodedData) => { this.defer.resolve(decodedData); },
                        (error) => { this.defer.reject(error) });


                        return this.defer.promise;

                    }catch (e){
                        // construct error object
                        var errObj = {} as any;
                        errObj.exception = JSON.stringify(e, null, 4);
                        errObj.EMUwebAppComment = 'This could be because you are using Safari (or another webkit based browser) and the audio sample rate is not in the interval >= 44100 and <= 96000 which seem to currently be the only sample rates supported by the webkitOfflineAudioContext (see here https://github.com/WebKit/webkit/blob/29271ffbec500cd9c92050fcc0e613adffd0ce6a/Source/WebCore/Modules/webaudio/AudioContext.cpp#L111)';

                        var err = {} as any;
                        err.status = {} as any;
                        err.status.message = JSON.stringify(errObj, null, 4);

                        this.defer = this.$q.defer();
                        this.defer.reject(err); // headerInfos now contains only error message
                        return this.defer.promise;

                    }

                }


            };


        }

        angular.module('emuwebApp')
        .service('WavParserService', ['$q', '$window', WavParserService]);
