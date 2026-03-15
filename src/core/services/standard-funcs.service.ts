import { deepCopy } from '../util/deep-copy';

export class StandardFuncsService {
	constructor() {}

	public traverseAndClean(o) {
		for (var i in o) {
			if (i.substr(0, 1) === '_') {
				delete o[i];
			}

			if (o[i] !== null && typeof(o[i]) === 'object') {
				this.traverseAndClean(o[i]);
			}
		}
	}

	public reverseCopy(a) {
		var r = deepCopy(a);
		r.reverse();
		return r;
	}
}

export const standardFuncsService = new StandardFuncsService();
