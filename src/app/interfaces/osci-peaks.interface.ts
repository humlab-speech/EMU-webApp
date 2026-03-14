export interface IChannelOsciPeaks {
	maxPeaks: [Float32Array, Float32Array, Float32Array];
	minPeaks: [Float32Array, Float32Array, Float32Array];
}

export interface IOsciPeaks {
	numberOfChannels: number;
	sampleRate: number;
	winSizes: [number, number, number];
	channelOsciPeaks: IChannelOsciPeaks[];
}
