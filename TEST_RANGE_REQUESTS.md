# Range Request Testing Guide

## Server Validation

### Quick Test: cURL

Start the example server:
```bash
cd exampleServers
node nodeEmuProtocolWsServer.js
# Server should be running on localhost:8080
```

In another terminal, test Range request:
```bash
# Test 1: Request first 1000 bytes
curl -v -r 0-999 http://localhost:8080/demoDBs/ae/msajc003.wav

# Expected response:
# < HTTP/1.1 206 Partial Content
# < Content-Range: bytes 0-999/[total-size]
# < Content-Length: 1000
# < Accept-Ranges: bytes

# Verify returned data is EXACTLY 1000 bytes
curl -r 0-999 http://localhost:8080/demoDBs/ae/msajc003.wav | wc -c
# Should output: 1000
```

### Test 2: Multiple ranges

```bash
# First 500 bytes
curl -r 0-499 http://localhost:8080/demoDBs/ae/msajc003.wav | wc -c
# Output: 500

# Middle chunk (bytes 1000-1999)
curl -r 1000-1999 http://localhost:8080/demoDBs/ae/msajc003.wav | wc -c
# Output: 1000

# Last chunk (from 5000 to end)
curl -r 5000- http://localhost:8080/demoDBs/ae/msajc003.wav | wc -c
# Output: [total-5000]
```

### Test 3: Verify WAV header integrity

```bash
# Get first 1000 bytes (includes WAV header)
curl -s -r 0-999 http://localhost:8080/demoDBs/ae/msajc003.wav > range_chunk.wav

# Get full file
curl -s http://localhost:8080/demoDBs/ae/msajc003.wav > full_file.wav

# Compare headers (first 44 bytes are WAV header)
hexdump -C full_file.wav | head -3
hexdump -C range_chunk.wav | head -3
# Should be identical
```

## Client-Side Validation

### JavaScript Test

```javascript
// Test WavRangeReq worker
const wavRangeReq = new WavRangeReq();

// Initialize
await wavRangeReq.setURL('http://localhost:8080/demoDBs/ae/msajc003.wav');

// Get file info
const fileInfo = await wavRangeReq.getWavFileInfo();
console.log(`File: ${fileInfo.totalSamples} samples @ ${fileInfo.sampleRate}Hz`);

// Load first 30 seconds
const thirtySecondsInSamples = fileInfo.sampleRate * 30;
const wavRange = await wavRangeReq.getRange(0, thirtySecondsInSamples);
console.log(`Loaded chunk: ${wavRange.length} samples`);

// Verify can be decoded
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
audioCtx.decodeAudioData(wavRange.buffer).then(audioBuffer => {
  console.log(`✓ Decoded successfully: ${audioBuffer.length} samples`);
}).catch(err => {
  console.error(`✗ Decode failed: ${err.message}`);
});
```

## Integration Test Flow

1. **Enable streaming in config**:
   ```json
   {
     "main": {
       "streamingEnabled": true,
       "streamingChunkSizeSeconds": 5
     }
   }
   ```

2. **Load a large file** via URL param:
   ```
   http://localhost:9000/?audioGetUrl=http://localhost:8080/demoDBs/ae/msajc003.wav&labelGetUrl=...
   ```

3. **Observe**:
   - [ ] Oscillogram loads quickly with placeholder bars
   - [ ] Browser Network tab shows multiple Range requests
   - [ ] First chunk renders in oscillogram
   - [ ] Playback enabled after first chunk
   - [ ] Remaining chunks load in background
   - [ ] Full oscillogram renders as chunks complete

## Network Inspection

Open Browser DevTools → Network tab → Filter by `.wav`

### Expected requests for streaming:

```
GET /demoDBs/ae/msajc003.wav [Range: bytes=0-27]       → 206 (header probe)
GET /demoDBs/ae/msajc003.wav [Range: bytes=0-262143]   → 206 (first chunk)
GET /demoDBs/ae/msajc003.wav [Range: bytes=262144-...]  → 206 (chunk 2)
GET /demoDBs/ae/msajc003.wav [Range: bytes=...]         → 206 (chunk 3)
...
```

Each response should be `206 Partial Content` with proper `Content-Range` headers.

## Troubleshooting

### Issue: Server returns full file instead of range

**Symptom**: cURL shows `Content-Length` = total file size

**Solution**: Verify server fix is applied
```bash
grep -n "fs.readSync" exampleServers/nodeEmuProtocolWsServer.js
# Should show line 131 with fs.readSync call
```

### Issue: Range request returns 200 instead of 206

**Cause**: Server not recognizing Range header

**Solution**: Check server logs and ensure Range header is being sent
```bash
# Verbose cURL
curl -v -r 0-999 http://localhost:8080/demoDBs/ae/msajc003.wav
# Should show "< HTTP/1.1 206 Partial Content"
```

### Issue: Decoded audio sounds wrong

**Cause**: WAV header not included in range response

**Solution**: Verify that each range response is a complete WAV file with header

The WavRangeReq worker expects WAV-wrapped data with proper headers. Each response must be a valid WAV file.

### Issue: Browser shows CORS error

**Cause**: Cross-origin Range request

**Solution**: Server already includes CORS headers
```javascript
'Access-Control-Allow-Headers': '... Range'
```

If still failing, check that:
1. `Access-Control-Allow-Origin` header is present
2. Client and server are on same origin or CORS is properly configured

## Performance Benchmarks

Target metrics after streaming is implemented:

| Scenario | Before | After |
|----------|--------|-------|
| 100MB file load time | 15-20s | 2-3s (first chunk) |
| Time to first playback | 15-20s | 2-3s |
| Memory usage | ~500MB | ~50MB (chunk size) |
| UI responsiveness | Blocked during load | Responsive |

## Verification Checklist

- [ ] Server correctly sends only requested byte range
- [ ] Response HTTP status is 206 Partial Content
- [ ] Content-Range header is correct
- [ ] Each range response is valid WAV file
- [ ] WavRangeReq worker can decode range data
- [ ] Oscillogram updates as chunks load
- [ ] No memory spikes during streaming
- [ ] All annotations preserve correctly
- [ ] Playback quality is identical to full-load version
- [ ] Feature flag properly gates streaming behavior

