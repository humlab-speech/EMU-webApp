'use strict';

/**
 * Angular DI compatibility shim for tests.
 *
 * Provides angular.mock.module(), angular.mock.inject(), angular.copy(),
 * and built-in services ($q, $rootScope, $filter, $httpBackend, etc.)
 * backed by fresh core service instances (created per test module).
 */

// --- Import CLASS constructors (NOT singletons) ---
const { ArrayHelperService } = require('../src/core/services/array-helper.service');
const { BinaryDataManipHelperService } = require('../src/core/services/binary-data-manip-helper.service');
const { BrowserDetectorService } = require('../src/core/services/browser-detector.service');
const { DataService } = require('../src/core/services/data.service');
const { DragnDropDataService } = require('../src/core/services/drag-n-drop-data.service');
const { FontScaleService } = require('../src/core/services/font-scale.service');
const { LoadedMetaDataService } = require('../src/core/services/loaded-meta-data.service');
const { MathHelperService } = require('../src/core/services/math-helper.service');
const { SoundHandlerService } = require('../src/core/services/sound-handler.service');
const { StandardFuncsService } = require('../src/core/services/standard-funcs.service');
const { UuidService } = require('../src/core/services/uuid.service');
const { SsffParserService } = require('../src/core/services/ssff-parser.service');
const { AudioResamplerService } = require('../src/core/services/audio-resampler.service');
const { ViewStateService } = require('../src/core/services/view-state.service');
const { ConfigProviderService } = require('../src/core/services/config-provider.service');
const { ModalService } = require('../src/core/services/modal.service');
const { WavParserService } = require('../src/core/services/wav-parser.service');
const { LinkService } = require('../src/core/services/link.service');
const { SsffDataService } = require('../src/core/services/ssff-data.service');
const { ValidationService } = require('../src/core/services/validation.service');
const { LevelService } = require('../src/core/services/level.service');
const { TextGridParserService } = require('../src/core/services/textgrid-parser.service');
const { PublisherService } = require('../src/core/services/publisher.service');
const { AppcacheHandlerService } = require('../src/core/services/app-cache-handler.service');
const { DrawHelperService } = require('../src/core/services/draw-helper.service');
const { EspsParserService } = require('../src/core/services/esps-parser.service');
const { HistoryService } = require('../src/core/services/history.service');
const { HierarchyLayoutService } = require('../src/core/services/hierarchy-layout.service');
const { AnagestService } = require('../src/core/services/anagest.service');
const { WebSocketHandlerService } = require('../src/core/services/websocket-handler.service');
const { HierarchyManipulationService } = require('../src/core/services/hierarchy-manipulation.service');
const { IoHandlerService } = require('../src/core/services/io-handler.service');
const { DragnDropService } = require('../src/core/services/drag-n-drop.service');
const { AppStateService } = require('../src/core/services/app-state.service');
const { DbObjLoadSaveService } = require('../src/core/services/db-obj-load-save.service');
const { HandleGlobalKeyStrokes } = require('../src/core/services/handleglobalkeystrokes.service');

// --- Current instance registry (refreshed per module()) ---
var registry = {};

