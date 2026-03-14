import * as angular from 'angular';

import styles from '../../styles/grazer-design.scss';

class HandleGlobalKeyStrokes{

    private $rootScope;
    private $timeout;
    private ViewStateService;
    private ModalService;
    private HierarchyManipulationService;
    private SoundHandlerService;
    private ConfigProviderService;
    private HistoryService;
    private LevelService;
    private DataService;
    private LinkService;
    private AnagestService;
    private DbObjLoadSaveService;
    private BrowserDetectorService;

    constructor(
        $rootScope,
        $timeout,
        ViewStateService,
        ModalService,
        HierarchyManipulationService,
        SoundHandlerService,
        ConfigProviderService,
        HistoryService,
        LevelService,
        DataService,
        LinkService,
        AnagestService,
        DbObjLoadSaveService,
        BrowserDetectorService
        ){
            this.$rootScope = $rootScope;
            this.$timeout = $timeout;
            this.ViewStateService = ViewStateService;
            this.ModalService = ModalService;
            this.HierarchyManipulationService = HierarchyManipulationService;
            this.SoundHandlerService = SoundHandlerService;
            this.ConfigProviderService = ConfigProviderService;
            this.HistoryService = HistoryService;
            this.LevelService = LevelService;
            this.DataService = DataService;
            this.LinkService = LinkService;
            this.AnagestService = AnagestService;
            this.DbObjLoadSaveService = DbObjLoadSaveService;
            this.BrowserDetectorService = BrowserDetectorService;

    }
    /**
     * function called by emu-webapp.component that sets up keyboard bindings
     * to document
     */
    public bindGlobalKeys (){
        // Remove any previous bindings first to prevent accumulation on re-init
        $(document).off('.emuGlobalKeys');

        $(document).on('keyup.emuGlobalKeys', (e) => {
            var code = (e.keyCode ? e.keyCode : e.which);
            if (this.ViewStateService.isEditing() && !this.ViewStateService.getcursorInTextField()) {
                this.applyKeyCodeUp(code);
            }
        });

        $(document).on('keydown.emuGlobalKeys', (e) => {
            var code = (e.keyCode ? e.keyCode : e.which);
            if (code === 8 || code === 9 || code === 27 || code === 37 || code === 38 || code === 39 || code === 40 || code === 32) {
                this.applyKeyCode(code, e);
            }
        });

        $(document).on('keypress.emuGlobalKeys', (e) => {
            var code = (e.keyCode ? e.keyCode : e.which);
            this.applyKeyCode(code, e);
        });

        this.$rootScope.$on('$destroy', () => {
            $(document).off('.emuGlobalKeys');
        });
    }

    private applyKeyCodeUp (code) {
        this.$rootScope.$apply(() => {
            if (code !== this.ConfigProviderService.vals.keyMappings.esc && code !== this.ConfigProviderService.vals.keyMappings.createNewItemAtSelection) {
                var domElement = $('.' + this.LevelService.getlasteditArea()) as any;
                var str = domElement.val();
                this.ViewStateService.setSavingAllowed(true);
                var curAttrIndex = this.ViewStateService.getCurAttrIndex(this.ViewStateService.getcurClickLevelName());
                var lvlDefs = this.ConfigProviderService.getLevelDefinition(this.ViewStateService.getcurClickLevelName());
                var definitions = {} as any;
                if (lvlDefs.attributeDefinitions !== undefined && lvlDefs.attributeDefinitions.length > 0) {
                    definitions = this.ConfigProviderService.getLevelDefinition(this.ViewStateService.getcurClickLevelName()).attributeDefinitions[curAttrIndex];
                }
                if (definitions.legalLabels !== undefined && str.length > 0) {
                    if (definitions.legalLabels.indexOf(str) < 0) {
                        this.ViewStateService.setSavingAllowed(false);
                    }
                }
                if (this.ViewStateService.isSavingAllowed()) {
                    domElement.css({
                        'background-color': 'rgba(255,255,0,1)'
                    });
                } else {
                    domElement.css({
                        'background-color': 'rgba(255,0,0,1)'
                    });
                }
            }
        });
    };

    private applyKeyCode (code, e) {
        this.$rootScope.$apply(() => {
            if (this.ConfigProviderService.vals.main.catchMouseForKeyBinding) {
                if (!this.ViewStateService.mouseInEmuWebApp) {
                    return;
                }
            }
            this.ViewStateService.setlastKeyCode(code);

            if (this.ViewStateService.hierarchyState.isShown() && this.ViewStateService.hierarchyState !== undefined) {
                if (this.ViewStateService.hierarchyState.getInputFocus()) {
                    this.handleHierarchyEditKeys(code, e);
                } else {
                    this.handleHierarchyNavKeys(code, e);
                }
            } else if (this.ViewStateService.isEditing()) {
                this.handleEditingKeys(code, e);
            } else if (this.ViewStateService.getcursorInTextField() === false) {
                this.handleMainKeys(code, e);
            }
        });
    };

    // =============================================
    // Context: Hierarchy modal — text editing focus
    // =============================================

    private handleHierarchyEditKeys(code, e) {
        const km = this.ConfigProviderService.vals.keyMappings;
        const actionMap = this.createHierarchyEditActionMap();
        const action = actionMap[code];
        if (action) action();
    }

    /**
     * Action map for hierarchy edit mode key bindings
     */
    private createHierarchyEditActionMap() {
        const km = this.ConfigProviderService.vals.keyMappings;
        return {
            [km.hierarchyCommitEdit]: () => this.commitHierarchyEdit(),
            [km.hierarchyCancelEdit]: () => this.cancelHierarchyEdit()
        };
    }

