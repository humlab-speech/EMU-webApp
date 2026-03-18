/**
 * Lenient X/Y track merging utility.
 * Handles mismatched sample rates and start times via time-domain interpolation.
 */

export interface TrackInfo {
	values: number[][];
	sampleRate: number;
	startTime: number;
}

/**
 * Linear interpolation of a track value at arbitrary time.
 */
export function getValueAtTime(track: TrackInfo, time: number, contourNr: number): number {
	const fractionalIdx = (time - track.startTime) * track.sampleRate;
	const lo = Math.floor(fractionalIdx);
	const hi = Math.ceil(fractionalIdx);
	const maxIdx = track.values.length - 1;
	const loC = Math.max(0, Math.min(lo, maxIdx));
	const hiC = Math.max(0, Math.min(hi, maxIdx));
	if (loC === hiC) return track.values[loC][contourNr];
	const frac = fractionalIdx - lo;
	return track.values[loC][contourNr] * (1 - frac) + track.values[hiC][contourNr] * frac;
}

export interface MergedPair {
	xValues: number[][];
	yValues: number[][];
	sampleRate: number;
	startTime: number;
}

/**
 * Finds common time window, aligns frames via interpolation.
 * Fast path: if both tracks have identical timing, returns as-is.
 */
export function mergeTrackPair(x: TrackInfo, y: TrackInfo): MergedPair {
	// Fast path
	if (
		x.sampleRate === y.sampleRate &&
		x.startTime === y.startTime &&
		x.values.length === y.values.length
	) {
		return {
			xValues: x.values,
			yValues: y.values,
			sampleRate: x.sampleRate,
			startTime: x.startTime,
		};
	}

	const xEnd = x.startTime + (x.values.length - 1) / x.sampleRate;
	const yEnd = y.startTime + (y.values.length - 1) / y.sampleRate;
	const commonStart = Math.max(x.startTime, y.startTime);
	const commonEnd = Math.min(xEnd, yEnd);

	if (commonStart >= commonEnd) {
		return { xValues: [], yValues: [], sampleRate: x.sampleRate, startTime: commonStart };
	}

	const outSR = Math.max(x.sampleRate, y.sampleRate);
	const nFrames = Math.floor((commonEnd - commonStart) * outSR) + 1;
	const xOut: number[][] = [];
	const yOut: number[][] = [];
	const xContours = x.values[0]?.length ?? 0;
	const yContours = y.values[0]?.length ?? 0;

	for (let i = 0; i < nFrames; i++) {
		const t = commonStart + i / outSR;
		const xFrame: number[] = [];
		for (let c = 0; c < xContours; c++) {
			xFrame.push(getValueAtTime(x, t, c));
		}
		xOut.push(xFrame);

		const yFrame: number[] = [];
		for (let c = 0; c < yContours; c++) {
			yFrame.push(getValueAtTime(y, t, c));
		}
		yOut.push(yFrame);
	}

	return { xValues: xOut, yValues: yOut, sampleRate: outSR, startTime: commonStart };
}
