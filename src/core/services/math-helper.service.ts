export class MathHelperService {

	constructor() {}

	public calcClosestPowerOf2Gt(num) {
		var curExp = 0;
		while (Math.pow(2, curExp) < num) {
			curExp = curExp + 1;
		}
		return (Math.pow(2, curExp));
	}

	public roundToNdigitsAfterDecPoint(x, n) {
		if (n < 1 || n > 14) {
			console.error('error in call of round function!!');
		}
		var e = Math.pow(10, n);
		var k = (Math.round(x * e) / e).toString();
		if (k.indexOf('.') === -1) {
			k += '.';
		}
		k += e.toString().substring(1);
		return parseFloat(k.substring(0, k.indexOf('.') + n + 1));
	}
}

export const mathHelperService = new MathHelperService();
