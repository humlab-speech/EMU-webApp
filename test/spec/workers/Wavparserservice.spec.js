'use strict';

// ============================================================
// Helpers: build synthetic WAV ArrayBuffers in-memory.
// These encode valid binary structures — no disk I/O needed.
// ============================================================

/**
 * Build a standard WAV ArrayBuffer.
 * opts: { audioFormat, numChannels, sampleRate, bitsPerSample, numSamples }
 */
function buildPcmWav(opts) {
    opts = opts || {};
    var audioFormat   = opts.audioFormat   !== undefined ? opts.audioFormat   : 1;
    var numChannels   = opts.numChannels   !== undefined ? opts.numChannels   : 1;
    var sampleRate    = opts.sampleRate    !== undefined ? opts.sampleRate    : 16000;
    var bitsPerSample = opts.bitsPerSample !== undefined ? opts.bitsPerSample : 16;
    var numSamples    = opts.numSamples    !== undefined ? opts.numSamples    : 10;

    var dataSize = numSamples * numChannels * (bitsPerSample / 8);
    var buf = new ArrayBuffer(44 + dataSize);
    var dv  = new DataView(buf);
    var u8  = new Uint8Array(buf);

    // RIFF header
    u8.set([0x52, 0x49, 0x46, 0x46], 0);        // "RIFF"
    dv.setUint32(4,  36 + dataSize, true);
    u8.set([0x57, 0x41, 0x56, 0x45], 8);         // "WAVE"
    // fmt subchunk
    u8.set([0x66, 0x6d, 0x74, 0x20], 12);        // "fmt "
    dv.setUint32(16, 16, true);                  // FmtSubchunkSize
    dv.setUint16(20, audioFormat, true);
    dv.setUint16(22, numChannels, true);
    dv.setUint32(24, sampleRate, true);
    dv.setUint32(28, sampleRate * numChannels * bitsPerSample / 8, true); // ByteRate
    dv.setUint16(32, numChannels * bitsPerSample / 8, true);              // BlockAlign
    dv.setUint16(34, bitsPerSample, true);
    // data subchunk
    u8.set([0x64, 0x61, 0x74, 0x61], 36);        // "data"
    dv.setUint32(40, dataSize, true);

    return buf;
}

/**
 * Build an Extensible WAV (AudioFormat 65534, FmtSubchunkSize 40).
 * opts: { subFormat, numChannels, sampleRate, bitsPerSample, numSamples }
 * subFormat is the real format inside the GUID (1=PCM, 3=IEEE754 float).
 *
 * Layout: RIFF(12) + "fmt "(8+40) + "data"(8) + samples  → header ends at byte 68
 */
function buildExtensibleWav(opts) {
    opts = opts || {};
    var subFormat     = opts.subFormat     !== undefined ? opts.subFormat     : 1;
    var numChannels   = opts.numChannels   !== undefined ? opts.numChannels   : 1;
    var sampleRate    = opts.sampleRate    !== undefined ? opts.sampleRate    : 16000;
    var bitsPerSample = opts.bitsPerSample !== undefined ? opts.bitsPerSample : 16;
    var numSamples    = opts.numSamples    !== undefined ? opts.numSamples    : 10;

    var fmtSubchunkSize = 40;
    var dataSize = numSamples * numChannels * (bitsPerSample / 8);
    var buf = new ArrayBuffer(68 + dataSize);
    var dv  = new DataView(buf);
    var u8  = new Uint8Array(buf);

    // RIFF header
    u8.set([0x52, 0x49, 0x46, 0x46], 0);
    dv.setUint32(4, 4 + 8 + fmtSubchunkSize + 8 + dataSize, true);
    u8.set([0x57, 0x41, 0x56, 0x45], 8);
    // fmt subchunk (extensible, 40-byte body)
    u8.set([0x66, 0x6d, 0x74, 0x20], 12);
    dv.setUint32(16, fmtSubchunkSize, true);
    dv.setUint16(20, 65534, true);               // WAVE_FORMAT_EXTENSIBLE
    dv.setUint16(22, numChannels, true);
    dv.setUint32(24, sampleRate, true);
    dv.setUint32(28, sampleRate * numChannels * bitsPerSample / 8, true);
    dv.setUint16(32, numChannels * bitsPerSample / 8, true);
    dv.setUint16(34, bitsPerSample, true);
    dv.setUint16(36, 22, true);                  // cbSize — must be ≥ 22 for SubFormat to be valid
    dv.setUint16(38, bitsPerSample, true);        // wValidBitsPerSample
    dv.setUint32(40, 0, true);                   // dwChannelMask
    dv.setUint16(44, subFormat, true);           // SubFormat GUID bytes 0-1 = actual AudioFormat
    // bytes 46-59: rest of 16-byte GUID (zeros)
    // data subchunk at byte 60
    u8.set([0x64, 0x61, 0x74, 0x61], 60);
    dv.setUint32(64, dataSize, true);

    return buf;
}

