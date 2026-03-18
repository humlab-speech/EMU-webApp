'use strict';

// jQuery must be on window and global (used by some tests for $.isEmptyObject etc.)
const jquery = require('jquery');
global.$ = global.jQuery = window.jQuery = window.$ = jquery;

// Install angular compatibility shim (replaces AngularJS + angular-mocks)
// This wires core service singletons and provides angular.mock.module/inject/copy
const angularCompat = require('./angular-compat');
angularCompat.install();

// Reset $provide overrides between test suites
beforeEach(function () {
  angularCompat.resetProvideOverrides();
});

// jest-circus doesn't provide spyOn as a global (unlike jest-jasmine2).
// Many Jasmine-style tests use bare spyOn(). Provide it.
global.spyOn = jest.spyOn;

// jsdom doesn't implement Canvas API — stub getContext('2d')
HTMLCanvasElement.prototype.getContext = function (type) {
  if (type === '2d') {
    return {
      canvas: this,
      fillRect: function () {},
      clearRect: function () {},
      putImageData: function () {},
      getImageData: function () { return { data: new Array(4) }; },
      createImageData: function () { return []; },
      setTransform: function () {},
      resetTransform: function () {},
      drawImage: function () {},
      save: function () {},
      fillText: function () {},
      restore: function () {},
      beginPath: function () {},
      moveTo: function () {},
      lineTo: function () {},
      closePath: function () {},
      stroke: function () {},
      translate: function () {},
      scale: function () {},
      rotate: function () {},
      arc: function () {},
      fill: function () {},
      rect: function () {},
      clip: function () {},
      measureText: function () { return { width: 0 }; },
      createLinearGradient: function () { return { addColorStop: function () {} }; },
      createRadialGradient: function () { return { addColorStop: function () {} }; },
      setLineDash: function () {},
      getLineDash: function () { return []; },
      strokeStyle: '',
      fillStyle: '',
      lineWidth: 1,
      lineCap: '',
      lineJoin: '',
      font: '',
      textAlign: '',
      textBaseline: '',
      globalAlpha: 1,
      globalCompositeOperation: 'source-over',
      shadowColor: '',
      shadowBlur: 0,
      shadowOffsetX: 0,
      shadowOffsetY: 0
    };
  }
  return null;
};

// jsdom stubs for APIs not available in jsdom
if (!window.URL.createObjectURL) {
  window.URL.createObjectURL = function () { return 'blob:mock'; };
  window.URL.revokeObjectURL = function () {};
}
if (!window.webkitURL) {
  window.webkitURL = window.URL;
}

// structuredClone polyfill for Node versions < 17
if (!global.structuredClone) {
  global.structuredClone = function(obj) {
    return JSON.parse(JSON.stringify(obj));
  };
}

// AudioContext mock for Web Audio API tests
if (!window.AudioContext) {
  window.AudioContext = function() {
    return {
      createBufferSource: function() {
        return {
          connect: function() {},
          start: function() {},
          stop: function() {},
          buffer: null
        };
      },
      createGain: function() {
        return {
          connect: function() {},
          gain: { value: 1 }
        };
      },
      destination: {},
      resume: function() { return Promise.resolve(); }
    };
  };
}
if (!window.webkitAudioContext) {
  window.webkitAudioContext = window.AudioContext;
}

// Expose Node's native fetch in jsdom (jsdom doesn't provide it).
if (typeof fetch === 'undefined') {
  const vm = require('vm');
  const realFetch = vm.runInThisContext('globalThis.fetch');
  if (typeof realFetch === 'function') {
    global.fetch = realFetch;
  }
}

// Silence noisy console methods during tests (keep warn/error visible)
jest.spyOn(console, 'info').mockImplementation(() => {});
jest.spyOn(console, 'debug').mockImplementation(() => {});
jest.spyOn(console, 'log').mockImplementation(() => {});


// Load fixture data
require('./fixtures/load-fixtures');
