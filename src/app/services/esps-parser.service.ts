import * as angular from 'angular';
import { EspsParserWorker } from '../workers/esps-parser.worker.js';

class EspsParserService{

	private LevelService;
	private SoundHandlerService;

	private worker;
	private _resolve: ((value: any) => void) | null = null;
	private _reject: ((reason: any) => void) | null = null;

	constructor(LevelService, SoundHandlerService){
		this.LevelService = LevelService;
		this.SoundHandlerService = SoundHandlerService;

		this.worker = new EspsParserWorker();
		// add event listener to worker to respond to messages
		this.worker.says((e) => {
			if (e.status.type === 'SUCCESS') {
				if (this._resolve) this._resolve(e.data);
			} else {
				if (this._reject) this._reject(e.data);
			}
		}, false);

	}

		/**
	* parse ESPS file using webworker
	* @param esps
	* @param annotates
	* @param name
	* @returns promise
	*/
	public asyncParseEsps(esps, annotates, name) {
		return new Promise((resolve, reject) => {
			this._resolve = resolve;
			this._reject = reject;
			this.worker.tell({
				'cmd': 'parseESPS',
				'esps': esps,
				'sampleRate': this.SoundHandlerService.audioBuffer.sampleRate,
				'annotates': annotates,
				'name': name
			});
		});
	};

	/**
	* parse JSO data to ESPS file using webworker
	* @param name
	* @param sampleRate
	* @returns promise
	*/
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


angular.module('grazer')
.service('EspsParserService', ['LevelService', 'SoundHandlerService', EspsParserService]);
