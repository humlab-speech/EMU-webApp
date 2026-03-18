import { httpGet } from '../util/http-get';

export class IoHandlerService{
	private HistoryService: any;
	private ViewStateService: any;
	private SoundHandlerService: any;
	private SsffParserService: any;
	private WavParserService: any;
	private TextGridParserService: any;
	private ConfigProviderService: any;
	private EspsParserService: any;
	private SsffDataService: any;
	private WebSocketHandlerService: any;
	private DragnDropDataService: any;
	private LoadedMetaDataService: any;

	constructor() {
		// Move privateToken from URL to sessionStorage to avoid leaking in referrer/logs
		var searchObject = this.getSearchParams();
		if (searchObject.privateToken) {
			sessionStorage.setItem('grazer_privateToken', searchObject.privateToken);
			const url = new URL(window.location.href);
			url.searchParams.delete('privateToken');
			window.history.replaceState({}, '', url.toString());
		}
	}

	public initDeps(deps: {
		HistoryService: any; ViewStateService: any; SoundHandlerService: any;
		SsffParserService: any; WavParserService: any; TextGridParserService: any;
		ConfigProviderService: any; EspsParserService: any; SsffDataService: any;
		WebSocketHandlerService: any; DragnDropDataService: any; LoadedMetaDataService: any;
	}) {
		this.HistoryService = deps.HistoryService;
		this.ViewStateService = deps.ViewStateService;
		this.SoundHandlerService = deps.SoundHandlerService;
		this.SsffParserService = deps.SsffParserService;
		this.WavParserService = deps.WavParserService;
		this.TextGridParserService = deps.TextGridParserService;
		this.ConfigProviderService = deps.ConfigProviderService;
		this.EspsParserService = deps.EspsParserService;
		this.SsffDataService = deps.SsffDataService;
		this.WebSocketHandlerService = deps.WebSocketHandlerService;
		this.DragnDropDataService = deps.DragnDropDataService;
		this.LoadedMetaDataService = deps.LoadedMetaDataService;
	}

	private getSearchParams(): Record<string, string> {
		const params = new URLSearchParams(window.location.search);
		const obj: Record<string, string> = {};
		params.forEach((v, k) => { obj[k] = v; });
		return obj;
	}

	private getPrivateToken(): string {
		return sessionStorage.getItem('grazer_privateToken') || '';
	}

	public httpGetDefaultConfig() {
		return httpGet('configFiles/default_grazerConfig.json');
	};

	public httpGetPath(path, respType?, ignoreComMode: boolean = false) {
		if(this.ConfigProviderService.vals.main.comMode !== "GITLAB" || ignoreComMode){
			var prom = httpGet(path, { responseType: respType });
		} else {
			var searchObject = this.getSearchParams();
			prom = fetch(path, {
				method: 'GET',
				headers: { 'PRIVATE-TOKEN': this.getPrivateToken() }
			}).then((resp) => {
				if(!resp.ok){ throw new Error('HTTP ' + resp.status + ': ' + resp.statusText); }
				if(respType === 'json'){ return(resp.json()); }
				else if(respType === 'arraybuffer'){ return(resp.arrayBuffer()); }
				else if(respType === 'text'){ return(resp.text()); }
				else { return(resp.json()); }
			}).catch((err) => {
				console.error('Fetch error for ' + path + ':', err);
				throw err;
			});
		}
		return prom;
	};

	public getProtocol() {
		var getProm;
		if (this.ConfigProviderService.vals.main.comMode === 'CORS') {
		} else if (this.ConfigProviderService.vals.main.comMode === 'WS') {
			getProm = this.WebSocketHandlerService.getProtocol();
		} else if (this.ConfigProviderService.vals.main.comMode === 'GITLAB'){
			getProm = Promise.resolve({ protocol: 'EMU-webApp-websocket-protocol', version: '0.0.2' });
		}
		return getProm;
	};

	public getDoUserManagement() {
		var getProm;
		if (this.ConfigProviderService.vals.main.comMode === 'CORS') {
		} else if (this.ConfigProviderService.vals.main.comMode === 'WS') {
			getProm = this.WebSocketHandlerService.getDoUserManagement();
		} else if (this.ConfigProviderService.vals.main.comMode === 'GITLAB'){
			getProm = Promise.resolve('NO');
		}
		return getProm;
	};

	public logOnUser(name, pwd) {
		var getProm;
		if (this.ConfigProviderService.vals.main.comMode === 'CORS') {
		} else if (this.ConfigProviderService.vals.main.comMode === 'WS') {
			getProm = this.WebSocketHandlerService.logOnUser(name, pwd);
		}
		return getProm;
	};

