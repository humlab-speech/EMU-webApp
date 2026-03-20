'use strict';

describe('Service: BinaryDataManipHelperService', function () {

  // load the controller's module
  beforeEach(angular.mock.module('artic'));

  /**
   *
   */
  it('should convert base64ToArrayBuffer', angular.mock.inject(function (BinaryDataManipHelperService) {
    var ab = BinaryDataManipHelperService.base64ToArrayBuffer(msajc003_bndl.mediaFile.data);
    expect(ab.byteLength).toBe(msajc003_bndl.mediaFile.data.length * 0.75 - 1);
  }));

  /**
   *
   */
  it('should convert arrayBufferToBase64', angular.mock.inject(function (BinaryDataManipHelperService) {
    var base = BinaryDataManipHelperService.arrayBufferToBase64(BinaryDataManipHelperService.base64ToArrayBuffer(msajc003_bndl.mediaFile.data));
    expect(base).toBe(msajc003_bndl.mediaFile.data);
  }));

});