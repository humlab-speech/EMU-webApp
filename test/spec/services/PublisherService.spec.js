'use strict';

describe('Service: PublisherService', function () {
  var originalPostMessage;

  beforeEach(angular.mock.module('artic'));

  beforeEach(angular.mock.inject(function (ConfigProviderService) {
    ConfigProviderService.setVals(defaultArticConfig);
    // Save and replace window.parent.postMessage for isolation
    originalPostMessage = window.parent.postMessage;
    window.parent.postMessage = jest.fn();
  }));

  afterEach(function () {
    window.parent.postMessage = originalPostMessage;
  });

  it('should not post when comMode is not EMBEDDED', angular.mock.inject(function (PublisherService, ConfigProviderService) {
    ConfigProviderService.vals.main.comMode = 'WS';

    return PublisherService.publishUnsavedBundleToParentWindow().then(function () {
      expect(window.parent.postMessage).not.toHaveBeenCalled();
    });
  }));

  it('should post when comMode is EMBEDDED and bundle is valid', angular.mock.inject(function (PublisherService, ConfigProviderService, DataService, ValidationService, StandardFuncsService, LoadedMetaDataService, SsffDataService) {
    ConfigProviderService.vals.main.comMode = 'EMBEDDED';

    spyOn(DataService, 'getData').mockReturnValue({ levels: [], links: [] });
    spyOn(ValidationService, 'validateJSO').mockReturnValue(true);
    spyOn(StandardFuncsService, 'traverseAndClean').mockImplementation(function () {});
    spyOn(LoadedMetaDataService, 'getCurBndl').mockReturnValue({
      session: 'sess1',
      finishedEditing: true,
      comment: 'test comment'
    });
    spyOn(SsffDataService, 'getFile').mockReturnValue(undefined);

    return PublisherService.publishUnsavedBundleToParentWindow().then(function () {
      expect(window.parent.postMessage).toHaveBeenCalledTimes(1);
      var callArgs = window.parent.postMessage.mock.calls[0];
      expect(callArgs[0].trigger).toBe('autoSave');
      expect(callArgs[0].data.annotation).toEqual({ levels: [], links: [] });
      expect(callArgs[0].data.session).toBe('sess1');
      expect(callArgs[0].data.finishedEditing).toBe(true);
      expect(callArgs[0].data.comment).toBe('test comment');
    });
  }));
});
