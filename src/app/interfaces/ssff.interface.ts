export interface ISsffColumn {
	name: string;
	ssffdatatype: 'DOUBLE' | 'FLOAT';
	length: number;
	values: number[][];
	_minVal: number;
	_maxVal: number;
}

export interface ISsffFile {
	fileExtension: string;
	sampleRate: number;
	startTime: number;
	origFreq: number;
	Columns: ISsffColumn[];
}
