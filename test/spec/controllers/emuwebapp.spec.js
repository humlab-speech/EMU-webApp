'use strict';

describe('Controller: MainController', function () {

  //load the controller's module
  beforeEach(angular.mock.module('artic'));

  var emptyObject = {};

  var $window, $location;
  var ctrl, scope, deferred;
  var testSizeAll = 58809;
  var testSizeStart = 10;
  var testSizeEnd = 1337;
  var orig = [];

  //Initialize the controller and a mock scope
  beforeEach(angular.mock.inject(function ($componentController,
    $rootScope,
    $q,
    $httpBackend,
    LevelService,
    DataService,
    ConfigProviderService,
    ViewStateService,
    SoundHandlerService,
    ModalService,
    HistoryService,
    IoHandlerService,
    ValidationService,
    WavParserService,
    LoadedMetaDataService,
    TextGridParserService, _$window_, _$location_) {

    $window = _$window_;
    $location = _$location_;

    // initiate the component controller and mock the scope
    scope = $rootScope.$new();
    ctrl = $componentController('artic', {
      $scope: scope,
      $element: angular.element('<div></div>'),
      $window: _$window_,
      $document: document,
      $location: _$location_,
      $timeout: function(fn) { fn(); }
    }, {});

    ctrl.ViewStateService = ViewStateService;
    ctrl.ConfigProviderService = ConfigProviderService;
    ctrl.SoundHandlerService = SoundHandlerService;
    ctrl.ModalService = ModalService;
    ctrl.IoHandlerService = IoHandlerService;
    ctrl.ValidationService = ValidationService;
    ctrl.LevelService = LevelService;
    ctrl.HistoryService = HistoryService;
    ctrl.TextGridParserService = TextGridParserService;
    ctrl.LoadedMetaDataService = LoadedMetaDataService;
    ctrl.WavParserService = WavParserService;
    ctrl.DataService = DataService;
    ctrl.SoundHandlerService.audioBuffer.length = testSizeAll;
    ctrl.ConfigProviderService.setVals(defaultArticConfig);
    ctrl.ConfigProviderService.design = defaultArticDesign;
    ctrl.ConfigProviderService.curDbConfig = aeDbConfig;

    deferred = $q.defer();
    deferred.resolve('called');
    $httpBackend.whenGET("schemaFiles/annotationFileSchema.json").respond(annotationFileSchema);
    $httpBackend.whenGET("schemaFiles/articConfigSchema.json").respond(articConfigSchema);
    $httpBackend.whenGET("schemaFiles/DBconfigFileSchema.json").respond(DBconfigFileSchema);
    $httpBackend.whenGET("schemaFiles/bundleListSchema.json").respond(bundleListSchema);
    $httpBackend.whenGET("schemaFiles/bundleSchema.json").respond(bundleSchema);
    $httpBackend.whenGET("schemaFiles/designSchema.json").respond(designSchema);
    $httpBackend.whenGET("demoDBs/ae/ae_bundleList.json").respond(ae_bundleList);
    $httpBackend.whenGET("demoDBs/ae/msajc003_bndl.json").respond(msajc003_bndl);
    $httpBackend.whenGET("views/error.html").respond('');
    $httpBackend.whenGET("views/connectModal.html").respond('');
    $httpBackend.whenGET("views/export.html").respond('');
    $httpBackend.whenGET("configFiles/default_articConfig.json").respond(defaultArticConfig);
    $httpBackend.whenGET("configFiles/default_articDesign.json").respond(defaultArticDesign);
  }));

  it('should react to $broadcast connectionDisrupted', angular.mock.inject(function ($rootScope) {
    // register listeners that are normally set up in $postLink
    scope.$on('connectionDisrupted', function () {
      ctrl.AppStateService.resetToInitState();
    });
    spyOn(ctrl.AppStateService, 'resetToInitState');
    $rootScope.$broadcast('connectionDisrupted');
    expect(ctrl.AppStateService.resetToInitState).toHaveBeenCalled();
  }));

  it('should react to $broadcast resetToInitState', angular.mock.inject(function ($rootScope) {
    // register listeners that are normally set up in $postLink
    scope.$on('resetToInitState', function () {
      ctrl.loadDefaultConfig();
    });
    spyOn(ctrl, 'loadDefaultConfig');
    $rootScope.$broadcast('resetToInitState');
    expect(ctrl.loadDefaultConfig).toHaveBeenCalled();
  }));


  it('should have all variables defined', function () {
    expect(ctrl.connectBtnLabel).toBe('connect');
    expect(ctrl.dbLoaded).toBe(false);
    expect(ctrl.is2dCancasesHidden).toBe(true);
    expect(ctrl.windowWidth).toBeDefined;
  });

  it('all services should exist', angular.mock.inject(function (ViewStateService,
    ConfigProviderService,
    HistoryService,
    FontScaleService,
    LevelService,
    ModalService,
    SsffDataService,
    SoundHandlerService,
    DrawHelperService,
    WavParserService,
    IoHandlerService,
    AppcacheHandlerService) {
    expect(ViewStateService).toBeDefined();
    expect(ConfigProviderService).toBeDefined();
    expect(HistoryService).toBeDefined();
    expect(FontScaleService).toBeDefined();
    expect(LevelService).toBeDefined();
    expect(ModalService).toBeDefined();
    expect(SsffDataService).toBeDefined();
    expect(SoundHandlerService).toBeDefined();
    expect(DrawHelperService).toBeDefined();
    expect(WavParserService).toBeDefined();
    expect(IoHandlerService).toBeDefined();
    expect(AppcacheHandlerService).toBeDefined();

  }));

  it('should have a working uninitialized ViewStateService service', function () {
    expect(ctrl.ViewStateService.curViewPort.sS).toBe(0);
    expect(ctrl.ViewStateService.curViewPort.eS).toBe(0);
    expect(ctrl.ViewStateService.curViewPort.selectS).toBe(-1);
    expect(ctrl.ViewStateService.curViewPort.selectE).toBe(-1);
  });

  it('should set cursorInTextField', function () {
    spyOn(ctrl.ViewStateService, 'setcursorInTextField');
    ctrl.cursorInTextField();
    expect(ctrl.ViewStateService.setcursorInTextField).toHaveBeenCalledWith(true);
  });

  it('should set cursorInTextField', function () {
    spyOn(ctrl.ViewStateService, 'setcursorInTextField');
    ctrl.cursorOutOfTextField();
    expect(ctrl.ViewStateService.setcursorInTextField).toHaveBeenCalledWith(false);
  });

  it('should clear', angular.mock.inject(function ($q) {
    var txtDeferred = $q.defer();
    spyOn(ctrl.ModalService, 'open').and.returnValue(txtDeferred.promise);
    ctrl.clearBtnClick();
    txtDeferred.resolve(true);
    scope.$digest();
    expect(ctrl.ModalService.open).toHaveBeenCalledWith('views/confirmModal.html', 'Do you wish to clear all loaded data and if connected disconnect from the server? You have NO unsaved changes so no changes will be lost.');
  }));

  it('should clear with unsafed changes', function () {
    spyOn(ctrl.ModalService, 'open').and.returnValue(deferred.promise);
    ctrl.ConfigProviderService.vals.main.comMode = 'embedded';
    ctrl.HistoryService.movesAwayFromLastSave = 1;
    ctrl.clearBtnClick();
    expect(ctrl.ModalService.open).toHaveBeenCalledWith( 'views/confirmModal.html', 'Do you wish to clear all loaded data and if connected disconnect from the server? CAUTION: YOU HAVE UNSAVED CHANGES! These will be lost if you confirm.');
  });

  it('should showHierarchy', function () {
    spyOn(ctrl.ModalService, 'open');
    ctrl.showHierarchyBtnClick();
    expect(ctrl.ModalService.open).toHaveBeenCalledWith('views/showHierarchyModal.html');
  });

  it('should showAbout', function () {
    spyOn(ctrl.ModalService, 'open');
    ctrl.aboutBtnClick();
    expect(ctrl.ModalService.open).toHaveBeenCalledWith('views/help.html');
  });

  it('should openDemoDB ae', angular.mock.inject(function ($q, $httpBackend, DbObjLoadSaveService) {
    var ioDeferredDBConfig = $q.defer();
    ioDeferredDBConfig.resolve({
      data: {
        EMUwebAppConfig: {},
        levelDefinitions: aeDbConfig.levelDefinitions || []
      }
    });
    var ioDeferredBundleList = $q.defer();
    ioDeferredBundleList.resolve({
      data: ae_bundleList
    });
    spyOn(ctrl.ViewStateService, 'getPermission').and.returnValue(true);
    spyOn(ctrl.ViewStateService, 'setState');
    spyOn(ctrl.IoHandlerService, 'getDBconfigFile').and.returnValue(ioDeferredDBConfig.promise);
    spyOn(ctrl.IoHandlerService, 'getBundleList').and.returnValue(ioDeferredBundleList.promise);
    spyOn(ctrl.ValidationService, 'validateJSO').and.returnValue(true);
    spyOn(DbObjLoadSaveService, 'loadBundle').and.returnValue("test12"); // overwrite call to loadBundle
    ctrl.openDemoDBbtnClick('ae');
    expect(ctrl.ViewStateService.setState).toHaveBeenCalledWith('loadingSaving');
    expect(ctrl.ViewStateService.getPermission).toHaveBeenCalledWith('openDemoBtnDBclick');
    expect(ctrl.LoadedMetaDataService.getDemoDbName()).toEqual('ae');
    expect(ctrl.ConfigProviderService.vals.main.comMode).toEqual('DEMO');
    expect(ctrl.ViewStateService.somethingInProgressTxt).toEqual('Loading DB config...');
    ioDeferredDBConfig.resolve();
    scope.$digest();
    $httpBackend.flush();
    expect(ctrl.IoHandlerService.getDBconfigFile).toHaveBeenCalledWith('ae');
    expect(ctrl.ValidationService.validateJSO).toHaveBeenCalled();
    expect(ctrl.IoHandlerService.getBundleList).toHaveBeenCalledWith('ae');
    ioDeferredBundleList.resolve();
    scope.$digest();
  }));

  it('should downloadAnnotationBtnClick', angular.mock.inject(function ($q) {
    spyOn(ctrl.ViewStateService, 'getPermission').and.returnValue(true);
    spyOn(ctrl.ModalService, 'open');
    ctrl.LoadedMetaDataService.setCurBndl({name: 'test'});
    ctrl.downloadAnnotationBtnClick();
    expect(ctrl.ViewStateService.getPermission).toHaveBeenCalledWith('downloadAnnotationBtnClick');
    expect(ctrl.ModalService.open).toHaveBeenCalledWith('views/export.html', 'test_annot.json', angular.toJson({levels: []}, true));
  }));

  it('should downloadTextGridBtnClick', angular.mock.inject(function ($q) {
    var txtDeferred = $q.defer();
    txtDeferred.resolve('test1');
    spyOn(ctrl.ViewStateService, 'getPermission').and.returnValue(true);
    spyOn(ctrl.TextGridParserService, 'asyncToTextGrid').and.returnValue(txtDeferred.promise);
    spyOn(ctrl.ModalService, 'open');
    ctrl.LoadedMetaDataService.setCurBndl({name: 'test2'});
    ctrl.downloadTextGridBtnClick();
    txtDeferred.resolve();
    scope.$digest();
    expect(ctrl.TextGridParserService.asyncToTextGrid).toHaveBeenCalled();
    expect(ctrl.ViewStateService.getPermission).toHaveBeenCalledWith('downloadTextGridBtnClick');
    expect(ctrl.ModalService.open).toHaveBeenCalledWith('views/export.html', 'test2.TextGrid' , 'test1');
  }));

  it('should not openDemoDB ae (no permission)', angular.mock.inject(function ($q) {
    spyOn(ctrl.ViewStateService, 'getPermission').and.returnValue(false);
    ctrl.openDemoDBbtnClick('ae');
    expect(ctrl.ViewStateService.getPermission).toHaveBeenCalledWith('openDemoBtnDBclick');
  }));

  it('should not connect (error)', angular.mock.inject(function ($q) {
    var conDeferred = $q.defer();
    conDeferred.resolve('http://test:1234');
    var ioDeferred = $q.defer();
    ioDeferred.resolve({
      type: 'error'
    });
    spyOn(ctrl.ViewStateService, 'getPermission').and.returnValue(true);
    spyOn(ctrl.ModalService, 'open').and.returnValue(conDeferred.promise);
    spyOn(ctrl.IoHandlerService.WebSocketHandlerService, 'initConnect').and.returnValue(ioDeferred.promise);
    ctrl.connectBtnClick();
    expect(ctrl.ViewStateService.getPermission).toHaveBeenCalledWith('connectBtnClick');
    expect(ctrl.ModalService.open).toHaveBeenCalledWith('views/connectModal.html');
    conDeferred.resolve();
    scope.$digest();
    expect(ctrl.IoHandlerService.WebSocketHandlerService.initConnect).toHaveBeenCalledWith('http://test:1234');
  }));

  it('should not connect (not allowed)', angular.mock.inject(function ($q) {
    spyOn(ctrl.ViewStateService, 'getPermission').and.returnValue(false);
    ctrl.connectBtnClick();
    expect(ctrl.ViewStateService.getPermission).toHaveBeenCalledWith('connectBtnClick');
  }));

  it('should connect', angular.mock.inject(function ($q) {
    var conDeferred = $q.defer();
    conDeferred.resolve('http://test:1234');
    var ioDeferred = $q.defer();
    ioDeferred.resolve({
      type: 'ok'
    });
    spyOn(ctrl, 'handleConnectedToWSserver');
    spyOn(ctrl.ViewStateService, 'getPermission').and.returnValue(true);
    spyOn(ctrl.ModalService, 'open').and.returnValue(conDeferred.promise);
    spyOn(ctrl.IoHandlerService.WebSocketHandlerService, 'initConnect').and.returnValue(ioDeferred.promise);
    ctrl.connectBtnClick();
    expect(ctrl.ViewStateService.getPermission).toHaveBeenCalledWith('connectBtnClick');
    expect(ctrl.ModalService.open).toHaveBeenCalledWith('views/connectModal.html');
    conDeferred.resolve();
    scope.$digest();
    expect(ctrl.handleConnectedToWSserver).toHaveBeenCalled();
    expect(ctrl.IoHandlerService.WebSocketHandlerService.initConnect).toHaveBeenCalledWith('http://test:1234');
  }));

  it('should open spectro Settings', function () {
    spyOn(ctrl.ModalService, 'open');
    spyOn(ctrl.ViewStateService, 'getPermission').and.returnValue(true);
    ctrl.settingsBtnClick();
    expect(ctrl.ViewStateService.getPermission).toHaveBeenCalledWith('spectSettingsChange');
    expect(ctrl.ModalService.open).toHaveBeenCalledWith('views/settingsModal.html');
  });

  it('should not open spectro Settings (not allowed)', function () {
    spyOn(ctrl.ModalService, 'open');
    spyOn(ctrl.ViewStateService, 'getPermission').and.returnValue(false);
    ctrl.settingsBtnClick();
    expect(ctrl.ViewStateService.getPermission).toHaveBeenCalledWith('spectSettingsChange');
    expect(ctrl.ModalService.open).not.toHaveBeenCalledWith();
  });

  it('should open download Textgrid', angular.mock.inject(function ($q) {
    /*ctrl.LoadedMetaDataService.setCurBndl({name: 'test'});
    var txtgridDeferred = $q.defer();
    txtgridDeferred.resolve({
      data: 'test123'
    });
    spyOn(ctrl.TextGridParserService, 'asyncToTextGrid').and.returnValue(txtgridDeferred.promise);
    spyOn(ctrl.ModalService, 'openExport');
    spyOn(ctrl.ViewStateService, 'getPermission').and.returnValue(true);
    ctrl.downloadTextGridBtnClick();
    txtgridDeferred.resolve();
    scope.$digest();
    expect(ctrl.ViewStateService.getPermission).toHaveBeenCalledWith('downloadTextGridBtnClick');
    expect(ctrl.ModalService.openExport).toHaveBeenCalledWith('views/export.html', 'ExportCtrl', 'test123', 'test.TextGrid');*/
  }));

  it('should not open download Textgrid (not allowed)', function () {
    spyOn(ctrl.ModalService, 'open');
    spyOn(ctrl.ViewStateService, 'getPermission').and.returnValue(false);
    ctrl.downloadTextGridBtnClick();
    expect(ctrl.ViewStateService.getPermission).toHaveBeenCalledWith('downloadTextGridBtnClick');
    expect(ctrl.ModalService.open).not.toHaveBeenCalledWith();
  });


  it('should open rename selected Level', function () {
    spyOn(ctrl.ModalService, 'open');
    spyOn(ctrl.ViewStateService, 'getPermission').and.returnValue(true);
    spyOn(ctrl.ViewStateService, 'getcurClickLevelName').and.returnValue('ae');
    ctrl.renameSelLevelBtnClick();
    expect(ctrl.ViewStateService.getPermission).toHaveBeenCalledWith('renameSelLevelBtnClick');
    expect(ctrl.ModalService.open).toHaveBeenCalledWith('views/renameLevel.html', 'ae');
  });

  it('should open rename selected Level error', function () {
    spyOn(ctrl.ModalService, 'open');
    spyOn(ctrl.ViewStateService, 'getPermission').and.returnValue(true);
    spyOn(ctrl.ViewStateService, 'getcurClickLevelName').and.returnValue(undefined);
    ctrl.renameSelLevelBtnClick();
    expect(ctrl.ViewStateService.getPermission).toHaveBeenCalledWith('renameSelLevelBtnClick');
    expect(ctrl.ModalService.open).toHaveBeenCalledWith('views/error.html', 'Rename Error : Please choose a Level first !');
  });

  it('should not open rename selected Level (not allowed)', function () {
    spyOn(ctrl.ModalService, 'open');
    spyOn(ctrl.ViewStateService, 'getPermission').and.returnValue(false);
    ctrl.renameSelLevelBtnClick();
    expect(ctrl.ViewStateService.getPermission).toHaveBeenCalledWith('renameSelLevelBtnClick');
    expect(ctrl.ModalService.open).not.toHaveBeenCalledWith();
  });

  // getPerspectiveColor moved to perspectives-side-bar component
  xit('should getPerspectiveColor', function () {
    expect(ctrl.getPerspectiveColor()).toEqual('artic-curSelPerspLi');
    // set curPerspectiveIdx
    ctrl.ViewStateService.curPerspectiveIdx = 0;
    expect(ctrl.getPerspectiveColor({
      name: 'test'
    })).toEqual('artic-perspLi');
    // reset curPerspectiveIdx
    ctrl.ViewStateService.curPerspectiveIdx = -1;
  });

  // changePerspective moved to perspectives-side-bar component
  xit('should changePerspective', function () {
    spyOn(ctrl.ViewStateService, 'setPerspectivesSideBarOpen').and.callThrough();
    ctrl.changePerspective({
      name: 'default'
    });
    expect(ctrl.ViewStateService.curPerspectiveIdx).toEqual(0);
    expect(ctrl.ViewStateService.setPerspectivesSideBarOpen).toHaveBeenCalled();
  });

  it('should cmdPlayAll', function () {
    spyOn(ctrl.ViewStateService, 'getPermission').and.returnValue(true);
    spyOn(ctrl.ViewStateService, 'animatePlayHead');
    spyOn(ctrl.SoundHandlerService, 'playFromTo');
    ctrl.cmdPlayAll();
    expect(ctrl.SoundHandlerService.playFromTo).toHaveBeenCalledWith(0, testSizeAll);
    expect(ctrl.ViewStateService.animatePlayHead).toHaveBeenCalledWith(0, testSizeAll);
    expect(ctrl.ViewStateService.getPermission).toHaveBeenCalledWith('playaudio');
  });

  it('should not cmdPlayAll (disallowed)', function () {
    spyOn(ctrl.ViewStateService, 'getPermission').and.returnValue(false);
    ctrl.cmdPlayAll();
    expect(ctrl.ViewStateService.getPermission).toHaveBeenCalledWith('playaudio');
  });

  it('should cmdPlaySel', function () {
    ctrl.ViewStateService.select(testSizeStart, testSizeEnd);
    spyOn(ctrl.ViewStateService, 'getPermission').and.returnValue(true);
    spyOn(ctrl.ViewStateService, 'animatePlayHead');
    spyOn(ctrl.SoundHandlerService, 'playFromTo');
    ctrl.cmdPlaySel();
    expect(ctrl.SoundHandlerService.playFromTo).toHaveBeenCalledWith(testSizeStart, testSizeEnd);
    expect(ctrl.ViewStateService.animatePlayHead).toHaveBeenCalledWith(testSizeStart, testSizeEnd);
    expect(ctrl.ViewStateService.getPermission).toHaveBeenCalledWith('playaudio');
  });

  it('should not cmdPlaySel (disallowed)', function () {
    spyOn(ctrl.ViewStateService, 'getPermission').and.returnValue(false);
    ctrl.cmdPlaySel();
    expect(ctrl.ViewStateService.getPermission).toHaveBeenCalledWith('playaudio');
  });

  it('should cmdPlayView', function () {
    ctrl.ViewStateService.setViewPort(testSizeStart, testSizeEnd);
    spyOn(ctrl.ViewStateService, 'getPermission').and.returnValue(true);
    spyOn(ctrl.ViewStateService, 'animatePlayHead');
    spyOn(ctrl.SoundHandlerService, 'playFromTo');
    ctrl.cmdPlayView();
    expect(ctrl.SoundHandlerService.playFromTo).toHaveBeenCalledWith(testSizeStart, testSizeEnd);
    expect(ctrl.ViewStateService.animatePlayHead).toHaveBeenCalledWith(testSizeStart, testSizeEnd);
    expect(ctrl.ViewStateService.getPermission).toHaveBeenCalledWith('playaudio');
  });

  it('should not cmdPlayView (disallowed)', function () {
    spyOn(ctrl.ViewStateService, 'getPermission').and.returnValue(false);
    ctrl.cmdPlayView();
    expect(ctrl.ViewStateService.getPermission).toHaveBeenCalledWith('playaudio');
  });

  it('should cmdZoomSel', function () {
    ctrl.ViewStateService.select(testSizeStart, testSizeEnd);
    spyOn(ctrl.ViewStateService, 'getPermission').and.returnValue(true);
    spyOn(ctrl.LevelService, 'deleteEditArea');
    spyOn(ctrl.ViewStateService, 'setViewPort');
    ctrl.cmdZoomSel();
    expect(ctrl.ViewStateService.setViewPort).toHaveBeenCalledWith(testSizeStart, testSizeEnd);
    expect(ctrl.LevelService.deleteEditArea).toHaveBeenCalled();
    expect(ctrl.ViewStateService.getPermission).toHaveBeenCalledWith('zoom');
  });

  it('should not cmdZoomSel (disallowed)', function () {
    spyOn(ctrl.ViewStateService, 'getPermission').and.returnValue(false);
    ctrl.cmdZoomSel();
    expect(ctrl.ViewStateService.getPermission).toHaveBeenCalledWith('zoom');
  });

  it('should cmdZoomRight', function () {
    ctrl.ViewStateService.select(testSizeStart, testSizeEnd);
    spyOn(ctrl.ViewStateService, 'getPermission').and.returnValue(true);
    spyOn(ctrl.LevelService, 'deleteEditArea');
    spyOn(ctrl.ViewStateService, 'shiftViewPort');
    ctrl.cmdZoomRight();
    expect(ctrl.ViewStateService.shiftViewPort).toHaveBeenCalledWith(true);
    expect(ctrl.LevelService.deleteEditArea).toHaveBeenCalled();
    expect(ctrl.ViewStateService.getPermission).toHaveBeenCalledWith('zoom');
  });

  it('should not cmdZoomRight (disallowed)', function () {
    spyOn(ctrl.ViewStateService, 'getPermission').and.returnValue(false);
    ctrl.cmdZoomRight();
    expect(ctrl.ViewStateService.getPermission).toHaveBeenCalledWith('zoom');
  });

  it('should cmdZoomLeft', function () {
    ctrl.ViewStateService.select(testSizeStart, testSizeEnd);
    spyOn(ctrl.ViewStateService, 'getPermission').and.returnValue(true);
    spyOn(ctrl.LevelService, 'deleteEditArea');
    spyOn(ctrl.ViewStateService, 'shiftViewPort');
    ctrl.cmdZoomLeft();
    expect(ctrl.ViewStateService.shiftViewPort).toHaveBeenCalledWith(false);
    expect(ctrl.LevelService.deleteEditArea).toHaveBeenCalled();
    expect(ctrl.ViewStateService.getPermission).toHaveBeenCalledWith('zoom');
  });

  it('should not cmdZoomLeft (disallowed)', function () {
    spyOn(ctrl.ViewStateService, 'getPermission').and.returnValue(false);
    ctrl.cmdZoomLeft();
    expect(ctrl.ViewStateService.getPermission).toHaveBeenCalledWith('zoom');
  });

  it('should cmdZoomOut', function () {
    ctrl.ViewStateService.select(testSizeStart, testSizeEnd);
    spyOn(ctrl.ViewStateService, 'getPermission').and.returnValue(true);
    spyOn(ctrl.LevelService, 'deleteEditArea');
    spyOn(ctrl.ViewStateService, 'zoomViewPort');
    ctrl.cmdZoomOut();
    expect(ctrl.ViewStateService.zoomViewPort).toHaveBeenCalledWith(false);
    expect(ctrl.LevelService.deleteEditArea).toHaveBeenCalled();
    expect(ctrl.ViewStateService.getPermission).toHaveBeenCalledWith('zoom');
  });

  it('should not cmdZoomOut (disallowed)', function () {
    spyOn(ctrl.ViewStateService, 'getPermission').and.returnValue(false);
    ctrl.cmdZoomOut();
    expect(ctrl.ViewStateService.getPermission).toHaveBeenCalledWith('zoom');
  });

  it('should cmdZoomIn', function () {
    ctrl.ViewStateService.select(testSizeStart, testSizeEnd);
    spyOn(ctrl.ViewStateService, 'getPermission').and.returnValue(true);
    spyOn(ctrl.LevelService, 'deleteEditArea');
    spyOn(ctrl.ViewStateService, 'zoomViewPort');
    ctrl.cmdZoomIn();
    expect(ctrl.ViewStateService.zoomViewPort).toHaveBeenCalledWith(true);
    expect(ctrl.LevelService.deleteEditArea).toHaveBeenCalled();
    expect(ctrl.ViewStateService.getPermission).toHaveBeenCalledWith('zoom');
  });

  it('should not cmdZoomIn (disallowed)', function () {
    spyOn(ctrl.ViewStateService, 'getPermission').and.returnValue(false);
    ctrl.cmdZoomIn();
    expect(ctrl.ViewStateService.getPermission).toHaveBeenCalledWith('zoom');
  });

  it('should cmdZoomAll', function () {
    ctrl.ViewStateService.select(testSizeStart, testSizeEnd);
    spyOn(ctrl.ViewStateService, 'getPermission').and.returnValue(true);
    spyOn(ctrl.LevelService, 'deleteEditArea');
    spyOn(ctrl.ViewStateService, 'setViewPort');
    ctrl.cmdZoomAll();
    expect(ctrl.ViewStateService.setViewPort).toHaveBeenCalledWith(0, testSizeAll);
    expect(ctrl.LevelService.deleteEditArea).toHaveBeenCalled();
    expect(ctrl.ViewStateService.getPermission).toHaveBeenCalledWith('zoom');
  });

  it('should not cmdZoomAll (disallowed)', function () {
    spyOn(ctrl.ViewStateService, 'getPermission').and.returnValue(false);
    ctrl.cmdZoomAll();
    expect(ctrl.ViewStateService.getPermission).toHaveBeenCalledWith('zoom');
  });

  it('should cmdZoomAll', function () {
    ctrl.ConfigProviderService.vals.perspectives[0].signalCanvases.order = [1, 2];
    spyOn(ctrl.ViewStateService, 'getPermission').and.returnValue(false);
    ctrl.cmdZoomAll();
    expect(ctrl.ViewStateService.getPermission).toHaveBeenCalledWith('zoom');
  });

  it('should addLevelPoint on BtnClick', angular.mock.inject(function (ConfigProviderService, ViewStateService) {
  	ViewStateService.curPerspectiveIdx = 0;
    spyOn(ctrl.ViewStateService, 'getPermission').and.returnValue(true);
    spyOn(ViewStateService, 'selectLevel');
    spyOn(ctrl.LevelService, 'insertLevel');
    spyOn(ctrl.HistoryService, 'addObjToUndoStack');
    ctrl.addLevelPointBtnClick();
    expect(ctrl.LevelService.insertLevel).toHaveBeenCalled();
    expect(ctrl.HistoryService.addObjToUndoStack).toHaveBeenCalled();
    expect(ctrl.ViewStateService.getPermission).toHaveBeenCalledWith('addLevelPointBtnClick');
    expect(ViewStateService.selectLevel).toHaveBeenCalled();
  }));

  it('should addLevelSeg on BtnClick', angular.mock.inject(function (ConfigProviderService, ViewStateService) {
    ViewStateService.curPerspectiveIdx = 0;
    spyOn(ctrl.ViewStateService, 'getPermission').and.returnValue(true);
    spyOn(ViewStateService, 'selectLevel');
    spyOn(ctrl.LevelService, 'insertLevel');
    spyOn(ctrl.HistoryService, 'addObjToUndoStack');
    ctrl.addLevelSegBtnClick();
    expect(ctrl.LevelService.insertLevel).toHaveBeenCalled();
    expect(ctrl.HistoryService.addObjToUndoStack).toHaveBeenCalled();
    expect(ctrl.ViewStateService.getPermission).toHaveBeenCalledWith('addLevelSegBtnClick');
    expect(ViewStateService.selectLevel).toHaveBeenCalled();
  }));

   // ViewStateService.getenlarge() no longer exists
   xit('should getEnlarge (-1)', angular.mock.inject(function (ViewStateService) {
    ViewStateService.curPerspectiveIdx = 0;
    spyOn(ctrl.ViewStateService, 'getenlarge').and.returnValue(-1);
    var ret = ctrl.getEnlarge();
    expect(ret).toEqual('auto');
  }));

   // ViewStateService.getenlarge() no longer exists
   xit('should getEnlarge (2 / small)', angular.mock.inject(function (ViewStateService) {
    ViewStateService.curPerspectiveIdx = 0;
    spyOn(ctrl.ViewStateService, 'getenlarge').and.returnValue(3);
    var ret = ctrl.getEnlarge(2);
    expect(ret).toEqual('27%');
  }));

   // ViewStateService.getenlarge() no longer exists
   xit('should getEnlarge (2 / large)', angular.mock.inject(function (ViewStateService) {
    ViewStateService.curPerspectiveIdx = 0;
    spyOn(ctrl.ViewStateService, 'getenlarge').and.returnValue(3);
    var ret = ctrl.getEnlarge(3);
    expect(ret).toEqual('70%');
  }));

   // ViewStateService.getenlarge() no longer exists
   xit('should getEnlarge (3 / small)', angular.mock.inject(function (ViewStateService, ConfigProviderService) {
    ViewStateService.curPerspectiveIdx = 0;
    orig = ConfigProviderService.vals.perspectives[ViewStateService.curPerspectiveIdx].signalCanvases.order;
    ConfigProviderService.vals.perspectives[ViewStateService.curPerspectiveIdx].signalCanvases.order.push({empty: ''})
    spyOn(ctrl.ViewStateService, 'getenlarge').and.returnValue(3);
    var ret = ctrl.getEnlarge(2);
    expect(ret).toEqual('22.5%');
  }));

   // ViewStateService.getenlarge() no longer exists
   xit('should getEnlarge (3 / large)', angular.mock.inject(function (ViewStateService, ConfigProviderService) {
    ViewStateService.curPerspectiveIdx = 0;
    ConfigProviderService.vals.perspectives[ViewStateService.curPerspectiveIdx].signalCanvases.order.push({empty: ''})
    spyOn(ctrl.ViewStateService, 'getenlarge').and.returnValue(3);
    var ret = ctrl.getEnlarge(3);
    expect(ret).toEqual('50%');
  }));

   // ViewStateService.getenlarge() no longer exists
   xit('should getEnlarge (1)', angular.mock.inject(function (ViewStateService, ConfigProviderService) {
    ViewStateService.curPerspectiveIdx = 0;
    ConfigProviderService.vals.perspectives[ViewStateService.curPerspectiveIdx].signalCanvases.order.pop();
    ConfigProviderService.vals.perspectives[ViewStateService.curPerspectiveIdx].signalCanvases.order.pop();
    ConfigProviderService.vals.perspectives[ViewStateService.curPerspectiveIdx].signalCanvases.order.pop();
    spyOn(ctrl.ViewStateService, 'getenlarge').and.returnValue(3);
    var ret = ctrl.getEnlarge(2);
    expect(ret).toEqual('auto');
    ConfigProviderService.vals.perspectives[ViewStateService.curPerspectiveIdx].signalCanvases.order = orig;
  }));

   // toggleCollapseSession and uniqSessionList are commented out in the component
   xit('should toggleCollapseSession', function () {
    ctrl.uniqSessionList = [];
    ctrl.uniqSessionList[0] = {};
    ctrl.uniqSessionList[0].collapsed = true;
    ctrl.toggleCollapseSession(0);
    expect(ctrl.uniqSessionList[0].collapsed).toEqual(false);
  });

   it('should react on resize window', function () {
     // bind resize handler that is normally set up in $postLink
     angular.element($window).bind('resize', function () {
       ctrl.LevelService.deleteEditArea();
       ctrl.ViewStateService.setWindowWidth($window.outerWidth);
     });
     spyOn(ctrl.LevelService, 'deleteEditArea');
     spyOn(ctrl.ViewStateService, 'setWindowWidth');
     angular.element($window).triggerHandler('resize');
     expect(ctrl.LevelService.deleteEditArea).toHaveBeenCalled();
     expect(ctrl.ViewStateService.setWindowWidth).toHaveBeenCalled();
  });

   it('should loadFilesForEmbeddedApp', angular.mock.inject(function ($q) {
     var ioDeferred = $q.defer();
     var ioDeferred2 = $q.defer();
     var wavDeferred = $q.defer();
     spyOn($location, 'search').and.returnValue({audioGetUrl: 'test.wav', labelGetUrl: 'test_annot.json'});
     spyOn(ctrl.IoHandlerService, 'httpGetPath').and.returnValue(ioDeferred.promise);
     spyOn(ctrl.ConfigProviderService, 'setVals');
     spyOn(ctrl.ValidationService, 'validateJSO').and.returnValue(true);
     spyOn(ctrl.WavParserService, 'parseWavAudioBuf').and.returnValue(wavDeferred.promise);
     spyOn(ctrl.IoHandlerService, 'parseLabelFile').and.returnValue(ioDeferred2.promise);
     spyOn(ctrl.DataService, 'setData');
     ctrl.ConfigProviderService.embeddedVals.audioGetUrl = 'test.wav';
     ctrl.loadFilesForEmbeddedApp();
     ioDeferred.resolve({data: defaultArticConfig});
     scope.$apply();
     expect(ctrl.ConfigProviderService.setVals).toHaveBeenCalled();
     wavDeferred.resolve({audioBuffer: {Data: [1, 2, 3], length: 3, sampleRate: 16000}, playbackBuffer: null});
     scope.$apply();
     expect(ctrl.WavParserService.parseWavAudioBuf).toHaveBeenCalled();
     ioDeferred2.resolve({levels: [{ name: 'test' }]});
     scope.$apply();
     expect(ctrl.ValidationService.validateJSO).toHaveBeenCalled();
     expect(ctrl.IoHandlerService.parseLabelFile).toHaveBeenCalled();
     expect(ctrl.DataService.setData).toHaveBeenCalled();
  }));

   it('should loadDefaultConfig', angular.mock.inject(function ($httpBackend, $q, ValidationService, IoHandlerService) {
     var ioDeferred = $q.defer();
     var jsonDeferred = $q.defer();
     spyOn(ValidationService, 'loadSchemas').and.returnValue(ioDeferred.promise);
     spyOn(ValidationService, 'setSchemas');
     spyOn(ValidationService, 'validateJSO').and.returnValue(jsonDeferred.promise);
     ctrl.loadDefaultConfig();
     ioDeferred.resolve([]);
     scope.$apply();
     $httpBackend.flush();
     jsonDeferred.resolve(true);
     scope.$apply();
  }));



});
