export class AudioBufferLike {
    readonly sampleRate: number;
    readonly length: number;
    readonly duration: number;
    readonly numberOfChannels: number;
    private _channels: Float32Array[];

    constructor(channels: Float32Array[], sampleRate: number) {
        this._channels = channels;
        this.sampleRate = sampleRate;
        this.length = channels[0].length;
        this.duration = this.length / sampleRate;
        this.numberOfChannels = channels.length;
    }

    getChannelData(channel: number): Float32Array {
        return this._channels[channel];
    }
}