function createFreshServices() {
  var r = {};

  // Tier 0: no dependencies
  r.ArrayHelperService = new ArrayHelperService();
  r.BinaryDataManipHelperService = new BinaryDataManipHelperService();
  r.BrowserDetectorService = new BrowserDetectorService();
  r.DataService = new DataService();
  r.DragnDropDataService = new DragnDropDataService();
  r.FontScaleService = new FontScaleService();
  r.LoadedMetaDataService = new LoadedMetaDataService();
  r.MathHelperService = new MathHelperService();
  r.SoundHandlerService = new SoundHandlerService();
  r.StandardFuncsService = new StandardFuncsService();
  r.UuidService = new UuidService();
  r.SsffParserService = new SsffParserService();

  // Tier 1
  r.AudioResamplerService = new AudioResamplerService();
  r.AudioResamplerService.initDeps({ BrowserDetectorService: r.BrowserDetectorService });
  r.ViewStateService = new ViewStateService();
  r.ViewStateService.initDeps({
    SoundHandlerService: r.SoundHandlerService,
    DataService: r.DataService,
    StandardFuncsService: r.StandardFuncsService,
  });

  // Tier 2
  r.ConfigProviderService = new ConfigProviderService();
  r.ConfigProviderService.initDeps({ ViewStateService: r.ViewStateService });
  r.ModalService = new ModalService();
  r.ModalService.initDeps({ ArrayHelperService: r.ArrayHelperService, ViewStateService: r.ViewStateService });
  r.WavParserService = new WavParserService();
  r.WavParserService.initDeps({ AudioResamplerService: r.AudioResamplerService, ViewStateService: r.ViewStateService });

  // Tier 3
  r.LinkService = new LinkService();
  r.LinkService.initDeps({ DataService: r.DataService, ConfigProviderService: r.ConfigProviderService });
  r.SsffDataService = new SsffDataService();
  r.SsffDataService.initDeps({ SoundHandlerService: r.SoundHandlerService, ConfigProviderService: r.ConfigProviderService });
  r.ValidationService = new ValidationService();
  r.ValidationService.initDeps({ ConfigProviderService: r.ConfigProviderService });
  if (typeof r.LoadedMetaDataService.init === 'function') {
    r.LoadedMetaDataService.init(r.ValidationService);
  }

  // Tier 4
  r.LevelService = new LevelService();
  r.LevelService.initDeps({
    DataService: r.DataService,
    LinkService: r.LinkService,
    ConfigProviderService: r.ConfigProviderService,
    SoundHandlerService: r.SoundHandlerService,
    ViewStateService: r.ViewStateService,
  });
  r.TextGridParserService = new TextGridParserService();
  r.TextGridParserService.initDeps({
    DataService: r.DataService,
    ViewStateService: r.ViewStateService,
    SoundHandlerService: r.SoundHandlerService,
  });
  r.PublisherService = new PublisherService();
  r.PublisherService.initDeps({
    SsffDataService: r.SsffDataService,
    SsffParserService: r.SsffParserService,
    BinaryDataManipHelperService: r.BinaryDataManipHelperService,
    ValidationService: r.ValidationService,
    DataService: r.DataService,
    StandardFuncsService: r.StandardFuncsService,
    LoadedMetaDataService: r.LoadedMetaDataService,
    ConfigProviderService: r.ConfigProviderService,
  });
  r.AppcacheHandlerService = new AppcacheHandlerService();
  r.AppcacheHandlerService.initDeps({ ModalService: r.ModalService });
  r.DrawHelperService = new DrawHelperService();
  r.DrawHelperService.initDeps({
    ViewStateService: r.ViewStateService,
    ConfigProviderService: r.ConfigProviderService,
    SoundHandlerService: r.SoundHandlerService,
    FontScaleService: r.FontScaleService,
    SsffDataService: r.SsffDataService,
    MathHelperService: r.MathHelperService,
  });

  // Tier 5
  r.EspsParserService = new EspsParserService();
  r.EspsParserService.initDeps({ LevelService: r.LevelService, SoundHandlerService: r.SoundHandlerService });
  r.HistoryService = new HistoryService();
  r.HistoryService.initDeps({
    SsffDataService: r.SsffDataService,
    LevelService: r.LevelService,
    LinkService: r.LinkService,
    ConfigProviderService: r.ConfigProviderService,
    ViewStateService: r.ViewStateService,
    SoundHandlerService: r.SoundHandlerService,
    LoadedMetaDataService: r.LoadedMetaDataService,
    PublisherService: r.PublisherService,
  });
  r.HierarchyLayoutService = new HierarchyLayoutService();
  r.HierarchyLayoutService.initDeps({
    ViewStateService: r.ViewStateService,
    ConfigProviderService: r.ConfigProviderService,
    LevelService: r.LevelService,
    DataService: r.DataService,
    StandardFuncsService: r.StandardFuncsService,
  });
  r.AnagestService = new AnagestService();
  r.AnagestService.initDeps({
    ViewStateService: r.ViewStateService,
    LevelService: r.LevelService,
    LinkService: r.LinkService,
    ConfigProviderService: r.ConfigProviderService,
    SsffDataService: r.SsffDataService,
    ArrayHelperService: r.ArrayHelperService,
    ModalService: r.ModalService,
    HistoryService: r.HistoryService,
    DataService: r.DataService,
  });

  // Tier 6
  r.WebSocketHandlerService = new WebSocketHandlerService();
  r.WebSocketHandlerService.initDeps({
    HistoryService: r.HistoryService,
    SsffParserService: r.SsffParserService,
    ConfigProviderService: r.ConfigProviderService,
    ViewStateService: r.ViewStateService,
    WavParserService: r.WavParserService,
    SoundHandlerService: r.SoundHandlerService,
    EspsParserService: r.EspsParserService,
    UuidService: r.UuidService,
    BinaryDataManipHelperService: r.BinaryDataManipHelperService,
    SsffDataService: r.SsffDataService,
    ModalService: r.ModalService,
  });
  r.HierarchyManipulationService = new HierarchyManipulationService();
  r.HierarchyManipulationService.initDeps({
    HierarchyLayoutService: r.HierarchyLayoutService,
    DataService: r.DataService,
    LevelService: r.LevelService,
    ConfigProviderService: r.ConfigProviderService,
  });

  // Tier 7
  r.IoHandlerService = new IoHandlerService();
  r.IoHandlerService.initDeps({
    HistoryService: r.HistoryService,
    ViewStateService: r.ViewStateService,
    SoundHandlerService: r.SoundHandlerService,
    SsffParserService: r.SsffParserService,
    WavParserService: r.WavParserService,
    TextGridParserService: r.TextGridParserService,
    ConfigProviderService: r.ConfigProviderService,
    EspsParserService: r.EspsParserService,
    SsffDataService: r.SsffDataService,
    WebSocketHandlerService: r.WebSocketHandlerService,
    DragnDropDataService: r.DragnDropDataService,
    LoadedMetaDataService: r.LoadedMetaDataService,
  });

  // Tier 8
  r.DragnDropService = new DragnDropService();
  r.DragnDropService.initDeps({
    ModalService: r.ModalService,
    DataService: r.DataService,
    ValidationService: r.ValidationService,
    ConfigProviderService: r.ConfigProviderService,
    DragnDropDataService: r.DragnDropDataService,
    IoHandlerService: r.IoHandlerService,
    ViewStateService: r.ViewStateService,
    SoundHandlerService: r.SoundHandlerService,
    BinaryDataManipHelperService: r.BinaryDataManipHelperService,
    BrowserDetectorService: r.BrowserDetectorService,
    WavParserService: r.WavParserService,
    TextGridParserService: r.TextGridParserService,
    LoadedMetaDataService: r.LoadedMetaDataService,
    LevelService: r.LevelService,
  });

  // Tier 9
  r.AppStateService = new AppStateService();
  r.AppStateService.initDeps({
    DragnDropService: r.DragnDropService,
    DragnDropDataService: r.DragnDropDataService,
    ViewStateService: r.ViewStateService,
    IoHandlerService: r.IoHandlerService,
    LoadedMetaDataService: r.LoadedMetaDataService,
    SoundHandlerService: r.SoundHandlerService,
    DataService: r.DataService,
    SsffDataService: r.SsffDataService,
    HistoryService: r.HistoryService,
  });

  // Tier 10
  r.DbObjLoadSaveService = new DbObjLoadSaveService();
  r.DbObjLoadSaveService.initDeps({
    DataService: r.DataService,
    ViewStateService: r.ViewStateService,
    HistoryService: r.HistoryService,
    LoadedMetaDataService: r.LoadedMetaDataService,
    SsffDataService: r.SsffDataService,
    IoHandlerService: r.IoHandlerService,
    BinaryDataManipHelperService: r.BinaryDataManipHelperService,
    WavParserService: r.WavParserService,
    SoundHandlerService: r.SoundHandlerService,
    SsffParserService: r.SsffParserService,
    ValidationService: r.ValidationService,
    LevelService: r.LevelService,
    ModalService: r.ModalService,
    ConfigProviderService: r.ConfigProviderService,
    AppStateService: r.AppStateService,
    StandardFuncsService: r.StandardFuncsService,
  });

  // Tier 11
  r.HandleGlobalKeystrokesService = new HandleGlobalKeyStrokes();
  r.HandleGlobalKeystrokesService.initDeps({
    ViewStateService: r.ViewStateService,
    ModalService: r.ModalService,
    HierarchyManipulationService: r.HierarchyManipulationService,
    SoundHandlerService: r.SoundHandlerService,
    ConfigProviderService: r.ConfigProviderService,
    HistoryService: r.HistoryService,
    LevelService: r.LevelService,
    DataService: r.DataService,
    LinkService: r.LinkService,
    AnagestService: r.AnagestService,
    DbObjLoadSaveService: r.DbObjLoadSaveService,
    BrowserDetectorService: r.BrowserDetectorService,
  });

  // Aliases (Angular wrappers used different names than the registry key convention)
  r.HandleGlobalKeyStrokes = r.HandleGlobalKeystrokesService;

  return r;
}

