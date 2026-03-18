import { EspsParserWorker } from '../workers/esps-parser.worker.js';

export class EspsParserService {
	LevelService!: any;
	SoundHandlerService!: any;

	private worker;
	private _resolve: ((value: any) => void) | null = null;
	private _reject: ((reason: any) => void) | null = null;

	constructor() {
		this.worker = new EspsParserWorker();
		this.worker.says((e) => {
			if (e.status.type === 'SUCCESS') {
				if (this._resolve) this._resolve(e.data);
			} else {
				if (this._reject) this._reject(e.data);
			}
		}, false);
	}

	initDeps(deps: { LevelService: any; SoundHandlerService: any }) {
		Object.assign(this, deps);
	}

	public asyncParseEsps(esps, annotates, name) {
		return new Promise((resolve, reject) => {
			this._resolve = resolve;
			this._reject = reject;
			this.worker.tell({
				'cmd': 'parseESPS', 'esps': esps,
				'sampleRate': this.SoundHandlerService.audioBuffer.sampleRate,
				'annotates': annotates, 'name': name
			});
		});
	};

	public asyncParseJSO(name) {
		return new Promise((resolve, reject) => {
			this._resolve = resolve;
			this._reject = reject;
			this.worker.tell({
				'cmd': 'parseJSO',
				'level': this.LevelService.getLevelDetails(name),
				'sampleRate': this.SoundHandlerService.audioBuffer.sampleRate
			});
		});
	};
}

export const espsParserService = new EspsParserService();
