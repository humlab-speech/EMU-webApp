import { AudioBufferLike } from './audio-buffer-like';

let libavInstance: any = null;

async function getLibAV(): Promise<any> {
	if (libavInstance) return libavInstance;
	// Dynamic import from public/ — not bundled, fetched on demand
	const libav = await import(/* @vite-ignore */ '/libav/libav-default.mjs');
	libavInstance = await libav.LibAV({ noworker: true });
	return libavInstance;
}

/**
 * Decode audio from an ArrayBuffer using libav.js (FFmpeg WASM).
 * Returns channel data + sample rate, compatible with AudioBufferLike.
 */
export async function decodeWithLibAV(buf: ArrayBuffer): Promise<{ audioBuffer: AudioBufferLike }> {
	const libav = await getLibAV();

	// Write input to virtual filesystem
	const filename = 'input.audio';
	await libav.writeFile(filename, new Uint8Array(buf));

	// Open demuxer
	const [fmt_ctx, streams] = await libav.ff_init_demuxer_file(filename);

	// Find first audio stream
	const audioStream = streams.find((s: any) => s.codec_type === libav.AVMEDIA_TYPE_AUDIO);
	if (!audioStream) {
		await libav.avformat_close_input_js(fmt_ctx);
		await libav.unlink(filename);
		throw { status: { type: 'ERROR', message: 'No audio stream found in file.' } };
	}

	// Init decoder
	const [, c, pkt, frame] = await libav.ff_init_decoder(
		audioStream.codec_id, audioStream.codecpar
	);

	// Read all packets
	const [, allPackets] = await libav.ff_read_multi(fmt_ctx, pkt);
	const packets = allPackets[audioStream.index] || [];

	// Decode all packets
	const frames = await libav.ff_decode_multi(c, pkt, frame, packets, true);

	if (!frames || frames.length === 0) {
		await libav.ff_free_decoder(c, pkt, frame);
		await libav.avformat_close_input_js(fmt_ctx);
		await libav.unlink(filename);
		throw { status: { type: 'ERROR', message: 'libav.js: no audio frames decoded.' } };
	}

	// Extract sample rate and channel count from first frame
	const sampleRate = frames[0].sample_rate;
	const numChannels = frames[0].channels || frames[0].ch_layout_nb_channels || 1;
	const sampleFormat = frames[0].format;

	// Calculate total length
	let totalSamples = 0;
	for (const f of frames) totalSamples += f.nb_samples;

	// Build per-channel Float32Arrays
	const channels: Float32Array[] = [];
	for (let ch = 0; ch < numChannels; ch++) channels.push(new Float32Array(totalSamples));

	let offset = 0;
	for (const f of frames) {
		const nb = f.nb_samples;
		if (isPlanar(sampleFormat)) {
			// Planar: f.data is array of typed arrays, one per channel
			for (let ch = 0; ch < numChannels; ch++) {
				const src = toFloat32(f.data[ch], sampleFormat);
				channels[ch].set(src, offset);
			}
		} else {
			// Interleaved: f.data is single typed array
			const src = toFloat32(f.data, sampleFormat);
			for (let i = 0; i < nb; i++) {
				for (let ch = 0; ch < numChannels; ch++) {
					channels[ch][offset + i] = src[i * numChannels + ch];
				}
			}
		}
		offset += nb;
	}

	// Cleanup
	await libav.ff_free_decoder(c, pkt, frame);
	await libav.avformat_close_input_js(fmt_ctx);
	await libav.unlink(filename);

	return { audioBuffer: new AudioBufferLike(channels, sampleRate) };
}

function isPlanar(fmt: number): boolean {
	// AV_SAMPLE_FMT_*P formats: U8P=6, S16P=7, S32P=8, FLTP=9, DBLP=10, S64P=12
	return fmt >= 6 && fmt <= 10 || fmt === 12;
}

function toFloat32(data: any, fmt: number): Float32Array {
	if (data instanceof Float32Array) return data;
	if (data instanceof Float64Array) {
		const out = new Float32Array(data.length);
		for (let i = 0; i < data.length; i++) out[i] = data[i];
		return out;
	}
	if (data instanceof Int16Array) {
		const out = new Float32Array(data.length);
		for (let i = 0; i < data.length; i++) out[i] = data[i] / 32768;
		return out;
	}
	if (data instanceof Int32Array) {
		const out = new Float32Array(data.length);
		for (let i = 0; i < data.length; i++) out[i] = data[i] / 2147483648;
		return out;
	}
	if (data instanceof Uint8Array) {
		const out = new Float32Array(data.length);
		for (let i = 0; i < data.length; i++) out[i] = (data[i] - 128) / 128;
		return out;
	}
	// Already float or unknown — try direct
	return new Float32Array(data);
}