    /**
     * Commit edited label in hierarchy context menu
     */
    private commitHierarchyEdit() {
        const elementID = this.ViewStateService.hierarchyState.getContextMenuID();
        const element = this.LevelService.getItemByID(elementID);
        const levelName = this.LevelService.getLevelName(elementID);
        const attrIndex = this.ViewStateService.getCurAttrIndex(levelName);
        const legalLabels = this.ConfigProviderService.getLevelDefinition(levelName).attributeDefinitions[attrIndex].legalLabels;
        const newValue = this.ViewStateService.hierarchyState.getEditValue();
        let oldValue = '';

        if (element.labels[attrIndex] !== undefined) {
            oldValue = element.labels[attrIndex].value;
        }

        if (newValue !== undefined && newValue !== oldValue) {
            if (legalLabels === undefined || (newValue.length > 0 && legalLabels.indexOf(newValue) >= 0)) {
                this.LevelService.renameLabel(levelName, elementID, attrIndex, newValue);
                this.HistoryService.addObjToUndoStack({
                    'type': 'ANNOT',
                    'action': 'RENAMELABEL',
                    'name': levelName,
                    'id': elementID,
                    'attrIndex': attrIndex,
                    'oldValue': oldValue,
                    'newValue': newValue
                });
                this.ViewStateService.hierarchyState.closeContextMenu();
            }
        } else {
            this.ViewStateService.hierarchyState.closeContextMenu();
        }
    }

    /**
     * Cancel label editing in hierarchy context menu
     */
    private cancelHierarchyEdit() {
        this.ViewStateService.hierarchyState.closeContextMenu();
    }

    // =============================================
    // Context: Hierarchy modal — navigation
    // =============================================

    private handleHierarchyNavKeys(code, e) {
        const km = this.ConfigProviderService.vals.keyMappings;
        const actionMap = this.createHierarchyNavActionMap();
        const action = actionMap[code];
        if (action) action(e);
    }

    /**
     * Action map for hierarchy navigation mode key bindings
     */
    private createHierarchyNavActionMap() {
        const km = this.ConfigProviderService.vals.keyMappings;
        return {
            [km.hierarchyDeleteLink]: (e) => { e.preventDefault(); this.deleteHierarchyLink(); },
            [km.hierarchyPlayback]: (e) => { e.preventDefault(); this.toggleHierarchyPlayback(); },
            [km.hierarchyRotate]: () => this.toggleHierarchyRotation(),
            [km.hierarchyDeleteItem]: () => this.deleteHierarchyItem(),
            [km.hierarchyAddItemBefore]: () => this.addHierarchyItemBefore(),
            [km.hierarchyAddItemAfter]: () => this.addHierarchyItemAfter(),
            [km.levelUp]: () => this.navigateLevelUp(),
            [km.levelDown]: () => this.navigateLevelDown(),
            [km.undo]: () => this.HistoryService.undo(),
            [km.redo]: () => this.HistoryService.redo(),
            [km.esc]: (e) => { if (!e.shiftKey) this.ModalService.close(); },
            [km.showHierarchy]: (e) => { if (!e.shiftKey) this.ModalService.close(); }
        };
    }

    private deleteHierarchyLink() {
        const pos = this.LinkService.deleteLink(
            this.ViewStateService.hierarchyState.selectedLinkFromID,
            this.ViewStateService.hierarchyState.selectedLinkToID
        );
        if (pos !== -1) {
            this.HistoryService.addObjToUndoStack({
                type: 'HIERARCHY',
                action: 'DELETELINK',
                fromID: this.ViewStateService.hierarchyState.selectedLinkFromID,
                toID: this.ViewStateService.hierarchyState.selectedLinkToID,
                position: pos
            });
        }
    }

    private toggleHierarchyPlayback() {
        this.ViewStateService.hierarchyState.playing += 1;
    }

    private toggleHierarchyRotation() {
        this.ViewStateService.hierarchyState.toggleRotation();
    }

    private deleteHierarchyItem() {
        const result = this.LevelService.deleteItemWithLinks(
            this.ViewStateService.hierarchyState.selectedItemID
        );
        if (result.item !== undefined) {
            this.HistoryService.addObjToUndoStack({
                type: 'HIERARCHY',
                action: 'DELETEITEM',
                item: result.item,
                levelName: result.levelName,
                position: result.position,
                deletedLinks: result.deletedLinks
            });
        }
    }

    private addHierarchyItemBefore() {
        const newID = this.LevelService.addItem(
            this.ViewStateService.hierarchyState.selectedItemID, true
        );
        if (newID !== -1) {
            this.HistoryService.addObjToUndoStack({
                type: 'HIERARCHY',
                action: 'ADDITEM',
                newID: newID,
                neighborID: this.ViewStateService.hierarchyState.selectedItemID,
                before: true
            });
        }
    }

    private addHierarchyItemAfter() {
        const newID = this.LevelService.addItem(
            this.ViewStateService.hierarchyState.selectedItemID, false
        );
        if (newID !== -1) {
            this.HistoryService.addObjToUndoStack({
                type: 'HIERARCHY',
                action: 'ADDITEM',
                newID: newID,
                neighborID: this.ViewStateService.hierarchyState.selectedItemID,
                before: false
            });
        }
    }

    private navigateLevelUp() {
        if (this.ViewStateService.hierarchyState.curPathIdx >= 1) {
            this.ViewStateService.hierarchyState.curPathIdx -= 1;
        }
    }

    private navigateLevelDown() {
        if (this.ViewStateService.hierarchyState.curPathIdx < this.ViewStateService.hierarchyState.curNrOfPaths - 1) {
            this.ViewStateService.hierarchyState.curPathIdx += 1;
        }
    }

    // =============================================
    // Context: Editing mode (label text input)
    // =============================================

