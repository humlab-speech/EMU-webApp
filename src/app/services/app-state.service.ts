import * as angular from 'angular';
import { eventBus } from '../util/event-bus';

/**
 * @ngdoc service
 * @name grazer.AppStateService
 * @description
 * # AppStateService
 * Service in the emuwebApp.
 */
class AppStateService{

	private DragnDropService;
	private DragnDropDataService;
	private ViewStateService;
	private IoHandlerService;
	private LoadedMetaDataService;
	private SoundHandlerService;
	private DataService;
	private SsffDataService;
	private HistoryService;

	constructor(DragnDropService, DragnDropDataService, ViewStateService, IoHandlerService, LoadedMetaDataService, SoundHandlerService, DataService, SsffDataService, HistoryService){
		this.DragnDropService = DragnDropService;
		this.DragnDropDataService = DragnDropDataService;
		this.ViewStateService = ViewStateService;
		this.IoHandlerService = IoHandlerService;
		this.LoadedMetaDataService = LoadedMetaDataService;
		this.SoundHandlerService = SoundHandlerService;
		this.DataService = DataService;
		this.SsffDataService = SsffDataService;
		this.HistoryService = HistoryService;

	}

			/**
		 *
		 */
		public resetToInitState() {
			// SIC IoHandlerService.WebSocketHandlerService is private
			if(this.IoHandlerService.WebSocketHandlerService.isConnected()) {
				this.IoHandlerService.WebSocketHandlerService.disconnectWarning().then(() => {
					console.info('Closing websocket connection to server');
					this.IoHandlerService.WebSocketHandlerService.closeConnect();
				});
			}
			// $scope.curBndl = {};
			this.LoadedMetaDataService.resetToInitState();
			this.SoundHandlerService.audioBuffer = {};
			this.SoundHandlerService.playbackBuffer = null;
			this.DataService.setData({});
			this.DragnDropDataService.resetToInitState();
			this.DragnDropService.resetToInitState();
			this.SsffDataService.data = [];
			this.HistoryService.resetToInitState();
			this.ViewStateService.setState('noDBorFilesloaded');
			this.ViewStateService.somethingInProgress = false;
			this.ViewStateService.resetToInitState();
			this.HistoryService.resetToInitState();
			this.ViewStateService.showDropZone = true;
			window.history.replaceState({}, '', window.location.pathname); // reset URL without get values
			eventBus.emit('resetToInitState');
			//$scope.loadDefaultConfig();
		};
		
		public reloadToInitState (session) {
			// SIC IoHandlerService.WebSocketHandlerService is private
			this.IoHandlerService.WebSocketHandlerService.closeConnect();
			// $scope.curBndl = {};
			var url = this.ViewStateService.url;
			this.LoadedMetaDataService.resetToInitState();
			this.SoundHandlerService.audioBuffer = {};
			this.SoundHandlerService.playbackBuffer = null;
			this.DataService.setData({});
			this.DragnDropDataService.resetToInitState();
			this.DragnDropService.resetToInitState();
			this.SsffDataService.data = [];
			this.HistoryService.resetToInitState();
			this.ViewStateService.setState('noDBorFilesloaded');
			this.ViewStateService.somethingInProgress = false;
			this.HistoryService.resetToInitState();
			this.ViewStateService.resetToInitState();
			eventBus.emit('reloadToInitState', {url:url, session:session, reload:true });
		};

}


angular.module('grazer')
	.service('AppStateService', ['DragnDropService', 'DragnDropDataService', 'ViewStateService', 'IoHandlerService', 'LoadedMetaDataService', 'SoundHandlerService', 'DataService', 'SsffDataService', 'HistoryService', AppStateService]);
