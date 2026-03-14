import * as angular from 'angular';

class DragnDropDataService{
	private convertedBundles;
	private sessionDefault;

	constructor(){
		this.convertedBundles = [];
		this.sessionDefault = '';
	}

	///////////////////////////////
	// public api

	public getBundle(name) {
		return new Promise((resolve) => {
			this.convertedBundles.forEach((bundle) => {
				if (bundle.name === name) {
					var bc = angular.copy(bundle);
					delete bc.name;
					resolve({
						status: 200,
						data: bc
					});
				}
			});
		});
	};
	
	public resetToInitState() {
		this.convertedBundles = [];
		this.sessionDefault = '';
	};
	
	public setDefaultSession(name) {
		this.sessionDefault = name;
	};
	
	public getDefaultSession() {
		return this.sessionDefault;
	};
	
}

angular.module('grazer')
.service('DragnDropDataService', [DragnDropDataService]);