// --- Synchronous $q deferred (matches AngularJS $apply behavior) ---

function createSyncDeferred() {
  var settled = false;
  var isResolved = false;
  var settledValue;
  var thenQueue = [];

  function runThen(entry) {
    var cb = isResolved ? entry.onResolve : entry.onReject;
    if (!cb) {
      // Pass through
      if (isResolved) entry.next.resolve(settledValue);
      else entry.next.reject(settledValue);
      return;
    }
    try {
      var result = cb(settledValue);
      if (result && typeof result.then === 'function') {
        result.then(
          function(v) { entry.next.resolve(v); },
          function(e) { entry.next.reject(e); }
        );
      } else {
        entry.next.resolve(result);
      }
    } catch (e) {
      entry.next.reject(e);
    }
  }

  var promise = {
    then: function (onResolve, onReject) {
      var next = createSyncDeferred();
      var entry = { onResolve: onResolve, onReject: onReject, next: next };
      if (settled) {
        runThen(entry);
      } else {
        thenQueue.push(entry);
      }
      return next.promise;
    },
    catch: function (onReject) {
      return promise.then(null, onReject);
    },
    finally: function (onFinally) {
      return promise.then(
        function (val) { onFinally(); return val; },
        function (err) { onFinally(); throw err; }
      );
    }
  };

  return {
    promise: promise,
    resolve: function (value) {
      if (settled) return;
      settled = true; isResolved = true; settledValue = value;
      thenQueue.forEach(runThen);
      thenQueue.length = 0;
    },
    reject: function (reason) {
      if (settled) return;
      settled = true; isResolved = false; settledValue = reason;
      thenQueue.forEach(runThen);
      thenQueue.length = 0;
    }
  };
}

