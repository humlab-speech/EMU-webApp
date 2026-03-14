import { IAnnotJSON } from './annot-json.interface';

export interface IBundleMediaFile {
	encoding: 'BASE64' | 'GETURL' | 'ARRAYBUFFER';
	data: string | ArrayBuffer;
}

export interface IBundleSsffFile {
	encoding: 'BASE64' | 'GETURL' | 'ARRAYBUFFER';
	data: string | ArrayBuffer | Promise<any>;
	fileExtension: string;
}

export interface IBundle {
	mediaFile: IBundleMediaFile;
	annotation: IAnnotJSON;
	ssffFiles: IBundleSsffFile[];
	session?: string;
	finishedEditing?: boolean;
	comment?: string;
}
