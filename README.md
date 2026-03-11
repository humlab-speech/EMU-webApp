# grazer

Fork of [EMU-webApp](https://github.com/IPS-LMU/EMU-webApp) by Humlab, Umeå University.

## Introduction

grazer is an online and offline web application for labeling, visualizing and correcting speech and derived speech data.

## Quick start

Visit the demo and click the `open demo DB` button in the top menu to load one of the three small example databases.

## Development

* install [nodejs and npm](http://nodejs.org/)
* clone this repo with `git clone https://github.com/humlab-speech/grazer.git`
* `cd grazer && npm install`
* `npm start` — dev server at `http://localhost:9000`
* example WebSocket server: `cd exampleServers && node nodeEmuProtocolWsServer.js`
* auto-connecting dev: `http://localhost:9000/?autoConnect=true`
* GET-param dev (no WebSocket): `http://localhost:9000/?audioGetUrl=http:%2F%2Flocalhost:9000%2FdemoDBs%2Fae%2Fmsajc003.wav&labelGetUrl=http:%2F%2Flocalhost:9000%2FdemoDBs%2Fae%2Fmsajc003_annot.json&labelType=annotJSON`

## Supported audio formats

The app decodes audio natively in the browser. WAV files use the original header-based pipeline; other formats fall back to `AudioContext.decodeAudioData()`.

| Format | Chrome | Firefox | Safari | Edge |
|--------|--------|---------|--------|------|
| WAV (PCM/float) | Y | Y | Y | Y |
| MP3 | Y | Y | Y | Y |
| FLAC | Y | Y | Y | Y |
| AAC (MP4/M4A) | Y | Y | Y | Y |
| OGG Vorbis | Y | Y | N | Y |
| OGG Opus | Y | Y | Y* | Y |

*Safari 16.4+. Note: MP3 decoding may add small silence padding (~50ms) due to encoder delay — this is a browser limitation.

## Tests
* `npm test` — unit tests (currently not working)
* `npm e2e` — end-to-end tests (currently not working)

## Original authors

**Raphael Winkelmann** · [github](http://github.com/raphywink)
**Georg Raess** · [github](http://github.com/georgraess)
**Markus Jochim** · [github](http://github.com/MJochim)

[Institute of Phonetics and Speech Processing](http://www.en.phonetik.uni-muenchen.de/), LMU Munich