    private handleEditingKeys(code, e) {
        var km = this.ConfigProviderService.vals.keyMappings;
        var domElement = $('.' + this.LevelService.getlasteditArea()) as any;

        // prevent enter if saving not allowed
        if (!this.ViewStateService.isSavingAllowed() && code === km.createNewItemAtSelection) {
            var definitions = this.ConfigProviderService.getLevelDefinition(this.ViewStateService.getcurClickLevelName()).attributeDefinitions[this.ViewStateService.getCurAttrIndex(this.ViewStateService.getcurClickLevelName())].legalLabels;
            e.preventDefault();
            e.stopPropagation();
            this.LevelService.deleteEditArea();
            this.ViewStateService.setEditing(false);
            this.ModalService.open('views/error.html', 'Editing Error: Sorry, characters allowed on this Level are "' + JSON.stringify(definitions) + '"');
        }
        // save text on enter if saving is allowed
        if (this.ViewStateService.isSavingAllowed() && code === km.createNewItemAtSelection) {
            var editingElement = this.LevelService.getItemFromLevelById(this.ViewStateService.getcurClickLevelName(), this.LevelService.getlastID());
            var attrIndex = this.ViewStateService.getCurAttrIndex(this.ViewStateService.getcurClickLevelName());
            var oldValue = '';
            var newValue = '';
            if (editingElement.labels[attrIndex] !== undefined) {
                oldValue = editingElement.labels[attrIndex].value;
            }
            if (this.ConfigProviderService.vals.restrictions.useLargeTextInputField) {
                newValue = this.ViewStateService.largeTextFieldInputFieldCurLabel;
            } else {
                newValue = domElement.val();
            }
            this.LevelService.renameLabel(this.ViewStateService.getcurClickLevelName(), this.LevelService.getlastID(), this.ViewStateService.getCurAttrIndex(this.ViewStateService.getcurClickLevelName()), newValue);
            this.HistoryService.addObjToUndoStack({
                'type': 'ANNOT',
                'action': 'RENAMELABEL',
                'name': this.ViewStateService.getcurClickLevelName(),
                'id': this.LevelService.getlastID(),
                'attrIndex': attrIndex,
                'oldValue': oldValue,
                'newValue': newValue
            });
            this.LevelService.deleteEditArea();
            this.ViewStateService.setEditing(false);
            this.ViewStateService.setcurClickItem(this.LevelService.getItemFromLevelById(this.ViewStateService.getcurClickLevelName(), this.LevelService.getlastID()));
        }
        // escape from text
        if (code === km.esc) {
            this.LevelService.deleteEditArea();
            this.ViewStateService.setEditing(false);
        }

        // playback while editing (alt+key)
        if (this.ViewStateService.getPermission('playaudio') && this.ConfigProviderService.vals.restrictions.playback && e.altKey) {
            if (code === km.playAllInView) {
                this.SoundHandlerService.playFromTo(this.ViewStateService.curViewPort.sS, this.ViewStateService.curViewPort.eS);
                this.ViewStateService.animatePlayHead(this.ViewStateService.curViewPort.sS, this.ViewStateService.curViewPort.eS);
            }
            if (code === 3) { // playSelected
                this.SoundHandlerService.playFromTo(this.ViewStateService.curViewPort.selectS, this.ViewStateService.curViewPort.selectE);
                this.ViewStateService.animatePlayHead(this.ViewStateService.curViewPort.selectS, this.ViewStateService.curViewPort.selectE);
            }
            if (code === km.playEntireFile) {
                this.SoundHandlerService.playFromTo(0, this.SoundHandlerService.audioBuffer.length);
                this.ViewStateService.animatePlayHead(0, this.SoundHandlerService.audioBuffer.length);
            }
        }
    }

    // =============================================
    // Context: Main annotation interface
    // =============================================

