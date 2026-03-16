<script lang="ts">
import * as d3 from 'd3';
import { getTick } from '../stores/app-state.svelte';
import { scheduleUpdate } from '../../core/util/schedule-update';
import {
	viewStateService,
	historyService,
	dataService,
	levelService,
	hierarchyManipulationService,
	hierarchyLayoutService,
	soundHandlerService,
	configProviderService,
} from '../stores/services';

// Color constants (from grazer-design.scss :export block)
const COLOR_DARK_GREY = '#303030';
const COLOR_WHITE = '#ffffff';
const COLOR_BLUE = '#0DC5FF';
const COLOR_RED = '#f00';
const COLOR_YELLOW = '#ff0';
const COLOR_GREY = '#424242';
const COLOR_TRANSPARENT_GREY = 'rgba(22, 22, 22, 0.1)';

// ── DOM refs ──────────────────────────────────────────────────────────────────
let containerEl: HTMLDivElement;
let svgRootEl: SVGSVGElement | null = null;

// ── Init guard ────────────────────────────────────────────────────────────────
let _inited = false;

// ── Graphical offsets ─────────────────────────────────────────────────────────
let offsetX = 25;
let offsetY = 30;
let vertOffsetX = 150;
let vertOffsetY = 25;

// ── CSS transition settings ───────────────────────────────────────────────────
const transition = {
	duration: 750,
	links: false,
	nodes: false,
	rotation: false,
	contextMenu: false,
};

// ── Zoom / pan settings ───────────────────────────────────────────────────────
const scaleExtent: [number, number] = [0.5, 10];
const panningLimit = 0.95;
const allowCrossAxisZoom = false;
const allowCrossAxisPan = false;

let timeAxisStartPosition: number | undefined;
let timeAxisEndPosition: number | undefined;
let crossAxisStartPosition: number | undefined;
let crossAxisEndPosition: number | undefined;
let northernBoundary: number | undefined;
let southernBoundary: number | undefined;
let westernBoundary: number | undefined;
let easternBoundary: number | undefined;

// ── Zoom timeout ──────────────────────────────────────────────────────────────
let zoomTimeoutId: ReturnType<typeof setTimeout> | null = null;
let lastScaleFactor = 1;

// ── Selection state ───────────────────────────────────────────────────────────
let selectedItem: any;
let selectedLink: any;
let newLinkSrc: any;
let shiftMode = false;

// ── Dimensions ────────────────────────────────────────────────────────────────
let width = 0;
let height = 0;
let vertical = false;

// ── D3 objects ────────────────────────────────────────────────────────────────
let svg: any;          // main <g> for nodes/links (child of root <g>)
let zoomer: any;       // transparent rect that receives zoom events
let captionLayer: any; // <g> for level captions (sibling of svg)
let zoomListener: any;
let timeArrow: any;
let scaleFactorDisplay: any;

// ─────────────────────────────────────────────────────────────────────────────
// Helper functions
// ─────────────────────────────────────────────────────────────────────────────

function selectItem(item: any) {
	selectedItem = item;
	viewStateService.hierarchyState.selectedItemID = item.id;
}

function selectLink(link: any) {
	selectedLink = link;
	viewStateService.hierarchyState.selectedLinkFromID = link.fromID;
	viewStateService.hierarchyState.selectedLinkToID = link.toID;
}

export function checkLink(event: MouseEvent) {
	if (event.shiftKey && !shiftMode) {
		if (viewStateService.hierarchyState.newLinkFromID === undefined) {
			viewStateService.hierarchyState.newLinkFromID = viewStateService.hierarchyState.selectedItemID;
			shiftMode = true;
		}
	}
	if (!event.shiftKey && shiftMode) {
		shiftMode = false;
		const linkObj = hierarchyManipulationService.addLink(
			viewStateService.hierarchyState.path,
			viewStateService.hierarchyState.newLinkFromID,
			viewStateService.hierarchyState.selectedItemID,
		);
		viewStateService.hierarchyState.newLinkFromID = undefined;
		if (linkObj !== null) {
			historyService.addObjToUndoStack({
				type: 'HIERARCHY',
				action: 'ADDLINK',
				link: linkObj,
			});
		}
	}
}

// ── Zoom & pan ────────────────────────────────────────────────────────────────

