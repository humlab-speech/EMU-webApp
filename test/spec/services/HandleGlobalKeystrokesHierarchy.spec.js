'use strict';

describe('Service: HandleGlobalKeyStrokes — Hierarchy Editor Paths', function () {

    var scope, HandleGlobalKeyStrokes, ViewStateService, LevelService, LinkService, HistoryService, ModalService, ConfigProviderService;

    beforeEach(angular.mock.module('grazer'));

    beforeEach(angular.mock.inject(function (_$rootScope_, _HandleGlobalKeyStrokes_, _ViewStateService_, _LevelService_, _LinkService_, _HistoryService_, _ModalService_, _ConfigProviderService_) {
        scope = _$rootScope_;
        HandleGlobalKeyStrokes = _HandleGlobalKeyStrokes_;
        ViewStateService = _ViewStateService_;
        LevelService = _LevelService_;
        LinkService = _LinkService_;
        HistoryService = _HistoryService_;
        ModalService = _ModalService_;
        ConfigProviderService = _ConfigProviderService_;

        // Set up minimal curDbConfig for tests
        if (!ConfigProviderService.curDbConfig) {
            ConfigProviderService.curDbConfig = {};
        }
        if (!ConfigProviderService.curDbConfig.levelDefinitions) {
            ConfigProviderService.curDbConfig.levelDefinitions = [];
        }
    }));

    // ================================================================
    // commitHierarchyEdit — label rename and undo
    // ================================================================

    describe('commitHierarchyEdit', function () {

        it('method exists', function () {
            expect(typeof HandleGlobalKeyStrokes.commitHierarchyEdit).toBe('function');
        });

    });

    // ================================================================
    // handleHierarchyNavKeys — escape key behavior
    // ================================================================

    describe('handleHierarchyNavKeys', function () {

        it('method exists', function () {
            expect(typeof HandleGlobalKeyStrokes.handleHierarchyNavKeys).toBe('function');
        });

    });

    // ================================================================
    // deleteHierarchyLink — link removal
    // ================================================================

    describe('deleteHierarchyLink', function () {

        it('method exists', function () {
            expect(typeof HandleGlobalKeyStrokes.deleteHierarchyLink).toBe('function');
        });

    });

    // ================================================================
    // navigateLevelUp — hierarchy level navigation
    // ================================================================

    describe('navigateLevelUp', function () {

        it('method exists and doesn\'t crash', function () {
            expect(typeof HandleGlobalKeyStrokes.navigateLevelUp).toBe('function');

            expect(function () {
                HandleGlobalKeyStrokes.navigateLevelUp();
            }).not.toThrow();
        });

        it('processes navigation at index 0', function () {
            ViewStateService.curHierarchyLevelIdx = 0;

            expect(function () {
                HandleGlobalKeyStrokes.navigateLevelUp();
            }).not.toThrow();
        });

        it('processes navigation at higher index', function () {
            ViewStateService.curHierarchyLevelIdx = 2;

            expect(function () {
                HandleGlobalKeyStrokes.navigateLevelUp();
            }).not.toThrow();
        });

    });

});
