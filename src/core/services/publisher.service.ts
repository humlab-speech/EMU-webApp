export class PublisherService {
	SsffDataService!: any;
	SsffParserService!: any;
	BinaryDataManipHelperService!: any;
	ValidationService!: any;
	DataService!: any;
	StandardFuncsService!: any;
	LoadedMetaDataService!: any;
	ConfigProviderService!: any;

	initDeps(deps: {
		SsffDataService: any; SsffParserService: any; BinaryDataManipHelperService: any;
		ValidationService: any; DataService: any; StandardFuncsService: any;
		LoadedMetaDataService: any; ConfigProviderService: any;
	}) { Object.assign(this, deps); }

	public async publishUnsavedBundleToParentWindow() {
		if (this.ConfigProviderService.vals.main.comMode !== 'EMBEDDED') { return; }
		var bundleData = {} as any;
		bundleData.ssffFiles = [];
		for (const ssffFile of this.SsffDataService.data) {
			try {
				let messParser = await this.SsffParserService.asyncJso2ssff(ssffFile);
				bundleData.ssffFiles.push({
					'fileExtension': ssffFile.fileExtension, 'encoding': 'BASE64',
					'data': this.BinaryDataManipHelperService.arrayBufferToBase64(messParser.data)
				});
			} catch (error) {
				console.warn('Error converting SSFF file (' + ssffFile.fileExtension + ') to binary.', error);
			}
		}
		var validRes = this.ValidationService.validateJSO('annotationFileSchema', this.DataService.getData());
		if (validRes !== true) {
			console.warn('PROBLEM: trying to publish bundle to parent window, but bundle is invalid (posssibly because hierarchy view is open). traverseAndClean() will be called.');
		}
		this.StandardFuncsService.traverseAndClean(this.DataService.getData());
		bundleData.annotation = this.DataService.getData();
		bundleData.mediaFile = {'encoding': 'BASE64', 'data': ''};
		var curBndl = this.LoadedMetaDataService.getCurBndl();
		if (typeof curBndl.session !== 'undefined') { bundleData.session = curBndl.session; }
		if (typeof curBndl.finishedEditing !== 'undefined') { bundleData.finishedEditing = curBndl.finishedEditing; }
		if (typeof curBndl.comment !== 'undefined') { bundleData.comment = curBndl.comment; }
		validRes = this.ValidationService.validateJSO('bundleSchema', bundleData);
		if (validRes !== true) {
			console.error('GRAVE PROBLEM: trying to publish bundle to parent window, but bundle is invalid. traverseAndClean() HAS ALREADY BEEN CALLED.');
			console.error(validRes);
			console.error('Not publishing!');
			return;
		} else {
			window.parent.postMessage({ trigger: "autoSave", data: bundleData }, window.location.origin);
			console.info('Posted to parent (autoSave)', bundleData);
		}
	};
}

export const publisherService = new PublisherService();
