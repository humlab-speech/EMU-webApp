import * as angular from 'angular';
import { TextGridParserWorker } from '../workers/textgrid-parser.worker.js';

class TextGridParserService{
	private DataService;
	private ViewStateService;
	private SoundHandlerService;

	private worker;
	private _resolve: ((value: any) => void) | null = null;
	private _reject: ((reason: any) => void) | null = null;

	constructor(DataService, ViewStateService, SoundHandlerService){
		this.DataService = DataService;
		this.ViewStateService = ViewStateService;
		this.SoundHandlerService = SoundHandlerService;

		this.worker = new TextGridParserWorker();

		// add event listener to worker to respond to messages
		this.worker.says((e) => {
			if (e.status.type === 'SUCCESS') {
				if (this._resolve) this._resolve(e.data);
			} else {
				if (this._reject) this._reject(e);
			}
		}, false);
	}

	/**
	* parse level data to Textgrid File
	* @param level data
	* @returns promise
	*/
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


	/**
	* parse array of ssff file using webworker
	* @param array of ssff files encoded as base64 stings
	* @returns promise
	*/
	public asyncParseTextGrid(textGrid, annotates, name) {
		return new Promise((resolve, reject) => {
			this._resolve = resolve;
			this._reject = reject;
			this.worker.tell({
				'cmd': 'parseTG',
				'textGrid': textGrid,
				'sampleRate': this.SoundHandlerService.audioBuffer.sampleRate,
				'annotates': annotates,
				'name': name
			});
		});
	};
}

angular.module('grazer')
.service('TextGridParserService', ['DataService', 'ViewStateService', 'SoundHandlerService', TextGridParserService]);