function limitPanning(t: any) {
	let x = t.x;
	let y = t.y;

	if (vertical) {
		if (!allowCrossAxisPan) {
			y = 0;
		} else {
			if (y > (southernBoundary ?? 0) - (crossAxisStartPosition ?? 0)) {
				y = (southernBoundary ?? 0) - (crossAxisStartPosition ?? 0);
			}
			if (y < (northernBoundary ?? 0) - (crossAxisEndPosition ?? 0)) {
				y = (northernBoundary ?? 0) - (crossAxisEndPosition ?? 0);
			}
		}
		if (x > (easternBoundary ?? 0) - (timeAxisStartPosition ?? 0)) {
			x = (easternBoundary ?? 0) - (timeAxisStartPosition ?? 0);
		}
		if (x < (westernBoundary ?? 0) - (timeAxisEndPosition ?? 0)) {
			x = (westernBoundary ?? 0) - (timeAxisEndPosition ?? 0);
		}
	} else {
		if (!allowCrossAxisPan) {
			x = 0;
		} else {
			if (x > (easternBoundary ?? 0) - (crossAxisStartPosition ?? 0)) {
				x = (easternBoundary ?? 0) - (crossAxisStartPosition ?? 0);
			}
			if (x < (westernBoundary ?? 0) - (crossAxisEndPosition ?? 0)) {
				x = (westernBoundary ?? 0) - (crossAxisEndPosition ?? 0);
			}
		}
		if (y > (southernBoundary ?? 0) - (timeAxisStartPosition ?? 0)) {
			y = (southernBoundary ?? 0) - (timeAxisStartPosition ?? 0);
		}
		if (y < (northernBoundary ?? 0) - (timeAxisEndPosition ?? 0)) {
			y = (northernBoundary ?? 0) - (timeAxisEndPosition ?? 0);
		}
	}

	return { x, y, k: t.k };
}

function zoom() {
	let t = d3.zoomTransform(zoomer.node());
	t = limitPanning(t);

	viewStateService.hierarchyState.translate = [t.x, t.y];
	viewStateService.hierarchyState.scaleFactor = t.k;

	svg.attr('transform', getOrientatedTransform(true));
	captionLayer.attr('transform', getOrientatedLevelCaptionLayerTransform());
	captionLayer
		.selectAll('g.emuhierarchy-levelcaption')
		.attr('transform', getOrientatedLevelCaptionTransform);

	if (zoomTimeoutId !== null) {
		clearTimeout(zoomTimeoutId);
		zoomTimeoutId = null;
	}
	zoomTimeoutId = setTimeout(() => {
		zoomTimeoutId = null;
		render();
	}, 200);
}

function rotate() {
	const t = d3.zoomTransform(zoomer.node());

	let percentageAwayTimeAxis: number;
	let percentageAwayCrossAxis: number;

	if (vertical === true) {
		percentageAwayTimeAxis = t.y / (timeAxisEndPosition ?? 1);
		percentageAwayCrossAxis = t.x / (crossAxisEndPosition ?? 1);
	} else {
		percentageAwayTimeAxis = t.x / (timeAxisEndPosition ?? 1);
		percentageAwayCrossAxis = t.y / (crossAxisEndPosition ?? 1);
	}

	render();

	percentageAwayTimeAxis = percentageAwayTimeAxis * (timeAxisEndPosition ?? 0);
	percentageAwayCrossAxis = percentageAwayCrossAxis * (crossAxisEndPosition ?? 0);

	if (vertical === true) {
		zoomer.call(
			zoomListener.transform,
			d3.zoomIdentity.translate(percentageAwayTimeAxis, percentageAwayCrossAxis).scale(t.k),
		);
	} else {
		zoomer.call(
			zoomListener.transform,
			d3.zoomIdentity.translate(percentageAwayCrossAxis, percentageAwayTimeAxis).scale(t.k),
		);
	}

	limitPanning(t);
}

// ── Orientation helpers ───────────────────────────────────────────────────────

function getOrientatedTransform(zoomInProgress: boolean) {
	let transform = '';
	let t = d3.zoomTransform(zoomer.node());
	t = limitPanning(t);

	if (vertical) {
		transform += 'translate(' + t.x + ',' + t.y + ')';
		transform += 'scale(-1,1),rotate(90)';
	} else {
		transform += 'translate(' + t.x + ',' + t.y + ')';
		transform += 'rotate(0)';
	}

	if (zoomInProgress === true) {
		const factor = t.k / lastScaleFactor;
		if (allowCrossAxisZoom) {
			transform += 'scale(' + factor + ')';
		} else {
			transform += 'scale(1,' + factor + ')';
		}
	}

	return transform;
}

function getOrientatedNodeTransform() {
	if (vertical) {
		return 'scale(-1,1)rotate(90)';
	} else {
		return 'rotate(0)';
	}
}

function getOrientatedLinkStrokeWidth() {
	return '2px';
}

function getOrientatedGhostLinkStrokeWidth() {
	return '15px';
}

function getNodeText(d: any) {
	const level = viewStateService.getCurAttrDef(levelService.getLevelName(d.id));
	for (let i = 0; i < d.labels.length; ++i) {
		if (d.labels[i].name === level) {
			return d.labels[i].value;
		}
	}
	console.debug('Likely a bug: Did not find the label selected for display', 'Selected level:', level, 'Node: ', d);
	return 'NO VALUE';
}

