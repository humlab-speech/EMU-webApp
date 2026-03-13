'use strict';

describe('Service: ArrayHelperService', function () {

	// load the controller's module
	beforeEach(angular.mock.module('grazer'));


	/**
	 *
	 */
	it('should find min/max in mock array', angular.mock.inject(function (ArrayHelperService) {
		var mockArr = [123, 3, 432, 2, 4, 4];

		var res = ArrayHelperService.findMinMax(mockArr, 'min');
		expect(res.val).toEqual(2);
		expect(res.idx).toEqual(3);

		res = ArrayHelperService.findMinMax(mockArr, 'max');
		expect(res.val).toEqual(432);
		expect(res.idx).toEqual(2);

	}));


	/**
	 *
	 */
	it('should create absolute array of mock array', angular.mock.inject(function (ArrayHelperService) {
		var mockArr = [3, 2, 1, 1, -1, -2, -3, -4];

		var res = ArrayHelperService.convertToAbsValues(mockArr);
		expect(res.length).toEqual(8);
		expect(res[0]).toEqual(3);
		expect(res[7]).toEqual(4);

	}));

	/**
	 *
	 */
	it('should multiply each element of array with value', angular.mock.inject(function (ArrayHelperService) {
		var mockArr = [3, 2, 1, 1, -1, -2, -3, -4];

		var res = ArrayHelperService.multiplyEachElement(mockArr, 2);
		expect(res.length).toEqual(8);
		expect(res[0]).toEqual(6);
		expect(res[7]).toEqual(-8);

	}));

	/**
	 *
	 */
	it('should do calculate correct interpolation', angular.mock.inject(function (ArrayHelperService, MathHelperService) {
		var res = ArrayHelperService.interp2points(1, 1, 2, 2, 1.5);
		expect(res).toEqual(1.5);
		var res = ArrayHelperService.interp2points(14, 4, 15, 5, 14.2);
		expect(MathHelperService.roundToNdigitsAfterDecPoint(res, 1)).toEqual(4.2);
		var res = ArrayHelperService.interp2points(-42, 3, 125, 41, 0);
		expect(res).toEqual(12.55688622754491);

	}));

	/**
	 *
	 */
	it('should flatten array of arrays', angular.mock.inject(function (ArrayHelperService) {

		var arrOfArrs = [
			[1],
			[2],
			[3],
			[4],
			[5, 6]
		];
		expect(typeof arrOfArrs[0]).toEqual('object');
		var flatArr = ArrayHelperService.flattenArrayOfArray(arrOfArrs);
		expect(typeof flatArr[0]).toEqual('number');

	}));

});