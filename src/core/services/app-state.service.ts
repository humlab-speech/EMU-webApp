import { eventBus } from '../../app/util/event-bus';

export class AppStateService {
	DragnDropService!: any;
	DragnDropDataService!: any;
	ViewStateService!: any;
	IoHandlerService!: any;
	LoadedMetaDataService!: any;
	SoundHandlerService!: any;
	DataService!: any;
	SsffDataService!: any;
	HistoryService!: any;

	initDeps(deps: {
		DragnDropService: any; DragnDropDataService: any; ViewStateService: any;
		IoHandlerService: any; LoadedMetaDataService: any; SoundHandlerService: any;
		DataService: any; SsffDataService: any; HistoryService: any;
	}) { Object.assign(this, deps); }

	public resetToInitState() {
		if(this.IoHandlerService.WebSocketHandlerService.isConnected()) {
			this.IoHandlerService.WebSocketHandlerService.disconnectWarning().then(() => {
				console.info('Closing websocket connection to server');
				this.IoHandlerService.WebSocketHandlerService.closeConnect();
			});
		}
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
		window.history.replaceState({}, '', window.location.pathname);
		eventBus.emit('resetToInitState');
	};

	public reloadToInitState(session) {
		this.IoHandlerService.WebSocketHandlerService.closeConnect();
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

export const appStateService = new AppStateService();
