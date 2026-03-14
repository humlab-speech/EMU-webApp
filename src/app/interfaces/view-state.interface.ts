/**
 * View state interfaces for canvas rendering and UI state management
 */

export interface IViewPort {
	sS: number;           // sample start
	eS: number;           // sample end
	selectS: number;      // selection start
	selectE: number;      // selection end
	movingS: number;      // moving boundary start
	movingE: number;      // moving boundary end
	dragBarActive: boolean;
	dragBarHeight: number;
	windowWidth?: number;
}

export interface ISpectroSettings {
	windowSizeInSecs: number;
	rangeFrom: number;
	rangeTo: number;
	dynamicRange: number;
	window: number;
	drawHeatMapColors: number;
	preEmphasisFilterFactor: number;
}

export interface IOsciSettings {
	curChannel: number;
}

export interface IPlayHeadAnimationInfos {
	sS: number;
	eS: number;
	curS: number | null;
	endFreezeSample: number;
	autoscroll: boolean;
}

export interface IClickItem {
	id: number;
	levelName: string;
	sampleStart?: number;
	sampleDur?: number;
	samplePoint?: number;
	labels?: Array<{ name: string; value: string }>;
}