function getLevelCaptionText(levelName: string) {
	const attributeDefinition = viewStateService.getCurAttrDef(levelName);
	if (levelName === attributeDefinition) {
		return levelName;
	} else {
		return levelName + ':' + attributeDefinition;
	}
}

function getOrientatedNodeCollapseText(d: any) {
	if (vertical) {
		if (viewStateService.hierarchyState.getCollapsed(d.id)) {
			return '↓';
		} else {
			return '↑';
		}
	} else {
		if (viewStateService.hierarchyState.getCollapsed(d.id)) {
			return '→';
		} else {
			return '←';
		}
	}
}

function getOrientatedTextTransform() {
	// intentionally empty — matches original
}

function getOrientatedTextAnchor() {
	return vertical ? 'middle' : 'begin';
}

function getOrientatedTextX() {
	return vertical ? 0 : 10;
}

function getOrientatedTextY() {
	return vertical ? '1.45em' : '0.35em';
}

function getOrientatedLevelCaptionLayerTransform() {
	let t = d3.zoomTransform(zoomer.node());
	t = limitPanning(t);
	if (vertical) {
		return 'translate(0, ' + t.y + ')';
	} else {
		return 'translate(' + t.x + ', 0)';
	}
}

function getOrientatedLevelCaptionTransform(d: any) {
	const revArr = [...(viewStateService.hierarchyState.path ?? [])].reverse();
	if (vertical) {
		return 'translate(25, ' + depthToX(revArr.indexOf(d)) + ')';
	} else {
		return 'translate(' + depthToX(revArr.indexOf(d)) + ', 20)';
	}
}

function getOrientatedAddItemButtonTransform() {
	return 'translate(-12, -5)';
}

function getOrientatedTimeLevelBackgroundTransform() {
	if (vertical) {
		return 'translate(' + (vertOffsetX - 25) + ',-8)';
	} else {
		return 'translate(-8,' + (offsetY - 20) + ')';
	}
}

function getOrientatedTimeLevelBackgroundWidth() {
	return vertical ? '100%' : '15px';
}

function getOrientatedTimeLevelBackgroundHeight() {
	return vertical ? '15px' : '100%';
}

function getOrientatedMousePosition(mouse: [number, number]) {
	let t = d3.zoomTransform(zoomer.node());
	t = limitPanning(t);
	if (vertical) {
		return [mouse[1] - t.y, mouse[0] - t.x];
	} else {
		return [mouse[0] - t.x, mouse[1] - t.y];
	}
}

function getPath(d: any) {
	return 'M' + d._fromX + ' ' + d._fromY + 'Q' + d._fromX + ' ' + d._toY + ' ' + d._toX + ' ' + d._toY;
}

function getPreviewPath() {
	const from = { x: newLinkSrc._x, y: newLinkSrc._y };
	const to = { x: selectedItem._x, y: selectedItem._y };
	return 'M' + from.x + ' ' + from.y + 'Q' + from.x + ' ' + to.y + ' ' + to.x + ' ' + to.y;
}

function getPreviewColor() {
	let validity = hierarchyManipulationService.checkLinkValidity(
		viewStateService.hierarchyState.path,
		newLinkSrc.id,
		selectedItem.id,
	);

	if (validity.valid) {
		return 'green';
	} else {
		if (validity.reason === 3) {
			validity = hierarchyManipulationService.checkLinkValidity(
				viewStateService.hierarchyState.path,
				selectedItem.id,
				newLinkSrc.id,
			);
			if (validity.valid) {
				return 'green';
			}
		}
		return 'red';
	}
}

function getLabelLegalnessColor(d: any) {
	const dom = svg.select('.emuhierarchy-contextmenu input').node() as HTMLInputElement | null;
	const levelName = levelService.getLevelName(d.id);
	const attrIndex = viewStateService.getCurAttrIndex(levelName);
	const legalLabels = configProviderService.getLevelDefinition(levelName).attributeDefinitions[attrIndex].legalLabels;

	if (legalLabels === undefined || (dom && dom.value.length > 0 && legalLabels.indexOf(dom.value) >= 0)) {
		return 'lightgreen';
	} else {
		return 'red';
	}
}

// ── Transform relative → absolute coordinates ─────────────────────────────────

function depthToX(depth: number) {
	let crossAxisSize: number;
	let offset: number;
	if (vertical) {
		crossAxisSize = height;
		offset = vertOffsetY;
	} else {
		crossAxisSize = width;
		offset = offsetX;
	}

	let result = (depth / viewStateService.hierarchyState.path.length) * crossAxisSize;
	result += offset;
	return result;
}

function posInLevelToY(posInLevel: number) {
	let t = d3.zoomTransform(zoomer.node());
	t = limitPanning(t);
	let offset: number;
	let timeAxisSize: number;
	if (vertical) {
		offset = vertOffsetX;
		timeAxisSize = width - offset;
	} else {
		offset = offsetY;
		timeAxisSize = height - offset;
	}

	let result = posInLevel * timeAxisSize * t.k;
	result += offset;
	return result;
}

