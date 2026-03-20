# Media Streaming Implementation Guide

## Overview

Enable handling of large audio files (>200MB) by implementing HTTP Range request support. This prevents out-of-memory (OOM) errors when loading large speech databases.

**Status**: Implementation in progress
**Impact**: Enables 10x larger files without OOM risk
**Effort**: ~2 days total work
**Risk Level**: Medium (affects critical audio loading path)

---

## Server-Side Fix (CRITICAL)

### The Bug

**File**: `exampleServers/nodeEmuProtocolWsServer.js` (lines 129-131)

When a client requests a byte range via HTTP Range header, the server:
1. ✅ Correctly parses the range request (lines 105-116)
2. ✅ Correctly sets HTTP 206 response headers (lines 117-127)
3. ✅ Allocates a buffer for the range (line 129)
4. ❌ **BUG**: Sends the ENTIRE file instead of the requested bytes (line 131)

```javascript
// WRONG - sends full file
const buf = Buffer.alloc(chunksize);
response.end(fs.readFileSync(filePath));  // ← reads ENTIRE file!
```

### The Fix

Use `fs.readSync()` to read only the requested byte range:

```javascript
// CORRECT - sends only requested range
const buf = Buffer.alloc(chunksize);
const fd = fs.openSync(filePath, 'r');
fs.readSync(fd, buf, 0, chunksize, start);
fs.closeSync(fd);
response.end(buf);  // ← sends only the requested bytes
```

**What this does**:
1. `fs.openSync(filePath, 'r')` — Open file for reading, get file descriptor
2. `fs.readSync(fd, buf, 0, chunksize, start)` — Read exactly `chunksize` bytes into `buf`, starting at byte offset `start` in the file
3. `fs.closeSync(fd)` — Close the file descriptor
4. `response.end(buf)` — Send only the buffer contents (the requested range)

**Result**: HTTP Range requests now work correctly:
- Client requests bytes 0-999999 → Server sends 1MB
- Client requests bytes 1000000-1999999 → Server sends next 1MB
- No OOM from loading entire file

### Implementation Details

The fix is minimal and safe:
- No changes to HTTP headers (already correct)
- No changes to response status code (206 Partial Content is correct)
- No changes to CORS handling
- No external dependencies (using Node.js built-in `fs` module)
- Synchronous I/O (matching existing code style)

### Testing the Fix

1. Start example server: `cd exampleServers && node nodeEmuProtocolWsServer.js`
2. Test Range request manually:
   ```bash
   # Request first 1MB of a WAV file
   curl -r 0-1048575 http://localhost:8080/demoDB/audio.wav \
     -H "Range: bytes=0-1048575" -v

   # Should see HTTP 206 response with Content-Range header
   # < HTTP/1.1 206 Partial Content
   # < Content-Range: bytes 0-1048575/10485760
   ```

3. Verify client-side can decode the range:
   ```javascript
   // WavRangeReq worker should be able to decode this
   wavRangeReq.getRange(0, 1000000);  // Request first 1M samples
   ```

---

## Client-Side Implementation

### Architecture

```
Audio Loading Pipeline (with Range Request Support)
┌─────────────────────────────────────────────────┐
│ User loads bundle via io-handler.service         │
│ (mediumum)                               │
└────────────┬────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────┐
│ Check config: streamingEnabled = true?          │
│ If false, use legacy full-load path             │
└────────────┬────────────────────────────────────┘
             │
        YES  ▼
┌─────────────────────────────────────────────────┐
│ Phase 1: Probe header (Range: bytes=0-27)      │
│ WavRangeReq.setURL(audioUrl)                    │
│ → Get sampleRate, channels, totalSamples        │
└────────────┬────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────┐
│ Phase 2: Build stub AudioBuffer                 │
│ Viewport set to full range immediately          │
│ Oscillogram shows grey placeholder bars         │
│ User can see the duration and structure         │
└────────────┬────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────┐
│ Phase 3: Load first chunk (30 seconds)          │
│ WavRangeReq.getRange(0, firstChunkEnd)         │
│ Decode into real AudioBuffer                    │
│ Oscillogram renders actual waveform (partial)   │
│ Playback enabled for first chunk                │
└────────────┬────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────┐
│ Phase 4: Background progressive loading         │
│ Load remaining chunks (30s windows) in background
│ As each chunk arrives, update oscillogram       │
│ User can play while loading continues           │
│ Annotation editing on loaded portions only      │
└────────────┬────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────┐
│ Phase 5: Complete                               │
│ Full AudioBuffer assembled                      │
│ Full oscillogram rendered                       │
│ All playback features enabled                   │
└─────────────────────────────────────────────────┘
```

### Configuration

**File**: `src/configFiles/default_articConfig.json`

