import { SsffParserWorker } from '../workers/ssff-parser.worker.js';

export class SsffParserService {
	private worker;
	private workerFailed: boolean;
	private _resolve: ((value: any) => void) | null = null;
	private _reject: ((reason: any) => void) | null = null;

	constructor() {
		this.workerFailed = false;
		try {
			this.worker = new SsffParserWorker();
		} catch (e) {
			console.warn('[SsffParser] Worker creation failed:', e.message);
			this.workerFailed = true;
			return;
		}
		this.worker.says((e) => {
			if (e.status.type === 'SUCCESS') {
				if (this._resolve) this._resolve(e);
			} else {
				if (this._reject) this._reject(e);
			}
		}, false);
		if (this.worker.worker) {
			this.worker.worker.onerror = (err) => {
				console.warn('[SsffParser] Worker error, falling back to main thread parsing');
				this.workerFailed = true;
				if (this._reject) {
					this._reject({
						status: { type: 'ERROR', message: 'Worker failed: ' + (err.message || 'unknown error') }
					});
				}
			};
		}
	}

	private mainThreadParseSsffArr(ssffArray) {
		return new Promise((resolve, reject) => {
			try {
				var ctx: any = {};
				(new SsffParserWorker()).workerInit(ctx);
				var result = ctx.parseArr(ssffArray);
				if (result.status.type === 'SUCCESS') { resolve(result); } else { reject(result); }
			} catch (e) {
				reject({ status: { type: 'ERROR', message: 'Main thread SSFF parse failed: ' + e.message } });
			}
		});
	}

	private mainThreadJso2ssff(jso) {
		return new Promise((resolve, reject) => {
			try {
				var ctx: any = {};
				(new SsffParserWorker()).workerInit(ctx);
				var result = ctx.jso2ssff(jso);
				if (result.status.type === 'SUCCESS') { resolve(result); } else { reject(result); }
			} catch (e) {
				reject({ status: { type: 'ERROR', message: 'Main thread SSFF jso2ssff failed: ' + e.message } });
			}
		});
	}

	public asyncParseSsffArr(ssffArray) {
		if (this.workerFailed) { return this.mainThreadParseSsffArr(ssffArray); }
		return new Promise((resolve, reject) => {
			this._resolve = resolve;
			this._reject = reject;
			this.worker.tell({ 'cmd': 'parseArr', 'ssffArr': ssffArray });
		});
	};

	public asyncJso2ssff(jso) {
		if (this.workerFailed) { return this.mainThreadJso2ssff(jso); }
		return new Promise((resolve, reject) => {
			this._resolve = resolve;
			this._reject = reject;
			this.worker.tell({ 'cmd': 'jso2ssff', 'jso': JSON.stringify(jso) });
		});
	};
}

export const ssffParserService = new SsffParserService();
