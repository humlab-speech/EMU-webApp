export class DragnDropService{
	private ModalService: any;
	private DataService: any;
	private ValidationService: any;
	private ConfigProviderService: any;
	private DragnDropDataService: any;
	private IoHandlerService: any;
	private ViewStateService: any;
	private SoundHandlerService: any;
	private BinaryDataManipHelperService: any;
	private BrowserDetectorService: any;
	private WavParserService: any;
	private TextGridParserService: any;
	private LoadedMetaDataService: any;
	private LevelService: any;

	private drandropBundles: any;
	private bundleList: any;
	private sessionName: string;
	private maxDroppedBundles: number;

	constructor(){
		this.drandropBundles = [];
		this.bundleList = [];
		this.sessionName = 'File(s)';
		this.maxDroppedBundles = 10;
	}

	public initDeps(deps: {
		ModalService: any; DataService: any; ValidationService: any;
		ConfigProviderService: any; DragnDropDataService: any; IoHandlerService: any;
		ViewStateService: any; SoundHandlerService: any; BinaryDataManipHelperService: any;
		BrowserDetectorService: any; WavParserService: any; TextGridParserService: any;
		LoadedMetaDataService: any; LevelService: any;
	}) {
		this.ModalService = deps.ModalService;
		this.DataService = deps.DataService;
		this.ValidationService = deps.ValidationService;
		this.ConfigProviderService = deps.ConfigProviderService;
		this.DragnDropDataService = deps.DragnDropDataService;
		this.IoHandlerService = deps.IoHandlerService;
		this.ViewStateService = deps.ViewStateService;
		this.SoundHandlerService = deps.SoundHandlerService;
		this.BinaryDataManipHelperService = deps.BinaryDataManipHelperService;
		this.BrowserDetectorService = deps.BrowserDetectorService;
		this.WavParserService = deps.WavParserService;
		this.TextGridParserService = deps.TextGridParserService;
		this.LoadedMetaDataService = deps.LoadedMetaDataService;
		this.LevelService = deps.LevelService;
	}

	private static readonly MEDIA_EXTS = new Set(['.wav','.mp3','.flac','.ogg','.oga','.aac','.m4a','.wma','.mp4','.webm','.mkv','.mov']);

	public handleDrop(files: FileList) {
		const fileMap = new Map<string, { media?: File; annotation?: { type: string; file: File } }>();

		for (let i = 0; i < files.length; i++) {
			const file = files[i];
			const name = file.name;
			const ext = name.substring(name.lastIndexOf('.')).toLowerCase();
			const base = name.substring(0, name.lastIndexOf('.'));

			if (!fileMap.has(base)) fileMap.set(base, {});
			const entry = fileMap.get(base)!;

			if (DragnDropService.MEDIA_EXTS.has(ext)) {
				entry.media = file;
			} else if (ext === '.textgrid') {
				entry.annotation = { type: 'textgrid', file };
			} else if (ext === '.json' || name.endsWith('_annot.json')) {
				entry.annotation = { type: 'annotation', file };
			}
		}

		const bundles: [string, File, { type: string; file: File }?][] = [];
		for (const [base, entry] of fileMap) {
			if (!entry.media) continue;
			if (entry.annotation) {
				bundles.push([base, entry.media, entry.annotation]);
			} else {
				bundles.push([base, entry.media]);
			}
		}

		if (bundles.length === 0) {
			this.ModalService.open('views/error.html', 'No supported audio/video files found. Drop audio files (.wav, .mp3, .flac, .ogg, .m4a, .mp4, .webm), optionally paired with .TextGrid or _annot.json files.');
			return;
		}

		this.resetToInitState();
		this.setData(bundles);
	}

	public setData(bundles) {
		var count = 0;
		bundles.forEach((bundle, i) => {
			this.setDragnDropData(bundle[0], i, 'media', bundle[1]);
			if (bundle[2] !== undefined) { this.setDragnDropData(bundle[0], i, 'annotation', bundle[2]); }
			count = i;
		});
		if (count <= this.maxDroppedBundles) {
			this.convertDragnDropData(this.drandropBundles, 0).then(() => {
				this.LoadedMetaDataService.setBundleList(this.bundleList);
				this.LoadedMetaDataService.setCurBndlName(this.bundleList[this.DragnDropDataService.sessionDefault]);
				this.LoadedMetaDataService.setDemoDbName(this.bundleList[this.DragnDropDataService.sessionDefault]);
				this.handleLocalFiles();
				return true;
			}).catch((err) => { console.error('Error converting dropped files:', err); });
		} else { return false; }
	};

	public resetToInitState() {
		delete this.drandropBundles;
		this.drandropBundles = [];
		delete this.bundleList;
		this.bundleList = [];
		this.sessionName = 'File(s)';
		this.maxDroppedBundles = 10;
		this.DragnDropDataService.resetToInitState();
		this.LoadedMetaDataService.resetToInitState();
	};

	public setDragnDropData(bundle, i, type, data) {
		this.DragnDropDataService.setDefaultSession(i);
		if (this.drandropBundles[i] === undefined) {
			this.drandropBundles[i] = {};
			this.DragnDropDataService.convertedBundles[i] = {};
			this.DragnDropDataService.convertedBundles[i].name = bundle;
			this.bundleList.push({ name: bundle, session: this.sessionName });
		}
		if (type === 'media') { this.drandropBundles[i].media = data; }
		else if (type === 'annotation') { this.drandropBundles[i].annotation = data; }
	};

	public getDragnDropData(bundle, type) {
		if (type === 'media') { return this.drandropBundles[bundle].media; }
		else if (type === 'annotation') { return this.drandropBundles[bundle].annotation; }
		else { return false; }
	};

	public generateDrop(data) { return URL.createObjectURL(this.getBlob(data)); };

	public getBlob(data) { return new Blob([data], {type: 'text/plain'}); };

	public convertDragnDropData(bundles, i) {
		var data = this.drandropBundles[i];
		var reader:any = new FileReader();
		var reader2:any = new FileReader();
		var res;
		if (bundles.length > i) {
			return new Promise<void>((resolve, reject) => {
				if (data.media !== undefined) {
					reader.readAsArrayBuffer(data.media);
					reader.onloadend = (evt) => {
						if (evt.target.readyState === FileReader.DONE) {
							if (this.BrowserDetectorService.isBrowser.Firefox()) { res = evt.target.result; }
							else { res = evt.currentTarget.result; }
							this.WavParserService.parseAudioBuf(res).then((result) => {
								var audioBuffer = result.audioBuffer;
								if (this.DragnDropDataService.convertedBundles[i] === undefined) { this.DragnDropDataService.convertedBundles[i] = {}; }
								this.SoundHandlerService.audioBuffer = audioBuffer;
								this.SoundHandlerService.playbackBuffer = result.playbackBuffer;
								this.DragnDropDataService.convertedBundles[i].ssffFiles = [];
								var bundle = data.media.name.substr(0, data.media.name.lastIndexOf('.'));
								if (data.annotation === undefined) {
									this.DragnDropDataService.convertedBundles[i].annotation = {
										levels: [], links: [],
										sampleRate: audioBuffer.sampleRate,
										annotates: bundle, name: bundle
									};
									this.convertDragnDropData(bundles, i + 1).then(() => {
										delete this.drandropBundles;
										this.drandropBundles = [];
										resolve();
									});
								} else {
									if (data.annotation.type === 'textgrid') {
										reader2.readAsText(data.annotation.file);
										reader2.onloadend = (evt) => {
											if (evt.target.readyState === FileReader.DONE) {
												this.TextGridParserService.asyncParseTextGrid(evt.currentTarget.result, data.media.name, bundle).then((parseMess) => {
													this.DragnDropDataService.convertedBundles[i].annotation = parseMess;
													this.convertDragnDropData(bundles, i + 1).then(() => { resolve(); });
												}, (errMess) => {
													this.ModalService.open('views/error.html', 'Error parsing TextGrid file: ' + errMess.status.message).then(() => { reject(); });
												});
											}
										};
									} else if (data.annotation.type === 'annotation') {
										reader2.readAsText(data.annotation.file);
										reader2.onloadend = (evt) => {
											if (evt.target.readyState === FileReader.DONE) {
												this.DragnDropDataService.convertedBundles[i].annotation = JSON.parse(evt.currentTarget.result);
												this.convertDragnDropData(bundles, i + 1).then(() => { resolve(); });
											}
										};
									}
								}
							}, (errMess) => {
								this.ModalService.open('views/error.html', 'Error decoding audio file: ' + errMess.status.message).then(() => { reject(); });
							});
						}
					};
				}
			});
		} else { return Promise.resolve(); }
	};

	public handleLocalFiles() {
		var annotation;
		if (this.DragnDropDataService.convertedBundles[this.DragnDropDataService.sessionDefault].annotation !== undefined) {
			annotation = this.DragnDropDataService.convertedBundles[this.DragnDropDataService.sessionDefault].annotation;
		} else { annotation = {levels: [], links: []}; }
		this.ViewStateService.showDropZone = false;
		this.ViewStateService.setState('loadingSaving');
		this.ViewStateService.somethingInProgress = true;
		this.ViewStateService.somethingInProgressTxt = 'Loading local File: ' + this.DragnDropDataService.convertedBundles[this.DragnDropDataService.sessionDefault].name;
		this.IoHandlerService.httpGetPath('configFiles/standalone_grazerConfig.json').then((resp) => {
			this.ViewStateService.curPerspectiveIdx = 0;
			this.ConfigProviderService.setVals(resp.data.EMUwebAppConfig);
			delete resp.data.EMUwebAppConfig;
			var validRes;
			validRes = this.ValidationService.validateJSO('grazerConfigSchema', this.ConfigProviderService.vals);
			if (validRes === true) {
				this.ConfigProviderService.curDbConfig = resp.data;
				this.ViewStateService.somethingInProgressTxt = 'Parsing audio file...';
				this.ViewStateService.curViewPort.sS = 0;
				this.ViewStateService.curViewPort.eS = this.SoundHandlerService.audioBuffer.length;
				this.ViewStateService.curViewPort.selectS = -1;
				this.ViewStateService.curViewPort.selectE = -1;
				this.ViewStateService.curClickSegments = [];
				this.ViewStateService.curClickLevelName = undefined;
				this.ViewStateService.curClickLevelType = undefined;
				this.LoadedMetaDataService.setCurBndl(this.DragnDropDataService.convertedBundles[this.DragnDropDataService.sessionDefault]);
				this.ViewStateService.resetSelect();
				this.ViewStateService.curPerspectiveIdx = 0;
				this.DataService.setData(annotation);
				var lNames = [];
				var levelDefs = [];
				annotation.levels.forEach((l) => {
					if (l.type === 'SEGMENT' || l.type === 'EVENT') {
						lNames.push(l.name);
						levelDefs.push({
							'name': l.name, 'type': l.type,
							'attributeDefinitions': { 'name': l.name, 'type': 'string' }
						});
					}
				});
				this.ConfigProviderService.curDbConfig.levelDefinitions = levelDefs;
				this.ViewStateService.setCurLevelAttrDefs(this.ConfigProviderService.curDbConfig.levelDefinitions);
				this.ConfigProviderService.setPerspectivesOrder(this.ViewStateService.curPerspectiveIdx, lNames);
				this.ViewStateService.somethingInProgressTxt = 'Parsing SSFF files...';
				validRes = this.ValidationService.validateJSO('annotationFileSchema', annotation);
				if (validRes === true) {
					this.DataService.setLinkData(annotation.links);
					this.ViewStateService.setState('labeling');
					this.ViewStateService.somethingInProgress = false;
					this.ViewStateService.somethingInProgressTxt = 'Done!';
				} else {
					this.ModalService.open('views/error.html', 'Error validating annotation file: ' + JSON.stringify(validRes, null, 4)).then(() => {
						this.resetToInitState();
					});
				}
				if (!this.BrowserDetectorService.isBrowser.HeadlessChrome()){
					this.ViewStateService.selectLevel(false, this.ConfigProviderService.vals.perspectives[this.ViewStateService.curPerspectiveIdx].levelCanvases.order, this.LevelService);
				}
			}
			this.ViewStateService.somethingInProgress = false;
		}).catch((err) => {
			console.error('Error loading standalone config:', err);
			this.ViewStateService.somethingInProgress = false;
			this.ModalService.open('views/error.html', 'Error loading configuration: ' + (err.message || err));
		});
	};
}

export const dragnDropService = new DragnDropService();
