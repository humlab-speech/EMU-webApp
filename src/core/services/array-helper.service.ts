export class ArrayHelperService {

	constructor() {}

	public convertToAbsValues(arr) {
		for (var i = 0; i < arr.length; i++) {
			arr[i] = Math.abs(arr[i]);
		}
		return arr;
	}

	public multiplyEachElement(arr, val) {
		for (var i = 0; i < arr.length; i++) {
			arr[i] = arr[i] * val;
		}
		return arr;
	}

	public interp2points(x0, y0, x1, y1, x) {
		return y0 + (y1 - y0) * ((x - x0) / (x1 - x0));
	}

	public findMinMax(arr, minOrMax) {
		var val, idx, i;
		if (minOrMax === 'min') {
			val = Infinity;
			for (i = 0; i < arr.length; i++) {
				if (arr[i] < val) {
					val = arr[i];
					idx = i;
				}
			}
		} else if (minOrMax === 'max') {
			val = -Infinity;
			for (i = 0; i < arr.length; i++) {
				if (arr[i] > val) {
					val = arr[i];
					idx = i;
				}
			}
		}

		return {
			'val': val,
			'idx': idx
		};
	}

	public flattenArrayOfArray(arrOfArrs) {
		var merged = [];
		merged = merged.concat.apply(merged, arrOfArrs);
		return merged;
	}

	public convertArrayToXYjsoArray(y) {
		var xyArray = [];
		for (var i = 0; i < y.length; i++) {
			xyArray.push({
				x: i,
				y: y[i]
			});
		}
		return xyArray;
	}
}

export const arrayHelperService = new ArrayHelperService();