Add feature flag:
```json
{
  "main": {
    "streamingEnabled": false,  // Set to true to enable streaming
    "streamingChunkSizeSeconds": 30,
    "streamingChunkSizeBytes": 1048576  // 1MB max per Range request
  }
}
```

**File**: `src/configFiles/default_articConfigSchema.json`

Add schema validation:
```json
{
  "properties": {
    "main": {
      "properties": {
        "streamingEnabled": {
          "type": "boolean",
          "description": "Enable progressive loading of audio via HTTP Range requests"
        },
        "streamingChunkSizeSeconds": {
          "type": "number",
          "minimum": 5,
          "maximum": 120,
          "description": "Duration of each chunk in seconds"
        },
        "streamingChunkSizeBytes": {
          "type": "number",
          "description": "Maximum bytes per Range request"
        }
      }
    }
  }
}
```

### Implementation Steps

#### Step 1: Wire streaming flag into config provider
**File**: `src/app/services/config-provider.service.ts`

The flag is already accessible via:
```typescript
this.ConfigProviderService.vals.main.streamingEnabled
```

#### Step 2: Create streaming audio service
**File**: `src/app/services/streaming-audio.service.ts` (new)

```typescript
class StreamingAudioService {
  private wavRangeReq: any;
  private loadingProgress: number = 0;
  private chunkCache: Map<number, Float32Array> = new Map();

  constructor(private ViewStateService, private DrawHelperService) {
    this.wavRangeReq = null;
  }

  /**
   * Initialize Range request and get file metadata
   */
  async initializeStreaming(audioUrl: string) {
    this.wavRangeReq = new WavRangeReq();
    await this.wavRangeReq.setURL(audioUrl);
    return this.wavRangeReq.getWavFileInfo();
  }

  /**
   * Load a chunk of audio data
   */
  async loadChunk(startSampleIdx: number, endSampleIdx: number) {
    const wavRange = await this.wavRangeReq.getRange(startSampleIdx, endSampleIdx);
    // wavRange is { buffer, sampleRate, numberOfChannels, length }
    // Decode and return AudioBuffer
    return this.decodeWavRange(wavRange);
  }

  /**
   * Progressively load all chunks in background
   */
  async loadAllChunksProgressive(chunkDurationSecs: number, onProgress?: (percent: number) => void) {
    const info = await this.wavRangeReq.getWavFileInfo();
    const chunkSamples = info.sampleRate * chunkDurationSecs;
    const totalChunks = Math.ceil(info.totalSamples / chunkSamples);

    for (let i = 0; i < totalChunks; i++) {
      const startSample = i * chunkSamples;
      const endSample = Math.min((i + 1) * chunkSamples, info.totalSamples);

      await this.loadChunk(startSample, endSample);

      if (onProgress) {
        onProgress((i + 1) / totalChunks * 100);
      }
    }
  }

  private decodeWavRange(wavRange: any): AudioBuffer {
    // Use WavParserService to decode WAV-wrapped data
    // Return AudioBuffer for the chunk
  }
}
```

#### Step 3: Modify db-obj-load-save.service.ts
**File**: `src/app/services/db-obj-load-save.service.ts`

Modify `innerLoadBundle()` to use streaming when enabled:

```typescript
private innerLoadBundle(bndl, bundleData, arrBuff, defer) {
  const streamingEnabled = this.ConfigProviderService.vals.main.streamingEnabled;

  if (streamingEnabled && bundleData.mediaFile.encoding === 'GETURL') {
    this.loadBundleWithStreaming(bndl, bundleData, defer);
  } else {
    this.loadBundleTraditional(bndl, bundleData, arrBuff, defer);
  }
}

private async loadBundleWithStreaming(bndl, bundleData, defer) {
  try {
    // 1. Initialize streaming and get file info
    const fileInfo = await this.StreamingAudioService.initializeStreaming(bundleData.mediaFile.data);

    // 2. Create stub buffer (zeros, correct size)
    const stubBuffer = this.createStubAudioBuffer(fileInfo);
    this.SoundHandlerService.audioBuffer = stubBuffer;
    this.ViewStateService.curViewPort.sS = 0;
    this.ViewStateService.curViewPort.eS = fileInfo.totalSamples;

    // 3. Load first chunk (30 seconds)
    const firstChunkEnd = Math.min(
      fileInfo.sampleRate * 30,
      fileInfo.totalSamples
    );
    const firstChunk = await this.StreamingAudioService.loadChunk(0, firstChunkEnd);
    this.SoundHandlerService.audioBuffer = firstChunk;
    this.DrawHelperService.calculateOsciPeaks();

    // 4. Load remaining chunks in background
    this.StreamingAudioService.loadAllChunksProgressive(30, (progress) => {
      console.log(`Audio loading: ${progress.toFixed(0)}%`);
      // Update UI progress bar if desired
    }).then(() => {
      // Complete
      defer.resolve();
    });

  } catch (err) {
    this.ModalService.open('views/error.html', 'Error streaming audio: ' + err.message);
    defer.reject(err);
  }
}

private createStubAudioBuffer(fileInfo: WavFileInfos): AudioBufferLike {
  // Create AudioBuffer-like object with correct metadata
  return {
    sampleRate: fileInfo.sampleRate,
    length: fileInfo.totalSamples,
    numberOfChannels: fileInfo.numberOfChannels,
    getChannelData: (channel: number) => {
      return new Float32Array(fileInfo.totalSamples); // zeros
    }
  };
}
```

