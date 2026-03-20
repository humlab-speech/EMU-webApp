'use strict';

describe('Service: DrawHelperService', function () {

  // load the controller's module
  beforeEach(angular.mock.module('artic'));
  
  var scope;

  //Initialize the controller and a mock scope
  beforeEach(angular.mock.inject(function ($rootScope, DrawHelperService, ViewStateService, ConfigProviderService) {
    scope = $rootScope.$new();
    scope.dhs = DrawHelperService;
    scope.vs = ViewStateService;
    scope.cps = ConfigProviderService;
    scope.cps.design = defaultArticDesign;    
    scope.cps.vals = {};
    scope.cps.vals.restrictions = {};
    scope.cps.vals.colors = {};
    scope.cps.vals.font = {};
    scope.cps.vals.restrictions.drawCrossHairs = true;
    scope.cps.vals.colors.crossHairsColor = '#00f';
    scope.cps.vals.fontPxSize = 10;
    scope.cps.vals.fontType = 'Verdana';
  }));

  /**
   *
   */
  it('should drawCrossHairs (trackname undefined)', angular.mock.inject(function (ConfigProviderService, SsffDataService) {
    var canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 256;
    var ctx = canvas.getContext('2d');
    // drawCrossHairs(ctx, mouseX, mouseY, min, max, unit, trackname)
    // With undefined trackname, the else branch draws min/max values
    scope.dhs.drawCrossHairs(ctx, 512, 128, 0, 1, 'Hz', undefined);
    // Method should execute without error for undefined trackname
  }));

  /**
   *
   */
  it('should drawCrossHairs (trackname OSCI)', angular.mock.inject(function (ConfigProviderService) {
    var canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 256;
    var ctx = canvas.getContext('2d');
    scope.dhs.drawCrossHairs(ctx, 512, 128, 0, 1, 'Hz', 'OSCI');
    // Method should execute without error for OSCI trackname
  }));

  /**
   *
   */
  it('should drawCrossHairs (trackname SPEC)', angular.mock.inject(function (ConfigProviderService) {
    var canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 256;
    var ctx = canvas.getContext('2d');
    scope.dhs.drawCrossHairs(ctx, 512, 128, 0, 1, 'Hz', 'SPEC');
    // Method should execute without error for SPEC trackname
  }));

  /**
   * calculateOsciPeaks with synthetic audio data
   */
  it('should calculateOsciPeaks and produce 3 peak levels', angular.mock.inject(function (SoundHandlerService) {
    var sampleRate = 4000;
    var numSamples = 4000; // 1 second of audio
    var samples = new Float32Array(numSamples);
    // fill with a simple sine wave
    for (var i = 0; i < numSamples; i++) {
      samples[i] = Math.sin(2 * Math.PI * 440 * i / sampleRate);
    }

    SoundHandlerService.audioBuffer = {
      sampleRate: sampleRate,
      numberOfChannels: 1,
      length: numSamples,
      getChannelData: function () { return samples; }
    };

    scope.dhs.calculateOsciPeaks();

    // access the internal osciPeaks via findMinMaxPeaks or freshRedraw
    // calculateOsciPeaks stores results internally; verify via findMinMaxPeaks
    scope.vs.curViewPort = { sS: 0, eS: numSamples - 1 };
    scope.vs.osciSettings = { curChannel: 0 };
    spyOn(scope.vs, 'calcSampleTime').mockImplementation(function (s) { return s / sampleRate; });

    var result = scope.dhs.findMinMaxPeaks(0, numSamples - 1, 0);
    expect(result.maxMaxPeak).toBeGreaterThan(0);
    expect(result.minMinPeak).toBeLessThan(0);
  }));

  /**
   * calculatePeaks in sub-pixel mode (samplePerPx < 1): returns raw samples
   */
  it('should calculatePeaks returning raw samples when zoomed in (samplePerPx < 1)', angular.mock.inject(function () {
    var data = new Float32Array([0.1, -0.5, 0.8, -0.3, 0.0]);
    // canvas wider than sample count -> sub-pixel mode
    var canvas = { width: 20 };
    var sS = 0;
    var eS = 4;

    var result = scope.dhs.calculatePeaks(canvas, data, sS, eS);

    expect(result.samplePerPx).toBeLessThan(1);
    expect(result.samples.length).toBeGreaterThan(0);
    expect(result.minSample).toBeCloseTo(-0.5, 5);
    expect(result.maxSample).toBeCloseTo(0.8, 5);
  }));

  /**
   * calculatePeaks in envelope mode (samplePerPx > 1): returns min/max peaks arrays
   */
  it('should calculatePeaks returning envelope peaks when zoomed out (samplePerPx > 1)', angular.mock.inject(function () {
    // 1000 samples viewed through 100px canvas -> 10 samples per pixel
    var numSamples = 1000;
    var data = new Float32Array(numSamples);
    for (var i = 0; i < numSamples; i++) {
      data[i] = Math.sin(2 * Math.PI * i / numSamples);
    }
    var canvas = { width: 100 };
    var sS = 0;
    var eS = numSamples - 1;

    var result = scope.dhs.calculatePeaks(canvas, data, sS, eS);

    expect(result.samplePerPx).toBeGreaterThanOrEqual(1);
    expect(result.maxPeaks).toBeDefined();
    expect(result.minPeaks).toBeDefined();
    expect(result.maxPeaks.length).toBe(100);
    expect(result.minPeaks.length).toBe(100);
    expect(result.maxMaxPeak).toBeGreaterThan(0);
    expect(result.minMinPeak).toBeLessThan(0);
    // samples array should be empty in envelope mode
    expect(result.samples.length).toBe(0);
  }));

  /**
   * calculatePeaks envelope at different viewport sizes
   */
  it('should produce different peak granularity at different viewport widths', angular.mock.inject(function () {
    var numSamples = 2000;
    var data = new Float32Array(numSamples);
    for (var i = 0; i < numSamples; i++) {
      data[i] = Math.sin(2 * Math.PI * 5 * i / numSamples); // 5 cycles
    }
    var sS = 0;
    var eS = numSamples - 1;

    var resultNarrow = scope.dhs.calculatePeaks({ width: 50 }, data, sS, eS);
    var resultWide = scope.dhs.calculatePeaks({ width: 200 }, data, sS, eS);

    expect(resultNarrow.maxPeaks.length).toBe(50);
    expect(resultWide.maxPeaks.length).toBe(200);
    // wider canvas has more samples per pixel precision
    expect(resultNarrow.samplePerPx).toBeGreaterThan(resultWide.samplePerPx);
  }));

  /**
   * calculateOsciPeaks with multi-channel audio
   */
  it('should calculateOsciPeaks for multi-channel audio', angular.mock.inject(function (SoundHandlerService) {
    var sampleRate = 4000;
    var numSamples = 4000;
    var ch0 = new Float32Array(numSamples);
    var ch1 = new Float32Array(numSamples);
    for (var i = 0; i < numSamples; i++) {
      ch0[i] = Math.sin(2 * Math.PI * 200 * i / sampleRate);
      ch1[i] = 0.5 * Math.cos(2 * Math.PI * 300 * i / sampleRate);
    }
    var channels = [ch0, ch1];

    SoundHandlerService.audioBuffer = {
      sampleRate: sampleRate,
      numberOfChannels: 2,
      length: numSamples,
      getChannelData: function (idx) { return channels[idx]; }
    };

    scope.dhs.calculateOsciPeaks();

    scope.vs.curViewPort = { sS: 0, eS: numSamples - 1 };
    spyOn(scope.vs, 'calcSampleTime').mockImplementation(function (s) { return s / sampleRate; });

    // check channel 0
    scope.vs.osciSettings = { curChannel: 0 };
    var res0 = scope.dhs.findMinMaxPeaks(0, numSamples - 1, 0);
    expect(res0.maxMaxPeak).toBeGreaterThan(0.9);

    // check channel 1 — amplitude is 0.5
    scope.vs.osciSettings = { curChannel: 1 };
    var res1 = scope.dhs.findMinMaxPeaks(0, numSamples - 1, 0);
    expect(res1.maxMaxPeak).toBeLessThanOrEqual(0.5 + 0.01);
    expect(res1.maxMaxPeak).toBeGreaterThan(0.4);
  }));

});
