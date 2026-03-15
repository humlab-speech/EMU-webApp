export class ModalService {
	ArrayHelperService!: any;
	ViewStateService!: any;

	private isOpen;
	private templateUrl;
	private _resolve: ((value: any) => void) | null = null;
	private _reject: ((reason: any) => void) | null = null;
	private deferChange;
	private force;
	private dataOut;
	private dataIn;
	private dataExport;

	initDeps(deps: { ArrayHelperService: any; ViewStateService: any }) {
		Object.assign(this, deps);
	}

	public initialize() {
		this.isOpen = false;
		this.templateUrl = '';
		this._resolve = null;
		this._reject = null;
		this.deferChange = undefined;
		this.force = false;
		this.dataOut = undefined;
		this.dataIn = undefined;
		this.dataExport = undefined;
	};

	public open(template, param1, param2, force) {
		this.initialize();
		if (param1 !== undefined) {
			this.dataIn = param1;
			if (param1.y !== undefined) {
				this.dataIn.chartData = this.ArrayHelperService.convertArrayToXYjsoArray(param1.y);
			}
		}
		if (param2 !== undefined) {
			this.dataExport = param2;
		}
		if (force !== undefined) {
			this.force = force;
		}
		return new Promise((resolve, reject) => {
			this._resolve = resolve;
			this._reject = reject;
			this.templateUrl = template;
			this.ViewStateService.setState('modalShowing');
			this.isOpen = true;
		});
	};

	public error(msg) {
		this.initialize();
		this.dataIn = msg;
		this.templateUrl = 'views/error.html';
		this.ViewStateService.setState('modalShowing');
	};

	public close() {
		this.ViewStateService.setEditing(false);
		this.ViewStateService.setState(this.ViewStateService.prevState);
		this.isOpen = false;
		if (this.ViewStateService.hierarchyState.isShown()) {
			this.ViewStateService.hierarchyState.toggleHierarchy();
		}
		if (this._resolve) this._resolve(false);
	};

	public closeAndResolve(status) {
		this.ViewStateService.setEditing(false);
		this.ViewStateService.setState(this.ViewStateService.prevState);
		this.isOpen = false;
		if (this.ViewStateService.hierarchyState.isShown()) {
			this.ViewStateService.hierarchyState.toggleHierarchy();
		}
		if (this._resolve) this._resolve(status);
	};

	public confirm() {
		this.ViewStateService.setEditing(false);
		this.ViewStateService.setState(this.ViewStateService.prevState);
		this.isOpen = false;
		if (this._resolve) this._resolve(true);
	};

	public select(idx) {
		this.closeAndResolve(idx);
	};

	public confirmContent() {
		this.ViewStateService.setEditing(false);
		this.ViewStateService.setState(this.ViewStateService.prevState);
		this.isOpen = false;
		if (this._resolve) this._resolve(this.dataOut);
	};

	public getTemplateUrl() {
		return this.templateUrl;
	};
}

export const modalService = new ModalService();