// ── SVG event handlers ────────────────────────────────────────────────────────

function svgOnMouseMove(event: MouseEvent) {
	if (newLinkSrc !== undefined) {
		const mouse = getOrientatedMousePosition(
			d3.pointer(event, svgRootEl) as [number, number],
		);
		const x = mouse[0];
		const y = mouse[1];

		svg.select('path.emuhierarchy-newlink')
			.attr('d', 'M' + newLinkSrc._x + ',' + newLinkSrc._y + ' L' + x + ',' + y);
	}
}

function svgOnClick(event: MouseEvent) {
	if (viewStateService.hierarchyState.contextMenuID !== undefined) {
		viewStateService.hierarchyState.contextMenuID = undefined;
		scheduleUpdate();
	}
}

function nodeOnClick(event: MouseEvent, d: any) {
	console.debug('Clicked node', d);

	if (viewStateService.hierarchyState.contextMenuID === undefined) {
		event.stopPropagation();
		viewStateService.hierarchyState.contextMenuID = d.id;
		viewStateService.hierarchyState.setEditValue(getNodeText(d));
		render();
		scheduleUpdate();
	}

	if (viewStateService.hierarchyState.contextMenuID === d.id) {
		event.stopPropagation();
	}
}

function nodeOnPlayClick(_event: MouseEvent, d: any) {
	play(d);
}

function nodeOnCollapseClick(_event: MouseEvent, d: any) {
	console.debug('collapsing', d);
	hierarchyLayoutService.toggleCollapse(d, viewStateService.hierarchyState.path);
	render();
	scheduleUpdate();
}

function nodeOnMouseOver(_event: MouseEvent, d: any) {
	selectItem(d);
	renderSelectionOnly();
}

function nodeOnInput(_event: Event, d: any) {
	const dom = svg.select('.emuhierarchy-contextmenu input').node() as HTMLInputElement | null;
	if (!dom) return;
	viewStateService.hierarchyState.setEditValue(dom.value);
	dom.style.backgroundColor = getLabelLegalnessColor(d);
}

function nodeOnFocusIn() {
	viewStateService.hierarchyState.inputFocus = true;
}

function nodeOnFocusOut() {
	viewStateService.hierarchyState.inputFocus = false;
}

function linkOnMouseOver(_event: MouseEvent, d: any) {
	selectLink(d);
	renderSelectionOnly();
}

function addButtonOnClick(_event: MouseEvent, d: any) {
	const id = levelService.pushNewItem(d);
	if (id !== -1) {
		historyService.addObjToUndoStack({
			type: 'HIERARCHY',
			action: 'PUSHITEM',
			newID: id,
			level: d,
		});
	}
	render();
	scheduleUpdate();
}

// ── Playback ──────────────────────────────────────────────────────────────────

function play(d: any) {
	const timeInfoLevel = viewStateService.hierarchyState.path[0];
	if (typeof timeInfoLevel === 'undefined') {
		console.debug('Likely a bug: There is no path selection. Not executing play():', d);
		return;
	}
	const timeInfoType = levelService.getLevelDetails(timeInfoLevel).type;

	let startSample: number | null = null;
	let endSample: number | null = null;

	let itemList: any[] = [d];
	let currentItem: any;
	while (itemList.length > 0) {
		currentItem = itemList.pop();
		if (currentItem.labels[0].name === timeInfoLevel) {
			if (timeInfoType === 'EVENT') {
				if (currentItem.samplePoint < (startSample ?? currentItem.samplePoint + 1) || startSample === null) {
					startSample = currentItem.samplePoint;
				}
				if (currentItem.samplePoint > (endSample ?? currentItem.samplePoint - 1) || endSample === null) {
					endSample = currentItem.samplePoint;
				}
			} else if (timeInfoType === 'SEGMENT') {
				if (currentItem.sampleStart < (startSample ?? currentItem.sampleStart + 1) || startSample === null) {
					startSample = currentItem.sampleStart;
				}
				const tmp = currentItem.sampleStart + currentItem.sampleDur;
				if (tmp > (endSample ?? tmp - 1) || endSample === null) {
					endSample = tmp;
				}
			}
		}
		itemList = itemList.concat(
			hierarchyLayoutService.findChildren(currentItem, viewStateService.hierarchyState.path),
		);
	}

	console.debug('Node info for playback: ', timeInfoType, d, startSample, endSample);

	if (startSample === null || endSample === null) {
		console.debug('No time information found for node, aborting playback', d);
		return;
	}

	soundHandlerService.playFromTo(startSample, endSample);
}

// ── Render helpers ────────────────────────────────────────────────────────────

