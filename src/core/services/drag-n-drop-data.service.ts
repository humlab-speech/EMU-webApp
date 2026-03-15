import { deepCopy } from '../util/deep-copy';

export class DragnDropDataService {
	private convertedBundles;
	private sessionDefault;

	constructor() {
		this.convertedBundles = [];
		this.sessionDefault = '';
	}

	public getBundle(name) {
		return new Promise((resolve) => {
			this.convertedBundles.forEach((bundle) => {
				if (bundle.name === name) {
					var bc = deepCopy(bundle);
					delete bc.name;
					resolve({
						status: 200,
						data: bc
					});
				}
			});
		});
	}

	public resetToInitState() {
		this.convertedBundles = [];
		this.sessionDefault = '';
	}

	public setDefaultSession(name) {
		this.sessionDefault = name;
	}

	public getDefaultSession() {
		return this.sessionDefault;
	}
}

export const dragnDropDataService = new DragnDropDataService();