	public getDBconfigFile(nameOfDB) {
		var getProm;
		if (this.ConfigProviderService.vals.main.comMode === 'CORS') {
		} else if (this.ConfigProviderService.vals.main.comMode === 'WS') {
			getProm = this.WebSocketHandlerService.getDBconfigFile();
		} else if (this.ConfigProviderService.vals.main.comMode === 'DEMO') {
			getProm = httpGet('demoDBs/' + nameOfDB + '/' + nameOfDB + '_DBconfig.json');
		} else if (this.ConfigProviderService.vals.main.comMode === 'GITLAB'){
			var searchObject = this.getSearchParams();
			if (searchObject.gitlabURL && !/^https?:\/\//i.test(searchObject.gitlabURL)) {
				return Promise.reject(new Error('Invalid gitlabURL: must use http(s) protocol'));
			}
			let gitlabPath = this.getGitlabPathFromSearchObject(searchObject);
			getProm = fetch(searchObject.gitlabURL + '/api/v4/projects/' + searchObject.projectID + '/repository/files/' + gitlabPath + searchObject.emuDBname + '_DBconfig.json/raw?ref=master', {
				method: 'GET',
				headers: { 'PRIVATE-TOKEN': this.getPrivateToken() }
			}).then((resp) => { return(resp.json()) }).catch((err) => {
				console.error('Error fetching DB config file:', err);
				throw err;
			});
		}
		return getProm;
	};

	public getBundleList(nameOfDB) {
		var getProm;
		if (this.ConfigProviderService.vals.main.comMode === 'CORS') {
		} else if (this.ConfigProviderService.vals.main.comMode === 'WS') {
			getProm = this.WebSocketHandlerService.getBundleList();
		} else if (this.ConfigProviderService.vals.main.comMode === 'DEMO') {
			getProm = httpGet('demoDBs/' + nameOfDB + '/' + nameOfDB + '_bundleList.json');
		} else if (this.ConfigProviderService.vals.main.comMode === 'GITLAB') {
			let searchObject = this.getSearchParams();
			if (searchObject.gitlabURL && !/^https?:\/\//i.test(searchObject.gitlabURL)) {
				return Promise.reject(new Error('Invalid gitlabURL: must use http(s) protocol'));
			}
			let gitlabPath = this.getGitlabPathFromSearchObject(searchObject);
			getProm = fetch(searchObject.gitlabURL + '/api/v4/projects/' + searchObject.projectID + '/repository/files/' + gitlabPath + 'bundleLists%2F' + searchObject.bundleListName + '_bundleList.json/raw?ref=master', {
				method: 'GET',
				headers: { 'PRIVATE-TOKEN': this.getPrivateToken() }
			}).then((resp) => { return(resp.json())}).catch((err) => {
				console.error('Error fetching bundle list:', err);
				throw err;
			});
		}
		return getProm;
	};

	private getGitlabPathFromSearchObject(searchObject, UriEncode = true) {
		let gitlabPath = "";
		if(typeof searchObject.gitlabPath != "undefined") {
			gitlabPath = searchObject.gitlabPath;
			while(gitlabPath.indexOf("/") == 0) { gitlabPath = gitlabPath.substr(1, gitlabPath.length); }
			if(gitlabPath.indexOf("/", gitlabPath.length-1) == -1) { gitlabPath += "/"; }
			if(UriEncode) { gitlabPath = encodeURIComponent(gitlabPath); }
		}
		return gitlabPath;
	}

	public getBundle(name, session, nameOfDB) {
		var getProm;
		if (this.ConfigProviderService.vals.main.comMode === 'CORS') {
		} else if (this.ConfigProviderService.vals.main.comMode === 'EMBEDDED') {
			getProm = this.DragnDropDataService.getBundle(name, session);
		} else if (this.ConfigProviderService.vals.main.comMode === 'WS') {
			getProm = this.WebSocketHandlerService.getBundle(name, session);
		} else if (this.ConfigProviderService.vals.main.comMode === 'DEMO') {
			getProm = httpGet('demoDBs/' + nameOfDB + '/' + name + '_bndl.json');
		} else if (this.ConfigProviderService.vals.main.comMode === 'GITLAB') {
			var searchObject = this.getSearchParams();
			if (searchObject.gitlabURL && !/^https?:\/\//i.test(searchObject.gitlabURL)) {
				return Promise.reject(new Error('Invalid gitlabURL: must use http(s) protocol'));
			}
			let gitlabPath = this.getGitlabPathFromSearchObject(searchObject);
			var bndlURL = searchObject.gitlabURL + '/api/v4/projects/' + searchObject.projectID + '/repository/files/' + gitlabPath + session + '_ses%2F' + name + '_bndl%2F';
			var neededTracks = this.ConfigProviderService.findAllTracksInDBconfigNeededByEMUwebApp();
			var ssffFiles = [];
			neededTracks.forEach((tr) => {
				ssffFiles.push({
					encoding: "GETURL",
					data: bndlURL + name + "." + tr.fileExtension + '/raw?ref=master',
					fileExtension: tr.fileExtension
				});
			});
			if(searchObject.useLFS !== "true"){
				getProm = Promise.all([
					fetch(bndlURL + name + '_annot.json/raw?ref=master', {
						method: 'GET', headers: { 'PRIVATE-TOKEN': this.getPrivateToken() }
					}).then((resp) => { return(resp.json()) })
				]).then((allResponses) => {
					return {
						mediaFile: { encoding: "GETURL", data: bndlURL + name + '.wav/raw?ref=master' },
						annotation: allResponses[0], ssffFiles: ssffFiles
					};
				}).catch((err) => { console.error('Error fetching bundle:', err); throw err; })
			} else {
				console.log("using LFS");
				getProm = Promise.all([
					fetch(bndlURL + name + '_annot.json/raw?ref=master', {
						method: 'GET', headers: { 'PRIVATE-TOKEN': this.getPrivateToken() }
					}).then((resp) => { return(resp.json()) })
				]).then((allResponses) => {
					return {
						mediaFile: { encoding: "GETURL", data: bndlURL + name + '.wav/raw?ref=master' },
						annotation: allResponses[0], ssffFiles: ssffFiles
					};
				}).catch((err) => { console.error('Error fetching bundle (LFS):', err); throw err; })
			}
		}
		return getProm;
	};