function renderSelectionOnly() {
	svg
		.selectAll('circle.emuhierarchy-nodeCircle')
		.style('fill', (d: any) => {
			let color = COLOR_WHITE;
			if (typeof selectedItem !== 'undefined' && d.id === selectedItem.id) {
				color = COLOR_BLUE;
			}
			return color;
		});

	svg
		.selectAll('path.emuhierarchy-link')
		.style('stroke', (d: any) => {
			if (selectedLink === d) {
				return COLOR_YELLOW;
			} else {
				return COLOR_GREY;
			}
		});

	svg
		.select('.emuhierarchy-newlinkpreview')
		.attr('d', getPreviewPath)
		.style('stroke', getPreviewColor);
}

// ── Main render ───────────────────────────────────────────────────────────────

function render() {
	if (!_inited || !zoomer || !svg) return;

	let t = d3.zoomTransform(zoomer.node());
	t = limitPanning(t);
	lastScaleFactor = t.k;

	// Get current dimensions from SVG element
	width = parseInt(d3.select(svgRootEl).style('width'), 10);
	height = parseInt(d3.select(svgRootEl).style('height'), 10);

	// Set orientation transform
	if (transition.rotation) {
		svg.transition().duration(transition.duration).attr('transform', getOrientatedTransform(false));
	} else {
		svg.attr('transform', getOrientatedTransform(false));
	}

	// Draw time arrow
	if (vertical) {
		timeArrow.attr('transform', 'translate(' + width / 2 + ',' + (height - 10) + ')');
	} else {
		timeArrow.attr('transform', 'translate(' + (width - 20) + ',' + height / 2 + ')rotate(90)');
	}

	// Draw scale factor display
	if (vertical) {
		scaleFactorDisplay.attr('transform', 'translate(' + width + ', 20)');
		scaleFactorDisplay
			.select('text')
			.attr('text-anchor', 'end')
			.style('fill', COLOR_WHITE)
			.text('Zoom: ' + Math.round(t.k * 100) + ' %');
	} else {
		scaleFactorDisplay.attr('transform', 'translate(0, ' + height + ')');
		scaleFactorDisplay
			.select('text')
			.attr('text-anchor', 'start')
			.style('fill', COLOR_WHITE)
			.text('Zoom: ' + Math.round(t.k * 100) + ' %');
	}

	// Draw level captions
	captionLayer.attr('transform', getOrientatedLevelCaptionLayerTransform());

	let levelCaptionSet = captionLayer
		.selectAll('g.emuhierarchy-levelcaption')
		.data(viewStateService.hierarchyState.path, (d: any) => d);

	const oldLevelCaptions = levelCaptionSet.exit();
	let newLevelCaptions = levelCaptionSet.enter();

	newLevelCaptions = newLevelCaptions.append('g').attr('class', 'emuhierarchy-levelcaption');
	newLevelCaptions.append('text');

	const addItemButtons = newLevelCaptions
		.filter((d: any) => {
			const levelType = levelService.getLevelDetails(d).type;
			return levelType === 'ITEM';
		})
		.append('g')
		.attr('class', 'emuhierarchy-addbutton')
		.attr('transform', getOrientatedAddItemButtonTransform)
		.on('click', addButtonOnClick);

	addItemButtons.append('circle').style('fill', COLOR_BLUE).attr('r', 8);
	addItemButtons.append('path').style('stroke', COLOR_WHITE).attr('d', 'M0,-6 V6 M-6,0 H6');

	newLevelCaptions
		.filter((d: any) => {
			const levelType = levelService.getLevelDetails(d).type;
			return levelType === 'SEGMENT' || levelType === 'EVENT';
		})
		.append('rect')
		.attr('class', 'emuhierarchy-timelevelbackground')
		.style('fill', COLOR_TRANSPARENT_GREY);

	// Merge
	levelCaptionSet = levelCaptionSet.merge(newLevelCaptions);
	levelCaptionSet.attr('transform', getOrientatedLevelCaptionTransform);
	levelCaptionSet.select('text').text(getLevelCaptionText);

	levelCaptionSet
		.select('.emuhierarchy-timelevelbackground')
		.attr('transform', getOrientatedTimeLevelBackgroundTransform)
		.style('width', getOrientatedTimeLevelBackgroundWidth)
		.style('height', getOrientatedTimeLevelBackgroundHeight);

	if (transition.rotation) {
		oldLevelCaptions.transition().duration(transition.duration).remove();
	} else {
		oldLevelCaptions.remove();
	}
	oldLevelCaptions.select('text').style('fill-opacity', 0);

	// Compute nodes
	const nodes: any[] = [];
	hierarchyLayoutService.calculateWeightsBottomUp(viewStateService.hierarchyState.path);

	for (let i = 0; i < viewStateService.hierarchyState.path.length; ++i) {
		const levelItems = levelService.getLevelDetails(viewStateService.hierarchyState.path[i]).items;
		for (let ii = 0; ii < levelItems.length; ++ii) {
			if (levelItems[ii]._visible) {
				nodes.push(levelItems[ii]);
			}
		}
	}

	// Ensure visible selections
	const selItem = levelService.getItemByID(viewStateService.hierarchyState.selectedItemID);
	const ctxMenuItem = levelService.getItemByID(viewStateService.hierarchyState.contextMenuID);
	const selLinkFrom = levelService.getItemByID(viewStateService.hierarchyState.selectedLinkFromID);
	const selLinkTo = levelService.getItemByID(viewStateService.hierarchyState.selectedLinkToID);

	if (selItem !== undefined && !selItem._visible) {
		console.debug('Unselecting node');
		viewStateService.hierarchyState.selectedItemID = undefined;
	}
	if (selLinkFrom !== undefined && !selLinkFrom._visible) {
		console.debug('Unselecting link');
		viewStateService.hierarchyState.selectedLinkFromID = undefined;
		viewStateService.hierarchyState.selectedLinkToID = undefined;
	}
	if (selLinkTo !== undefined && !selLinkTo._visible) {
		console.debug('Unselecting link');
		viewStateService.hierarchyState.selectedLinkFromID = undefined;
		viewStateService.hierarchyState.selectedLinkToID = undefined;
	}
	if (ctxMenuItem !== undefined && !ctxMenuItem._visible) {
		console.debug('Closing context menu (node became invisible)');
		viewStateService.hierarchyState.contextMenuID = undefined;
	}

	// Compute links
	const links: any[] = [];
	const allLinks = dataService.getData().links;
	for (let l = 0; l < allLinks.length; ++l) {
		for (let i = 0; i < viewStateService.hierarchyState.path.length - 1; ++i) {
			const element = levelService.getItemFromLevelById(
				viewStateService.hierarchyState.path[i],
				allLinks[l].toID,
			);
			const parentElement = levelService.getItemFromLevelById(
				viewStateService.hierarchyState.path[i + 1],
				allLinks[l].fromID,
			);

			if (element === null) continue;
			if (parentElement === null) continue;
			if (!element._visible) continue;
			if (viewStateService.hierarchyState.getCollapsed(parentElement.id) || !parentElement._visible) continue;

			links.push(allLinks[l]);
		}
	}

	// Convert relative coords to absolute
	nodes.forEach((d) => {
		d._x = depthToX(d._depth);
		d._y = posInLevelToY(d._posInLevel);
	});
	links.forEach((d) => {
		d._fromX = depthToX(d._fromDepth);
		d._fromY = posInLevelToY(d._fromPosInLevel);
		d._toX = depthToX(d._toDepth);
		d._toY = posInLevelToY(d._toPosInLevel);
	});

	// D3 data join — nodes
	let dataSet = svg.selectAll('g.emuhierarchy-node').data(nodes, (d: any) => d.id);

	const oldNodes = dataSet.exit();
	let newNodes = dataSet.enter();

	newNodes = newNodes
		.append('g')
		.attr('class', 'emuhierarchy-node')
		.merge(newNodes)
		.attr('pointer-events', 'mouseover')
		.on('click', nodeOnClick)
		.on('mouseover', nodeOnMouseOver);

	const circle = newNodes.append('circle').attr('class', 'emuhierarchy-nodeCircle').style('stroke', COLOR_GREY);

	if (transition.nodes) {
		circle.attr('r', 0).transition().duration(transition.duration).attr('r', 4.5);
	} else {
		circle.attr('r', 4.5);
	}

	newNodes.append('text').attr('class', 'emuhierarchy-nodeText');

	newNodes.attr('transform', (d: any) => {
		const position = viewStateService.hierarchyState.getCollapsePosition(d.id);
		if (typeof position !== 'undefined') {
			const x = position[0];
			const y = position[1];
			viewStateService.hierarchyState.setCollapsePosition(d.id, undefined);
			return 'translate(' + x + ',' + y + ')' + getOrientatedNodeTransform();
		}
	});

	// Merge
	dataSet = dataSet.merge(newNodes);

	// Remove old nodes
	if (transition.nodes) {
		oldNodes
			.transition()
			.duration(transition.duration)
			.attr('transform', (d: any) => {
				const cp = viewStateService.hierarchyState.getCollapsePosition(d.id);
				if (typeof cp !== 'undefined') {
					const x = cp[0];
					const y = cp[1];
					viewStateService.hierarchyState.setCollapsePosition(d.id, undefined);
					return 'translate(' + x + ',' + y + ')';
				} else {
					return 'translate(0,0)';
				}
			})
			.remove();
	} else {
		oldNodes
			.attr('transform', (d: any) => {
				const cp = viewStateService.hierarchyState.getCollapsePosition(d.id);
				if (typeof cp !== 'undefined') {
					const x = cp[0];
					const y = cp[1];
					viewStateService.hierarchyState.setCollapsePosition(d.id, undefined);
					return 'translate(' + x + ',' + y + ')';
				} else {
					return 'translate(0,0)';
				}
			})
			.remove();
	}
	oldNodes.select('text').style('fill-opacity', 0);

	// Update node properties
	dataSet
		.select('text')
		.attr('x', getOrientatedTextX)
		.attr('y', getOrientatedTextY)
		.attr('text-anchor', getOrientatedTextAnchor)
		.attr('transform', getOrientatedTextTransform)
		.text(getNodeText);

	dataSet
		.select('circle.emuhierarchy-nodeCircle')
		.style('fill', (d: any) => {
			let color = COLOR_WHITE;
			if (typeof selectedItem !== 'undefined' && d.id === selectedItem.id) {
				color = COLOR_BLUE;
			}
			return color;
		})
		.style('stroke', (d: any) => {
			if (viewStateService.hierarchyState.getCollapsed(d.id)) {
				return COLOR_RED;
			} else {
				return COLOR_GREY;
			}
		});

	if (transition.nodes) {
		dataSet.transition().duration(transition.duration).attr('transform', (d: any) => {
			return 'translate(' + d._x + ',' + d._y + ')' + getOrientatedNodeTransform();
		});
	} else {
		dataSet.attr('transform', (d: any) => {
			return 'translate(' + d._x + ',' + d._y + ')' + getOrientatedNodeTransform();
		});
	}

	// Context menu
	if (viewStateService.hierarchyState.contextMenuID === undefined) {
		svg.selectAll('.emuhierarchy-contextmenu').remove();
	}

	let contextMenu = svg.select('.emuhierarchy-contextmenu');

	if (contextMenu.empty()) {
		contextMenu = dataSet
			.filter((d: any) => d.id === viewStateService.hierarchyState.contextMenuID)
			.append('g')
			.attr('class', 'emuhierarchy-contextmenu');

		contextMenu.append('circle').style('fill', 'darkgrey').attr('r', 50).style('cursor', 'default');

		if (transition.contextMenu) {
			contextMenu.style('opacity', 0).transition().duration(transition.duration).style('opacity', 0.5);
		}

		contextMenu
			.append('text')
			.text(getOrientatedNodeCollapseText)
			.attr('x', -25)
			.attr('y', -25)
			.attr('text-anchor', 'middle')
			.on('click', nodeOnCollapseClick);

		if (transition.contextMenu) {
			contextMenu.style('opacity', 0).transition().duration(transition.duration).style('opacity', 1);
		}

		contextMenu
			.append('text')
			.text('play')
			.attr('x', -25)
			.attr('y', +25)
			.attr('text-anchor', 'middle')
			.on('click', nodeOnPlayClick);

		if (transition.contextMenu) {
			contextMenu.style('opacity', 0).transition().duration(transition.duration).style('opacity', 1);
		}

		const foreignObject = contextMenu
			.append('foreignObject')
			.attr('height', 30)
			.attr('x', 10)
			.attr('y', -15)
			.attr('width', 0);

		if (transition.contextMenu) {
			foreignObject.transition().duration(transition.duration).attr('width', 100);
		} else {
			foreignObject.attr('width', 100);
		}

		foreignObject
			.append('xhtml:body')
			.append('input')
			.attr('value', getNodeText)
			.style('width', '100%')
			.style('height', '100%')
			.style('outline', 'none')
			.style('border', '0')
			.style('background-color', getLabelLegalnessColor)
			.on('input', nodeOnInput)
			.on('focus', nodeOnFocusIn)
			.on('blur', nodeOnFocusOut);

		if (!foreignObject.empty()) {
			const inputNode = foreignObject.select('input').node() as HTMLInputElement | null;
			if (inputNode) {
				inputNode.focus();
				inputNode.select();
			}
		}
	} else {
		svg.select('.emuhierarchy-contextmenu text').text(getOrientatedNodeCollapseText);
	}

	// Sort so the context-menu node is on top
	svg.selectAll('.emuhierarchy-node').sort((a: any, b: any) => {
		if (a.id === viewStateService.hierarchyState.contextMenuID) return 1;
		if (b.id === viewStateService.hierarchyState.contextMenuID) return -1;
		return 0;
	});

	// D3 data join — links
	let linkSet = svg
		.selectAll('.emuhierarchy-linkgroup')
		.data(links, (d: any) => 's' + d.fromID + 't' + d.toID);

	const oldLinks = linkSet.exit();
	let newLinks = linkSet.enter();

	newLinks = newLinks.insert('g', ':first-child').attr('class', 'emuhierarchy-linkgroup');

	newLinks
		.append('path')
		.attr('class', 'emuhierarchy-ghostlink')
		.style('stroke-width', getOrientatedGhostLinkStrokeWidth)
		.on('mouseover', linkOnMouseOver);

	newLinks
		.append('path')
		.attr('class', 'emuhierarchy-link')
		.style('stroke-width', getOrientatedLinkStrokeWidth);

	if (transition.links) {
		newLinks.style('opacity', 0).transition().duration(transition.duration).style('opacity', 1);
	}

	// Merge
	linkSet = linkSet.merge(newLinks);

	if (transition.links) {
		oldLinks.transition().duration(transition.duration).style('opacity', 0).remove();
	} else {
		oldLinks.remove();
	}

	linkSet.selectAll('.emuhierarchy-link').style('stroke', (d: any) => {
		if (selectedLink === d) {
			return COLOR_YELLOW;
		} else {
			return COLOR_GREY;
		}
	});

	if (transition.links) {
		linkSet
			.selectAll('.emuhierarchy-link')
			.transition()
			.duration(transition.duration)
			.attr('d', getPath)
			.style('stroke-width', getOrientatedLinkStrokeWidth)
			.style('opacity', 1);
	} else {
		linkSet.selectAll('.emuhierarchy-link').attr('d', getPath).style('stroke-width', getOrientatedLinkStrokeWidth);
	}

	linkSet.selectAll('.emuhierarchy-ghostlink').attr('d', getPath);

	// New link preview
	svg.selectAll('.emuhierarchy-newlink').remove();
	svg.selectAll('.emuhierarchy-newlinkpreview').remove();

	if (newLinkSrc !== undefined) {
		svg
			.append('path')
			.attr('class', 'emuhierarchy-newlink')
			.style('stroke', 'black')
			.style('stroke-width', getOrientatedLinkStrokeWidth);

		svg
			.append('path')
			.attr('class', 'emuhierarchy-newlinkpreview')
			.attr('d', getPreviewPath)
			.style('stroke', getPreviewColor)
			.style('stroke-width', getOrientatedLinkStrokeWidth);
	}

	// Pan boundaries
	if (vertical) {
		northernBoundary = vertOffsetY + height * (1 - panningLimit);
		southernBoundary = height * panningLimit;
		westernBoundary = vertOffsetX + width * (1 - panningLimit);
		easternBoundary = width * panningLimit;
	} else {
		northernBoundary = offsetY + height * (1 - panningLimit);
		southernBoundary = height * panningLimit;
		westernBoundary = offsetX + width * (1 - panningLimit);
		easternBoundary = width * panningLimit;
	}

	const bbox = svg.node().getBBox();
	timeAxisStartPosition = bbox.y;
	timeAxisEndPosition = timeAxisStartPosition + bbox.height;
	crossAxisStartPosition = bbox.x;
	crossAxisEndPosition = crossAxisStartPosition + bbox.width;
}