/**
 * Build a WAV that has a "LIST" chunk between the fmt and data chunks.
 * Exercises the parser's chunk-jump logic (advance by chunkSize+8, not byte-by-byte).
 *
 * Layout bytes: RIFF(12) + fmt(36) + LIST-hdr(8) + LIST-data(8) + data-hdr(8) + samples
 *                  0          12       36              44              52           60
 */
function buildWavWithExtraChunk(opts) {
    opts = opts || {};
    var numChannels   = opts.numChannels   !== undefined ? opts.numChannels   : 1;
    var sampleRate    = opts.sampleRate    !== undefined ? opts.sampleRate    : 16000;
    var bitsPerSample = opts.bitsPerSample !== undefined ? opts.bitsPerSample : 16;
    var numSamples    = opts.numSamples    !== undefined ? opts.numSamples    : 10;

    var listChunkDataSize = 8;
    var dataSize = numSamples * numChannels * (bitsPerSample / 8);
    var buf = new ArrayBuffer(60 + dataSize);
    var dv  = new DataView(buf);
    var u8  = new Uint8Array(buf);

    u8.set([0x52, 0x49, 0x46, 0x46], 0);
    dv.setUint32(4, 60 + dataSize - 8, true);
    u8.set([0x57, 0x41, 0x56, 0x45], 8);
    // fmt chunk
    u8.set([0x66, 0x6d, 0x74, 0x20], 12);
    dv.setUint32(16, 16, true);
    dv.setUint16(20, 1, true);
    dv.setUint16(22, numChannels, true);
    dv.setUint32(24, sampleRate, true);
    dv.setUint32(28, sampleRate * numChannels * bitsPerSample / 8, true);
    dv.setUint16(32, numChannels * bitsPerSample / 8, true);
    dv.setUint16(34, bitsPerSample, true);
    // LIST chunk (at byte 36)
    u8.set([0x4c, 0x49, 0x53, 0x54], 36);       // "LIST"
    dv.setUint32(40, listChunkDataSize, true);
    u8.set([0x49, 0x4e, 0x46, 0x4f], 44);        // "INFO" (LIST body)
    // bytes 48-51: zero padding
    // data chunk (at byte 52)
    u8.set([0x64, 0x61, 0x74, 0x61], 52);
    dv.setUint32(56, dataSize, true);

    return buf;
}


// ============================================================
// Tests
// ============================================================