    private handleMainKeys(code, e) {
        var km = this.ConfigProviderService.vals.keyMappings;

        this.LevelService.deleteEditArea();

        // Escape — close modal
        if (this.ViewStateService.curState.permittedActions.length === 0 &&
            code === km.esc &&
            this.ModalService.force === false) {
            this.ModalService.close();
        }

        // Show hierarchy
        if (code === km.showHierarchy && this.ConfigProviderService.vals.activeButtons.showHierarchy) {
            if (this.ViewStateService.curState !== this.ViewStateService.states.noDBorFilesloaded) {
                if (this.ViewStateService.hierarchyState.isShown()) {
                    this.ModalService.close();
                } else {
                    this.ViewStateService.hierarchyState.toggleHierarchy();
                    this.ModalService.open('views/showHierarchyModal.html');
                }
            }
        }

        // Zoom actions
        this.dispatchZoomAction(code, km);

        // Playback actions
        this.dispatchPlaybackAction(code, km, e);

        // Save bundle
        if (code === km.saveBndl) {
            if (this.ViewStateService.getPermission('saveBndlBtnClick')) {
                this.DbObjLoadSaveService.saveBundle();
            }
        }

        // Correction tools
        this.dispatchCorrectionToolAction(code, km);

        // Level navigation
        if (code === km.levelUp) {
            if (this.ViewStateService.getPermission('labelAction')) {
                this.ViewStateService.selectLevel(false, this.ConfigProviderService.vals.perspectives[this.ViewStateService.curPerspectiveIdx].levelCanvases.order, this.LevelService);
            }
        }
        if (code === km.levelDown) {
            if (this.ViewStateService.getPermission('labelAction')) {
                this.ViewStateService.selectLevel(true, this.ConfigProviderService.vals.perspectives[this.ViewStateService.curPerspectiveIdx].levelCanvases.order, this.LevelService);
            }
        }

        // Boundary snapping
        if (code === km.snapBoundaryToNearestTopBoundary) {
            this.handleSnapBoundary(true);
        }
        if (code === km.snapBoundaryToNearestBottomBoundary) {
            this.handleSnapBoundary(false);
        }
        if (code === km.snapBoundaryToNearestZeroCrossing) {
            this.handleSnapToZeroCrossing();
        }

        // Expand/shrink segments
        this.dispatchExpandShrinkAction(code, km);

        // Toggle sidebars
        if (code === km.toggleSideBarLeft) {
            if (this.ViewStateService.getPermission('toggleSideBars')) {
                if (this.ConfigProviderService.vals.activeButtons.openMenu) {
                    this.ViewStateService.toggleBundleListSideBar(styles.animationPeriod);
                }
            }
        }
        if (code === km.toggleSideBarRight) {
            if (this.ViewStateService.getPermission('toggleSideBars')) {
                if (this.ConfigProviderService.vals.activeButtons.openMenu) {
                    this.ViewStateService.setPerspectivesSideBarOpen(!this.ViewStateService.getPerspectivesSideBarOpen());
                }
            }
        }

        // Item selection
        if (code === km.selectItemsInSelection) {
            this.handleSelectItemsInSelection();
        }
        if (code === km.selPrevItem) {
            this.handleSelPrevItem(e);
        }
        if (code === km.selNextItem) {
            this.handleSelNextItem(e);
        }
        if (code === km.selNextPrevItem) {
            this.handleSelNextPrevItem(e);
        }

        // Create new item / enter
        if (code === km.createNewItemAtSelection) {
            this.handleCreateNewItem(code, e);
        }

        // Undo/Redo
        if (code === km.undo) {
            if (this.ViewStateService.getPermission('labelAction')) {
                this.HistoryService.undo();
            }
        }
        if (code === km.redo) {
            if (this.ViewStateService.getPermission('labelAction')) {
                this.HistoryService.redo();
            }
        }

        // Perspective switching (Shift+Digit1-9)
        if (e.shiftKey && e.originalEvent && e.originalEvent.code) {
            var digitMatch = e.originalEvent.code.match(/^Digit(\d)$/);
            if (digitMatch) {
                this.ViewStateService.switchPerspective(parseInt(digitMatch[1], 10) - 1, this.ConfigProviderService.vals.perspectives);
            }
        }

        // Delete boundary/item
        if (code === km.deletePreselBoundary) {
            this.handleDeletePreselBoundary(e);
        }

        if (!e.metaKey && !e.ctrlKey) {
            e.preventDefault();
            e.stopPropagation();
        }
    }

    // =============================================
    // Dispatch helpers — group repetitive patterns
    // =============================================

    private dispatchZoomAction(code, km) {
        if (!this.ViewStateService.getPermission('zoom')) return;

        var actions = {
            [km.zoomAll]: () => this.ViewStateService.setViewPort(0, this.SoundHandlerService.audioBuffer.length),
            [km.zoomIn]: () => this.ViewStateService.zoomViewPort(true, this.LevelService),
            [km.zoomOut]: () => this.ViewStateService.zoomViewPort(false, this.LevelService),
            [km.zoomSel]: () => this.ViewStateService.setViewPort(this.ViewStateService.curViewPort.selectS, this.ViewStateService.curViewPort.selectE),
            [km.shiftViewPortLeft]: () => this.ViewStateService.shiftViewPort(false),
            [km.shiftViewPortRight]: () => this.ViewStateService.shiftViewPort(true),
        };
        if (actions[code]) {
            actions[code]();
        }
    }

    private dispatchPlaybackAction(code, km, e) {
        if (!this.ViewStateService.getPermission('playaudio')) return;
        if (!this.ConfigProviderService.vals.restrictions.playback) return;

        if (code === km.playEntireFile) {
            this.SoundHandlerService.playFromTo(0, this.SoundHandlerService.audioBuffer.length);
            this.ViewStateService.animatePlayHead(0, this.SoundHandlerService.audioBuffer.length);
        }
        if (code === km.playAllInView) {
            if (!e.shiftKey) {
                this.SoundHandlerService.playFromTo(this.ViewStateService.curViewPort.sS, this.ViewStateService.curViewPort.eS);
                this.ViewStateService.animatePlayHead(this.ViewStateService.curViewPort.sS, this.ViewStateService.curViewPort.eS);
            } else {
                this.SoundHandlerService.playFromTo(this.ViewStateService.curViewPort.sS, this.SoundHandlerService.audioBuffer.length);
                this.ViewStateService.animatePlayHead(this.ViewStateService.curViewPort.sS, this.SoundHandlerService.audioBuffer.length, true);
            }
        }
        if (code === km.playSelected) {
            this.SoundHandlerService.playFromTo(this.ViewStateService.curViewPort.selectS, this.ViewStateService.curViewPort.selectE);
            this.ViewStateService.animatePlayHead(this.ViewStateService.curViewPort.selectS, this.ViewStateService.curViewPort.selectE);
        }
    }

    private dispatchCorrectionToolAction(code, km) {
        if (!this.ViewStateService.getPermission('labelAction')) return;
        if (!this.ConfigProviderService.vals.restrictions.correctionTool) return;

        var toolMap = {
            [km.selectFirstContourCorrectionTool]: 1,
            [km.selectSecondContourCorrectionTool]: 2,
            [km.selectThirdContourCorrectionTool]: 3,
            [km.selectFourthContourCorrectionTool]: 4,
            [km.selectFifthContourCorrectionTool]: 5,
            [km.selectNoContourCorrectionTool]: undefined,
        };
        if (code in toolMap) {
            this.ViewStateService.curCorrectionToolNr = toolMap[code];
        }
    }

