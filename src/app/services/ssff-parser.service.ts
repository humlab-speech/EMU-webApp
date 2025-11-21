import * as angular from 'angular';
import { SsffParserWorker } from '../workers/ssff-parser.worker.js';

class SsffParserService{
	private $q;
	private worker;
	private defer;
	private JstfParserService;

	constructor($q, JstfParserService){
		this.$q = $q;
		this.JstfParserService = JstfParserService;
		this.worker = new SsffParserWorker();

		// add event listener to worker to respond to messages
		this.worker.says((e) => {
			if (e.status.type === 'SUCCESS') {
				this.defer.resolve(e);
			} else {
				this.defer.reject(e);
			}
		}, false);

	}

	/**
	* parse array of ssff/jstf files using webworker for SSFF and JstfParserService for JSTF
	* @param array of ssff/jstf files
	* @returns promise with {ssffData: [...], jstfData: [...]}
	*/
	public asyncParseSsffArr(fileArray) {
		// Use local defer to avoid concurrency issues
		const mainDefer = this.$q.defer();

		// Separate SSFF and JSTF files
		const ssffFiles = [];
		const jstfFiles = [];

		fileArray.forEach((file) => {
			// Check if file is JSTF format
			if (this.JstfParserService.isJstfFormat(file.data)) {
				jstfFiles.push(file);
			} else {
				ssffFiles.push(file);
			}
		});

		// Parse both types in parallel
		const promises = [];

		// Parse SSFF files using worker (if any)
		if (ssffFiles.length > 0) {
			const ssffDefer = this.$q.defer();
			promises.push(ssffDefer.promise);

			// Set up one-time listener for this parse operation
			const ssffWorker = new SsffParserWorker();
			ssffWorker.says((e) => {
				if (e.status.type === 'SUCCESS') {
					ssffDefer.resolve(e.data);
				} else {
					ssffDefer.reject(e);
				}
				// Clean up: terminate worker after use to prevent memory leak
				ssffWorker.terminate();
			}, false);

			ssffWorker.tell({
				'cmd': 'parseArr',
				'ssffArr': ssffFiles
			});
		} else {
			// No SSFF files, return empty array
			promises.push(this.$q.resolve([]));
		}

		// Parse JSTF files (if any)
		if (jstfFiles.length > 0) {
			promises.push(this.JstfParserService.asyncParseJstfArr(jstfFiles));
		} else {
			// No JSTF files, return empty array
			promises.push(this.$q.resolve([]));
		}

		// Wait for both to complete
		this.$q.all(promises).then((results) => {
			mainDefer.resolve({
				status: {type: 'SUCCESS'},
				ssffData: results[0],
				jstfData: results[1]
			});
		}, (error) => {
			mainDefer.reject(error);
		});

		return mainDefer.promise;
	};
	
	
	/**
	* convert jso to ssff binary file using webworker
	* @param java script object of ssff file (internal rep)
	* @returns promise
	*/
	public asyncJso2ssff(jso) {
		this.defer = this.$q.defer();
		this.worker.tell({
			'cmd': 'jso2ssff',
			'jso': JSON.stringify(jso)
		}); // Send data to our worker.
		return this.defer.promise;
	};
	
}

angular.module('emuwebApp')
.service('SsffParserService', ['$q', 'JstfParserService', SsffParserService]);