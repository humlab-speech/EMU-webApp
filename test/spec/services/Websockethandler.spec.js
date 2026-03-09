'use strict';

describe('Service: Websockethandler', function () {

  // load the service's module
  var mockLocation;
  beforeEach(module('emuwebApp', function ($provide) {
    mockLocation = {
      protocol: function () {
        return 'http';
      }
    };

    $provide.value('$location', mockLocation);
    $provide.value('HistoryService', {});
    $provide.value('SsffParserService', {});
    $provide.value('ConfigProviderService', {
      vals: {
        main: {
          serverTimeoutInterval: 1000
        }
      }
    });
    $provide.value('ViewStateService', {});
    $provide.value('WavParserService', {});
    $provide.value('SoundHandlerService', {});
    $provide.value('EspsParserService', {});
    $provide.value('UuidService', {
      new: function () {
        return 'test-callback-id';
      }
    });
    $provide.value('BinaryDataManipHelperService', {});
    $provide.value('SsffDataService', {});
    $provide.value('ModalService', {
      open: angular.noop
    });
  }));

  // instantiate service
  var Websockethandler;
  var $location;
  var $rootScope;
  var originalWebSocket;
  beforeEach(inject(function (_WebSocketHandlerService_, _$rootScope_) {
    Websockethandler = _WebSocketHandlerService_;
    $location = mockLocation;
    $rootScope = _$rootScope_;
    originalWebSocket = window.WebSocket;
  }));

  afterEach(function () {
    window.WebSocket = originalWebSocket;
  });

  it('should check if isConnected', function () {
    var res = Websockethandler.isConnected();
    expect(res).toBe(false);
  });
  
  it('should initConnect', function () {
    Websockethandler.initConnect('ws://localhost');
    expect(Websockethandler.isConnected()).toBe(false);
  });

  it('should normalize http URLs before connecting', function () {
    var usedUrl;
    spyOn($location, 'protocol').and.returnValue('http');
    window.WebSocket = jasmine.createSpy('WebSocket').and.callFake(function (url) {
      usedUrl = url;
      return {
        send: angular.noop,
        close: angular.noop
      };
    });

    Websockethandler.initConnect('  http://localhost:17890  ');

    expect(usedUrl).toBe('ws://localhost:17890');
  });

  it('should reject insecure websocket URLs on https pages', function () {
    var errorMessage;
    spyOn($location, 'protocol').and.returnValue('https');

    Websockethandler.initConnect('ws://localhost:17890').then(angular.noop, function (message) {
      errorMessage = message;
    });
    $rootScope.$digest();

    expect(errorMessage).toBe('Refusing to open an insecure ws:// connection from an https page. Please use wss:// instead.');
  });

  it('should reject malformed websocket URLs', function () {
    var errorMessage;
    spyOn($location, 'protocol').and.returnValue('http');

    Websockethandler.initConnect('localhost:17890').then(angular.noop, function (message) {
      errorMessage = message;
    });
    $rootScope.$digest();

    expect(errorMessage).toBe('A malformed websocket URL that does not start with ws:// or wss:// was provided.');
  });
  
  //todo 

});