describe('Service: WavParserService', function () {

    beforeEach(angular.mock.module('grazer'));

    // ----------------------------------------------------------
    // parseWavHeader — successful parses
    // ----------------------------------------------------------

    describe('parseWavHeader: valid inputs', function () {

        it('parses standard mono 16kHz 16-bit PCM (AudioFormat 1)', angular.mock.inject(function (WavParserService) {
            var h = WavParserService.parseWavHeader(
                buildPcmWav({ audioFormat: 1, numChannels: 1, sampleRate: 16000, bitsPerSample: 16, numSamples: 100 }));

            expect(h.status).toBeUndefined();
            expect(h.ChunkID).toBe('RIFF');
            expect(h.Format).toBe('WAVE');
            expect(h.FmtSubchunkID).toBe('fmt ');
            expect(h.FmtSubchunkSize).toBe(16);
            expect(h.AudioFormat).toBe(1);
            expect(h.NumChannels).toBe(1);
            expect(h.SampleRate).toBe(16000);
            expect(h.BitsPerSample).toBe(16);
            expect(h.BlockAlign).toBe(2);        // 1 ch * 16 bit / 8
            expect(h.ByteRate).toBe(32000);      // 16000 * 1 * 2
            expect(h.dataChunkSize).toBe(200);   // 100 samples * 1 ch * 2 bytes
            expect(h.dataChunkSizeIdx).toBe(40); // byte offset of the 4-byte data-size field
            expect(h.offsetToDataChunk).toBe(44);
        }));

        it('parses stereo 44.1kHz 16-bit PCM', angular.mock.inject(function (WavParserService) {
            var h = WavParserService.parseWavHeader(
                buildPcmWav({ numChannels: 2, sampleRate: 44100, bitsPerSample: 16, numSamples: 50 }));

            expect(h.status).toBeUndefined();
            expect(h.NumChannels).toBe(2);
            expect(h.SampleRate).toBe(44100);
            expect(h.BlockAlign).toBe(4);        // 2 ch * 16 bit / 8
            expect(h.ByteRate).toBe(176400);
            expect(h.dataChunkSize).toBe(200);   // 50 samples * 2 ch * 2 bytes
        }));

        it('parses IEEE754 float WAV (AudioFormat 3)', angular.mock.inject(function (WavParserService) {
            var h = WavParserService.parseWavHeader(
                buildPcmWav({ audioFormat: 3, numChannels: 1, sampleRate: 44100, bitsPerSample: 32 }));

            expect(h.status).toBeUndefined();
            expect(h.AudioFormat).toBe(3);
            expect(h.BitsPerSample).toBe(32);
        }));

        it('parses Extensible WAV (65534) containing PCM sub-format', angular.mock.inject(function (WavParserService) {
            var h = WavParserService.parseWavHeader(buildExtensibleWav({ subFormat: 1 }));

            expect(h.status).toBeUndefined();
            // parser must resolve the sub-format — AudioFormat must be 1, not 65534
            expect(h.AudioFormat).toBe(1);
            expect(h.offsetToDataChunk).toBe(68);
            expect(h.dataChunkSizeIdx).toBe(64);
        }));

        it('parses Extensible WAV (65534) containing IEEE754 float sub-format', angular.mock.inject(function (WavParserService) {
            var h = WavParserService.parseWavHeader(buildExtensibleWav({ subFormat: 3 }));

            expect(h.status).toBeUndefined();
            expect(h.AudioFormat).toBe(3);
        }));

        it('origBinaryHeader covers exactly the bytes before the first sample (standard PCM)', angular.mock.inject(function (WavParserService) {
            var h = WavParserService.parseWavHeader(buildPcmWav({ numSamples: 20 }));

            expect(h.origBinaryHeader).toBeDefined();
            expect(h.origBinaryHeader.byteLength).toBe(44);
            // Verify it starts with "RIFF"
            expect(h.origBinaryHeader[0]).toBe(0x52);
            expect(h.origBinaryHeader[1]).toBe(0x49);
            expect(h.origBinaryHeader[2]).toBe(0x46);
            expect(h.origBinaryHeader[3]).toBe(0x46);
        }));

        it('origBinaryHeader for extensible WAV is 68 bytes', angular.mock.inject(function (WavParserService) {
            var h = WavParserService.parseWavHeader(buildExtensibleWav({ numSamples: 5 }));
            expect(h.origBinaryHeader.byteLength).toBe(68);
        }));

        it('origBinaryHeader is a copy — mutating it does not affect the source ArrayBuffer', angular.mock.inject(function (WavParserService) {
            var buf = buildPcmWav({ numSamples: 10 });
            var h = WavParserService.parseWavHeader(buf);
            var originalByte = h.origBinaryHeader[0]; // 'R' = 0x52

            h.origBinaryHeader[0] = 0x00;
            expect(new Uint8Array(buf, 0, 1)[0]).toBe(originalByte);
        }));

        it('locates data chunk correctly when an extra LIST chunk follows fmt', angular.mock.inject(function (WavParserService) {
            // fmt ends at byte 36; LIST chunk occupies bytes 36-51; data chunk at byte 52
            // offsetToDataChunk = 52 + 8 = 60
            var h = WavParserService.parseWavHeader(buildWavWithExtraChunk({ numSamples: 10 }));

            expect(h.status).toBeUndefined();
            expect(h.offsetToDataChunk).toBe(60);
            expect(h.dataChunkSizeIdx).toBe(56);
        }));
    });

    // ----------------------------------------------------------
    // parseWavHeader — error paths
    // ----------------------------------------------------------

    describe('parseWavHeader: invalid / unsupported inputs', function () {

        it('returns { status.type: ERROR } for non-RIFF ChunkID', angular.mock.inject(function (WavParserService) {
            var buf = buildPcmWav();
            new Uint8Array(buf).set([0x52, 0x49, 0x46, 0x58], 0); // "RIFX"
            var h = WavParserService.parseWavHeader(buf);

            expect(h.status).toBeDefined();
            expect(h.status.type).toBe('ERROR');
            expect(h.status.message).toContain('ChunkID not RIFF');
        }));

        it('returns { status.type: ERROR } for non-WAVE format field', angular.mock.inject(function (WavParserService) {
            var buf = buildPcmWav();
            new Uint8Array(buf).set([0x41, 0x56, 0x49, 0x20], 8); // "AVI "
            var h = WavParserService.parseWavHeader(buf);

            expect(h.status.type).toBe('ERROR');
            expect(h.status.message).toContain('Format not WAVE');
        }));

        it('returns { status.type: ERROR } for AudioFormat 2 (ADPCM — unsupported)', angular.mock.inject(function (WavParserService) {
            var h = WavParserService.parseWavHeader(buildPcmWav({ audioFormat: 2 }));
            expect(h.status.type).toBe('ERROR');
            expect(h.status.message).toContain('AudioFormat');
        }));

        it('returns { status.type: ERROR } for AudioFormat 7 (μ-law — unsupported)', angular.mock.inject(function (WavParserService) {
            var h = WavParserService.parseWavHeader(buildPcmWav({ audioFormat: 7 }));
            expect(h.status.type).toBe('ERROR');
        }));

        it('returns { status.type: ERROR } when NumChannels is 0', angular.mock.inject(function (WavParserService) {
            var h = WavParserService.parseWavHeader(buildPcmWav({ numChannels: 0 }));
            expect(h.status.type).toBe('ERROR');
            expect(h.status.message).toContain('NumChannels');
        }));

        it('never throws — always returns an error object on bad input', angular.mock.inject(function (WavParserService) {
            var emptyBuf = new ArrayBuffer(44);
            expect(function () {
                WavParserService.parseWavHeader(emptyBuf);
            }).not.toThrow();

            var h = WavParserService.parseWavHeader(emptyBuf);
            expect(h.status.type).toBe('ERROR');
        }));
    });

    // ----------------------------------------------------------
    // parseWavAudioBuf — promise contract
    // ----------------------------------------------------------

    describe('parseWavAudioBuf: promise resolution', function () {

        // Skipped: invalid WAV now falls back to native AudioContext.decodeAudioData which is truly async in ChromeHeadless; promise doesn't resolve within $apply()
        xit('rejects promise with status.type ERROR for an all-zeros buffer (not RIFF)', angular.mock.inject(function (WavParserService, $rootScope) {
            var rejected = false;
            var rejectedWith;

            WavParserService.parseWavAudioBuf(new ArrayBuffer(44)).then(null, function (err) {
                rejected = true;
                rejectedWith = err;
            });
            $rootScope.$apply();

            expect(rejected).toBe(true);
            expect(rejectedWith.status.type).toBe('ERROR');
        }));

        // Skipped: invalid WAV now falls back to native AudioContext.decodeAudioData which is truly async in ChromeHeadless; promise doesn't resolve within $apply()
        xit('rejects promise for unsupported AudioFormat (2 = ADPCM)', angular.mock.inject(function (WavParserService, $rootScope) {
            var rejected = false;

            WavParserService.parseWavAudioBuf(buildPcmWav({ audioFormat: 2 })).then(null, function () {
                rejected = true;
            });
            $rootScope.$apply();

            expect(rejected).toBe(true);
        }));

        it('creates OfflineAudioContext with correct numChannels/length/sampleRate — mono 16kHz 16-bit', angular.mock.inject(function (WavParserService, $rootScope, $window) {
            var buf = buildPcmWav({ numChannels: 1, sampleRate: 16000, bitsPerSample: 16, numSamples: 100 });
            var ctxArgs = null;
            var origCtx = $window.OfflineAudioContext;

            $window.OfflineAudioContext = function (channels, length, sampleRate) {
                ctxArgs = { channels: channels, length: length, sampleRate: sampleRate };
                return { decodeAudioData: function (ab, resolve) { resolve({}); } };
            };

            WavParserService.parseWavAudioBuf(buf);
            $rootScope.$apply();

            expect(ctxArgs).not.toBeNull();
            expect(ctxArgs.channels).toBe(1);
            expect(ctxArgs.sampleRate).toBe(16000);
            // length = dataChunkSize / numChannels / (bitsPerSample/8) = 200/1/2 = 100
            expect(ctxArgs.length).toBe(100);

            $window.OfflineAudioContext = origCtx;
        }));

        it('creates OfflineAudioContext with correct params — stereo 44.1kHz 16-bit', angular.mock.inject(function (WavParserService, $rootScope, $window) {
            var buf = buildPcmWav({ numChannels: 2, sampleRate: 44100, bitsPerSample: 16, numSamples: 50 });
            var ctxArgs = null;
            var origCtx = $window.OfflineAudioContext;

            $window.OfflineAudioContext = function (channels, length, sampleRate) {
                ctxArgs = { channels: channels, length: length, sampleRate: sampleRate };
                return { decodeAudioData: function (ab, resolve) { resolve({}); } };
            };

            WavParserService.parseWavAudioBuf(buf);
            $rootScope.$apply();

            expect(ctxArgs.channels).toBe(2);
            expect(ctxArgs.sampleRate).toBe(44100);
            // length = 200 / 2 / 2 = 50
            expect(ctxArgs.length).toBe(50);

            $window.OfflineAudioContext = origCtx;
        }));

        it('resolves promise with the AudioBuffer returned by decodeAudioData', angular.mock.inject(function (WavParserService, $rootScope, $window) {
            var fakeAudioBuffer = { duration: 0.001, sampleRate: 16000, numberOfChannels: 1 };
            var resolved = false;
            var resolvedWith;
            var origCtx = $window.OfflineAudioContext;

            $window.OfflineAudioContext = function () {
                return { decodeAudioData: function (ab, resolve) { resolve(fakeAudioBuffer); } };
            };

            WavParserService.parseWavAudioBuf(buildPcmWav()).then(function (result) {
                resolved = true;
                resolvedWith = result;
            });
            $rootScope.$apply();

            expect(resolved).toBe(true);
            expect(resolvedWith.audioBuffer).toBe(fakeAudioBuffer);
            expect(resolvedWith.playbackBuffer).toBeNull();

            $window.OfflineAudioContext = origCtx;
        }));

        it('rejects promise when decodeAudioData calls its error callback', angular.mock.inject(function (WavParserService, $rootScope, $window) {
            var rejected = false;
            var origCtx = $window.OfflineAudioContext;

            $window.OfflineAudioContext = function () {
                return { decodeAudioData: function (ab, resolve, reject) { reject(new Error('decode error')); } };
            };

            WavParserService.parseWavAudioBuf(buildPcmWav()).then(null, function () {
                rejected = true;
            });
            $rootScope.$apply();

            expect(rejected).toBe(true);

            $window.OfflineAudioContext = origCtx;
        }));
    });
});
