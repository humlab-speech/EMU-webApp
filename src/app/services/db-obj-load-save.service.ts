import * as angular from 'angular';

import { WavRangeReq } from '../workers/wavrangereq.worker';

/**
* @ngdoc service
* @name grazer.dbObjLoadSaveService
* @description
* # dbObjLoadSaveService
* Service in grazer.
*/
class DbObjLoadSaveService{
	
	private $log;
	private $http;
	private DataService;
	private ViewStateService;
	private HistoryService;
	private LoadedMetaDataService;
	private SsffDataService;
	private IoHandlerService;
	private BinaryDataManipHelperService;
	private WavParserService;
	private SoundHandlerService;
	private SsffParserService;
	private ValidationService;
	private LevelService;
	private ModalService;
	private ConfigProviderService;
	private AppStateService;
	private StandardFuncsService;
	
	constructor($log, $http, DataService, ViewStateService, HistoryService, LoadedMetaDataService, SsffDataService, IoHandlerService, BinaryDataManipHelperService, WavParserService, SoundHandlerService, SsffParserService, ValidationService, LevelService, ModalService, ConfigProviderService, AppStateService, StandardFuncsService){
		this.$log = $log;
		this.$http = $http;
		this.DataService = DataService;
		this.ViewStateService = ViewStateService;
		this.HistoryService = HistoryService;
		this.LoadedMetaDataService = LoadedMetaDataService;
		this.SsffDataService = SsffDataService;
		this.IoHandlerService = IoHandlerService;
		this.BinaryDataManipHelperService = BinaryDataManipHelperService;
		this.WavParserService = WavParserService;
		this.SoundHandlerService = SoundHandlerService;
		this.SsffParserService = SsffParserService;
		this.ValidationService = ValidationService;
		this.LevelService = LevelService;
		this.ModalService = ModalService;
		this.ConfigProviderService = ConfigProviderService;
		this.AppStateService = AppStateService;
		this.StandardFuncsService = StandardFuncsService;
		
	}
	
	private innerLoadBundle(bndl, bundleData, arrBuff): Promise<void> {
		this.ViewStateService.somethingInProgressTxt = 'Parsing WAV file...';

		return this.WavParserService.parseWavAudioBuf(arrBuff).then((result) => {
			var audioBuffer = result.audioBuffer;
			this.ViewStateService.curViewPort.sS = 0;
			this.ViewStateService.curViewPort.eS = audioBuffer.length;
			if(bndl.timeAnchors !== undefined && bndl.timeAnchors.length > 0){
				this.ViewStateService.curViewPort.selectS = bndl.timeAnchors[0].sample_start;
				this.ViewStateService.curViewPort.selectE = bndl.timeAnchors[0].sample_end;
			}else {
				this.ViewStateService.resetSelect();
			}
			this.ViewStateService.curTimeAnchorIdx = -1;
			this.ViewStateService.curClickSegments = [];
			this.ViewStateService.curClickLevelName = undefined;
			this.ViewStateService.curClickLevelType = undefined;

			this.SoundHandlerService.audioBuffer = audioBuffer;
			this.SoundHandlerService.playbackBuffer = result.playbackBuffer;
			// fetch ssff files (if encoding == GETURL)
			var promises = [];
			bundleData.ssffFiles.forEach((file) => {
				if(file.encoding === 'GETURL'){ // BASE64 & ARRAYBUFFER are handled by worker
					file.data = this.IoHandlerService.httpGetPath(file.data, 'arraybuffer');
					promises.push(file.data);
					file.encoding = 'ARRAYBUFFER';
				}
			})
			if(promises.length === 0){
				promises.push(Promise.resolve());
			}

			return Promise.all(promises).then((res) => {
				for(var i = 0; i < res.length; i++){
					if(res[i] !== undefined){
						bundleData.ssffFiles[i].data = res[i];
					}
				}
				// set all ssff files
				this.ViewStateService.somethingInProgressTxt = 'Parsing SSFF files...';
				return this.SsffParserService.asyncParseSsffArr(bundleData.ssffFiles).then((ssffJso) => {
					this.SsffDataService.data = ssffJso.data;
					// set annotation
					this.DataService.setData(bundleData.annotation);
					this.LoadedMetaDataService.setCurBndl(bndl);
					// select first level
					this.ViewStateService.selectLevel(false, this.ConfigProviderService.vals.perspectives[this.ViewStateService.curPerspectiveIdx].levelCanvases.order, this.LevelService);
					this.ViewStateService.setState('labeling');

					this.ViewStateService.somethingInProgress = false;
					this.ViewStateService.somethingInProgressTxt = 'Done!';
				}, (errMess) => {
					this.ModalService.open('views/error.html', 'Error parsing SSFF file: ' + errMess.status.message).then(() => {
						this.AppStateService.resetToInitState();
					});
				});
			}, (errMess) => {
				this.ModalService.open('views/error.html', 'Error fetching SSFF files: ' + JSON.stringify(errMess)).then(() => {
					this.AppStateService.resetToInitState();
				});
			});
		}, (errMess) => {
			this.ModalService.open('views/error.html', 'Error decoding audio file: ' + errMess.status.message).then(() => {
				this.AppStateService.resetToInitState();
			});
		});
	}