var $q = {
  defer: function () { return createSyncDeferred(); },
  resolve: function (value) { var d = createSyncDeferred(); d.resolve(value); return d.promise; },
  reject: function (reason) { var d = createSyncDeferred(); d.reject(reason); return d.promise; },
  when: function (value) { return $q.resolve(value); },
  all: function (promises) {
    var results = [];
    var remaining = promises.length;
    var d = createSyncDeferred();
    if (remaining === 0) { d.resolve(results); return d.promise; }
    promises.forEach(function (p, i) {
      if (p && typeof p.then === 'function') {
        p.then(function (val) {
          results[i] = val;
          if (--remaining === 0) d.resolve(results);
        }, function (err) { d.reject(err); });
      } else {
        results[i] = p;
        if (--remaining === 0) d.resolve(results);
      }
    });
    return d.promise;
  }
};

// --- $rootScope shim ---
function createScope() {
  return {
    $apply: function (fn) { if (typeof fn === 'function') fn(); },
    $new: function () { return createScope(); },
    $on: function () {}, $emit: function () {}, $broadcast: function () {},
    $watch: function () { return function () {}; },
    $digest: function () {},
  };
}
var $rootScope = createScope();

// --- $httpBackend stub ---
var noop = function () {};
var httpEntry = { respond: function () { return httpEntry; }, passThrough: noop };
var $httpBackend = {
  whenGET: function () { return httpEntry; }, whenPOST: function () { return httpEntry; },
  whenPUT: function () { return httpEntry; }, whenDELETE: function () { return httpEntry; },
  expectGET: function () { return httpEntry; }, expectPOST: function () { return httpEntry; },
  flush: noop, verifyNoOutstandingExpectation: noop, verifyNoOutstandingRequest: noop,
};

// --- $sceProvider stub ---
var $sceProvider = { enabled: function () {} };

// --- $provide shim ---
var provideOverrides = {};
var $provide = {
  value: function (name, value) { provideOverrides[name] = value; },
  factory: noop, service: noop, decorator: noop,
};

// --- $filter registry (pure function implementations) ---
function regexFilter() {
  return function (input, regex) {
    var patt = new RegExp(regex.toLowerCase());
    var out = [];
    for (var i = 0; i < input.length; i++) {
      if (patt.test(input[i].name.toLowerCase())) out.push(input[i]);
    }
    return out;
  };
}
function levelsFilterFactory() {
  return function (input) {
    if (!input) return;
    var ConfigProviderService = registry.ConfigProviderService;
    var ViewStateService = registry.ViewStateService;
    var patt1 = /SEGMENT|EVENT/;
    var out = [];
    for (var i = 0; i < input.length; i++) {
      if (patt1.test(input[i].type)) {
        var persp = ConfigProviderService.vals.perspectives &&
          ConfigProviderService.vals.perspectives[ViewStateService.curPerspectiveIdx];
        if (persp && persp.levelCanvases !== undefined) {
          if (persp.levelCanvases.order.indexOf(input[i].name) !== -1) out.push(input[i]);
        }
      }
    }
    return out;
  };
}
function startFromFilter() {
  return function (input, start) {
    start = +start;
    if (input) return input.slice(start);
  };
}
var filterMap = { regex: regexFilter, levelsFilter: levelsFilterFactory, startFrom: startFromFilter };
function $filter(name) {
  var factory = filterMap[name];
  if (!factory) throw new Error('Unknown filter: ' + name);
  return factory();
}