// ─────────────────────────────────────────────────────────────────────────────
// Lifecycle effects
// ─────────────────────────────────────────────────────────────────────────────

// Init — runs once when containerEl is bound
$effect(() => {
	if (!containerEl || _inited) return;

	width = 0;
	height = 0;

	zoomListener = d3.zoom().scaleExtent(scaleExtent).on('zoom', zoom);

	// The SVG is appended into containerEl's first div child
	const rootG = d3
		.select(containerEl)
		.append('svg')
		.attr('width', '100%')
		.attr('height', '100%')
		.style('background-color', COLOR_DARK_GREY)
		.call(zoomListener)
		.on('dblclick.zoom', null)
		.on('mousemove', svgOnMouseMove)
		.on('click', svgOnClick)
		.append('g');

	// Store reference to the raw SVG element for d3.pointer()
	svgRootEl = (d3.select(containerEl).select('svg').node() as SVGSVGElement) ?? null;

	zoomer = rootG
		.append('rect')
		.attr('width', '100%')
		.attr('height', '100%')
		.style('fill', 'none')
		.style('pointer-events', 'all')
		.call(zoomListener);

	shiftMode = false;

	captionLayer = rootG.append('g').style('z-index', 5);

	timeArrow = rootG
		.append('g')
		.append('text')
		.style('fill', COLOR_WHITE)
		.text('time →');

	scaleFactorDisplay = rootG.append('g');
	scaleFactorDisplay.append('text');

	// svg is the main <g> for nodes/links
	svg = rootG.append('g').style('z-index', 1);

	// Restore previous zoom/pan state
	const existingT = d3.zoomTransform(zoomer.node());
	zoomer.call(
		zoomListener.transform,
		d3.zoomIdentity.translate(existingT.x, existingT.y).scale(existingT.k),
	);

	_inited = true;
});

// Reactive update — re-render when tick changes or vertical rotation changes
$effect(() => {
	const t = getTick();
	if (!_inited || t < 0) return;

	const newVertical = viewStateService.hierarchyState.isRotated
		? viewStateService.hierarchyState.isRotated()
		: viewStateService.hierarchyState.vertical ?? false;

	if (newVertical !== vertical) {
		vertical = newVertical;
		rotate();
	} else {
		render();
	}
});
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="grazer-hierarchy-container"
	bind:this={containerEl}
	onmousemove={checkLink}
></div>

<style>
.grazer-hierarchy-container {
	width: 100%;
	height: 100%;
	overflow: hidden;
}
</style>
