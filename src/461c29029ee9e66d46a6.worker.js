/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./node_modules/comlink-loader/dist/comlink-worker-loader.js!./node_modules/ts-loader/index.js!./src/app/workers/hierarchy.worker.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./node_modules/comlink-loader/dist/comlink-worker-loader.js!./node_modules/ts-loader/index.js!./src/app/workers/hierarchy.worker.ts":
/*!**********************************************************************************************************************************!*\
  !*** ./node_modules/comlink-loader/dist/comlink-worker-loader.js!./node_modules/ts-loader!./src/app/workers/hierarchy.worker.ts ***!
  \**********************************************************************************************************************************/
/*! exports provided: HierarchyWorker */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "HierarchyWorker", function() { return HierarchyWorker; });
/* harmony import */ var comlink__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! comlink */ "./node_modules/comlink/dist/esm/comlink.mjs");

  var HierarchyWorker = /** @class */ (function () {
    ///////////////////////////
    // public api
    function HierarchyWorker() {
    }
    HierarchyWorker.prototype.reduceAnnotationToViewableTimeAndPath = function (annotation, path, viewPortStartSample, viewPortEndSample) {
        var _this = this;
        this.idHashMap = undefined; // reset 4       
        this.linkSubToSuperHashMap = undefined;
        this.createIdHashMapForPath(path, annotation);
        this.createLinkSubToSuperHashMap(annotation); // from child to parents
        var childLevel = this.reduceToItemsWithTimeInView(annotation, path, viewPortStartSample, viewPortEndSample);
        // clone and empty annotation
        var annotationClone = JSON.parse(JSON.stringify(annotation));
        annotationClone.levels = [];
        annotationClone.levels.push(JSON.parse(JSON.stringify(childLevel)));
        annotationClone.links = [];
        var reachedTargetLevel = false;
        path.forEach(function (ln, lnIdx) {
            if (ln !== path[path.length - 1]) {
                if (ln !== path[path.length - 1]) {
                    var parentLevelClone = JSON.parse(JSON.stringify(_this.getLevelDetails(path[lnIdx + 1], annotation)));
                    parentLevelClone.items = [];
                    _this.giveTimeToParentsAndAppendItemsAndLinks(annotationClone, parentLevelClone, childLevel);
                    annotationClone.levels.push(parentLevelClone);
                    childLevel = annotationClone.levels[annotationClone.levels.length - 1];
                }
            }
        });
        return annotationClone;
    };
    /**
    * returns level details by passing in level name
    * if the corresponding level exists
    * otherwise returns 'null'
    *    @param name
    */
    HierarchyWorker.prototype.getLevelDetails = function (name, annotation) {
        var ret = null;
        annotation.levels.forEach(function (level) {
            if (level.name === name) {
                ret = level;
            }
        });
        return ret;
    };
    ;
    /**
     *
     * @param annotation annotation to guess LinkDefinitions from
     */
    HierarchyWorker.prototype.guessLinkDefinitions = function (annotation) {
        // console.log(annotation)
        this.idHashMap = undefined; // reset 4       
        this.linkSubToSuperHashMap = undefined;
        this.createIdHashMapForEveryLevel(annotation);
        this.createLinkSubToSuperHashMap(annotation); // from child to parents
        this.createLinkSuperToSubHashMap(annotation); // from parent to children
        // console.log(this.idHashMap);
        // console.log(this.linkSubToSuperHashMap);
        // console.log(this.linkSuperToSubHashMap);
        var linkDefsSuperToSub = this.findAllLinkDefs(this.linkSuperToSubHashMap, false);
        var linkDefsSubToSuper = this.findAllLinkDefs(this.linkSubToSuperHashMap, true);
        // console.log(linkDefsSuperToSub);
        // console.log(linkDefsSubToSuper);
        linkDefsSuperToSub.forEach(function (linkDefSuperToSub) {
            linkDefsSubToSuper.forEach(function (linkDefSubToSuper) {
                if (linkDefSuperToSub.superlevelName === linkDefSubToSuper.superlevelName && linkDefSuperToSub.sublevelName === linkDefSubToSuper.sublevelName) {
                    if (linkDefSuperToSub.type === "ONE_TO_ONE") {
                        linkDefSuperToSub.type = linkDefSubToSuper.type;
                    }
                    else if (linkDefSuperToSub.type === "ONE_TO_MANY" && linkDefSubToSuper.type === "MANY_TO_MANY") {
                        linkDefSuperToSub.type = linkDefSubToSuper.type;
                    }
                }
            });
        });
        return (linkDefsSuperToSub);
    };
    ///////////////////////////
    // private api
    HierarchyWorker.prototype.reduceToItemsWithTimeInView = function (annotation, path, viewPortStartSample, viewPortEndSample) {
        var subLevelWithTime = this.getLevelDetails(path[0], annotation);
        var subLevelWithTimeClone = JSON.parse(JSON.stringify(subLevelWithTime));
        subLevelWithTimeClone.items = [];
        // let itemsInView = [];
        subLevelWithTime.items.forEach(function (item) {
            if (item.sampleStart + item.sampleDur > viewPortStartSample && item.sampleStart < viewPortEndSample) {
                subLevelWithTimeClone.items.push(item);
            }
        });
        return subLevelWithTimeClone;
    };
    HierarchyWorker.prototype.giveTimeToParentsAndAppendItemsAndLinks = function (annotation, parentLevel, childLevel) {
        var _this = this;
        childLevel.items.forEach(function (item) {
            var parentIds = _this.linkSubToSuperHashMap.get(item.id);
            if (typeof parentIds !== 'undefined') {
                parentIds.forEach(function (parentId) {
                    var parentItem = _this.idHashMap.get(parentId);
                    // console.log(parentId);
                    // console.log(parentItem);
                    if (typeof parentItem !== 'undefined') { // as only levels in path are in idHashMap 
                        if (parentItem.labels[0].name === parentLevel.name) {
                            // append link
                            annotation.links.push({
                                fromID: parentId,
                                toID: item.id
                            });
                            // add time info
                            if (typeof parentItem.sampleStart === 'undefined') {
                                parentItem.sampleStart = item.sampleStart;
                                parentItem.sampleDur = item.sampleDur;
                            }
                            else if (item.sampleStart < parentItem.sampleStart) {
                                parentItem.sampleStart = item.sampleStart;
                            }
                            else if (item.sampleStart + item.sampleDur > parentItem.sampleStart + parentItem.sampleDur) {
                                parentItem.sampleDur = item.sampleStart + item.sampleDur - parentItem.sampleStart;
                            }
                            // append item
                            parentLevel.items.push(parentItem);
                        }
                    }
                    // check if parent is on right level
                });
            }
        });
    };
    HierarchyWorker.prototype.giveTimeToParents = function (levelName, annotation, subLevelWithTime) {
        var _this = this;
        var level;
        if (levelName === subLevelWithTime.name) {
            level = subLevelWithTime;
        }
        else {
            level = this.getLevelDetails(levelName, annotation);
        }
        level.items.forEach(function (item) {
            var parentId = _this.linkSubToSuperHashMap.get(item.id);
            var parents = _this.idHashMap.get(parentId);
            if (parents) {
                parents.forEach(function (parent) {
                    if (typeof parent.sampleStart === 'undefined') {
                        parent.sampleStart = item.sampleStart;
                        parent.sampleDur = item.sampleDur;
                    }
                    else if (item.sampleStart < parent.sampleStart) {
                        parent.sampleStart = item.sampleStart;
                    }
                    else if (item.sampleStart + item.sampleDur > parent.sampleStart + parent.sampleDur) {
                        parent.sampleDur = item.sampleStart + item.sampleDur - parent.sampleStart;
                    }
                });
            }
        });
    };
    HierarchyWorker.prototype.createIdHashMapForPath = function (path, annotation) {
        var _this = this;
        this.idHashMap = new Map();
        path.forEach(function (levelName) {
            var level = _this.getLevelDetails(levelName, annotation);
            level.items.forEach(function (item) {
                _this.idHashMap.set(item.id, item);
            });
        });
    };
    HierarchyWorker.prototype.createIdHashMapForEveryLevel = function (annotation) {
        var _this = this;
        this.idHashMap = new Map();
        annotation.levels.forEach(function (level) {
            level.items.forEach(function (item) {
                _this.idHashMap.set(item.id, item);
            });
        });
    };
    HierarchyWorker.prototype.createLinkSubToSuperHashMap = function (annotation) {
        var _this = this;
        this.linkSubToSuperHashMap = new Map();
        annotation.links.forEach(function (link) {
            if (!_this.linkSubToSuperHashMap.has(link.toID)) {
                _this.linkSubToSuperHashMap.set(link.toID, [link.fromID]);
            }
            else {
                var prevParents = _this.linkSubToSuperHashMap.get(link.toID);
                prevParents.push(link.fromID);
                _this.linkSubToSuperHashMap.set(link.toID, prevParents);
            }
        });
    };
    HierarchyWorker.prototype.createLinkSuperToSubHashMap = function (annotation) {
        var _this = this;
        this.linkSuperToSubHashMap = new Map();
        annotation.links.forEach(function (link) {
            if (!_this.linkSuperToSubHashMap.has(link.fromID)) {
                _this.linkSuperToSubHashMap.set(link.fromID, [link.toID]);
            }
            else {
                var prevChildren = _this.linkSuperToSubHashMap.get(link.fromID);
                prevChildren.push(link.toID);
                _this.linkSuperToSubHashMap.set(link.fromID, prevChildren);
            }
        });
    };
    // private walkAndAppendToLinkDefinitions(key, path, foundPaths, linkHashMap){
    //     // add to path only if we havn't visited it yet
    //     let item = this.idHashMap.get(key);
    //     let curLevelName = item.labels[0].name;
    //     if(!path.includes(curLevelName)){
    //         path.push(curLevelName);
    //     }
    //     // get values
    //     let values = linkHashMap.get(key);
    //     if(typeof values !== "undefined"){
    //         values.forEach((connectedItemId) => {
    //             // let item = this.idHashMap.get(connectedItemId);
    //             // path.push(item.labels[0].name);
    //             this.walkAndAppendToLinkDefinitions(connectedItemId, path, foundPaths, linkHashMap);
    //         })
    //     } else {
    //         // reached end of path 
    //         // -> append to foundPaths + reset path
    //         // foundPaths.push(path.join(' → '));
    //         // path = [];
    //     }
    // }
    // probably should move this to service
    // private onlyUnique(value, index, self) { 
    //     return self.indexOf(value) === index;
    // }
    HierarchyWorker.prototype.findAllLinkDefs = function (linkHashMap, reverse) {
        // console.log("in findAllLinkDefs");
        var _this = this;
        var foundLinkDefs = [];
        var foundLinkDefStrings = [];
        // loop through map
        linkHashMap.forEach(function (values, key, map) {
            var connectedLevels = [];
            // if([173].indexOf(key) !== -1) { // only start at 8 for now
            var startItem = _this.idHashMap.get(key);
            var startLevelName = startItem.labels[0].name;
            // console.log("startLevelName:", startLevelName);
            // console.log("key:", key);
            // console.log("values:", values);
            // console.log("map:", map);
            values.forEach(function (connectedItemId) {
                var connectedItem = _this.idHashMap.get(connectedItemId);
                var connectedItemLevelName = connectedItem.labels[0].name;
                var linkDefType;
                // console.log("connectedItemLevelName:", connectedItemLevelName);
                if (connectedLevels.indexOf(connectedItemLevelName) === -1) {
                    connectedLevels.push(connectedItemLevelName);
                    linkDefType = "ONE_TO_ONE";
                }
                else {
                    if (!reverse) {
                        linkDefType = "ONE_TO_MANY";
                    }
                    else {
                        linkDefType = "MANY_TO_MANY";
                    }
                }
                // this also depends on reverse
                var linkDefString = startLevelName + ' → ' + connectedItemLevelName;
                // console.log(linkDefString);
                if (foundLinkDefStrings.indexOf(linkDefString) === -1) {
                    foundLinkDefStrings.push(linkDefString);
                    if (!reverse) {
                        foundLinkDefs.push({
                            type: linkDefType,
                            superlevelName: startLevelName,
                            sublevelName: connectedItemLevelName
                        });
                    }
                    else {
                        foundLinkDefs.push({
                            type: linkDefType,
                            superlevelName: connectedItemLevelName,
                            sublevelName: startLevelName
                        });
                    }
                }
                else {
                    // update type (only in upgradable direction)
                    if (foundLinkDefs[foundLinkDefStrings.indexOf(linkDefString)].type === "ONE_TO_ONE") {
                        foundLinkDefs[foundLinkDefStrings.indexOf(linkDefString)].type = linkDefType;
                    }
                    else if (foundLinkDefs[foundLinkDefStrings.indexOf(linkDefString)].type === "ONE_TO_MANY" && linkDefType === "MANY_TO_MANY") {
                        foundLinkDefs[foundLinkDefStrings.indexOf(linkDefString)].type = linkDefType;
                    }
                }
            });
            // }
        });
        // console.log("------------");
        // console.log(foundLinkDefStrings);
        // console.log(foundLinkDefs); // foundLinkDefs.filter(this.onlyUnique)
        return (foundLinkDefs);
    };
    return HierarchyWorker;
}());

