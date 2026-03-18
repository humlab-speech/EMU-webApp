'use strict';

const { buildPcmWav } = require('../../fixtures/wav-builders');
const { WavRangeReq } = require('../../../src/core/workers/wavrangereq.worker');

describe('Worker: WavRangeReq', function () {

    let originalFetch;

    beforeEach(function () {
        originalFetch = global.fetch;
    });

    afterEach(function () {
        global.fetch = originalFetch;
    });

    // ================================================================
    // setURL — header probe and file info population
    // ================================================================

    describe('setURL', function () {

        it('populates wavFileInfo with sampleRate, numChannels, lastSampleBlockIdx', async function () {
            const testWav = buildPcmWav({
                numChannels: 2,
                sampleRate: 44100,
                bitsPerSample: 16,
                numSamples: 1000
            });

            global.fetch = jest.fn(async (url, opts) => ({
                arrayBuffer: async () => testWav.slice(0, 44)
            }));

            const rangeReq = new WavRangeReq();
            await rangeReq.setURL('http://example.com/test.wav');
            const info = await rangeReq.getWavFileInfo();

            expect(info).toBeDefined();
            expect(info.headerInfos.SampleRate).toBe(44100);
            expect(info.headerInfos.NumChannels).toBe(2);
            expect(info.lastSampleBlockIdx).toBe(999); // (1000 samples - 1)
        });

        it('handles server 200 response — documents current behavior', async function () {
            const testWav = buildPcmWav({ numSamples: 100 });

            global.fetch = jest.fn(async (url, opts) => ({
                arrayBuffer: async () => testWav.slice(0, 44)
            }));

            const rangeReq = new WavRangeReq();
            await rangeReq.setURL('http://example.com/test.wav');
            const info = await rangeReq.getWavFileInfo();

            expect(info).toBeDefined();
            expect(info.headerInfos.NumChannels).toBe(1);
        });

    });

    // ================================================================
    // getWavFileInfo — returns populated info after setURL
    // ================================================================

    describe('getWavFileInfo', function () {

        it('returns wavFileInfo with url and sample bounds', async function () {
            const testWav = buildPcmWav({
                numChannels: 1,
                sampleRate: 16000,
                bitsPerSample: 16,
                numSamples: 500
            });

            global.fetch = jest.fn(async (url, opts) => ({
                arrayBuffer: async () => testWav.slice(0, 44)
            }));

            const rangeReq = new WavRangeReq();
            await rangeReq.setURL('http://example.com/test.wav');
            const info = await rangeReq.getWavFileInfo();

            expect(info.url).toBe('http://example.com/test.wav');
            expect(info.firstSampleBlockIdx).toBe(0);
            expect(info.lastSampleBlockIdx).toBe(499);
        });

    });

    // ================================================================
    // getRange — valid and invalid sample block ranges
    // ================================================================

    describe('getRange', function () {

        it('returns WavRange with correct shape for full range', async function () {
            const testWav = buildPcmWav({
                numChannels: 1,
                sampleRate: 16000,
                bitsPerSample: 16,
                numSamples: 100
            });

            let callCount = 0;
            global.fetch = jest.fn(async (url, opts) => {
                // First calls during setURL fetch header
                // Subsequent calls during getRange fetch PCM data
                callCount++;
                if (callCount === 1) {
                    return { arrayBuffer: async () => testWav.slice(0, 44) };
                }
                // For getRange, return just the PCM data from requested byte range
                const range = opts.headers?.Range;
                if (range) {
                    const [start, end] = range.match(/\d+/g).map(Number);
                    return { arrayBuffer: async () => testWav.slice(start, end + 1) };
                }
                return { arrayBuffer: async () => testWav };
            });

            const rangeReq = new WavRangeReq();
            await rangeReq.setURL('http://example.com/test.wav');
            const range = await rangeReq.getRange(0, 99);

            expect(range.numberOfChannels).toBe(1);
            expect(range.sampleRate).toBe(16000);
            expect(range.length).toBe(100);
            expect(range.startSampleBlockIdx).toBe(0);
            expect(range.endSampleBlockIdx).toBe(99);
            expect(range.buffer).toBeDefined();
        });

        it('stereo range — preserves channel count and sample rate', async function () {
            const testWav = buildPcmWav({
                numChannels: 2,
                sampleRate: 44100,
                bitsPerSample: 16,
                numSamples: 50
            });

            let callCount = 0;
            global.fetch = jest.fn(async (url, opts) => {
                callCount++;
                if (callCount === 1) {
                    return { arrayBuffer: async () => testWav.slice(0, 44) };
                }
                const range = opts.headers?.Range;
                if (range) {
                    const [start, end] = range.match(/\d+/g).map(Number);
                    return { arrayBuffer: async () => testWav.slice(start, end + 1) };
                }
                return { arrayBuffer: async () => testWav };
            });

            const rangeReq = new WavRangeReq();
            await rangeReq.setURL('http://example.com/test.wav');
            const range = await rangeReq.getRange(0, 49);

            expect(range.numberOfChannels).toBe(2);
            expect(range.sampleRate).toBe(44100);
            expect(range.length).toBe(50);
        });

        it('negative start index — throws "out of range"', async function () {
            const testWav = buildPcmWav({ numSamples: 100 });

            global.fetch = jest.fn(async (url, opts) => ({
                arrayBuffer: async () => testWav.slice(0, 44)
            }));

            const rangeReq = new WavRangeReq();
            await rangeReq.setURL('http://example.com/test.wav');

            await expect(rangeReq.getRange(-1, 50)).rejects.toThrow('out of range');
        });

        it('end beyond lastSampleBlockIdx — throws "out of range"', async function () {
            const testWav = buildPcmWav({ numSamples: 100 });

            global.fetch = jest.fn(async (url, opts) => ({
                arrayBuffer: async () => testWav.slice(0, 44)
            }));

            const rangeReq = new WavRangeReq();
            await rangeReq.setURL('http://example.com/test.wav');

            await expect(rangeReq.getRange(50, 150)).rejects.toThrow('out of range');
        });

    });

    // ================================================================
    // origBinaryHeader mutation — verify immutability
    // ================================================================

    describe('origBinaryHeader immutability', function () {

        it('multiple getRange calls return uncorrupted header each time', async function () {
            const testWav = buildPcmWav({ numSamples: 50 });

            let callCount = 0;
            global.fetch = jest.fn(async (url, opts) => {
                callCount++;
                if (callCount === 1) {
                    return { arrayBuffer: async () => testWav.slice(0, 44) };
                }
                const range = opts.headers?.Range;
                if (range) {
                    const [start, end] = range.match(/\d+/g).map(Number);
                    return { arrayBuffer: async () => testWav.slice(start, end + 1) };
                }
                return { arrayBuffer: async () => testWav };
            });

            const rangeReq = new WavRangeReq();
            await rangeReq.setURL('http://example.com/test.wav');

            // First range request
            const range1 = await rangeReq.getRange(0, 24);
            const header1 = new Uint8Array(range1.buffer, 0, 4);
            expect(Array.from(header1)).toEqual([0x52, 0x49, 0x46, 0x46]); // "RIFF"

            // Second range request
            const range2 = await rangeReq.getRange(25, 49);
            const header2 = new Uint8Array(range2.buffer, 0, 4);
            expect(Array.from(header2)).toEqual([0x52, 0x49, 0x46, 0x46]);

            expect(range1.length).toBe(25);
            expect(range2.length).toBe(25);
        });

    });

    // ================================================================
    // sampleBlockIdxToByte — byte range calculation
    // ================================================================

    describe('byte range calculation', function () {

        it('sampleBlockIdx 0 fetches from offsetToDataChunk', async function () {
            const testWav = buildPcmWav({
                numChannels: 1,
                sampleRate: 16000,
                bitsPerSample: 16,
                numSamples: 100
            });

            let callCount = 0;
            let capturedRange;
            global.fetch = jest.fn(async (url, opts) => {
                callCount++;
                if (callCount === 1) {
                    return { arrayBuffer: async () => testWav.slice(0, 44) };
                }
                const range = opts.headers?.Range;
                capturedRange = range;
                if (range) {
                    const [start, end] = range.match(/\d+/g).map(Number);
                    return { arrayBuffer: async () => testWav.slice(start, end + 1) };
                }
                return { arrayBuffer: async () => testWav };
            });

            const rangeReq = new WavRangeReq();
            await rangeReq.setURL('http://example.com/test.wav');
            await rangeReq.getRange(0, 49);

            // Standard PCM header is 44 bytes, so data starts at byte 44
            expect(capturedRange).toMatch(/^bytes=44-/);
        });

        it('sampleBlockIdx 1 fetches from offsetToDataChunk + BlockAlign', async function () {
            const testWav = buildPcmWav({
                numChannels: 2,
                sampleRate: 44100,
                bitsPerSample: 16,
                numSamples: 100
            });

            let callCount = 0;
            let capturedRange;
            global.fetch = jest.fn(async (url, opts) => {
                callCount++;
                if (callCount === 1) {
                    return { arrayBuffer: async () => testWav.slice(0, 44) };
                }
                const range = opts.headers?.Range;
                capturedRange = range;
                if (range) {
                    const [start, end] = range.match(/\d+/g).map(Number);
                    return { arrayBuffer: async () => testWav.slice(start, end + 1) };
                }
                return { arrayBuffer: async () => testWav };
            });

            const rangeReq = new WavRangeReq();
            await rangeReq.setURL('http://example.com/test.wav');
            await rangeReq.getRange(1, 50);

            // BlockAlign = 2 channels * 16 bits / 8 = 4 bytes
            // Sample block 1 starts at byte 44 + 4 = 48
            expect(capturedRange).toMatch(/^bytes=48-/);
        });

    });

});