    private dispatchExpandShrinkAction(code, km) {
        if (!this.ViewStateService.getPermission('labelAction')) return;
        if (!this.ConfigProviderService.vals.restrictions.editItemSize) return;

        // Map: keyMapping → [rightSide, negateTime]
        var expandMap = {
            [km.expandSelSegmentsRight]: [true, false],
            [km.expandSelSegmentsLeft]: [false, false],
            [km.shrinkSelSegmentsLeft]: [true, true],
            [km.shrinkSelSegmentsRight]: [false, true],
        };

        if (expandMap[code]) {
            this.handleExpandShrinkSegment(expandMap[code][0], expandMap[code][1]);
        }
    }

    // =============================================
    // Action handlers — complex individual actions
    // =============================================

    private handleSnapBoundary(isTop) {
        if (!this.ViewStateService.getPermission('labelAction')) return;
        if (!this.ConfigProviderService.vals.restrictions.editItemSize) return;

        var mouseSeg = this.ViewStateService.getcurMouseItem();
        var levelName = this.ViewStateService.getcurMouseLevelName();
        var levelType = this.ViewStateService.getcurMouseLevelType();
        var neighbor = this.ViewStateService.getcurMouseNeighbours();
        var minDist = this.LevelService.snapBoundary(isTop, levelName, mouseSeg, neighbor, levelType);
        if (minDist === false) {
            return;
        }
        if (levelType === 'EVENT') {
            this.HistoryService.updateCurChangeObj({
                'type': 'ANNOT',
                'action': 'MOVEEVENT',
                'name': levelName,
                'id': mouseSeg.id,
                'movedBy': minDist
            });
        } else if (levelType === 'SEGMENT') {
            this.HistoryService.updateCurChangeObj({
                'type': 'ANNOT',
                'action': 'MOVEBOUNDARY',
                'name': levelName,
                'id': mouseSeg.id,
                'movedBy': minDist,
                'position': 0
            });
        }
        this.HistoryService.addCurChangeObjToUndoStack();
    }

    private handleSnapToZeroCrossing() {
        if (!this.ViewStateService.getPermission('labelAction')) return;
        if (!this.ConfigProviderService.vals.restrictions.editItemSize) return;

        var dist;
        if (this.ViewStateService.getcurMouseLevelType() === 'SEGMENT') {
            if (!this.ViewStateService.getcurMouseisLast()) {
                dist = this.LevelService.calcDistanceToNearestZeroCrossing(this.ViewStateService.getcurMouseItem().sampleStart);
            } else {
                dist = this.LevelService.calcDistanceToNearestZeroCrossing(this.ViewStateService.getcurMouseItem().sampleStart + this.ViewStateService.getcurMouseItem().sampleDur + 1);
            }
        } else {
            dist = this.LevelService.calcDistanceToNearestZeroCrossing(this.ViewStateService.getcurMouseItem().samplePoint);
        }
        if (dist !== 0) {
            var seg = this.ViewStateService.getcurMouseItem();
            var levelName = this.ViewStateService.getcurMouseLevelName();
            var levelType = this.ViewStateService.getcurMouseLevelType();
            var action;
            if (levelType == 'SEGMENT') {
                this.LevelService.moveBoundary(levelName, seg.id, dist, this.ViewStateService.getcurMouseisFirst(), this.ViewStateService.getcurMouseisLast());
                action = 'MOVEBOUNDARY';
            } else {
                this.LevelService.moveEvent(levelName, seg.id, dist);
                action = 'MOVEEVENT';
            }
            this.HistoryService.updateCurChangeObj({
                'type': 'ANNOT',
                'action': action,
                'name': levelName,
                'id': seg.id,
                'movedBy': dist,
                'isFirst': this.ViewStateService.getcurMouseisFirst(),
                'isLast': this.ViewStateService.getcurMouseisLast()
            });
            this.HistoryService.addCurChangeObjToUndoStack();
        }
    }

    private getChangeTime() {
        if (this.ConfigProviderService.vals.labelCanvasConfig.addTimeMode === 'relative') {
            return this.ConfigProviderService.vals.labelCanvasConfig.addTimeValue * (this.SoundHandlerService.audioBuffer.length / 100);
        } else if (this.ConfigProviderService.vals.labelCanvasConfig.addTimeMode === 'absolute') {
            return parseInt(this.ConfigProviderService.vals.labelCanvasConfig.addTimeValue, 10);
        } else {
            this.ModalService.open('views/error.html', 'Expand Segements Error: Error in Configuration (Value labelCanvasConfig.addTimeMode)');
            return 0;
        }
    }

    private handleExpandShrinkSegment(rightSide, negate) {
        if (this.ViewStateService.getcurClickLevelName() === undefined) {
            this.ModalService.open('views/error.html', 'Expand Segments Error: Please select a Level first');
            return;
        }
        if (this.ViewStateService.getselected().length === 0) {
            this.ModalService.open('views/error.html', 'Expand Segments Error: Please select one or more Segments first');
            return;
        }
        var changeTime = this.getChangeTime();
        if (negate) changeTime = -changeTime;

        this.LevelService.expandSegment(rightSide, this.ViewStateService.getcurClickItems(), this.ViewStateService.getcurClickLevelName(), changeTime);
        this.HistoryService.addObjToUndoStack({
            'type': 'ANNOT',
            'action': 'EXPANDSEGMENTS',
            'name': this.ViewStateService.getcurClickLevelName(),
            'item': this.ViewStateService.getcurClickItems(),
            'rightSide': rightSide,
            'changeTime': changeTime
        });
        this.ViewStateService.selectBoundary();
    }