;
  Object(comlink__WEBPACK_IMPORTED_MODULE_0__["expose"])(
    Object.keys(__webpack_exports__).reduce(function(r,k){
      if (k=='__esModule') return r;
      r[k] = __webpack_exports__[k];
      return r
    },{})
  )

/***/ }),

/***/ "./node_modules/comlink/dist/esm/comlink.mjs":
/*!***************************************************!*\
  !*** ./node_modules/comlink/dist/esm/comlink.mjs ***!
  \***************************************************/
/*! exports provided: createEndpoint, expose, proxy, proxyMarker, releaseProxy, transfer, transferHandlers, windowEndpoint, wrap */
/***/ (function(__webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createEndpoint", function() { return createEndpoint; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "expose", function() { return expose; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "proxy", function() { return proxy; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "proxyMarker", function() { return proxyMarker; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "releaseProxy", function() { return releaseProxy; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "transfer", function() { return transfer; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "transferHandlers", function() { return transferHandlers; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "windowEndpoint", function() { return windowEndpoint; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "wrap", function() { return wrap; });
/**
 * Copyright 2019 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const proxyMarker = Symbol("Comlink.proxy");
const createEndpoint = Symbol("Comlink.endpoint");
const releaseProxy = Symbol("Comlink.releaseProxy");
const throwSet = new WeakSet();
const transferHandlers = new Map([
    [
        "proxy",
        {
            canHandle: obj => obj && obj[proxyMarker],
            serialize(obj) {
                const { port1, port2 } = new MessageChannel();
                expose(obj, port1);
                return [port2, [port2]];
            },
            deserialize: (port) => {
                port.start();
                return wrap(port);
            }
        }
    ],
    [
        "throw",
        {
            canHandle: obj => throwSet.has(obj),
            serialize(obj) {
                const isError = obj instanceof Error;
                let serialized = obj;
                if (isError) {
                    serialized = {
                        isError,
                        message: obj.message,
                        stack: obj.stack
                    };
                }
                return [serialized, []];
            },
            deserialize(obj) {
                if (obj.isError) {
                    throw Object.assign(new Error(), obj);
                }
                throw obj;
            }
        }
    ]
]);
function expose(obj, ep = self) {
    ep.addEventListener("message", function callback(ev) {
        if (!ev || !ev.data) {
            return;
        }
        const { id, type, path } = Object.assign({ path: [] }, ev.data);
        const argumentList = (ev.data.argumentList || []).map(fromWireValue);
        let returnValue;
        try {
            const parent = path.slice(0, -1).reduce((obj, prop) => obj[prop], obj);
            const rawValue = path.reduce((obj, prop) => obj[prop], obj);
            switch (type) {
                case 0 /* GET */:
                    {
                        returnValue = rawValue;
                    }
                    break;
                case 1 /* SET */:
                    {
                        parent[path.slice(-1)[0]] = fromWireValue(ev.data.value);
                        returnValue = true;
                    }
                    break;
                case 2 /* APPLY */:
                    {
                        returnValue = rawValue.apply(parent, argumentList);
                    }
                    break;
                case 3 /* CONSTRUCT */:
                    {
                        const value = new rawValue(...argumentList);
                        returnValue = proxy(value);
                    }
                    break;
                case 4 /* ENDPOINT */:
                    {
                        const { port1, port2 } = new MessageChannel();
                        expose(obj, port2);
                        returnValue = transfer(port1, [port1]);
                    }
                    break;
                case 5 /* RELEASE */:
                    {
                        returnValue = undefined;
                    }
                    break;
            }
        }
        catch (e) {
            returnValue = e;
            throwSet.add(e);
        }
        Promise.resolve(returnValue)
            .catch(e => {
            throwSet.add(e);
            return e;
        })
            .then(returnValue => {
            const [wireValue, transferables] = toWireValue(returnValue);
            ep.postMessage(Object.assign(Object.assign({}, wireValue), { id }), transferables);
            if (type === 5 /* RELEASE */) {
                // detach and deactive after sending release response above.
                ep.removeEventListener("message", callback);
                closeEndPoint(ep);
            }
        });
    });
    if (ep.start) {
        ep.start();
    }
}
function isMessagePort(endpoint) {
    return endpoint.constructor.name === "MessagePort";
}
function closeEndPoint(endpoint) {
    if (isMessagePort(endpoint))
        endpoint.close();
}
function wrap(ep, target) {
    return createProxy(ep, [], target);
}
function throwIfProxyReleased(isReleased) {
    if (isReleased) {
        throw new Error("Proxy has been released and is not useable");
    }
}
function createProxy(ep, path = [], target = function () { }) {
    let isProxyReleased = false;
    const proxy = new Proxy(target, {
        get(_target, prop) {
            throwIfProxyReleased(isProxyReleased);
            if (prop === releaseProxy) {
                return () => {
                    return requestResponseMessage(ep, {
                        type: 5 /* RELEASE */,
                        path: path.map(p => p.toString())
                    }).then(() => {
                        closeEndPoint(ep);
                        isProxyReleased = true;
                    });
                };
            }
            if (prop === "then") {
                if (path.length === 0) {
                    return { then: () => proxy };
                }
                const r = requestResponseMessage(ep, {
                    type: 0 /* GET */,
                    path: path.map(p => p.toString())
                }).then(fromWireValue);
                return r.then.bind(r);
            }
            return createProxy(ep, [...path, prop]);
        },
        set(_target, prop, rawValue) {
            throwIfProxyReleased(isProxyReleased);
            // FIXME: ES6 Proxy Handler `set` methods are supposed to return a
            // boolean. To show good will, we return true asynchronously ¯\_(ツ)_/¯
            const [value, transferables] = toWireValue(rawValue);
            return requestResponseMessage(ep, {
                type: 1 /* SET */,
                path: [...path, prop].map(p => p.toString()),
                value
            }, transferables).then(fromWireValue);
        },
        apply(_target, _thisArg, rawArgumentList) {
            throwIfProxyReleased(isProxyReleased);
            const last = path[path.length - 1];
            if (last === createEndpoint) {
                return requestResponseMessage(ep, {
                    type: 4 /* ENDPOINT */
                }).then(fromWireValue);
            }
            // We just pretend that `bind()` didn’t happen.
            if (last === "bind") {
                return createProxy(ep, path.slice(0, -1));
            }
            const [argumentList, transferables] = processArguments(rawArgumentList);
            return requestResponseMessage(ep, {
                type: 2 /* APPLY */,
                path: path.map(p => p.toString()),
                argumentList
            }, transferables).then(fromWireValue);
        },
        construct(_target, rawArgumentList) {
            throwIfProxyReleased(isProxyReleased);
            const [argumentList, transferables] = processArguments(rawArgumentList);
            return requestResponseMessage(ep, {
                type: 3 /* CONSTRUCT */,
                path: path.map(p => p.toString()),
                argumentList
            }, transferables).then(fromWireValue);
        }
    });
    return proxy;
}
function myFlat(arr) {
    return Array.prototype.concat.apply([], arr);
}
function processArguments(argumentList) {
    const processed = argumentList.map(toWireValue);
    return [processed.map(v => v[0]), myFlat(processed.map(v => v[1]))];
}
const transferCache = new WeakMap();
function transfer(obj, transfers) {
    transferCache.set(obj, transfers);
    return obj;
}
function proxy(obj) {
    return Object.assign(obj, { [proxyMarker]: true });
}
function windowEndpoint(w, context = self, targetOrigin = "*") {
    return {
        postMessage: (msg, transferables) => w.postMessage(msg, targetOrigin, transferables),
        addEventListener: context.addEventListener.bind(context),
        removeEventListener: context.removeEventListener.bind(context)
    };
}
function toWireValue(value) {
    for (const [name, handler] of transferHandlers) {
        if (handler.canHandle(value)) {
            const [serializedValue, transferables] = handler.serialize(value);
            return [
                {
                    type: 3 /* HANDLER */,
                    name,
                    value: serializedValue
                },
                transferables
            ];
        }
    }
    return [
        {
            type: 0 /* RAW */,
            value
        },
        transferCache.get(value) || []
    ];
}
function fromWireValue(value) {
    switch (value.type) {
        case 3 /* HANDLER */:
            return transferHandlers.get(value.name).deserialize(value.value);
        case 0 /* RAW */:
            return value.value;
    }
}
function requestResponseMessage(ep, msg, transfers) {
    return new Promise(resolve => {
        const id = generateUUID();
        ep.addEventListener("message", function l(ev) {
            if (!ev.data || !ev.data.id || ev.data.id !== id) {
                return;
            }
            ep.removeEventListener("message", l);
            resolve(ev.data);
        });
        if (ep.start) {
            ep.start();
        }
        ep.postMessage(Object.assign({ id }, msg), transfers);
    });
}
function generateUUID() {
    return new Array(4)
        .fill(0)
        .map(() => Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(16))
        .join("-");
}


