export class SoundHandlerService {
	private audioContext;
	private curSource;
	public audioBuffer;
	public playbackBuffer;
	public isPlaying;

	constructor() {
		this.audioBuffer = {};
		this.playbackBuffer = null;
		this.isPlaying = false;
	}

	private initAudioContext() {
		try {
			window.AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
			this.audioContext = new AudioContext();
		} catch (e) {
			console.error('Error loading AudioContext (browser may not support Web Audio API):', e);
		}
	}

	public decodeAndPlay(sampleStart, endSample) {
		if (typeof(this.audioContext) === 'undefined') {
			this.initAudioContext();
		}
		if (this.audioContext.state === 'suspended') {
			this.audioContext.resume().then(() => {
				this.startPlayback(sampleStart, endSample);
			}).catch((err) => {
				console.error('Failed to resume audio context:', err);
			});
		} else {
			this.startPlayback(sampleStart, endSample);
		}
	};

	private startPlayback(sampleStart, endSample) {
		var startTime = sampleStart / this.audioBuffer.sampleRate;
		var endTime = endSample / this.audioBuffer.sampleRate;
		var durTime = endTime - startTime;
		var srcBuffer = this.playbackBuffer || this.audioBuffer;
		this.curSource = this.audioContext.createBufferSource();
		this.curSource.buffer = srcBuffer;
		this.curSource.connect(this.audioContext.destination);
		this.curSource.start(0, startTime, durTime);
		this.curSource.onended = () => { this.isPlaying = false; };
	};

	public playFromTo(sampleStart, endSample) {
		if (this.isPlaying) {
			this.isPlaying = false;
			this.curSource.stop(0);
		} else {
			this.isPlaying = true;
			if (this.audioBuffer.length > 0) {
				this.decodeAndPlay(sampleStart, endSample);
			}
		}
	};
}

export const soundHandlerService = new SoundHandlerService();