	public saveBundle(bundleData) {
		var getProm;
		if (this.ConfigProviderService.vals.main.comMode === 'CORS') {
		} else if (this.ConfigProviderService.vals.main.comMode === 'WS') {
			getProm = this.WebSocketHandlerService.saveBundle(bundleData);
		} else if (this.ConfigProviderService.vals.main.comMode === 'GITLAB') {
			var searchObject = this.getSearchParams();
			if (searchObject.gitlabURL && !/^https?:\/\//i.test(searchObject.gitlabURL)) {
				return Promise.reject(new Error("Invalid gitlabURL: must use http(s) protocol"));
			}
			let gitlabPath = this.getGitlabPathFromSearchObject(searchObject, false);
			var bndlPath = gitlabPath + bundleData.session + '_ses/' + bundleData.annotation.name + '_bndl/';
			var actions = [{
				action: "update",
				file_path: bndlPath + bundleData.annotation.name + "_annot.json",
				content: JSON.stringify(bundleData.annotation, null, 4),
				encoding: "text"
			}, {
				action: "update",
				file_path: gitlabPath + 'bundleLists/' + searchObject.bundleListName + "_bundleList.json",
				content: JSON.stringify(this.LoadedMetaDataService.getBundleList(), null, 4),
				encoding: "text"
			}];
			if(bundleData.ssffFiles.length > 0){
				actions.push({
					action: "update",
					file_path: bndlPath + bundleData.annotation.name + "." + bundleData.ssffFiles[0].fileExtension,
					content: bundleData.ssffFiles[0].data,
					encoding: "base64"
				});
			}
			var payload = {
				branch: "master",
				commit_message: "grazer save by user: " + searchObject.bundleListName + "; session: " + bundleData.session + "; bundle: " + bundleData.annotation.name + ";",
				actions: actions
			};
			getProm = fetch(searchObject.gitlabURL + '/api/v4/projects/' + searchObject.projectID + '/repository/commits', {
				method: 'POST',
				headers: { 'PRIVATE-TOKEN': this.getPrivateToken(), 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			}).then((resp) => {
				if (!resp.ok) { throw new Error('HTTP ' + resp.status + ': ' + resp.statusText); }
				return resp.json();
			}).catch((err) => { console.error('Error saving bundle:', err); throw err; })
		} else if (this.ConfigProviderService.vals.main.comMode === 'EMBEDDED') {
			window.parent.postMessage({ trigger: "manualSave", data: bundleData }, window.location.origin);
			getProm = Promise.resolve();
		}
		return getProm;
	};

	public saveConfiguration(configData) {
		var getProm;
		if (this.ConfigProviderService.vals.main.comMode === 'CORS') {
			console.error('CORS version of saveBundle not implemented');
		} else if (this.ConfigProviderService.vals.main.comMode === 'WS') {
			getProm = this.WebSocketHandlerService.saveConfiguration(configData);
		}
		return getProm;
	};

	public parseLabelFile(string, annotates, name, fileType) {
		var prom;
		if (fileType === 'ESPS') {
			prom = this.EspsParserService.asyncParseEsps(string, this.ConfigProviderService.embeddedVals.labelGetUrl, 'embeddedESPS');
		} else if (fileType === 'TEXTGRID') {
			prom = this.TextGridParserService.asyncParseTextGrid(string, this.ConfigProviderService.embeddedVals.labelGetUrl, 'embeddedTEXTGRID');
		} else if (fileType === 'annotJSON') {
			prom = Promise.resolve(typeof string === 'string' ? JSON.parse(string) : string);
		}
		return prom;
	};
}

export const ioHandlerService = new IoHandlerService();
