import { eventBus } from '../util/event-bus';
import { scheduleUpdate } from '../util/schedule-update';

export class WebSocketHandlerService{
	private HistoryService: any;
	private SsffParserService: any;
	private ConfigProviderService: any;
	private ViewStateService: any;
	private WavParserService: any;
	private SoundHandlerService: any;
	private EspsParserService: any;
	private UuidService: any;
	private BinaryDataManipHelperService: any;
	private SsffDataService: any;
	private ModalService: any;

	private callbacks: any;
	private conPromise: { resolve: (value: any) => void; reject: (reason: any) => void } | null;
	private connected: boolean;
	public ws: any;

	constructor(){
		this.callbacks = {} as any;
		this.conPromise = null;
		this.connected = false;
		this.ws = {} as any;
	}

	public initDeps(deps: {
		HistoryService: any; SsffParserService: any; ConfigProviderService: any;
		ViewStateService: any; WavParserService: any; SoundHandlerService: any;
		EspsParserService: any; UuidService: any; BinaryDataManipHelperService: any;
		SsffDataService: any; ModalService: any;
	}) {
		this.HistoryService = deps.HistoryService;
		this.SsffParserService = deps.SsffParserService;
		this.ConfigProviderService = deps.ConfigProviderService;
		this.ViewStateService = deps.ViewStateService;
		this.WavParserService = deps.WavParserService;
		this.SoundHandlerService = deps.SoundHandlerService;
		this.EspsParserService = deps.EspsParserService;
		this.UuidService = deps.UuidService;
		this.BinaryDataManipHelperService = deps.BinaryDataManipHelperService;
		this.SsffDataService = deps.SsffDataService;
		this.ModalService = deps.ModalService;
	}

	private listener(data) {
		var messageObj = data;
		if (this.callbacks.hasOwnProperty(messageObj.callbackID)) {
			switch (messageObj.type) {
				case 'getESPSfile': alert('espsfile'); break;
				case 'getSSFFfile': alert('ssfffile'); break;
			}
			if (messageObj.status.type === 'SUCCESS') {
				scheduleUpdate(() => { this.callbacks[messageObj.callbackID].cb.resolve(messageObj.data); });
			} else {
				this.closeConnect();
				eventBus.emit('resetToInitState');
				scheduleUpdate(() => { this.ModalService.open('views/error.html', 'Communication error with server! Error message is: ' + messageObj.status.message); });
			}
			delete this.callbacks[messageObj.callbackID];
		} else {
			if(typeof messageObj.status === 'undefined'){
				this.ModalService.open('views/error.html', 'Just got JSON message from server that artic does not know how to deal with! This is not allowed!');
			}
			else if (messageObj.status.type === 'ERROR:TIMEOUT') {
				// do nothing
			} else {
				this.ModalService.open('views/error.html', 'Received invalid messageObj.callbackID that could not be resolved to a request! This should not happen and indicates a bad server response! The invalid callbackID was: ' + messageObj.callbackID);
			}
		}
	}

	private getCallbackId() {
		return this.UuidService.new();
	}

	private wsonopen(message) {
		this.connected = true;
		if (this.conPromise) this.conPromise.resolve(message);
		scheduleUpdate();
	}

	private wsonmessage(message) {
		try{
			var jsonMessage = JSON.parse(message.data);
			this.listener(jsonMessage);
		}catch(e){
			this.ModalService.open('views/error.html', 'Got non-JSON string as message from server! This is not allowed! The message was: ' + message.data + ' which caused the JSON.parse error: ' + e).then(() => {
				this.closeConnect();
				eventBus.emit('resetToInitState');
			});
		}
	}

	private wsonerror(message) {
		console.error('WEBSOCKET ERROR!!!!!');
		if (this.conPromise) this.conPromise.reject(message);
		scheduleUpdate();
	}

	private wsonclose(message) {
		if (!message.wasClean && this.connected) {
			this.ModalService.open('views/error.html', 'A non clean disconnect to the server occurred! This probably means that the server is down. Please check the server and reconnect!').then(() => {
				eventBus.emit('connectionDisrupted');
			});
		}
		this.connected = false;
	}

	private sendRequest(request) {
		return new Promise((resolve, reject) => {
			var callbackId = this.getCallbackId();
			this.callbacks[callbackId] = { time: new Date(), cb: { resolve, reject } };
			request.callbackID = callbackId;
			this.ws.send(JSON.stringify(request));
			setTimeout(() => {
				var tOutResp = {
					'callbackID': callbackId,
					'status': {
						'type': 'ERROR:TIMEOUT',
						'message': 'Sent request of type: ' + request.type + ' timed out after ' + this.ConfigProviderService.vals.main.serverTimeoutInterval + 'ms!  Please check the server...'
					}
				};
				this.listener(tOutResp);
			}, this.ConfigProviderService.vals.main.serverTimeoutInterval);
		});
	}

	public initConnect(url) {
		try{
			this.ws = new WebSocket(url);
			this.ws.onopen = this.wsonopen.bind(this);
			this.ws.onmessage = this.wsonmessage.bind(this);
			this.ws.onerror = this.wsonerror.bind(this);
			this.ws.onclose = this.wsonclose.bind(this);
		}catch (err){
			return Promise.reject('A malformed websocket URL that does not start with ws:// or wss:// was provided.');
		}
		return new Promise((resolve, reject) => {
			this.conPromise = { resolve, reject };
		});
	};

	public isConnected() { return this.connected; };

	public closeConnect() {
		if (this.isConnected()) {
			this.ws.onclose = () => {};
			this.ws.close();
		}
	};

	public getProtocol() { return this.sendRequest({ type: 'GETPROTOCOL' }); };

	public getDoUserManagement() {
		const params = new URLSearchParams(window.location.search);
		const projectId = params.get("projectId");
		if (projectId && !/^[a-zA-Z0-9_-]+$/.test(projectId)) {
			console.error('Invalid projectId: must contain only alphanumeric, hyphen, or underscore characters');
			return;
		}
		return this.sendRequest({ type: 'GETDOUSERMANAGEMENT', data: { projectId } });
	};

	public logOnUser(name, pwd) { return this.sendRequest({ type: 'LOGONUSER', userName: name, pwd: pwd }); };
	public getDBconfigFile() { return this.sendRequest({ type: 'GETGLOBALDBCONFIG' }); };
	public getBundleList() { return this.sendRequest({ type: 'GETBUNDLELIST' }); };
	public getBundle(name, session) { return this.sendRequest({ type: 'GETBUNDLE', name: name, session: session }); };
	public saveBundle(bundleData) { return this.sendRequest({ type: 'SAVEBUNDLE', data: bundleData }); };
	public saveConfiguration(configData) { return this.sendRequest({ type: 'SAVEDBCONFIG', data: configData }); };
	public disconnectWarning() { return this.sendRequest({ type: 'DISCONNECTWARNING' }); };
	public getDoEditDBConfig() { return this.sendRequest({ type: 'GETDOEDITDBCONFIG' }); };
	public editDBConfig(subtype, data) { return this.sendRequest({ type: 'EDITDBCONFIG', subtype: subtype, data: data }); };
}

export const webSocketHandlerService = new WebSocketHandlerService();
