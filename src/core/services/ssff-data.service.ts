import { ISsffFile } from '../interfaces/ssff.interface';

export class SsffDataService {
	SoundHandlerService!: any;
	ConfigProviderService!: any;
	public data: ISsffFile[];

	constructor() { this.data = []; }

	initDeps(deps: { SoundHandlerService: any; ConfigProviderService: any }) {
		Object.assign(this, deps);
	}

	public getFile(trackName) {
		var res;
		if (this.ConfigProviderService.curDbConfig.ssffTrackDefinitions !== undefined) {
			this.ConfigProviderService.curDbConfig.ssffTrackDefinitions.forEach((std) => {
				if (std.name === trackName) {
					this.data.forEach((f) => {
						if (f.fileExtension === std.fileExtension) { res = f; }
					});
				}
			});
		}
		return res;
	};

	public getColumnOfTrack(trackName, columnName) {
		var res;
		var file = this.getFile(trackName);
		if (file !== undefined) {
			file.Columns.forEach((col) => {
				if (col.name === columnName) { res = col; }
			});
			return res;
		}
	};

	public getSampleRateAndStartTimeOfTrack(trackName) {
		var res = {} as any;
		var file = this.getFile(trackName);
		if (file !== undefined) {
			res.sampleRate = file.sampleRate;
			res.startTime = file.startTime;
			return res;
		}
	};

	public calculateSamplePosInVP(colSampleNr, sampleRate, startTime) {
		var sampleTime = (colSampleNr / sampleRate) + startTime;
		return Math.round(sampleTime * this.SoundHandlerService.audioBuffer.sampleRate);
	};
}

export const ssffDataService = new SsffDataService();