    private handleSelectItemsInSelection() {
        if (!this.ViewStateService.getPermission('labelAction')) return;
        if (this.ViewStateService.getcurClickLevelName() === undefined) {
            this.ModalService.open('views/error.html', 'Selection Error : Please select a Level first');
            return;
        }
        this.ViewStateService.curClickItems = [];
        var prev = null;
        this.ViewStateService.getItemsInSelection(this.DataService.data.levels).forEach((item) => {
            if (prev === null) {
                this.ViewStateService.setcurClickItem(item);
            } else {
                this.ViewStateService.setcurClickItemMultiple(item, prev);
            }
            prev = item;
        });
        this.ViewStateService.selectBoundary();
    }

    private handleSelPrevItem(e) {
        if (!this.ViewStateService.getPermission('labelAction')) return;
        if (this.ViewStateService.getcurClickItems().length === 0) return;

        var lastNeighboursMove = this.LevelService.getItemNeighboursFromLevel(this.ViewStateService.getcurClickLevelName(), this.ViewStateService.getcurClickItems()[0].id, this.ViewStateService.getcurClickItems()[this.ViewStateService.getcurClickItems().length - 1].id);
        var neighbours = this.LevelService.getItemNeighboursFromLevel(this.ViewStateService.getcurClickLevelName(), lastNeighboursMove.left.id, lastNeighboursMove.left.id);
        if (lastNeighboursMove.left !== undefined) {
            var samplePos = lastNeighboursMove.left.sampleStart !== undefined ? lastNeighboursMove.left.sampleStart : lastNeighboursMove.left.samplePoint;
            if (samplePos > this.ViewStateService.curViewPort.sS) {
                if (e.shiftKey) {
                    this.ViewStateService.setcurClickItemMultiple(lastNeighboursMove.left, neighbours.right);
                } else {
                    this.ViewStateService.setcurClickItem(lastNeighboursMove.left);
                }
                this.LevelService.setlasteditArea('_' + lastNeighboursMove.left.id);
                this.ViewStateService.selectBoundary();
            }
        }
    }

    private handleSelNextItem(e) {
        if (!this.ViewStateService.getPermission('labelAction')) return;
        if (this.ViewStateService.getcurClickItems().length === 0) return;

        var lastNeighboursMove = this.LevelService.getItemNeighboursFromLevel(this.ViewStateService.getcurClickLevelName(), this.ViewStateService.getcurClickItems()[0].id, this.ViewStateService.getcurClickItems()[this.ViewStateService.getcurClickItems().length - 1].id);
        var neighbours = this.LevelService.getItemNeighboursFromLevel(this.ViewStateService.getcurClickLevelName(), lastNeighboursMove.right.id, lastNeighboursMove.right.id);
        if (lastNeighboursMove.right !== undefined) {
            var endPos = lastNeighboursMove.right.sampleStart !== undefined
                ? lastNeighboursMove.right.sampleStart + lastNeighboursMove.right.sampleDur
                : lastNeighboursMove.right.samplePoint;
            if (endPos < this.ViewStateService.curViewPort.eS) {
                if (e.shiftKey) {
                    this.ViewStateService.setcurClickItemMultiple(lastNeighboursMove.right, neighbours.left);
                } else {
                    this.ViewStateService.setcurClickItem(lastNeighboursMove.right);
                }
                this.LevelService.setlasteditArea('_' + lastNeighboursMove.right.id);
                this.ViewStateService.selectBoundary();
            }
        }
    }

    private handleSelNextPrevItem(e) {
        if (!this.ViewStateService.getPermission('labelAction')) return;
        if (this.ViewStateService.getcurClickItems().length === 0) return;

        var idLeft = this.ViewStateService.getcurClickItems()[0].id;
        var idRight = this.ViewStateService.getcurClickItems()[this.ViewStateService.getcurClickItems().length - 1].id;
        var lastNeighboursMove = this.LevelService.getItemNeighboursFromLevel(this.ViewStateService.getcurClickLevelName(), idLeft, idRight);

        if (e.shiftKey) {
            if (lastNeighboursMove.left !== undefined) {
                var leftPos = lastNeighboursMove.left.sampleStart !== undefined ? lastNeighboursMove.left.sampleStart : lastNeighboursMove.left.samplePoint;
                if (leftPos >= this.ViewStateService.curViewPort.sS) {
                    this.ViewStateService.setcurClickItem(lastNeighboursMove.left, lastNeighboursMove.left.sampleStart === undefined ? lastNeighboursMove.left.id : undefined);
                    this.LevelService.setlasteditArea('_' + lastNeighboursMove.left.id);
                }
            }
        } else {
            if (lastNeighboursMove.right !== undefined) {
                var rightEnd = lastNeighboursMove.right.sampleStart !== undefined
                    ? lastNeighboursMove.right.sampleStart + lastNeighboursMove.right.sampleDur
                    : lastNeighboursMove.right.samplePoint;
                if (rightEnd <= this.ViewStateService.curViewPort.eS) {
                    this.ViewStateService.setcurClickItem(lastNeighboursMove.right);
                    this.LevelService.setlasteditArea('_' + lastNeighboursMove.right.id);
                }
            }
        }
    }