#### Step 4: Update oscillogram to show placeholder
**File**: `src/app/services/draw-helper.service.ts`

In `drawOscillogram()`, detect stub buffer and render placeholder:

```typescript
private drawOscillogram() {
  const isStubBuffer = this.isStubAudioBuffer();

  if (isStubBuffer) {
    this.drawOscilloPlaceholder();
    return;
  }

  // Normal oscillogram rendering...
}

private isStubAudioBuffer(): boolean {
  // Stub buffer is all zeros and audioBuffer.getChannelData() returns zeros
  const firstChannel = this.SoundHandlerService.audioBuffer.getChannelData(0);
  return firstChannel.every(sample => sample === 0);
}

private drawOscilloPlaceholder() {
  // Draw grey bars indicating waveform will load
  const canvas = this.canvasElement;
  const ctx = canvas.getContext('2d');
  const barWidth = 4;
  const gapWidth = 2;
  const barColor = '#666';

  for (let x = 0; x < canvas.width; x += barWidth + gapWidth) {
    ctx.fillStyle = barColor;
    ctx.fillRect(x, canvas.height / 2 - 10, barWidth, 20);
  }
}
```

#### Step 5: Progressive oscillogram updates
When chunks load in background:

```typescript
onChunkLoaded(chunkStartSample: number, chunkBuffer: AudioBuffer) {
  // Update oscillogram with new chunk data
  // Calculate peaks for chunk
  const peaks = this.calculatePeaksForChunk(chunkStartSample, chunkBuffer);

  // Update peak cache
  this.osciPeaks.channelOsciPeaks[channel].maxPeaks = mergeWithExisting(peaks.max);
  this.osciPeaks.channelOsciPeaks[channel].minPeaks = mergeWithExisting(peaks.min);

  // Trigger redraw
  this.redrawOscillogram();
}
```

### Testing Checklist

- [ ] Server Range requests return correct byte ranges (no OOM)
- [ ] Client can probe file header via Range request
- [ ] Stub buffer renders without oscillogram data
- [ ] First chunk loads and displays correct waveform
- [ ] Playback works on first chunk
- [ ] Background loading doesn't block UI
- [ ] Oscillogram updates as chunks arrive
- [ ] Full file eventually loads completely
- [ ] Can annotate on loaded portions only
- [ ] Feature flag disables streaming when false
- [ ] All 81 tests pass

### Performance Expectations

**Before streaming** (full load):
- 100MB file: ~15-20 seconds to load + decode
- User sees blank oscillogram, no playback until complete

**After streaming** (Range requests):
- Header probe: <100ms
- First chunk (30s): ~2-3 seconds
- User sees oscillogram + can play immediately
- Remaining chunks load in background (doesn't block UI)

### Rollback Plan

If issues arise:
1. Set `streamingEnabled: false` in config
2. Application falls back to traditional full-load
3. No data loss, all annotations preserved
4. Can investigate and retry later

### Files Modified/Created

```
Server:
  exampleServers/nodeEmuProtocolWsServer.js    [FIXED] Range response bug

Config:
  src/configFiles/default_articConfig.json     [NEW] streaming flags
  src/configFiles/default_articConfigSchema.json [NEW] schema validation

Services:
  src/app/services/streaming-audio.service.ts   [NEW] Streaming orchestration
  src/app/services/db-obj-load-save.service.ts  [MODIFIED] Routing logic
  src/app/services/draw-helper.service.ts       [MODIFIED] Placeholder rendering

Docs:
  STREAMING_IMPLEMENTATION.md                    [NEW] This file
```

---

## Security Considerations

### SSRF Protection
Range requests still use URL validation:
```typescript
if (!ConfigProviderService.validateGetUrl(audioUrl)) {
  throw new Error('Invalid URL protocol');
}
```

### CSP Headers
No changes needed — still uses `AudioContext.decodeAudioData()`, no blob URLs or `<audio>` elements.

### Large File Risks
- Max chunk size configurable (prevents memory spike)
- Progressive loading prevents OOM
- Annotation editing disabled on unloaded portions

---

## References

- [RFC 7233: HTTP Range Requests](https://tools.ietf.org/html/rfc7233)
- [WavRangeReq Worker](./src/app/workers/wavrangereq.worker.ts)
- [Web Audio API decodeAudioData](https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/decodeAudioData)