//# sourceMappingURL=comlink.mjs.map


/***/ })

/******/ });
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vc3JjL2FwcC93b3JrZXJzL2hpZXJhcmNoeS53b3JrZXIudHMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2NvbWxpbmsvZGlzdC9lc20vY29tbGluay5tanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtRQUFBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBOzs7UUFHQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0EsMENBQTBDLGdDQUFnQztRQUMxRTtRQUNBOztRQUVBO1FBQ0E7UUFDQTtRQUNBLHdEQUF3RCxrQkFBa0I7UUFDMUU7UUFDQSxpREFBaUQsY0FBYztRQUMvRDs7UUFFQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0EseUNBQXlDLGlDQUFpQztRQUMxRSxnSEFBZ0gsbUJBQW1CLEVBQUU7UUFDckk7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQSwyQkFBMkIsMEJBQTBCLEVBQUU7UUFDdkQsaUNBQWlDLGVBQWU7UUFDaEQ7UUFDQTtRQUNBOztRQUVBO1FBQ0Esc0RBQXNELCtEQUErRDs7UUFFckg7UUFDQTs7O1FBR0E7UUFDQTs7Ozs7Ozs7Ozs7OztBQ2xGQTtBQUFBO0FBQUE7QUFBaUM7QUFDakM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtQ0FBbUM7QUFDbkM7QUFDQTtBQUNBLHFEQUFxRDtBQUNyRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsbUNBQW1DO0FBQ25DO0FBQ0E7QUFDQSxxREFBcUQ7QUFDckQscURBQXFEO0FBQ3JEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2IsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw0REFBNEQ7QUFDNUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDZCQUE2QjtBQUM3QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYixTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0JBQWdCO0FBQ2hCLFlBQVk7QUFDWjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLCtDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw4Q0FBOEM7QUFDOUM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EseUJBQXlCO0FBQ3pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHlCQUF5QjtBQUN6QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQSxzQ0FBc0M7QUFDdEM7QUFDQTtBQUNBO0FBQ0EsQ0FBQztBQUMwQjtBQUMzQjtBQUNBLEVBQUUsc0RBQU07QUFDUjtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUssR0FBRztBQUNSLEc7Ozs7Ozs7Ozs7OztBQ3RUQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsdUJBQXVCLGVBQWU7QUFDdEM7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGVBQWUsaUJBQWlCLGtCQUFrQixXQUFXO0FBQzdEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLCtCQUErQixlQUFlO0FBQzlDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQSx5REFBeUQsZUFBZSxLQUFLO0FBQzdFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1QsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMERBQTBELEVBQUU7QUFDNUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscUJBQXFCO0FBQ3JCO0FBQ0E7QUFDQSxxQkFBcUI7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQSw0QkFBNEI7QUFDNUI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYixTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwrQkFBK0Isc0JBQXNCO0FBQ3JEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBLHNDQUFzQyxLQUFLO0FBQzNDLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFc0g7QUFDdEgiLCJmaWxlIjoiNDYxYzI5MDI5ZWU5ZTY2ZDQ2YTYud29ya2VyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZ2V0dGVyIH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSBmdW5jdGlvbihleHBvcnRzKSB7XG4gXHRcdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuIFx0XHR9XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG4gXHR9O1xuXG4gXHQvLyBjcmVhdGUgYSBmYWtlIG5hbWVzcGFjZSBvYmplY3RcbiBcdC8vIG1vZGUgJiAxOiB2YWx1ZSBpcyBhIG1vZHVsZSBpZCwgcmVxdWlyZSBpdFxuIFx0Ly8gbW9kZSAmIDI6IG1lcmdlIGFsbCBwcm9wZXJ0aWVzIG9mIHZhbHVlIGludG8gdGhlIG5zXG4gXHQvLyBtb2RlICYgNDogcmV0dXJuIHZhbHVlIHdoZW4gYWxyZWFkeSBucyBvYmplY3RcbiBcdC8vIG1vZGUgJiA4fDE6IGJlaGF2ZSBsaWtlIHJlcXVpcmVcbiBcdF9fd2VicGFja19yZXF1aXJlX18udCA9IGZ1bmN0aW9uKHZhbHVlLCBtb2RlKSB7XG4gXHRcdGlmKG1vZGUgJiAxKSB2YWx1ZSA9IF9fd2VicGFja19yZXF1aXJlX18odmFsdWUpO1xuIFx0XHRpZihtb2RlICYgOCkgcmV0dXJuIHZhbHVlO1xuIFx0XHRpZigobW9kZSAmIDQpICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgdmFsdWUgJiYgdmFsdWUuX19lc01vZHVsZSkgcmV0dXJuIHZhbHVlO1xuIFx0XHR2YXIgbnMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLnIobnMpO1xuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkobnMsICdkZWZhdWx0JywgeyBlbnVtZXJhYmxlOiB0cnVlLCB2YWx1ZTogdmFsdWUgfSk7XG4gXHRcdGlmKG1vZGUgJiAyICYmIHR5cGVvZiB2YWx1ZSAhPSAnc3RyaW5nJykgZm9yKHZhciBrZXkgaW4gdmFsdWUpIF9fd2VicGFja19yZXF1aXJlX18uZChucywga2V5LCBmdW5jdGlvbihrZXkpIHsgcmV0dXJuIHZhbHVlW2tleV07IH0uYmluZChudWxsLCBrZXkpKTtcbiBcdFx0cmV0dXJuIG5zO1xuIFx0fTtcblxuIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbiBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiBcdFx0cmV0dXJuIGdldHRlcjtcbiBcdH07XG5cbiBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IFwiLi9ub2RlX21vZHVsZXMvY29tbGluay1sb2FkZXIvZGlzdC9jb21saW5rLXdvcmtlci1sb2FkZXIuanMhLi9ub2RlX21vZHVsZXMvdHMtbG9hZGVyL2luZGV4LmpzIS4vc3JjL2FwcC93b3JrZXJzL2hpZXJhcmNoeS53b3JrZXIudHNcIik7XG4iLCJpbXBvcnQgeyBleHBvc2UgfSBmcm9tICdjb21saW5rJztcbiAgdmFyIEhpZXJhcmNoeVdvcmtlciA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcbiAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgICAvLyBwdWJsaWMgYXBpXG4gICAgZnVuY3Rpb24gSGllcmFyY2h5V29ya2VyKCkge1xuICAgIH1cbiAgICBIaWVyYXJjaHlXb3JrZXIucHJvdG90eXBlLnJlZHVjZUFubm90YXRpb25Ub1ZpZXdhYmxlVGltZUFuZFBhdGggPSBmdW5jdGlvbiAoYW5ub3RhdGlvbiwgcGF0aCwgdmlld1BvcnRTdGFydFNhbXBsZSwgdmlld1BvcnRFbmRTYW1wbGUpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgdGhpcy5pZEhhc2hNYXAgPSB1bmRlZmluZWQ7IC8vIHJlc2V0IDQgICAgICAgXG4gICAgICAgIHRoaXMubGlua1N1YlRvU3VwZXJIYXNoTWFwID0gdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLmNyZWF0ZUlkSGFzaE1hcEZvclBhdGgocGF0aCwgYW5ub3RhdGlvbik7XG4gICAgICAgIHRoaXMuY3JlYXRlTGlua1N1YlRvU3VwZXJIYXNoTWFwKGFubm90YXRpb24pOyAvLyBmcm9tIGNoaWxkIHRvIHBhcmVudHNcbiAgICAgICAgdmFyIGNoaWxkTGV2ZWwgPSB0aGlzLnJlZHVjZVRvSXRlbXNXaXRoVGltZUluVmlldyhhbm5vdGF0aW9uLCBwYXRoLCB2aWV3UG9ydFN0YXJ0U2FtcGxlLCB2aWV3UG9ydEVuZFNhbXBsZSk7XG4gICAgICAgIC8vIGNsb25lIGFuZCBlbXB0eSBhbm5vdGF0aW9uXG4gICAgICAgIHZhciBhbm5vdGF0aW9uQ2xvbmUgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGFubm90YXRpb24pKTtcbiAgICAgICAgYW5ub3RhdGlvbkNsb25lLmxldmVscyA9IFtdO1xuICAgICAgICBhbm5vdGF0aW9uQ2xvbmUubGV2ZWxzLnB1c2goSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShjaGlsZExldmVsKSkpO1xuICAgICAgICBhbm5vdGF0aW9uQ2xvbmUubGlua3MgPSBbXTtcbiAgICAgICAgdmFyIHJlYWNoZWRUYXJnZXRMZXZlbCA9IGZhbHNlO1xuICAgICAgICBwYXRoLmZvckVhY2goZnVuY3Rpb24gKGxuLCBsbklkeCkge1xuICAgICAgICAgICAgaWYgKGxuICE9PSBwYXRoW3BhdGgubGVuZ3RoIC0gMV0pIHtcbiAgICAgICAgICAgICAgICBpZiAobG4gIT09IHBhdGhbcGF0aC5sZW5ndGggLSAxXSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgcGFyZW50TGV2ZWxDbG9uZSA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoX3RoaXMuZ2V0TGV2ZWxEZXRhaWxzKHBhdGhbbG5JZHggKyAxXSwgYW5ub3RhdGlvbikpKTtcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50TGV2ZWxDbG9uZS5pdGVtcyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICBfdGhpcy5naXZlVGltZVRvUGFyZW50c0FuZEFwcGVuZEl0ZW1zQW5kTGlua3MoYW5ub3RhdGlvbkNsb25lLCBwYXJlbnRMZXZlbENsb25lLCBjaGlsZExldmVsKTtcbiAgICAgICAgICAgICAgICAgICAgYW5ub3RhdGlvbkNsb25lLmxldmVscy5wdXNoKHBhcmVudExldmVsQ2xvbmUpO1xuICAgICAgICAgICAgICAgICAgICBjaGlsZExldmVsID0gYW5ub3RhdGlvbkNsb25lLmxldmVsc1thbm5vdGF0aW9uQ2xvbmUubGV2ZWxzLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBhbm5vdGF0aW9uQ2xvbmU7XG4gICAgfTtcbiAgICAvKipcbiAgICAqIHJldHVybnMgbGV2ZWwgZGV0YWlscyBieSBwYXNzaW5nIGluIGxldmVsIG5hbWVcbiAgICAqIGlmIHRoZSBjb3JyZXNwb25kaW5nIGxldmVsIGV4aXN0c1xuICAgICogb3RoZXJ3aXNlIHJldHVybnMgJ251bGwnXG4gICAgKiAgICBAcGFyYW0gbmFtZVxuICAgICovXG4gICAgSGllcmFyY2h5V29ya2VyLnByb3RvdHlwZS5nZXRMZXZlbERldGFpbHMgPSBmdW5jdGlvbiAobmFtZSwgYW5ub3RhdGlvbikge1xuICAgICAgICB2YXIgcmV0ID0gbnVsbDtcbiAgICAgICAgYW5ub3RhdGlvbi5sZXZlbHMuZm9yRWFjaChmdW5jdGlvbiAobGV2ZWwpIHtcbiAgICAgICAgICAgIGlmIChsZXZlbC5uYW1lID09PSBuYW1lKSB7XG4gICAgICAgICAgICAgICAgcmV0ID0gbGV2ZWw7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gcmV0O1xuICAgIH07XG4gICAgO1xuICAgIC8qKlxuICAgICAqXG4gICAgICogQHBhcmFtIGFubm90YXRpb24gYW5ub3RhdGlvbiB0byBndWVzcyBMaW5rRGVmaW5pdGlvbnMgZnJvbVxuICAgICAqL1xuICAgIEhpZXJhcmNoeVdvcmtlci5wcm90b3R5cGUuZ3Vlc3NMaW5rRGVmaW5pdGlvbnMgPSBmdW5jdGlvbiAoYW5ub3RhdGlvbikge1xuICAgICAgICAvLyBjb25zb2xlLmxvZyhhbm5vdGF0aW9uKVxuICAgICAgICB0aGlzLmlkSGFzaE1hcCA9IHVuZGVmaW5lZDsgLy8gcmVzZXQgNCAgICAgICBcbiAgICAgICAgdGhpcy5saW5rU3ViVG9TdXBlckhhc2hNYXAgPSB1bmRlZmluZWQ7XG4gICAgICAgIHRoaXMuY3JlYXRlSWRIYXNoTWFwRm9yRXZlcnlMZXZlbChhbm5vdGF0aW9uKTtcbiAgICAgICAgdGhpcy5jcmVhdGVMaW5rU3ViVG9TdXBlckhhc2hNYXAoYW5ub3RhdGlvbik7IC8vIGZyb20gY2hpbGQgdG8gcGFyZW50c1xuICAgICAgICB0aGlzLmNyZWF0ZUxpbmtTdXBlclRvU3ViSGFzaE1hcChhbm5vdGF0aW9uKTsgLy8gZnJvbSBwYXJlbnQgdG8gY2hpbGRyZW5cbiAgICAgICAgLy8gY29uc29sZS5sb2codGhpcy5pZEhhc2hNYXApO1xuICAgICAgICAvLyBjb25zb2xlLmxvZyh0aGlzLmxpbmtTdWJUb1N1cGVySGFzaE1hcCk7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKHRoaXMubGlua1N1cGVyVG9TdWJIYXNoTWFwKTtcbiAgICAgICAgdmFyIGxpbmtEZWZzU3VwZXJUb1N1YiA9IHRoaXMuZmluZEFsbExpbmtEZWZzKHRoaXMubGlua1N1cGVyVG9TdWJIYXNoTWFwLCBmYWxzZSk7XG4gICAgICAgIHZhciBsaW5rRGVmc1N1YlRvU3VwZXIgPSB0aGlzLmZpbmRBbGxMaW5rRGVmcyh0aGlzLmxpbmtTdWJUb1N1cGVySGFzaE1hcCwgdHJ1ZSk7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKGxpbmtEZWZzU3VwZXJUb1N1Yik7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKGxpbmtEZWZzU3ViVG9TdXBlcik7XG4gICAgICAgIGxpbmtEZWZzU3VwZXJUb1N1Yi5mb3JFYWNoKGZ1bmN0aW9uIChsaW5rRGVmU3VwZXJUb1N1Yikge1xuICAgICAgICAgICAgbGlua0RlZnNTdWJUb1N1cGVyLmZvckVhY2goZnVuY3Rpb24gKGxpbmtEZWZTdWJUb1N1cGVyKSB7XG4gICAgICAgICAgICAgICAgaWYgKGxpbmtEZWZTdXBlclRvU3ViLnN1cGVybGV2ZWxOYW1lID09PSBsaW5rRGVmU3ViVG9TdXBlci5zdXBlcmxldmVsTmFtZSAmJiBsaW5rRGVmU3VwZXJUb1N1Yi5zdWJsZXZlbE5hbWUgPT09IGxpbmtEZWZTdWJUb1N1cGVyLnN1YmxldmVsTmFtZSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAobGlua0RlZlN1cGVyVG9TdWIudHlwZSA9PT0gXCJPTkVfVE9fT05FXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbmtEZWZTdXBlclRvU3ViLnR5cGUgPSBsaW5rRGVmU3ViVG9TdXBlci50eXBlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGxpbmtEZWZTdXBlclRvU3ViLnR5cGUgPT09IFwiT05FX1RPX01BTllcIiAmJiBsaW5rRGVmU3ViVG9TdXBlci50eXBlID09PSBcIk1BTllfVE9fTUFOWVwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsaW5rRGVmU3VwZXJUb1N1Yi50eXBlID0gbGlua0RlZlN1YlRvU3VwZXIudHlwZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIChsaW5rRGVmc1N1cGVyVG9TdWIpO1xuICAgIH07XG4gICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4gICAgLy8gcHJpdmF0ZSBhcGlcbiAgICBIaWVyYXJjaHlXb3JrZXIucHJvdG90eXBlLnJlZHVjZVRvSXRlbXNXaXRoVGltZUluVmlldyA9IGZ1bmN0aW9uIChhbm5vdGF0aW9uLCBwYXRoLCB2aWV3UG9ydFN0YXJ0U2FtcGxlLCB2aWV3UG9ydEVuZFNhbXBsZSkge1xuICAgICAgICB2YXIgc3ViTGV2ZWxXaXRoVGltZSA9IHRoaXMuZ2V0TGV2ZWxEZXRhaWxzKHBhdGhbMF0sIGFubm90YXRpb24pO1xuICAgICAgICB2YXIgc3ViTGV2ZWxXaXRoVGltZUNsb25lID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShzdWJMZXZlbFdpdGhUaW1lKSk7XG4gICAgICAgIHN1YkxldmVsV2l0aFRpbWVDbG9uZS5pdGVtcyA9IFtdO1xuICAgICAgICAvLyBsZXQgaXRlbXNJblZpZXcgPSBbXTtcbiAgICAgICAgc3ViTGV2ZWxXaXRoVGltZS5pdGVtcy5mb3JFYWNoKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICAgICAgICBpZiAoaXRlbS5zYW1wbGVTdGFydCArIGl0ZW0uc2FtcGxlRHVyID4gdmlld1BvcnRTdGFydFNhbXBsZSAmJiBpdGVtLnNhbXBsZVN0YXJ0IDwgdmlld1BvcnRFbmRTYW1wbGUpIHtcbiAgICAgICAgICAgICAgICBzdWJMZXZlbFdpdGhUaW1lQ2xvbmUuaXRlbXMucHVzaChpdGVtKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBzdWJMZXZlbFdpdGhUaW1lQ2xvbmU7XG4gICAgfTtcbiAgICBIaWVyYXJjaHlXb3JrZXIucHJvdG90eXBlLmdpdmVUaW1lVG9QYXJlbnRzQW5kQXBwZW5kSXRlbXNBbmRMaW5rcyA9IGZ1bmN0aW9uIChhbm5vdGF0aW9uLCBwYXJlbnRMZXZlbCwgY2hpbGRMZXZlbCkge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICBjaGlsZExldmVsLml0ZW1zLmZvckVhY2goZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgICAgICAgIHZhciBwYXJlbnRJZHMgPSBfdGhpcy5saW5rU3ViVG9TdXBlckhhc2hNYXAuZ2V0KGl0ZW0uaWQpO1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBwYXJlbnRJZHMgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgcGFyZW50SWRzLmZvckVhY2goZnVuY3Rpb24gKHBhcmVudElkKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBwYXJlbnRJdGVtID0gX3RoaXMuaWRIYXNoTWFwLmdldChwYXJlbnRJZCk7XG4gICAgICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKHBhcmVudElkKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2cocGFyZW50SXRlbSk7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgcGFyZW50SXRlbSAhPT0gJ3VuZGVmaW5lZCcpIHsgLy8gYXMgb25seSBsZXZlbHMgaW4gcGF0aCBhcmUgaW4gaWRIYXNoTWFwIFxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHBhcmVudEl0ZW0ubGFiZWxzWzBdLm5hbWUgPT09IHBhcmVudExldmVsLm5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBhcHBlbmQgbGlua1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFubm90YXRpb24ubGlua3MucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZyb21JRDogcGFyZW50SWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvSUQ6IGl0ZW0uaWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBhZGQgdGltZSBpbmZvXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBwYXJlbnRJdGVtLnNhbXBsZVN0YXJ0ID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnRJdGVtLnNhbXBsZVN0YXJ0ID0gaXRlbS5zYW1wbGVTdGFydDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyZW50SXRlbS5zYW1wbGVEdXIgPSBpdGVtLnNhbXBsZUR1cjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoaXRlbS5zYW1wbGVTdGFydCA8IHBhcmVudEl0ZW0uc2FtcGxlU3RhcnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyZW50SXRlbS5zYW1wbGVTdGFydCA9IGl0ZW0uc2FtcGxlU3RhcnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGl0ZW0uc2FtcGxlU3RhcnQgKyBpdGVtLnNhbXBsZUR1ciA+IHBhcmVudEl0ZW0uc2FtcGxlU3RhcnQgKyBwYXJlbnRJdGVtLnNhbXBsZUR1cikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnRJdGVtLnNhbXBsZUR1ciA9IGl0ZW0uc2FtcGxlU3RhcnQgKyBpdGVtLnNhbXBsZUR1ciAtIHBhcmVudEl0ZW0uc2FtcGxlU3RhcnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGFwcGVuZCBpdGVtXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyZW50TGV2ZWwuaXRlbXMucHVzaChwYXJlbnRJdGVtKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAvLyBjaGVjayBpZiBwYXJlbnQgaXMgb24gcmlnaHQgbGV2ZWxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfTtcbiAgICBIaWVyYXJjaHlXb3JrZXIucHJvdG90eXBlLmdpdmVUaW1lVG9QYXJlbnRzID0gZnVuY3Rpb24gKGxldmVsTmFtZSwgYW5ub3RhdGlvbiwgc3ViTGV2ZWxXaXRoVGltZSkge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICB2YXIgbGV2ZWw7XG4gICAgICAgIGlmIChsZXZlbE5hbWUgPT09IHN1YkxldmVsV2l0aFRpbWUubmFtZSkge1xuICAgICAgICAgICAgbGV2ZWwgPSBzdWJMZXZlbFdpdGhUaW1lO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgbGV2ZWwgPSB0aGlzLmdldExldmVsRGV0YWlscyhsZXZlbE5hbWUsIGFubm90YXRpb24pO1xuICAgICAgICB9XG4gICAgICAgIGxldmVsLml0ZW1zLmZvckVhY2goZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgICAgICAgIHZhciBwYXJlbnRJZCA9IF90aGlzLmxpbmtTdWJUb1N1cGVySGFzaE1hcC5nZXQoaXRlbS5pZCk7XG4gICAgICAgICAgICB2YXIgcGFyZW50cyA9IF90aGlzLmlkSGFzaE1hcC5nZXQocGFyZW50SWQpO1xuICAgICAgICAgICAgaWYgKHBhcmVudHMpIHtcbiAgICAgICAgICAgICAgICBwYXJlbnRzLmZvckVhY2goZnVuY3Rpb24gKHBhcmVudCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHBhcmVudC5zYW1wbGVTdGFydCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudC5zYW1wbGVTdGFydCA9IGl0ZW0uc2FtcGxlU3RhcnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnQuc2FtcGxlRHVyID0gaXRlbS5zYW1wbGVEdXI7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoaXRlbS5zYW1wbGVTdGFydCA8IHBhcmVudC5zYW1wbGVTdGFydCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcGFyZW50LnNhbXBsZVN0YXJ0ID0gaXRlbS5zYW1wbGVTdGFydDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChpdGVtLnNhbXBsZVN0YXJ0ICsgaXRlbS5zYW1wbGVEdXIgPiBwYXJlbnQuc2FtcGxlU3RhcnQgKyBwYXJlbnQuc2FtcGxlRHVyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnQuc2FtcGxlRHVyID0gaXRlbS5zYW1wbGVTdGFydCArIGl0ZW0uc2FtcGxlRHVyIC0gcGFyZW50LnNhbXBsZVN0YXJ0O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH07XG4gICAgSGllcmFyY2h5V29ya2VyLnByb3RvdHlwZS5jcmVhdGVJZEhhc2hNYXBGb3JQYXRoID0gZnVuY3Rpb24gKHBhdGgsIGFubm90YXRpb24pIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgdGhpcy5pZEhhc2hNYXAgPSBuZXcgTWFwKCk7XG4gICAgICAgIHBhdGguZm9yRWFjaChmdW5jdGlvbiAobGV2ZWxOYW1lKSB7XG4gICAgICAgICAgICB2YXIgbGV2ZWwgPSBfdGhpcy5nZXRMZXZlbERldGFpbHMobGV2ZWxOYW1lLCBhbm5vdGF0aW9uKTtcbiAgICAgICAgICAgIGxldmVsLml0ZW1zLmZvckVhY2goZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgICAgICAgICAgICBfdGhpcy5pZEhhc2hNYXAuc2V0KGl0ZW0uaWQsIGl0ZW0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH07XG4gICAgSGllcmFyY2h5V29ya2VyLnByb3RvdHlwZS5jcmVhdGVJZEhhc2hNYXBGb3JFdmVyeUxldmVsID0gZnVuY3Rpb24gKGFubm90YXRpb24pIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgdGhpcy5pZEhhc2hNYXAgPSBuZXcgTWFwKCk7XG4gICAgICAgIGFubm90YXRpb24ubGV2ZWxzLmZvckVhY2goZnVuY3Rpb24gKGxldmVsKSB7XG4gICAgICAgICAgICBsZXZlbC5pdGVtcy5mb3JFYWNoKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICAgICAgICAgICAgX3RoaXMuaWRIYXNoTWFwLnNldChpdGVtLmlkLCBpdGVtKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9O1xuICAgIEhpZXJhcmNoeVdvcmtlci5wcm90b3R5cGUuY3JlYXRlTGlua1N1YlRvU3VwZXJIYXNoTWFwID0gZnVuY3Rpb24gKGFubm90YXRpb24pIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgdGhpcy5saW5rU3ViVG9TdXBlckhhc2hNYXAgPSBuZXcgTWFwKCk7XG4gICAgICAgIGFubm90YXRpb24ubGlua3MuZm9yRWFjaChmdW5jdGlvbiAobGluaykge1xuICAgICAgICAgICAgaWYgKCFfdGhpcy5saW5rU3ViVG9TdXBlckhhc2hNYXAuaGFzKGxpbmsudG9JRCkpIHtcbiAgICAgICAgICAgICAgICBfdGhpcy5saW5rU3ViVG9TdXBlckhhc2hNYXAuc2V0KGxpbmsudG9JRCwgW2xpbmsuZnJvbUlEXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB2YXIgcHJldlBhcmVudHMgPSBfdGhpcy5saW5rU3ViVG9TdXBlckhhc2hNYXAuZ2V0KGxpbmsudG9JRCk7XG4gICAgICAgICAgICAgICAgcHJldlBhcmVudHMucHVzaChsaW5rLmZyb21JRCk7XG4gICAgICAgICAgICAgICAgX3RoaXMubGlua1N1YlRvU3VwZXJIYXNoTWFwLnNldChsaW5rLnRvSUQsIHByZXZQYXJlbnRzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfTtcbiAgICBIaWVyYXJjaHlXb3JrZXIucHJvdG90eXBlLmNyZWF0ZUxpbmtTdXBlclRvU3ViSGFzaE1hcCA9IGZ1bmN0aW9uIChhbm5vdGF0aW9uKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgIHRoaXMubGlua1N1cGVyVG9TdWJIYXNoTWFwID0gbmV3IE1hcCgpO1xuICAgICAgICBhbm5vdGF0aW9uLmxpbmtzLmZvckVhY2goZnVuY3Rpb24gKGxpbmspIHtcbiAgICAgICAgICAgIGlmICghX3RoaXMubGlua1N1cGVyVG9TdWJIYXNoTWFwLmhhcyhsaW5rLmZyb21JRCkpIHtcbiAgICAgICAgICAgICAgICBfdGhpcy5saW5rU3VwZXJUb1N1Ykhhc2hNYXAuc2V0KGxpbmsuZnJvbUlELCBbbGluay50b0lEXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB2YXIgcHJldkNoaWxkcmVuID0gX3RoaXMubGlua1N1cGVyVG9TdWJIYXNoTWFwLmdldChsaW5rLmZyb21JRCk7XG4gICAgICAgICAgICAgICAgcHJldkNoaWxkcmVuLnB1c2gobGluay50b0lEKTtcbiAgICAgICAgICAgICAgICBfdGhpcy5saW5rU3VwZXJUb1N1Ykhhc2hNYXAuc2V0KGxpbmsuZnJvbUlELCBwcmV2Q2hpbGRyZW4pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9O1xuICAgIC8vIHByaXZhdGUgd2Fsa0FuZEFwcGVuZFRvTGlua0RlZmluaXRpb25zKGtleSwgcGF0aCwgZm91bmRQYXRocywgbGlua0hhc2hNYXApe1xuICAgIC8vICAgICAvLyBhZGQgdG8gcGF0aCBvbmx5IGlmIHdlIGhhdm4ndCB2aXNpdGVkIGl0IHlldFxuICAgIC8vICAgICBsZXQgaXRlbSA9IHRoaXMuaWRIYXNoTWFwLmdldChrZXkpO1xuICAgIC8vICAgICBsZXQgY3VyTGV2ZWxOYW1lID0gaXRlbS5sYWJlbHNbMF0ubmFtZTtcbiAgICAvLyAgICAgaWYoIXBhdGguaW5jbHVkZXMoY3VyTGV2ZWxOYW1lKSl7XG4gICAgLy8gICAgICAgICBwYXRoLnB1c2goY3VyTGV2ZWxOYW1lKTtcbiAgICAvLyAgICAgfVxuICAgIC8vICAgICAvLyBnZXQgdmFsdWVzXG4gICAgLy8gICAgIGxldCB2YWx1ZXMgPSBsaW5rSGFzaE1hcC5nZXQoa2V5KTtcbiAgICAvLyAgICAgaWYodHlwZW9mIHZhbHVlcyAhPT0gXCJ1bmRlZmluZWRcIil7XG4gICAgLy8gICAgICAgICB2YWx1ZXMuZm9yRWFjaCgoY29ubmVjdGVkSXRlbUlkKSA9PiB7XG4gICAgLy8gICAgICAgICAgICAgLy8gbGV0IGl0ZW0gPSB0aGlzLmlkSGFzaE1hcC5nZXQoY29ubmVjdGVkSXRlbUlkKTtcbiAgICAvLyAgICAgICAgICAgICAvLyBwYXRoLnB1c2goaXRlbS5sYWJlbHNbMF0ubmFtZSk7XG4gICAgLy8gICAgICAgICAgICAgdGhpcy53YWxrQW5kQXBwZW5kVG9MaW5rRGVmaW5pdGlvbnMoY29ubmVjdGVkSXRlbUlkLCBwYXRoLCBmb3VuZFBhdGhzLCBsaW5rSGFzaE1hcCk7XG4gICAgLy8gICAgICAgICB9KVxuICAgIC8vICAgICB9IGVsc2Uge1xuICAgIC8vICAgICAgICAgLy8gcmVhY2hlZCBlbmQgb2YgcGF0aCBcbiAgICAvLyAgICAgICAgIC8vIC0+IGFwcGVuZCB0byBmb3VuZFBhdGhzICsgcmVzZXQgcGF0aFxuICAgIC8vICAgICAgICAgLy8gZm91bmRQYXRocy5wdXNoKHBhdGguam9pbignIOKGkiAnKSk7XG4gICAgLy8gICAgICAgICAvLyBwYXRoID0gW107XG4gICAgLy8gICAgIH1cbiAgICAvLyB9XG4gICAgLy8gcHJvYmFibHkgc2hvdWxkIG1vdmUgdGhpcyB0byBzZXJ2aWNlXG4gICAgLy8gcHJpdmF0ZSBvbmx5VW5pcXVlKHZhbHVlLCBpbmRleCwgc2VsZikgeyBcbiAgICAvLyAgICAgcmV0dXJuIHNlbGYuaW5kZXhPZih2YWx1ZSkgPT09IGluZGV4O1xuICAgIC8vIH1cbiAgICBIaWVyYXJjaHlXb3JrZXIucHJvdG90eXBlLmZpbmRBbGxMaW5rRGVmcyA9IGZ1bmN0aW9uIChsaW5rSGFzaE1hcCwgcmV2ZXJzZSkge1xuICAgICAgICAvLyBjb25zb2xlLmxvZyhcImluIGZpbmRBbGxMaW5rRGVmc1wiKTtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgdmFyIGZvdW5kTGlua0RlZnMgPSBbXTtcbiAgICAgICAgdmFyIGZvdW5kTGlua0RlZlN0cmluZ3MgPSBbXTtcbiAgICAgICAgLy8gbG9vcCB0aHJvdWdoIG1hcFxuICAgICAgICBsaW5rSGFzaE1hcC5mb3JFYWNoKGZ1bmN0aW9uICh2YWx1ZXMsIGtleSwgbWFwKSB7XG4gICAgICAgICAgICB2YXIgY29ubmVjdGVkTGV2ZWxzID0gW107XG4gICAgICAgICAgICAvLyBpZihbMTczXS5pbmRleE9mKGtleSkgIT09IC0xKSB7IC8vIG9ubHkgc3RhcnQgYXQgOCBmb3Igbm93XG4gICAgICAgICAgICB2YXIgc3RhcnRJdGVtID0gX3RoaXMuaWRIYXNoTWFwLmdldChrZXkpO1xuICAgICAgICAgICAgdmFyIHN0YXJ0TGV2ZWxOYW1lID0gc3RhcnRJdGVtLmxhYmVsc1swXS5uYW1lO1xuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coXCJzdGFydExldmVsTmFtZTpcIiwgc3RhcnRMZXZlbE5hbWUpO1xuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coXCJrZXk6XCIsIGtleSk7XG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhcInZhbHVlczpcIiwgdmFsdWVzKTtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwibWFwOlwiLCBtYXApO1xuICAgICAgICAgICAgdmFsdWVzLmZvckVhY2goZnVuY3Rpb24gKGNvbm5lY3RlZEl0ZW1JZCkge1xuICAgICAgICAgICAgICAgIHZhciBjb25uZWN0ZWRJdGVtID0gX3RoaXMuaWRIYXNoTWFwLmdldChjb25uZWN0ZWRJdGVtSWQpO1xuICAgICAgICAgICAgICAgIHZhciBjb25uZWN0ZWRJdGVtTGV2ZWxOYW1lID0gY29ubmVjdGVkSXRlbS5sYWJlbHNbMF0ubmFtZTtcbiAgICAgICAgICAgICAgICB2YXIgbGlua0RlZlR5cGU7XG4gICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coXCJjb25uZWN0ZWRJdGVtTGV2ZWxOYW1lOlwiLCBjb25uZWN0ZWRJdGVtTGV2ZWxOYW1lKTtcbiAgICAgICAgICAgICAgICBpZiAoY29ubmVjdGVkTGV2ZWxzLmluZGV4T2YoY29ubmVjdGVkSXRlbUxldmVsTmFtZSkgPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbm5lY3RlZExldmVscy5wdXNoKGNvbm5lY3RlZEl0ZW1MZXZlbE5hbWUpO1xuICAgICAgICAgICAgICAgICAgICBsaW5rRGVmVHlwZSA9IFwiT05FX1RPX09ORVwiO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFyZXZlcnNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsaW5rRGVmVHlwZSA9IFwiT05FX1RPX01BTllcIjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbmtEZWZUeXBlID0gXCJNQU5ZX1RPX01BTllcIjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyB0aGlzIGFsc28gZGVwZW5kcyBvbiByZXZlcnNlXG4gICAgICAgICAgICAgICAgdmFyIGxpbmtEZWZTdHJpbmcgPSBzdGFydExldmVsTmFtZSArICcg4oaSICcgKyBjb25uZWN0ZWRJdGVtTGV2ZWxOYW1lO1xuICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKGxpbmtEZWZTdHJpbmcpO1xuICAgICAgICAgICAgICAgIGlmIChmb3VuZExpbmtEZWZTdHJpbmdzLmluZGV4T2YobGlua0RlZlN0cmluZykgPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgIGZvdW5kTGlua0RlZlN0cmluZ3MucHVzaChsaW5rRGVmU3RyaW5nKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFyZXZlcnNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3VuZExpbmtEZWZzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IGxpbmtEZWZUeXBlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1cGVybGV2ZWxOYW1lOiBzdGFydExldmVsTmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdWJsZXZlbE5hbWU6IGNvbm5lY3RlZEl0ZW1MZXZlbE5hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgZm91bmRMaW5rRGVmcy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBsaW5rRGVmVHlwZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdXBlcmxldmVsTmFtZTogY29ubmVjdGVkSXRlbUxldmVsTmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdWJsZXZlbE5hbWU6IHN0YXJ0TGV2ZWxOYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gdXBkYXRlIHR5cGUgKG9ubHkgaW4gdXBncmFkYWJsZSBkaXJlY3Rpb24pXG4gICAgICAgICAgICAgICAgICAgIGlmIChmb3VuZExpbmtEZWZzW2ZvdW5kTGlua0RlZlN0cmluZ3MuaW5kZXhPZihsaW5rRGVmU3RyaW5nKV0udHlwZSA9PT0gXCJPTkVfVE9fT05FXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvdW5kTGlua0RlZnNbZm91bmRMaW5rRGVmU3RyaW5ncy5pbmRleE9mKGxpbmtEZWZTdHJpbmcpXS50eXBlID0gbGlua0RlZlR5cGU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoZm91bmRMaW5rRGVmc1tmb3VuZExpbmtEZWZTdHJpbmdzLmluZGV4T2YobGlua0RlZlN0cmluZyldLnR5cGUgPT09IFwiT05FX1RPX01BTllcIiAmJiBsaW5rRGVmVHlwZSA9PT0gXCJNQU5ZX1RPX01BTllcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgZm91bmRMaW5rRGVmc1tmb3VuZExpbmtEZWZTdHJpbmdzLmluZGV4T2YobGlua0RlZlN0cmluZyldLnR5cGUgPSBsaW5rRGVmVHlwZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgLy8gfVxuICAgICAgICB9KTtcbiAgICAgICAgLy8gY29uc29sZS5sb2coXCItLS0tLS0tLS0tLS1cIik7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKGZvdW5kTGlua0RlZlN0cmluZ3MpO1xuICAgICAgICAvLyBjb25zb2xlLmxvZyhmb3VuZExpbmtEZWZzKTsgLy8gZm91bmRMaW5rRGVmcy5maWx0ZXIodGhpcy5vbmx5VW5pcXVlKVxuICAgICAgICByZXR1cm4gKGZvdW5kTGlua0RlZnMpO1xuICAgIH07XG4gICAgcmV0dXJuIEhpZXJhcmNoeVdvcmtlcjtcbn0oKSk7XG5leHBvcnQgeyBIaWVyYXJjaHlXb3JrZXIgfTtcbjtcbiAgZXhwb3NlKFxuICAgIE9iamVjdC5rZXlzKF9fd2VicGFja19leHBvcnRzX18pLnJlZHVjZShmdW5jdGlvbihyLGspe1xuICAgICAgaWYgKGs9PSdfX2VzTW9kdWxlJykgcmV0dXJuIHI7XG4gICAgICByW2tdID0gX193ZWJwYWNrX2V4cG9ydHNfX1trXTtcbiAgICAgIHJldHVybiByXG4gICAgfSx7fSlcbiAgKSIsIi8qKlxyXG4gKiBDb3B5cmlnaHQgMjAxOSBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxyXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xyXG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXHJcbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxyXG4gKiAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXHJcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcclxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxyXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cclxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxyXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cclxuICovXHJcbmNvbnN0IHByb3h5TWFya2VyID0gU3ltYm9sKFwiQ29tbGluay5wcm94eVwiKTtcclxuY29uc3QgY3JlYXRlRW5kcG9pbnQgPSBTeW1ib2woXCJDb21saW5rLmVuZHBvaW50XCIpO1xyXG5jb25zdCByZWxlYXNlUHJveHkgPSBTeW1ib2woXCJDb21saW5rLnJlbGVhc2VQcm94eVwiKTtcclxuY29uc3QgdGhyb3dTZXQgPSBuZXcgV2Vha1NldCgpO1xyXG5jb25zdCB0cmFuc2ZlckhhbmRsZXJzID0gbmV3IE1hcChbXHJcbiAgICBbXHJcbiAgICAgICAgXCJwcm94eVwiLFxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY2FuSGFuZGxlOiBvYmogPT4gb2JqICYmIG9ialtwcm94eU1hcmtlcl0sXHJcbiAgICAgICAgICAgIHNlcmlhbGl6ZShvYmopIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHsgcG9ydDEsIHBvcnQyIH0gPSBuZXcgTWVzc2FnZUNoYW5uZWwoKTtcclxuICAgICAgICAgICAgICAgIGV4cG9zZShvYmosIHBvcnQxKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBbcG9ydDIsIFtwb3J0Ml1dO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBkZXNlcmlhbGl6ZTogKHBvcnQpID0+IHtcclxuICAgICAgICAgICAgICAgIHBvcnQuc3RhcnQoKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB3cmFwKHBvcnQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgXSxcclxuICAgIFtcclxuICAgICAgICBcInRocm93XCIsXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjYW5IYW5kbGU6IG9iaiA9PiB0aHJvd1NldC5oYXMob2JqKSxcclxuICAgICAgICAgICAgc2VyaWFsaXplKG9iaikge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgaXNFcnJvciA9IG9iaiBpbnN0YW5jZW9mIEVycm9yO1xyXG4gICAgICAgICAgICAgICAgbGV0IHNlcmlhbGl6ZWQgPSBvYmo7XHJcbiAgICAgICAgICAgICAgICBpZiAoaXNFcnJvcikge1xyXG4gICAgICAgICAgICAgICAgICAgIHNlcmlhbGl6ZWQgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlzRXJyb3IsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IG9iai5tZXNzYWdlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGFjazogb2JqLnN0YWNrXHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiBbc2VyaWFsaXplZCwgW11dO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBkZXNlcmlhbGl6ZShvYmopIHtcclxuICAgICAgICAgICAgICAgIGlmIChvYmouaXNFcnJvcikge1xyXG4gICAgICAgICAgICAgICAgICAgIHRocm93IE9iamVjdC5hc3NpZ24obmV3IEVycm9yKCksIG9iaik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBvYmo7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICBdXHJcbl0pO1xyXG5mdW5jdGlvbiBleHBvc2Uob2JqLCBlcCA9IHNlbGYpIHtcclxuICAgIGVwLmFkZEV2ZW50TGlzdGVuZXIoXCJtZXNzYWdlXCIsIGZ1bmN0aW9uIGNhbGxiYWNrKGV2KSB7XHJcbiAgICAgICAgaWYgKCFldiB8fCAhZXYuZGF0YSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IHsgaWQsIHR5cGUsIHBhdGggfSA9IE9iamVjdC5hc3NpZ24oeyBwYXRoOiBbXSB9LCBldi5kYXRhKTtcclxuICAgICAgICBjb25zdCBhcmd1bWVudExpc3QgPSAoZXYuZGF0YS5hcmd1bWVudExpc3QgfHwgW10pLm1hcChmcm9tV2lyZVZhbHVlKTtcclxuICAgICAgICBsZXQgcmV0dXJuVmFsdWU7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgY29uc3QgcGFyZW50ID0gcGF0aC5zbGljZSgwLCAtMSkucmVkdWNlKChvYmosIHByb3ApID0+IG9ialtwcm9wXSwgb2JqKTtcclxuICAgICAgICAgICAgY29uc3QgcmF3VmFsdWUgPSBwYXRoLnJlZHVjZSgob2JqLCBwcm9wKSA9PiBvYmpbcHJvcF0sIG9iaik7XHJcbiAgICAgICAgICAgIHN3aXRjaCAodHlwZSkge1xyXG4gICAgICAgICAgICAgICAgY2FzZSAwIC8qIEdFVCAqLzpcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVyblZhbHVlID0gcmF3VmFsdWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAxIC8qIFNFVCAqLzpcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudFtwYXRoLnNsaWNlKC0xKVswXV0gPSBmcm9tV2lyZVZhbHVlKGV2LmRhdGEudmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm5WYWx1ZSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAyIC8qIEFQUExZICovOlxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuVmFsdWUgPSByYXdWYWx1ZS5hcHBseShwYXJlbnQsIGFyZ3VtZW50TGlzdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAzIC8qIENPTlNUUlVDVCAqLzpcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gbmV3IHJhd1ZhbHVlKC4uLmFyZ3VtZW50TGlzdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVyblZhbHVlID0gcHJveHkodmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgNCAvKiBFTkRQT0lOVCAqLzpcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHsgcG9ydDEsIHBvcnQyIH0gPSBuZXcgTWVzc2FnZUNoYW5uZWwoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZXhwb3NlKG9iaiwgcG9ydDIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm5WYWx1ZSA9IHRyYW5zZmVyKHBvcnQxLCBbcG9ydDFdKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDUgLyogUkVMRUFTRSAqLzpcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVyblZhbHVlID0gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICByZXR1cm5WYWx1ZSA9IGU7XHJcbiAgICAgICAgICAgIHRocm93U2V0LmFkZChlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgUHJvbWlzZS5yZXNvbHZlKHJldHVyblZhbHVlKVxyXG4gICAgICAgICAgICAuY2F0Y2goZSA9PiB7XHJcbiAgICAgICAgICAgIHRocm93U2V0LmFkZChlKTtcclxuICAgICAgICAgICAgcmV0dXJuIGU7XHJcbiAgICAgICAgfSlcclxuICAgICAgICAgICAgLnRoZW4ocmV0dXJuVmFsdWUgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBbd2lyZVZhbHVlLCB0cmFuc2ZlcmFibGVzXSA9IHRvV2lyZVZhbHVlKHJldHVyblZhbHVlKTtcclxuICAgICAgICAgICAgZXAucG9zdE1lc3NhZ2UoT2JqZWN0LmFzc2lnbihPYmplY3QuYXNzaWduKHt9LCB3aXJlVmFsdWUpLCB7IGlkIH0pLCB0cmFuc2ZlcmFibGVzKTtcclxuICAgICAgICAgICAgaWYgKHR5cGUgPT09IDUgLyogUkVMRUFTRSAqLykge1xyXG4gICAgICAgICAgICAgICAgLy8gZGV0YWNoIGFuZCBkZWFjdGl2ZSBhZnRlciBzZW5kaW5nIHJlbGVhc2UgcmVzcG9uc2UgYWJvdmUuXHJcbiAgICAgICAgICAgICAgICBlcC5yZW1vdmVFdmVudExpc3RlbmVyKFwibWVzc2FnZVwiLCBjYWxsYmFjayk7XHJcbiAgICAgICAgICAgICAgICBjbG9zZUVuZFBvaW50KGVwKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgICBpZiAoZXAuc3RhcnQpIHtcclxuICAgICAgICBlcC5zdGFydCgpO1xyXG4gICAgfVxyXG59XHJcbmZ1bmN0aW9uIGlzTWVzc2FnZVBvcnQoZW5kcG9pbnQpIHtcclxuICAgIHJldHVybiBlbmRwb2ludC5jb25zdHJ1Y3Rvci5uYW1lID09PSBcIk1lc3NhZ2VQb3J0XCI7XHJcbn1cclxuZnVuY3Rpb24gY2xvc2VFbmRQb2ludChlbmRwb2ludCkge1xyXG4gICAgaWYgKGlzTWVzc2FnZVBvcnQoZW5kcG9pbnQpKVxyXG4gICAgICAgIGVuZHBvaW50LmNsb3NlKCk7XHJcbn1cclxuZnVuY3Rpb24gd3JhcChlcCwgdGFyZ2V0KSB7XHJcbiAgICByZXR1cm4gY3JlYXRlUHJveHkoZXAsIFtdLCB0YXJnZXQpO1xyXG59XHJcbmZ1bmN0aW9uIHRocm93SWZQcm94eVJlbGVhc2VkKGlzUmVsZWFzZWQpIHtcclxuICAgIGlmIChpc1JlbGVhc2VkKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiUHJveHkgaGFzIGJlZW4gcmVsZWFzZWQgYW5kIGlzIG5vdCB1c2VhYmxlXCIpO1xyXG4gICAgfVxyXG59XHJcbmZ1bmN0aW9uIGNyZWF0ZVByb3h5KGVwLCBwYXRoID0gW10sIHRhcmdldCA9IGZ1bmN0aW9uICgpIHsgfSkge1xyXG4gICAgbGV0IGlzUHJveHlSZWxlYXNlZCA9IGZhbHNlO1xyXG4gICAgY29uc3QgcHJveHkgPSBuZXcgUHJveHkodGFyZ2V0LCB7XHJcbiAgICAgICAgZ2V0KF90YXJnZXQsIHByb3ApIHtcclxuICAgICAgICAgICAgdGhyb3dJZlByb3h5UmVsZWFzZWQoaXNQcm94eVJlbGVhc2VkKTtcclxuICAgICAgICAgICAgaWYgKHByb3AgPT09IHJlbGVhc2VQcm94eSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVxdWVzdFJlc3BvbnNlTWVzc2FnZShlcCwge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiA1IC8qIFJFTEVBU0UgKi8sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhdGg6IHBhdGgubWFwKHAgPT4gcC50b1N0cmluZygpKVxyXG4gICAgICAgICAgICAgICAgICAgIH0pLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjbG9zZUVuZFBvaW50KGVwKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaXNQcm94eVJlbGVhc2VkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHByb3AgPT09IFwidGhlblwiKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAocGF0aC5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4geyB0aGVuOiAoKSA9PiBwcm94eSB9O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY29uc3QgciA9IHJlcXVlc3RSZXNwb25zZU1lc3NhZ2UoZXAsIHtcclxuICAgICAgICAgICAgICAgICAgICB0eXBlOiAwIC8qIEdFVCAqLyxcclxuICAgICAgICAgICAgICAgICAgICBwYXRoOiBwYXRoLm1hcChwID0+IHAudG9TdHJpbmcoKSlcclxuICAgICAgICAgICAgICAgIH0pLnRoZW4oZnJvbVdpcmVWYWx1ZSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gci50aGVuLmJpbmQocik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGNyZWF0ZVByb3h5KGVwLCBbLi4ucGF0aCwgcHJvcF0pO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc2V0KF90YXJnZXQsIHByb3AsIHJhd1ZhbHVlKSB7XHJcbiAgICAgICAgICAgIHRocm93SWZQcm94eVJlbGVhc2VkKGlzUHJveHlSZWxlYXNlZCk7XHJcbiAgICAgICAgICAgIC8vIEZJWE1FOiBFUzYgUHJveHkgSGFuZGxlciBgc2V0YCBtZXRob2RzIGFyZSBzdXBwb3NlZCB0byByZXR1cm4gYVxyXG4gICAgICAgICAgICAvLyBib29sZWFuLiBUbyBzaG93IGdvb2Qgd2lsbCwgd2UgcmV0dXJuIHRydWUgYXN5bmNocm9ub3VzbHkgwq9cXF8o44OEKV8vwq9cclxuICAgICAgICAgICAgY29uc3QgW3ZhbHVlLCB0cmFuc2ZlcmFibGVzXSA9IHRvV2lyZVZhbHVlKHJhd1ZhbHVlKTtcclxuICAgICAgICAgICAgcmV0dXJuIHJlcXVlc3RSZXNwb25zZU1lc3NhZ2UoZXAsIHtcclxuICAgICAgICAgICAgICAgIHR5cGU6IDEgLyogU0VUICovLFxyXG4gICAgICAgICAgICAgICAgcGF0aDogWy4uLnBhdGgsIHByb3BdLm1hcChwID0+IHAudG9TdHJpbmcoKSksXHJcbiAgICAgICAgICAgICAgICB2YWx1ZVxyXG4gICAgICAgICAgICB9LCB0cmFuc2ZlcmFibGVzKS50aGVuKGZyb21XaXJlVmFsdWUpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgYXBwbHkoX3RhcmdldCwgX3RoaXNBcmcsIHJhd0FyZ3VtZW50TGlzdCkge1xyXG4gICAgICAgICAgICB0aHJvd0lmUHJveHlSZWxlYXNlZChpc1Byb3h5UmVsZWFzZWQpO1xyXG4gICAgICAgICAgICBjb25zdCBsYXN0ID0gcGF0aFtwYXRoLmxlbmd0aCAtIDFdO1xyXG4gICAgICAgICAgICBpZiAobGFzdCA9PT0gY3JlYXRlRW5kcG9pbnQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiByZXF1ZXN0UmVzcG9uc2VNZXNzYWdlKGVwLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogNCAvKiBFTkRQT0lOVCAqL1xyXG4gICAgICAgICAgICAgICAgfSkudGhlbihmcm9tV2lyZVZhbHVlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyBXZSBqdXN0IHByZXRlbmQgdGhhdCBgYmluZCgpYCBkaWRu4oCZdCBoYXBwZW4uXHJcbiAgICAgICAgICAgIGlmIChsYXN0ID09PSBcImJpbmRcIikge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNyZWF0ZVByb3h5KGVwLCBwYXRoLnNsaWNlKDAsIC0xKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc3QgW2FyZ3VtZW50TGlzdCwgdHJhbnNmZXJhYmxlc10gPSBwcm9jZXNzQXJndW1lbnRzKHJhd0FyZ3VtZW50TGlzdCk7XHJcbiAgICAgICAgICAgIHJldHVybiByZXF1ZXN0UmVzcG9uc2VNZXNzYWdlKGVwLCB7XHJcbiAgICAgICAgICAgICAgICB0eXBlOiAyIC8qIEFQUExZICovLFxyXG4gICAgICAgICAgICAgICAgcGF0aDogcGF0aC5tYXAocCA9PiBwLnRvU3RyaW5nKCkpLFxyXG4gICAgICAgICAgICAgICAgYXJndW1lbnRMaXN0XHJcbiAgICAgICAgICAgIH0sIHRyYW5zZmVyYWJsZXMpLnRoZW4oZnJvbVdpcmVWYWx1ZSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBjb25zdHJ1Y3QoX3RhcmdldCwgcmF3QXJndW1lbnRMaXN0KSB7XHJcbiAgICAgICAgICAgIHRocm93SWZQcm94eVJlbGVhc2VkKGlzUHJveHlSZWxlYXNlZCk7XHJcbiAgICAgICAgICAgIGNvbnN0IFthcmd1bWVudExpc3QsIHRyYW5zZmVyYWJsZXNdID0gcHJvY2Vzc0FyZ3VtZW50cyhyYXdBcmd1bWVudExpc3QpO1xyXG4gICAgICAgICAgICByZXR1cm4gcmVxdWVzdFJlc3BvbnNlTWVzc2FnZShlcCwge1xyXG4gICAgICAgICAgICAgICAgdHlwZTogMyAvKiBDT05TVFJVQ1QgKi8sXHJcbiAgICAgICAgICAgICAgICBwYXRoOiBwYXRoLm1hcChwID0+IHAudG9TdHJpbmcoKSksXHJcbiAgICAgICAgICAgICAgICBhcmd1bWVudExpc3RcclxuICAgICAgICAgICAgfSwgdHJhbnNmZXJhYmxlcykudGhlbihmcm9tV2lyZVZhbHVlKTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuICAgIHJldHVybiBwcm94eTtcclxufVxyXG5mdW5jdGlvbiBteUZsYXQoYXJyKSB7XHJcbiAgICByZXR1cm4gQXJyYXkucHJvdG90eXBlLmNvbmNhdC5hcHBseShbXSwgYXJyKTtcclxufVxyXG5mdW5jdGlvbiBwcm9jZXNzQXJndW1lbnRzKGFyZ3VtZW50TGlzdCkge1xyXG4gICAgY29uc3QgcHJvY2Vzc2VkID0gYXJndW1lbnRMaXN0Lm1hcCh0b1dpcmVWYWx1ZSk7XHJcbiAgICByZXR1cm4gW3Byb2Nlc3NlZC5tYXAodiA9PiB2WzBdKSwgbXlGbGF0KHByb2Nlc3NlZC5tYXAodiA9PiB2WzFdKSldO1xyXG59XHJcbmNvbnN0IHRyYW5zZmVyQ2FjaGUgPSBuZXcgV2Vha01hcCgpO1xyXG5mdW5jdGlvbiB0cmFuc2ZlcihvYmosIHRyYW5zZmVycykge1xyXG4gICAgdHJhbnNmZXJDYWNoZS5zZXQob2JqLCB0cmFuc2ZlcnMpO1xyXG4gICAgcmV0dXJuIG9iajtcclxufVxyXG5mdW5jdGlvbiBwcm94eShvYmopIHtcclxuICAgIHJldHVybiBPYmplY3QuYXNzaWduKG9iaiwgeyBbcHJveHlNYXJrZXJdOiB0cnVlIH0pO1xyXG59XHJcbmZ1bmN0aW9uIHdpbmRvd0VuZHBvaW50KHcsIGNvbnRleHQgPSBzZWxmLCB0YXJnZXRPcmlnaW4gPSBcIipcIikge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBwb3N0TWVzc2FnZTogKG1zZywgdHJhbnNmZXJhYmxlcykgPT4gdy5wb3N0TWVzc2FnZShtc2csIHRhcmdldE9yaWdpbiwgdHJhbnNmZXJhYmxlcyksXHJcbiAgICAgICAgYWRkRXZlbnRMaXN0ZW5lcjogY29udGV4dC5hZGRFdmVudExpc3RlbmVyLmJpbmQoY29udGV4dCksXHJcbiAgICAgICAgcmVtb3ZlRXZlbnRMaXN0ZW5lcjogY29udGV4dC5yZW1vdmVFdmVudExpc3RlbmVyLmJpbmQoY29udGV4dClcclxuICAgIH07XHJcbn1cclxuZnVuY3Rpb24gdG9XaXJlVmFsdWUodmFsdWUpIHtcclxuICAgIGZvciAoY29uc3QgW25hbWUsIGhhbmRsZXJdIG9mIHRyYW5zZmVySGFuZGxlcnMpIHtcclxuICAgICAgICBpZiAoaGFuZGxlci5jYW5IYW5kbGUodmFsdWUpKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IFtzZXJpYWxpemVkVmFsdWUsIHRyYW5zZmVyYWJsZXNdID0gaGFuZGxlci5zZXJpYWxpemUodmFsdWUpO1xyXG4gICAgICAgICAgICByZXR1cm4gW1xyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IDMgLyogSEFORExFUiAqLyxcclxuICAgICAgICAgICAgICAgICAgICBuYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiBzZXJpYWxpemVkVmFsdWVcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICB0cmFuc2ZlcmFibGVzXHJcbiAgICAgICAgICAgIF07XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIFtcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHR5cGU6IDAgLyogUkFXICovLFxyXG4gICAgICAgICAgICB2YWx1ZVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdHJhbnNmZXJDYWNoZS5nZXQodmFsdWUpIHx8IFtdXHJcbiAgICBdO1xyXG59XHJcbmZ1bmN0aW9uIGZyb21XaXJlVmFsdWUodmFsdWUpIHtcclxuICAgIHN3aXRjaCAodmFsdWUudHlwZSkge1xyXG4gICAgICAgIGNhc2UgMyAvKiBIQU5ETEVSICovOlxyXG4gICAgICAgICAgICByZXR1cm4gdHJhbnNmZXJIYW5kbGVycy5nZXQodmFsdWUubmFtZSkuZGVzZXJpYWxpemUodmFsdWUudmFsdWUpO1xyXG4gICAgICAgIGNhc2UgMCAvKiBSQVcgKi86XHJcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZS52YWx1ZTtcclxuICAgIH1cclxufVxyXG5mdW5jdGlvbiByZXF1ZXN0UmVzcG9uc2VNZXNzYWdlKGVwLCBtc2csIHRyYW5zZmVycykge1xyXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xyXG4gICAgICAgIGNvbnN0IGlkID0gZ2VuZXJhdGVVVUlEKCk7XHJcbiAgICAgICAgZXAuYWRkRXZlbnRMaXN0ZW5lcihcIm1lc3NhZ2VcIiwgZnVuY3Rpb24gbChldikge1xyXG4gICAgICAgICAgICBpZiAoIWV2LmRhdGEgfHwgIWV2LmRhdGEuaWQgfHwgZXYuZGF0YS5pZCAhPT0gaWQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlcC5yZW1vdmVFdmVudExpc3RlbmVyKFwibWVzc2FnZVwiLCBsKTtcclxuICAgICAgICAgICAgcmVzb2x2ZShldi5kYXRhKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBpZiAoZXAuc3RhcnQpIHtcclxuICAgICAgICAgICAgZXAuc3RhcnQoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZXAucG9zdE1lc3NhZ2UoT2JqZWN0LmFzc2lnbih7IGlkIH0sIG1zZyksIHRyYW5zZmVycyk7XHJcbiAgICB9KTtcclxufVxyXG5mdW5jdGlvbiBnZW5lcmF0ZVVVSUQoKSB7XHJcbiAgICByZXR1cm4gbmV3IEFycmF5KDQpXHJcbiAgICAgICAgLmZpbGwoMClcclxuICAgICAgICAubWFwKCgpID0+IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIE51bWJlci5NQVhfU0FGRV9JTlRFR0VSKS50b1N0cmluZygxNikpXHJcbiAgICAgICAgLmpvaW4oXCItXCIpO1xyXG59XG5cbmV4cG9ydCB7IGNyZWF0ZUVuZHBvaW50LCBleHBvc2UsIHByb3h5LCBwcm94eU1hcmtlciwgcmVsZWFzZVByb3h5LCB0cmFuc2ZlciwgdHJhbnNmZXJIYW5kbGVycywgd2luZG93RW5kcG9pbnQsIHdyYXAgfTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWNvbWxpbmsubWpzLm1hcFxuIl0sInNvdXJjZVJvb3QiOiIifQ==