    private handleCreateNewItem(code, e) {
        // auto action in modal when open
        if (this.ModalService.isOpen) {
            if (this.ModalService.force === false) {
                this.ModalService.confirmContent();
            }
            return;
        }

        if (this.ViewStateService.curClickLevelIndex === undefined) {
            this.ModalService.open('views/error.html', 'Modify Error: Please select a Segment or Event Level first.');
            return;
        }
        if (!this.ViewStateService.getPermission('labelAction')) return;
        if (!this.ConfigProviderService.vals.restrictions.addItem) return;

        if (this.ViewStateService.getselectedRange().start === this.ViewStateService.curViewPort.selectS && this.ViewStateService.getselectedRange().end === this.ViewStateService.curViewPort.selectE) {
            if (this.ViewStateService.getcurClickItems().length === 1) {
                if (this.ViewStateService.getselectedRange().start >= this.ViewStateService.curViewPort.sS && this.ViewStateService.getselectedRange().end <= this.ViewStateService.curViewPort.eS) {
                    this.ViewStateService.setEditing(true);
                    this.LevelService.openEditArea(this.ViewStateService.getcurClickItems()[0], this.LevelService.getlasteditAreaElem(), this.ViewStateService.getcurClickLevelType());
                    this.ViewStateService.setcursorInTextField(true);
                }
            } else {
                this.ModalService.open('views/error.html', 'Modify Error: Please select a single Segment.');
            }
        } else {
            if (this.ViewStateService.curViewPort.selectE === -1 && this.ViewStateService.curViewPort.selectS === -1) {
                this.ModalService.open('views/error.html', 'Error : Please select a Segment or Point to modify it\'s name. Or select a level plus a range in the viewport in order to insert a new Segment.');
            } else {
                var seg = this.LevelService.getClosestItem(this.ViewStateService.curViewPort.selectS, this.ViewStateService.getcurClickLevelName(), this.SoundHandlerService.audioBuffer.length).current;
                if (this.ViewStateService.getcurClickLevelType() === 'SEGMENT') {
                    this.handleInsertSegment(seg);
                } else {
                    this.handleInsertEvent(seg);
                }
            }
        }
    }

    private handleInsertSegment(seg) {
        if (seg === undefined) {
            var insSeg = this.LevelService.insertSegment(this.ViewStateService.getcurClickLevelName(), this.ViewStateService.curViewPort.selectS, this.ViewStateService.curViewPort.selectE, this.ConfigProviderService.vals.labelCanvasConfig.newSegmentName);
            if (!insSeg.ret) {
                this.ModalService.open('views/error.html', 'Error : You are not allowed to insert a Segment here.');
            } else {
                this.HistoryService.addObjToUndoStack({
                    'type': 'ANNOT',
                    'action': 'INSERTSEGMENTS',
                    'name': this.ViewStateService.getcurClickLevelName(),
                    'start': this.ViewStateService.curViewPort.selectS,
                    'end': this.ViewStateService.curViewPort.selectE,
                    'ids': insSeg.ids,
                    'segName': this.ConfigProviderService.vals.labelCanvasConfig.newSegmentName
                });
            }
        } else {
            if (seg.sampleStart === this.ViewStateService.curViewPort.selectS && (seg.sampleStart + seg.sampleDur + 1) === this.ViewStateService.curViewPort.selectE) {
                this.LevelService.setlasteditArea('_' + seg.id);
                this.LevelService.openEditArea(seg, this.LevelService.getlasteditAreaElem(), this.ViewStateService.getcurClickLevelType());
                this.ViewStateService.setEditing(true);
            } else {
                var insSeg = this.LevelService.insertSegment(this.ViewStateService.getcurClickLevelName(), this.ViewStateService.curViewPort.selectS, this.ViewStateService.curViewPort.selectE, this.ConfigProviderService.vals.labelCanvasConfig.newSegmentName);
                if (!insSeg.ret) {
                    this.ModalService.open('views/error.html', 'Error : You are not allowed to insert a Segment here.');
                } else {
                    this.HistoryService.addObjToUndoStack({
                        'type': 'ANNOT',
                        'action': 'INSERTSEGMENTS',
                        'name': this.ViewStateService.getcurClickLevelName(),
                        'start': this.ViewStateService.curViewPort.selectS,
                        'end': this.ViewStateService.curViewPort.selectE,
                        'ids': insSeg.ids,
                        'segName': this.ConfigProviderService.vals.labelCanvasConfig.newSegmentName
                    });
                }
            }
        }
    }

    private handleInsertEvent(seg) {
        var levelDef = this.ConfigProviderService.getLevelDefinition(this.ViewStateService.getcurClickLevelName());
        if (typeof levelDef.anagestConfig === 'undefined') {
            var insPoint = this.LevelService.insertEvent(this.ViewStateService.getcurClickLevelName(), this.ViewStateService.curViewPort.selectS, this.ConfigProviderService.vals.labelCanvasConfig.newEventName);
            if (insPoint.alreadyExists) {
                this.LevelService.setlasteditArea('_' + seg.id);
                this.LevelService.openEditArea(seg, this.LevelService.getlasteditAreaElem(), this.ViewStateService.getcurClickLevelType());
                this.ViewStateService.setEditing(true);
            } else {
                this.HistoryService.addObjToUndoStack({
                    'type': 'ANNOT',
                    'action': 'INSERTEVENT',
                    'name': this.ViewStateService.getcurClickLevelName(),
                    'start': this.ViewStateService.curViewPort.selectS,
                    'id': insPoint.id,
                    'pointName': this.ConfigProviderService.vals.labelCanvasConfig.newEventName
                });
            }
        } else {
            this.AnagestService.insertAnagestEvents();
        }
    }

    private handleDeletePreselBoundary(e) {
        if (!this.ViewStateService.getPermission('labelAction')) return;
        e.preventDefault();

        var seg = this.ViewStateService.getcurMouseItem();
        var cseg = this.ViewStateService.getcurClickItems();
        var isFirst = this.ViewStateService.getcurMouseisFirst();
        var isLast = this.ViewStateService.getcurMouseisLast();
        var levelName = this.ViewStateService.getcurMouseLevelName();
        var type = this.ViewStateService.getcurMouseLevelType();

        if (!e.shiftKey) {
            this.handleDeleteBoundary(seg, levelName, type, isFirst, isLast);
        } else {
            this.handleDeleteSegments(cseg, levelName);
        }
    }