// --- Built-in service map ---
var builtins = {
  $q: $q, $rootScope: $rootScope, _$rootScope_: $rootScope,
  $httpBackend: $httpBackend, $sceProvider: $sceProvider,
  $filter: $filter, $provide: $provide,
  $window: (typeof window !== 'undefined' ? window : {}),
};

// --- Parameter name parser ---
function getParamNames(fn) {
  var s = fn.toString();
  var m = s.match(/^(?:async\s+)?(?:function\s*\w*)?\s*\(([^)]*)\)/) ||
          s.match(/^\(([^)]*)\)\s*=>/);
  if (!m) return [];
  return m[1].split(',').map(function (p) { return p.trim(); }).filter(Boolean);
}

// --- Resolve service by name ---
function resolveService(name) {
  // $provide overrides
  if (provideOverrides[name] !== undefined) return provideOverrides[name];
  // Built-ins
  if (builtins[name] !== undefined) return builtins[name];
  // Strip _ wrappers
  var stripped = name.replace(/^_/, '').replace(/_$/, '');
  if (builtins[stripped] !== undefined) return builtins[stripped];
  // Core services
  if (registry[name] !== undefined) return registry[name];
  if (registry[stripped] !== undefined) return registry[stripped];
  // Try adding 'Service' suffix (e.g. HandleGlobalKeyStrokes → HandleGlobalKeyStrokesService)
  if (registry[stripped + 'Service'] !== undefined) return registry[stripped + 'Service'];
  throw new Error('[angular-compat] Unknown service: ' + name);
}

// --- Apply $provide overrides to service instances ---
function applyProvideOverrides() {
  Object.keys(provideOverrides).forEach(function (key) {
    // Replace in registry
    registry[key] = provideOverrides[key];
    // Also update any service that holds this as a dependency property
    Object.keys(registry).forEach(function (svcName) {
      var svc = registry[svcName];
      if (svc && typeof svc === 'object' && key in svc && svc[key] !== provideOverrides[key]) {
        svc[key] = provideOverrides[key];
      }
    });
  });
}

// --- angular.mock.inject ---
function mockInject(fn) {
  var paramNames = getParamNames(fn);
  return function () {
    applyProvideOverrides();
    var args = paramNames.map(resolveService);
    return fn.apply(null, args);
  };
}

// --- angular.mock.module ---
function mockModule(arg) {
  if (typeof arg === 'function') {
    // module(function($provide) { ... }) — execute immediately AND return a function
    arg($provide);
    return function () { arg($provide); };
  }
  // module('artic') — create fresh services immediately
  // (handles both `beforeEach(angular.mock.module('artic'))` and
  //  `beforeEach(function() { angular.mock.module('artic'); })` patterns)
  registry = createFreshServices();
  return function () {
    registry = createFreshServices();
  };
}

// --- angular.copy ---
function angularCopy(source, destination) {
  var copy;
  try { copy = structuredClone(source); } catch (e) { copy = JSON.parse(JSON.stringify(source)); }
  if (destination) {
    if (Array.isArray(destination)) {
      destination.length = 0;
      Array.prototype.push.apply(destination, copy);
      return destination;
    }
    Object.keys(destination).forEach(function (k) { delete destination[k]; });
    Object.assign(destination, copy);
    return destination;
  }
  return copy;
}

// --- angular.forEach ---
function angularForEach(obj, iterator, context) {
  if (obj) {
    if (Array.isArray(obj)) {
      for (var i = 0; i < obj.length; i++) iterator.call(context, obj[i], i, obj);
    } else {
      var keys = Object.keys(obj);
      for (var i = 0; i < keys.length; i++) iterator.call(context, obj[keys[i]], keys[i], obj);
    }
  }
  return obj;
}

// --- Public API ---
module.exports = {
  install: function () {
    // Create initial registry
    registry = createFreshServices();

    global.angular = {
      mock: { module: mockModule, inject: mockInject },
      copy: angularCopy,
      forEach: angularForEach,
      module: function () {
        return { factory: noop, filter: noop, config: noop };
      },
    };
  },
  resetProvideOverrides: function () { provideOverrides = {}; },
};
