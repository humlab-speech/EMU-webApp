import { WavHeaderInfos } from '../interfaces/wav-header-infos.interface';

/**
 * Parse WAV file header from an ArrayBuffer.
 * Supports AudioFormat 1 (PCM int), 3 (IEEE754 float), 65534 (Extensible WAV).
 * Throws Error on invalid or unsupported format.
 * @param buf ArrayBuffer containing at least the full WAV header up to and including the data chunk size field
 */
export function parseWavHeader(buf: ArrayBuffer): WavHeaderInfos {

    // ChunkId == RIFF CHECK
    let curBufferView: Uint8Array | Uint16Array | Uint32Array;
    curBufferView = new Uint8Array(buf, 0, 4);
    const ChunkID: string = String.fromCharCode.apply(null, curBufferView as Uint8Array);
    if (ChunkID !== 'RIFF') {
        throw new Error('Wav read error: ChunkID not RIFF but ' + ChunkID);
    }

    // ChunkSize
    const ChunkSize: number = new Uint32Array(buf, 4, 1)[0];

    // Format == WAVE CHECK
    curBufferView = new Uint8Array(buf, 8, 4);
    const Format: string = String.fromCharCode.apply(null, curBufferView as Uint8Array);
    if (Format !== 'WAVE') {
        throw new Error('Wav read error: Format not WAVE but ' + Format);
    }

    // look for 'fmt ' sub-chunk as described here: http://soundfile.sapp.org/doc/WaveFormat/
    let foundChunk = false;
    let fmtBinIdx = 12; // 12 if first sub-chunk
    while (!foundChunk) {
        curBufferView = new Uint8Array(buf, fmtBinIdx, 4);
        const cur4chars = String.fromCharCode.apply(null, curBufferView as Uint8Array);
        if (cur4chars === 'fmt ') {
            foundChunk = true;
        } else if (cur4chars === 'data') {
            throw new Error('Wav read error: Reached end of header by reaching data sub-chunk without finding "fmt " sub-chunk');
        } else {
            fmtBinIdx += 1;
        }
    }

    // FmtSubchunkSize
    const FmtSubchunkSize: number = new Uint32Array(buf, fmtBinIdx + 4, 1)[0];

    // AudioFormat — check for extensible WAV (65534)
    let AudioFormat: number = new Uint16Array(buf, fmtBinIdx + 8, 1)[0];
    if (AudioFormat === 65534) {
        // Extensible WAV: actual format is in the SubFormat GUID (first 2 bytes).
        // Like SoX, we only check the first two bytes of the 16-byte GUID.
        // See RFC 2361 §4 for the template GUID: {XXXXXXXX-0000-0010-8000-00AA00389B71}
        // [0] https://www.rfc-editor.org/rfc/rfc2361
        const sizeOfExtension: number = new Uint16Array(buf, fmtBinIdx + 24, 1)[0];
        if (sizeOfExtension >= 22) {
            AudioFormat = new Uint16Array(buf, fmtBinIdx + 32, 1)[0];
        }
    }
    if ([0, 1, 3].indexOf(AudioFormat) === -1) { // 1=PCM int, 3=IEEE754, 0=unknown
        throw new Error('Wav read error: AudioFormat not 0, 1, or 3 but ' + AudioFormat);
    }

    // NumChannels
    const NumChannels: number = new Uint16Array(buf, fmtBinIdx + 10, 1)[0];
    if (NumChannels < 1) {
        throw new Error('Wav read error: NumChannels not greater than 0 but ' + NumChannels);
    }

    // SampleRate
    const SampleRate: number = new Uint32Array(buf, fmtBinIdx + 12, 1)[0];

    // ByteRate
    const ByteRate: number = new Uint32Array(buf, fmtBinIdx + 16, 1)[0];

    // BlockAlign
    const BlockAlign: number = new Uint16Array(buf, fmtBinIdx + 20, 1)[0];

    // BitsPerSample
    const BitsPerSample: number = new Uint16Array(buf, fmtBinIdx + 22, 1)[0];

    // look for 'data' sub-chunk
    foundChunk = false;
    let dataBinIdx = fmtBinIdx + 4 + 4 + FmtSubchunkSize; // skip past fmt chunk entirely

    let dataChunkSizeIdx: number;
    let dataChunkSize: number;
    let offsetToDataChunk: number;

    while (!foundChunk) {
        curBufferView = new Uint8Array(buf, dataBinIdx, 4);
        const cur4chars = String.fromCharCode.apply(null, curBufferView as Uint8Array);
        if (cur4chars === 'data') {
            foundChunk = true;
            dataChunkSizeIdx = dataBinIdx + 4;
            dataChunkSize = new Uint32Array(buf, dataChunkSizeIdx, 1)[0];
            offsetToDataChunk = dataBinIdx + 8;
        } else {
            // skip to next chunk: chunk-ID (4) + chunk-size field (4) + chunk-data
            const chunkSize: number = new Uint32Array(buf, dataBinIdx + 4, 1)[0];
            dataBinIdx += 8 + chunkSize;
        }
    }

    return {
        ChunkID,
        ChunkSize,
        Format,
        FmtSubchunkID: 'fmt ',
        FmtSubchunkSize,
        AudioFormat,
        NumChannels,
        SampleRate,
        ByteRate,
        BlockAlign,
        BitsPerSample,
        dataChunkSizeIdx,
        dataChunkSize,
        offsetToDataChunk,
        origBinaryHeader: new Uint8Array(buf.slice(0, offsetToDataChunk)),
    };
}
