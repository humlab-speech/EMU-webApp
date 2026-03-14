import * as angular from 'angular';
import { SsffParserWorker } from '../workers/ssff-parser.worker.js';

class SsffParserService{
	private $q;
	private worker;
	private defer;
	private workerFailed: boolean;

	constructor($q){
		this.$q = $q;
		this.workerFailed = false;

		try {
			this.worker = new SsffParserWorker();
		} catch (e) {
			console.warn('[SsffParser] Worker creation failed:', e.message);
			this.workerFailed = true;
			return;
		}

		// add event listener to worker to respond to messages
		this.worker.says((e) => {
			if (e.status.type === 'SUCCESS') {
				this.defer.resolve(e);
			} else {
				this.defer.reject(e);
			}
		}, false);

		// Handle worker errors (e.g. blob URL Workers unsupported in WKWebView)
		if (this.worker.worker) {
			this.worker.worker.onerror = (err) => {
				console.warn('[SsffParser] Worker error, falling back to main thread parsing');
				this.workerFailed = true;
				if (this.defer) {
					this.defer.reject({
						status: { type: 'ERROR', message: 'Worker failed: ' + (err.message || 'unknown error') }
					});
				}
			};
		}
	}

	/**
	 * Run ssff parsing on main thread as fallback when Worker is unavailable
	 */
	private mainThreadParseSsffArr(ssffArray) {
		var defer = this.$q.defer();
		try {
			// Execute workerInit to get the parsing functions
			var ctx: any = {};
			(new SsffParserWorker()).workerInit(ctx);
			var result = ctx.parseArr(ssffArray);
			if (result.status.type === 'SUCCESS') {
				defer.resolve(result);
			} else {
				defer.reject(result);
			}
		} catch (e) {
			defer.reject({
				status: { type: 'ERROR', message: 'Main thread SSFF parse failed: ' + e.message }
			});
		}
		return defer.promise;
	}

	private mainThreadJso2ssff(jso) {
		var defer = this.$q.defer();
		try {
			var ctx: any = {};
			(new SsffParserWorker()).workerInit(ctx);
			var result = ctx.jso2ssff(jso);
			if (result.status.type === 'SUCCESS') {
				defer.resolve(result);
			} else {
				defer.reject(result);
			}
		} catch (e) {
			defer.reject({
				status: { type: 'ERROR', message: 'Main thread SSFF jso2ssff failed: ' + e.message }
			});
		}
		return defer.promise;
	}

	/**
	* parse array of ssff file using webworker
	* @param array of ssff files encoded as base64 stings
	* @returns promise
	*/
	public asyncParseSsffArr(ssffArray) {
		if (this.workerFailed) {
			return this.mainThreadParseSsffArr(ssffArray);
		}
		this.defer = this.$q.defer();
		this.worker.tell({
			'cmd': 'parseArr',
			'ssffArr': ssffArray
		}); // Send data to our worker.
		return this.defer.promise;
	};


	/**
	* convert jso to ssff binary file using webworker
	* @param java script object of ssff file (internal rep)
	* @returns promise
	*/
	public asyncJso2ssff(jso) {
		if (this.workerFailed) {
			return this.mainThreadJso2ssff(jso);
		}
		this.defer = this.$q.defer();
		this.worker.tell({
			'cmd': 'jso2ssff',
			'jso': JSON.stringify(jso)
		}); // Send data to our worker.
		return this.defer.promise;
	};

}

angular.module('grazer')
.service('SsffParserService', ['$q', SsffParserService]);