    private handleDeleteBoundary(seg, levelName, type, isFirst, isLast) {
        if (!this.ConfigProviderService.vals.restrictions.deleteItemBoundary) return;
        if (seg === undefined) return;

        var neighbour = this.LevelService.getItemNeighboursFromLevel(levelName, seg.id, seg.id);
        if (type === 'SEGMENT') {
            var deletedSegment = this.LevelService.deleteBoundary(levelName, seg.id, isFirst, isLast);
            this.HistoryService.updateCurChangeObj({
                'type': 'ANNOT',
                'action': 'DELETEBOUNDARY',
                'name': levelName,
                'id': seg.id,
                'isFirst': isFirst,
                'isLast': isLast,
                'deletedSegment': deletedSegment
            });
            var neighbourId = neighbour.left !== undefined ? neighbour.left.id : -1;
            var deletedLinks = this.LinkService.deleteLinkBoundary(seg.id, neighbourId, this.LevelService);
            this.HistoryService.updateCurChangeObj({
                'type': 'ANNOT',
                'action': 'DELETELINKBOUNDARY',
                'name': levelName,
                'id': seg.id,
                'neighbourId': neighbourId,
                'deletedLinks': deletedLinks
            });
            this.HistoryService.addCurChangeObjToUndoStack();
            var lastEventMove = this.LevelService.getClosestItem(this.ViewStateService.getLasPcm() + this.ViewStateService.curViewPort.sS, levelName, this.SoundHandlerService.audioBuffer.length);
            if (lastEventMove.current !== undefined && lastEventMove.nearest !== undefined) {
                var lastNeighboursMove = this.LevelService.getItemNeighboursFromLevel(levelName, lastEventMove.nearest.id, lastEventMove.nearest.id);
                this.ViewStateService.setcurMouseItem(lastEventMove.nearest, lastNeighboursMove, this.ViewStateService.getLasPcm(), lastEventMove.isFirst, lastEventMove.isLast);
            }
            this.ViewStateService.setcurClickItem(deletedSegment.clickSeg);
        } else {
            var deletedPoint = this.LevelService.deleteEvent(levelName, seg.id);
            if (deletedPoint !== false) {
                this.HistoryService.updateCurChangeObj({
                    'type': 'ANNOT',
                    'action': 'DELETEEVENT',
                    'name': levelName,
                    'start': deletedPoint.samplePoint,
                    'id': deletedPoint.id,
                    'pointName': deletedPoint.labels[0].value
                });
                this.HistoryService.addCurChangeObjToUndoStack();
                var lastEventMove = this.LevelService.getClosestItem(this.ViewStateService.getLasPcm() + this.ViewStateService.curViewPort.sS, levelName, this.SoundHandlerService.audioBuffer.length);
                if (lastEventMove.current !== undefined && lastEventMove.nearest !== undefined) {
                    var lastNeighboursMove = this.LevelService.getItemNeighboursFromLevel(levelName, lastEventMove.nearest.id, lastEventMove.nearest.id);
                    this.ViewStateService.setcurMouseItem(lastEventMove.nearest, lastNeighboursMove, this.ViewStateService.getLasPcm(), lastEventMove.isFirst, lastEventMove.isLast);
                }
            } else {
                this.ViewStateService.setcurMouseItem(undefined, undefined, undefined, undefined, undefined);
            }
        }
    }

    private handleDeleteSegments(cseg, levelName) {
        if (!this.ConfigProviderService.vals.restrictions.deleteItem) return;
        if (cseg === undefined || cseg.length === 0) return;

        if (this.ViewStateService.getcurClickLevelType() === 'SEGMENT') {
            var deletedSegment = this.LevelService.deleteSegments(levelName, cseg[0].id, cseg.length);
            this.HistoryService.updateCurChangeObj({
                'type': 'ANNOT',
                'action': 'DELETESEGMENTS',
                'name': levelName,
                'id': cseg[0].id,
                'length': cseg.length,
                'deletedSegment': deletedSegment
            });
            var deletedLinks = this.LinkService.deleteLinkSegment(cseg);
            this.HistoryService.updateCurChangeObj({
                'type': 'ANNOT',
                'action': 'DELETELINKSEGMENT',
                'name': levelName,
                'segments': cseg,
                'deletedLinks': deletedLinks
            });
            this.HistoryService.addCurChangeObjToUndoStack();
            var lastEventMove = this.LevelService.getClosestItem(this.ViewStateService.getLasPcm() + this.ViewStateService.curViewPort.sS, levelName, this.SoundHandlerService.audioBuffer.length);
            if (lastEventMove.current !== undefined && lastEventMove.nearest !== undefined) {
                var lastNeighboursMove = this.LevelService.getItemNeighboursFromLevel(levelName, lastEventMove.nearest.id, lastEventMove.nearest.id);
                this.ViewStateService.setcurMouseItem(lastEventMove.nearest, lastNeighboursMove, this.ViewStateService.getLasPcm(), lastEventMove.isFirst, lastEventMove.isLast);
            }
            this.ViewStateService.setcurClickItem(deletedSegment.clickSeg);
        } else {
            this.ModalService.open('views/error.html', 'Delete Error: You can not delete Segments on Point Levels.');
        }
    }

}

angular.module('grazer')
.service('HandleGlobalKeyStrokes', [
    '$rootScope',
    '$timeout',
    'ViewStateService',
    'ModalService',
    'HierarchyManipulationService',
    'SoundHandlerService',
    'ConfigProviderService',
    'HistoryService',
    'LevelService',
    'DataService',
    'LinkService',
    'AnagestService',
    'DbObjLoadSaveService',
    'BrowserDetectorService',
    HandleGlobalKeyStrokes
]);
