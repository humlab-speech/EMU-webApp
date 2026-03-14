'use strict';

/**
 * WAV builder utilities for testing.
 * These encode valid binary WAV structures in-memory — no disk I/O needed.
 */

/**
 * Build a standard WAV ArrayBuffer with PCM encoding.
 * @param {Object} opts - Configuration
 * @param {number} [opts.audioFormat=1] - Audio format code (1=PCM, 3=IEEE754 float)
 * @param {number} [opts.numChannels=1] - Number of channels
 * @param {number} [opts.sampleRate=16000] - Sample rate in Hz
 * @param {number} [opts.bitsPerSample=16] - Bits per sample
 * @param {number} [opts.numSamples=10] - Total number of samples per channel
 * @returns {ArrayBuffer} Valid WAV file as ArrayBuffer
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
 * @param {Object} opts - Configuration
 * @param {number} [opts.subFormat=1] - Real format inside the GUID (1=PCM, 3=IEEE754 float)
 * @param {number} [opts.numChannels=1] - Number of channels
 * @param {number} [opts.sampleRate=16000] - Sample rate in Hz
 * @param {number} [opts.bitsPerSample=16] - Bits per sample
 * @param {number} [opts.numSamples=10] - Total number of samples per channel
 * @returns {ArrayBuffer} Valid extensible WAV file as ArrayBuffer
 *
 * Layout: RIFF(12) + "fmt "(8+40) + "data"(8) + samples → header ends at byte 68
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
    dv.setUint16(36, 22, true);                  // cbSize — must be ≥ 22 for SubFormat
    dv.setUint16(38, bitsPerSample, true);        // wValidBitsPerSample
    dv.setUint32(40, 0, true);                   // dwChannelMask
    dv.setUint16(44, subFormat, true);           // SubFormat GUID bytes 0-1
    // bytes 46-59: rest of 16-byte GUID (zeros)
    // data subchunk at byte 60
    u8.set([0x64, 0x61, 0x74, 0x61], 60);
    dv.setUint32(64, dataSize, true);

    return buf;
}

/**
 * Build a WAV with a "LIST" chunk between fmt and data chunks.
 * Exercises parser's chunk-jump logic (advance by chunkSize+8, not byte-by-byte).
 * @param {Object} opts - Configuration
 * @param {number} [opts.numChannels=1] - Number of channels
 * @param {number} [opts.sampleRate=16000] - Sample rate in Hz
 * @param {number} [opts.bitsPerSample=16] - Bits per sample
 * @param {number} [opts.numSamples=10] - Total number of samples per channel
 * @returns {ArrayBuffer} Valid WAV file with LIST chunk
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

module.exports = {
    buildPcmWav,
    buildExtensibleWav,
    buildWavWithExtraChunk
};
