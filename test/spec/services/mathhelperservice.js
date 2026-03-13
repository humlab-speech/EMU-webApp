'use strict';

describe('Service: MathHelperService', function () {

  // load the service's module
  beforeEach(angular.mock.module('grazer'));

  // instantiate service
  var MathHelperService;
  beforeEach(angular.mock.inject(function (_MathHelperService_) {
    MathHelperService = _MathHelperService_;
  }));

  //
  it('should calculate closest power of 2 correctly', function () {
    expect(!!MathHelperService).toBe(true);
    var res = MathHelperService.calcClosestPowerOf2Gt(5);
    expect(res).toBe(8);
    var res = MathHelperService.calcClosestPowerOf2Gt(9);
    expect(res).toBe(16);
    var res = MathHelperService.calcClosestPowerOf2Gt(255);
    expect(res).toBe(256);

  });

  //
  it('should roundToNdigitsAfterDecPoint correctly', function () {
    var res = MathHelperService.roundToNdigitsAfterDecPoint(2.12345, 2);
    expect(res).toBe(2.12);
    res = MathHelperService.roundToNdigitsAfterDecPoint(2.12345, 1);
    expect(res).toBe(2.1);
    res = MathHelperService.roundToNdigitsAfterDecPoint(2.12345, 4);
    expect(res).toBe(2.1235);

  });

});