	///////////////////
	// public api

	/**
	* general loadBundle method.
	* @param bndl object containing name attribute of currently loaded bundle
	* @param url if set the bundle is loaded from the given url
	*/
	public loadBundle(bndl, url) {
		// check if bndl has to be saved
		this.ViewStateService.setcurClickItem(null);
		if ((this.HistoryService.movesAwayFromLastSave !== 0 && this.ConfigProviderService.vals.main.comMode !== 'DEMO' && this.ConfigProviderService.vals.activeButtons.saveBundle)) {
			var curBndl = this.LoadedMetaDataService.getCurBndl();
			if (bndl !== curBndl) {
				return this.ModalService.open('views/saveChanges.html', curBndl.session + ':' + curBndl.name).then((messModal) => {
					if (messModal === 'saveChanges') {
						// save current bundle
						return this.saveBundle().then(() => {
							// load new bundle
							return this.loadBundle(bndl, "");
						});
					} else if (messModal === 'discardChanges') {
						// reset history
						this.HistoryService.resetToInitState();
						// load new bundle
						return this.loadBundle(bndl, "");
					}
				});
			}
			return Promise.resolve();
		} else {
			if (bndl !== this.LoadedMetaDataService.getCurBndl()) {
				// reset history
				this.HistoryService.resetToInitState();
				// reset hierarchy
				this.ViewStateService.hierarchyState.reset();
				// set state
				this.LevelService.deleteEditArea();
				this.ViewStateService.setEditing(false);
				this.ViewStateService.setState('loadingSaving');

				this.ViewStateService.somethingInProgress = true;
				this.ViewStateService.somethingInProgressTxt = 'Loading bundle: ' + bndl.name;
				// empty ssff files
				this.SsffDataService.data = [];
				if(!url){
					var promise = this.IoHandlerService.getBundle(bndl.name, bndl.session, this.LoadedMetaDataService.getDemoDbName());
				}else{
					var promise = this.$http.get(url);
				}
				return promise.then(async (bundleData) => {
					// check if response from http request
					if (bundleData.status === 200) {
						bundleData = bundleData.data;
					}

					// validate bundle
					var validRes = this.ValidationService.validateJSO('bundleSchema', bundleData);

					if (validRes === true) {

						var arrBuff;

						if(bundleData.mediaFile.encoding === 'BASE64'){
							arrBuff = this.BinaryDataManipHelperService.base64ToArrayBuffer(bundleData.mediaFile.data);
							return this.innerLoadBundle(bndl, bundleData, arrBuff);
						}else if(bundleData.mediaFile.encoding === 'GETURL'){
							return this.IoHandlerService.httpGetPath(bundleData.mediaFile.data, 'arraybuffer').then((res) => {
								if(res.status === 200){
									res = res.data;
								}
								return this.innerLoadBundle(bndl, bundleData, res);
							}, (errMess) => {
								this.ModalService.open('views/error.html', 'Error fetching audio file: ' + JSON.stringify(errMess)).then(() => {
									this.AppStateService.resetToInitState();
								});
							});
						}
					} else {
						this.ModalService.open('views/error.html', 'Error validating annotation file: ' + JSON.stringify(validRes, null, 4)).then(() => {
							this.AppStateService.resetToInitState();
						});
					}


				}, (errMess) => {
					// check for http vs websocket response
					if (errMess.data) {
						this.ModalService.open('views/error.html', 'Error loading bundle: ' + errMess.data).then(() => {
							this.AppStateService.resetToInitState();
						});
					} else {
						this.ModalService.open('views/error.html', 'Error loading bundle: ' + errMess.status.message).then(() => {
							this.AppStateService.resetToInitState();
						});
					}
				});
			}
			return Promise.resolve();
		}
	};
	
	
	/**
	* general purpose save bundle function.
	* @return promise that is resolved after completion (rejected on error)
	*/
	public saveBundle() {
		// check if something has changed
		// if (HistoryService.movesAwayFromLastSave !== 0) {
		if (this.ViewStateService.getPermission('saveBndlBtnClick')) {
			this.ViewStateService.somethingInProgress = true;
			this.ViewStateService.setState('loadingSaving');
			//create bundle json
			var bundleData = {} as any;
			this.ViewStateService.somethingInProgressTxt = 'Creating bundle json...';
			bundleData.ssffFiles = [];
			// ssffFiles (only FORMANTS are allowed to be manipulated so only this track is sent back to server)
			var formants = this.SsffDataService.getFile('FORMANTS');
			if (formants !== undefined) {
				return this.SsffParserService.asyncJso2ssff(formants).then((messParser) => {
					bundleData.ssffFiles.push({
						'fileExtension': formants.fileExtension,
						'encoding': 'BASE64',
						'data': this.BinaryDataManipHelperService.arrayBufferToBase64(messParser.data)
					});
					return this.getAnnotationAndSaveBndl(bundleData);
				}, (errMess) => {
					this.ModalService.open('views/error.html', 'Error converting javascript object to SSFF file: ' + errMess.status.message);
					return Promise.reject(errMess);
				});
			} else {
				return this.getAnnotationAndSaveBndl(bundleData);
			}
			// }
		} else {
			this.$log.info('Action: menuBundleSaveBtnClick not allowed!');
		}

	};
	
	
	/**
	*
	*/
	public getAnnotationAndSaveBndl(bundleData): Promise<void> {

		// Validate annotation before saving
		this.ViewStateService.somethingInProgressTxt = 'Validating annotJSON ...';

		var validRes = this.ValidationService.validateJSO('annotationFileSchema', this.DataService.getData());
		if (validRes !== true) {
			this.$log.warn('PROBLEM: trying to save bundle but bundle is invalid. traverseAndClean() will be called.');
			this.$log.error (validRes);
		}

		// clean annot data just to be safe...
		this.StandardFuncsService.traverseAndClean(this.DataService.getData());

		////////////////////////////
		// construct bundle

		// annotation
		bundleData.annotation = this.DataService.getData();

		// empty media file (depricated since schema was updated)
		bundleData.mediaFile = {'encoding': 'BASE64', 'data': ''};

		var curBndl = this.LoadedMetaDataService.getCurBndl();

		// add session if available
		if (typeof curBndl.session !== 'undefined') {
			bundleData.session = curBndl.session;
		}
		// add finishedEditing if available
		if (typeof curBndl.finishedEditing !== 'undefined') {
			bundleData.finishedEditing = curBndl.finishedEditing;
		}
		// add comment if available
		if (typeof curBndl.comment !== 'undefined') {
			bundleData.comment = curBndl.comment;
		}

		// validate bundle
		this.ViewStateService.somethingInProgressTxt = 'Validating bundle ...';
		validRes = this.ValidationService.validateJSO('bundleSchema', bundleData);

		if (validRes !== true) {
			this.$log.error('GRAVE PROBLEM: trying to save bundle but bundle is invalid. traverseAndClean() HAS ALREADY BEEN CALLED.');
			this.$log.error(validRes);

			return this.ModalService.open('views/error.html', 'Somehow the data for this bundle has been corrupted. This is most likely a nasty and diffucult to spot bug. If you are at the IPS right now, please contact an EMU developer immediately. The Validation error is: ' + JSON.stringify(validRes, null, 4)).then(() => {
				this.ViewStateService.somethingInProgressTxt = '';
				this.ViewStateService.somethingInProgress = false;
				this.ViewStateService.setState('labeling');
				return Promise.reject('Bundle validation failed');
			});
		} else {
			this.ViewStateService.somethingInProgressTxt = 'Saving bundle...';
			return this.IoHandlerService.saveBundle(bundleData).then(() => {
				this.ViewStateService.somethingInProgressTxt = 'Done!';
				this.ViewStateService.somethingInProgress = false;
				this.HistoryService.movesAwayFromLastSave = 0;
				this.ViewStateService.setState('labeling');
			}, (errMess) => {
				this.ModalService.open('views/error.html', 'Error saving bundle: ' + errMess.status.message).then(() => {
					this.AppStateService.resetToInitState();
				});
				return Promise.reject(errMess);
			});
		}
	};
	
}

angular.module('grazer')
.service('DbObjLoadSaveService', ['$log', '$http', 'DataService', 'ViewStateService', 'HistoryService', 'LoadedMetaDataService', 'SsffDataService', 'IoHandlerService', 'BinaryDataManipHelperService', 'WavParserService', 'SoundHandlerService', 'SsffParserService', 'ValidationService', 'LevelService', 'ModalService', 'ConfigProviderService', 'AppStateService', 'StandardFuncsService', DbObjLoadSaveService]);
