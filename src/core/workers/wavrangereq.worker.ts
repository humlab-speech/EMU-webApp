// Dependencies get bundled into the worker:
import { WavHeaderInfos } from '../interfaces/wav-header-infos.interface';
import { WavFileInfos } from '../interfaces/wav-file-infos.interface';
import { WavRange } from '../interfaces/wav-range.interface';
import { parseWavHeader } from '../services/wav-header-parser';

// Export as you would in a normal module:
export class WavRangeReq {
  
  private wavFileInfo: WavFileInfos; // TODO define interface
  private url: URL;

  ///////////////////////////
  // public api
  constructor() {
  }

  public async setURL(url: string) {
    // Two-step fetch to handle variable-length WAV headers:
    // 1. Fetch first 28 bytes — enough to read FmtSubchunkSize at offset 16.
    // 2. Use FmtSubchunkSize to compute where the header ends and fetch exactly that.
    // Standard PCM header = 44 bytes; extensible = 68 bytes; extra chunks may add more.
    const probeResp = await fetch(url, { method: 'GET', headers: { Range: 'bytes=0-27' } });
    const probeBuf = await probeResp.arrayBuffer();
    const fmtSubchunkSize: number = new Uint32Array(probeBuf, 16, 1)[0];
    // fmt chunk starts at 12; its data starts at 20; after it comes the data chunk (8 bytes header)
    const minHeaderBytes = 20 + fmtSubchunkSize + 8;
    const resp = await fetch(url, { method: 'GET', headers: { Range: `bytes=0-${minHeaderBytes - 1}` } });
    let buffer = await resp.arrayBuffer();
    let headerInfos = parseWavHeader(buffer);
    this.wavFileInfo = {
      url: url,
      headerInfos: headerInfos,
      firstSampleBlockIdx: 0,
      lastSampleBlockIdx: (headerInfos.dataChunkSize / headerInfos.BlockAlign) - 1
    }
  }

  public async getWavFileInfo() {
    return this.wavFileInfo;
  }

  public async getRange(startSampleBlockIdx: number, endSampleBlockIdx: number){
    if(startSampleBlockIdx < 0 || endSampleBlockIdx > this.wavFileInfo.lastSampleBlockIdx){
      throw new Error("startSample or endSample out of range");
    }

    let firstByte = this.sampleBlockIdxToByte(startSampleBlockIdx);
    let lastByte = this.sampleBlockIdxToByte(endSampleBlockIdx + 1) - 1; // - 1 to comp. for Range "read up to byte"

    // request range from server
    let resp = await fetch(this.wavFileInfo.url, { method: 'GET', headers: { Range: 'bytes=' + firstByte + '-' + lastByte } })
    
    // console.log(resp);
    let samplesBin = await resp.arrayBuffer();
    // console.log(new Int16Array(samplesBin)); // this works
    
    // copy original header
    let headerBin = new Uint8Array(this.wavFileInfo.headerInfos.origBinaryHeader);
    // reset dataChunkSize
    let curBufferView = new Uint32Array(
      headerBin.buffer,
      this.wavFileInfo.headerInfos.dataChunkSizeIdx,
      1);
    // console.log(curBufferView);
    curBufferView[0] = (endSampleBlockIdx - startSampleBlockIdx + 1) * this.wavFileInfo.headerInfos.NumChannels * (this.wavFileInfo.headerInfos.BitsPerSample / 8);
    // console.log(curBufferView[0]);
    // concatenate header with samples
    let wavFileBin = new Uint8Array(headerBin.length + curBufferView[0]);
    wavFileBin.set(headerBin, 0);
    wavFileBin.set(new Uint8Array(samplesBin), headerBin.length);
    
    let range: WavRange = {
      numberOfChannels: this.wavFileInfo.headerInfos.NumChannels,
      length: curBufferView[0] / this.wavFileInfo.headerInfos.NumChannels / (this.wavFileInfo.headerInfos.BitsPerSample / 8), 
      sampleRate: this.wavFileInfo.headerInfos.SampleRate,
      buffer: wavFileBin.buffer,
      startSampleBlockIdx: startSampleBlockIdx,
      endSampleBlockIdx: endSampleBlockIdx
    };

    return(range);

  }

  //////////////////////////
  // private api
  private sampleBlockIdxToByte(sampleBlockIdx: number){
    return(this.wavFileInfo.headerInfos.offsetToDataChunk + sampleBlockIdx * this.wavFileInfo.headerInfos.BlockAlign);
  }

}