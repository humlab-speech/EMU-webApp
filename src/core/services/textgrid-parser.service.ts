import { TextGridParserWorker } from '../../app/workers/textgrid-parser.worker.js';

export class TextGridParserService {
	DataService!: any;
	ViewStateService!: any;
	SoundHandlerService!: any;

	private worker;
	private _resolve: ((value: any) => void) | null = null;
	private _reject: ((reason: any) => void) | null = null;

	constructor() {
		this.worker = new TextGridParserWorker();
		this.worker.says((e) => {
			if (e.status.type === 'SUCCESS') {
				if (this._resolve) this._resolve(e.data);
			} else {
				if (this._reject) this._reject(e);
			}
		}, false);
	}

	initDeps(deps: { DataService: any; ViewStateService: any; SoundHandlerService: any }) {
		Object.assign(this, deps);
	}

	public asyncToTextGrid() {
		return new Promise((resolve, reject) => {
			this._resolve = resolve;
			this._reject = reject;
			this.worker.tell({
				'cmd': 'toTextGrid',
				'levels': this.DataService.getData().levels,
				'sampleRate': this.SoundHandlerService.audioBuffer.sampleRate,
				'buffLength': this.SoundHandlerService.audioBuffer.length
			});
		});
	};

	public asyncParseTextGrid(textGrid, annotates, name) {
		return new Promise((resolve, reject) => {
			this._resolve = resolve;
			this._reject = reject;
			this.worker.tell({
				'cmd': 'parseTG', 'textGrid': textGrid,
				'sampleRate': this.SoundHandlerService.audioBuffer.sampleRate,
				'annotates': annotates, 'name': name
			});
		});
	};
}

export const textGridParserService = new TextGridParserService();
