export class LoadedMetaDataService {
	public ValidationService: any;

	private uniqSessionList;
	private bundleList;
	private curBndl;
	private demoDbName;
	private rendOptBndlList;

	constructor() {
		this.uniqSessionList = [];
		this.bundleList = [];
		this.curBndl = {} as any;
		this.demoDbName = '';
		this.rendOptBndlList = {} as any;
	}

	/**
	 * Initialize with dependencies that were formerly injected via Angular DI.
	 */
	public init(validationService: any) {
		this.ValidationService = validationService;
	}

	private genUniqSessionList(bndlList) {
		var sList = [];
		var fistSes;
		bndlList.forEach((bndl, idx) => {
			sList[bndl.session] = {
				'collapsed': true
			};
			if (idx === 0) {
				fistSes = bndl.session;
			}
		});
		sList[fistSes].collapsed = false;
		return sList;
	}

	private genRendOptBndlList(bndlList) {
		bndlList.forEach((bndl) => {
			if (this.rendOptBndlList[bndl.session] === undefined) {
				this.rendOptBndlList[bndl.session] = [];
			}
			this.rendOptBndlList[bndl.session].push(bndl);
		});
		return this.rendOptBndlList;
	}

	public setBundleList(bList) {
		var validRes = this.ValidationService.validateJSO('bundleListSchema', bList);
		if (validRes === true) {
			this.bundleList = bList;
			this.uniqSessionList = this.genUniqSessionList(this.bundleList);
			this.rendOptBndlList = this.genRendOptBndlList(this.bundleList);
		}
		return validRes;
	}

	public getBundleList() {
		return this.bundleList;
	}

	public getRendOptBndlList() {
		return this.rendOptBndlList;
	}

	public getCurBndl() {
		return this.curBndl;
	}

	public setCurBndl(bndl) {
		this.curBndl = bndl;
	}

	public setBndlComment(comment, key, index) {
		this.rendOptBndlList[key][index].comment = comment;
	}

	public setBndlFinished(finished, key, index) {
		this.rendOptBndlList[key][index].finishedEditing = finished;
	}

	public getCurBndlName() {
		return this.curBndl.name;
	}

	public setCurBndlName(name) {
		this.curBndl.name = name;
	}

	public setTimeAnchors(timeAnchors) {
		this.curBndl.timeAnchors = timeAnchors;
	}

	public setDemoDbName(name) {
		this.demoDbName = name;
	}

	public getDemoDbName() {
		return this.demoDbName;
	}

	public toggleCollapseSession(session) {
		if (this.uniqSessionList[session] === undefined) {
			this.uniqSessionList[session] = {};
		}
		this.uniqSessionList[session].collapsed = !this.uniqSessionList[session].collapsed;
		Object.keys(this.uniqSessionList).forEach((key) => {
			if (key !== session) {
				this.uniqSessionList[key].collapsed = true;
			}
		});
	}

	public openCollapseSession(session) {
		this.uniqSessionList[session] = {};
		this.uniqSessionList[session].collapsed = false;
		Object.keys(this.uniqSessionList).forEach((key) => {
			if (key !== session) {
				this.uniqSessionList[key].collapsed = true;
			}
		});
	}

	public getSessionCollapseState(session) {
		if (this.uniqSessionList[session] === undefined) {
			return undefined;
		}
		else {
			return this.uniqSessionList[session].collapsed;
		}
	}

	public resetToInitState() {
		this.uniqSessionList = [];
		this.bundleList = [];
		this.curBndl = {};
		this.rendOptBndlList = {};
	}
}

export const loadedMetaDataService = new LoadedMetaDataService();
