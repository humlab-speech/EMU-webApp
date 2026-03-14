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
        var annotationClone = structuredClone(annotation);
        annotationClone.levels = [];
        annotationClone.levels.push(structuredClone(childLevel));
        annotationClone.links = [];
        path.forEach(function (ln, lnIdx) {
            if (ln !== path[path.length - 1]) {
                var parentLevelClone = structuredClone(_this.getLevelDetails(path[lnIdx + 1], annotation));
                parentLevelClone.items = [];
                _this.giveTimeToParentsAndAppendItemsAndLinks(annotationClone, parentLevelClone, childLevel);
                annotationClone.levels.push(parentLevelClone);
                childLevel = annotationClone.levels[annotationClone.levels.length - 1];
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
        var subLevelWithTimeClone = structuredClone(subLevelWithTime);
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
                                var oldEnd = parentItem.sampleStart + parentItem.sampleDur;
                                parentItem.sampleStart = item.sampleStart;
                                parentItem.sampleDur = oldEnd - parentItem.sampleStart;
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
            var parentIds = _this.linkSubToSuperHashMap.get(item.id);
            if (parentIds) {
                parentIds.forEach(function (parentId) {
                    var parent = _this.idHashMap.get(parentId);
                    if (parent) {
                        if (typeof parent.sampleStart === 'undefined') {
                            parent.sampleStart = item.sampleStart;
                            parent.sampleDur = item.sampleDur;
                        }
                        else if (item.sampleStart < parent.sampleStart) {
                            var oldEnd = parent.sampleStart + parent.sampleDur;
                            parent.sampleStart = item.sampleStart;
                            parent.sampleDur = oldEnd - parent.sampleStart;
                        }
                        else if (item.sampleStart + item.sampleDur > parent.sampleStart + parent.sampleDur) {
                            parent.sampleDur = item.sampleStart + item.sampleDur - parent.sampleStart;
                        }
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vc3JjL2FwcC93b3JrZXJzL2hpZXJhcmNoeS53b3JrZXIudHMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2NvbWxpbmsvZGlzdC9lc20vY29tbGluay5tanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtRQUFBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBOzs7UUFHQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0EsMENBQTBDLGdDQUFnQztRQUMxRTtRQUNBOztRQUVBO1FBQ0E7UUFDQTtRQUNBLHdEQUF3RCxrQkFBa0I7UUFDMUU7UUFDQSxpREFBaUQsY0FBYztRQUMvRDs7UUFFQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0EseUNBQXlDLGlDQUFpQztRQUMxRSxnSEFBZ0gsbUJBQW1CLEVBQUU7UUFDckk7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQSwyQkFBMkIsMEJBQTBCLEVBQUU7UUFDdkQsaUNBQWlDLGVBQWU7UUFDaEQ7UUFDQTtRQUNBOztRQUVBO1FBQ0Esc0RBQXNELCtEQUErRDs7UUFFckg7UUFDQTs7O1FBR0E7UUFDQTs7Ozs7Ozs7Ozs7OztBQ2xGQTtBQUFBO0FBQUE7QUFBaUM7QUFDakM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtQ0FBbUM7QUFDbkM7QUFDQTtBQUNBLHFEQUFxRDtBQUNyRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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LGFBQWE7QUFDYixTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwrQkFBK0Isc0JBQXNCO0FBQ3JEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBLHNDQUFzQyxLQUFLO0FBQzNDLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFc0g7QUFDdEgiLCJmaWxlIjoiM2Q5MjAzYWE5YmIwZjYyZWNhZTcud29ya2VyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZ2V0dGVyIH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSBmdW5jdGlvbihleHBvcnRzKSB7XG4gXHRcdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuIFx0XHR9XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG4gXHR9O1xuXG4gXHQvLyBjcmVhdGUgYSBmYWtlIG5hbWVzcGFjZSBvYmplY3RcbiBcdC8vIG1vZGUgJiAxOiB2YWx1ZSBpcyBhIG1vZHVsZSBpZCwgcmVxdWlyZSBpdFxuIFx0Ly8gbW9kZSAmIDI6IG1lcmdlIGFsbCBwcm9wZXJ0aWVzIG9mIHZhbHVlIGludG8gdGhlIG5zXG4gXHQvLyBtb2RlICYgNDogcmV0dXJuIHZhbHVlIHdoZW4gYWxyZWFkeSBucyBvYmplY3RcbiBcdC8vIG1vZGUgJiA4fDE6IGJlaGF2ZSBsaWtlIHJlcXVpcmVcbiBcdF9fd2VicGFja19yZXF1aXJlX18udCA9IGZ1bmN0aW9uKHZhbHVlLCBtb2RlKSB7XG4gXHRcdGlmKG1vZGUgJiAxKSB2YWx1ZSA9IF9fd2VicGFja19yZXF1aXJlX18odmFsdWUpO1xuIFx0XHRpZihtb2RlICYgOCkgcmV0dXJuIHZhbHVlO1xuIFx0XHRpZigobW9kZSAmIDQpICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgdmFsdWUgJiYgdmFsdWUuX19lc01vZHVsZSkgcmV0dXJuIHZhbHVlO1xuIFx0XHR2YXIgbnMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLnIobnMpO1xuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkobnMsICdkZWZhdWx0JywgeyBlbnVtZXJhYmxlOiB0cnVlLCB2YWx1ZTogdmFsdWUgfSk7XG4gXHRcdGlmKG1vZGUgJiAyICYmIHR5cGVvZiB2YWx1ZSAhPSAnc3RyaW5nJykgZm9yKHZhciBrZXkgaW4gdmFsdWUpIF9fd2VicGFja19yZXF1aXJlX18uZChucywga2V5LCBmdW5jdGlvbihrZXkpIHsgcmV0dXJuIHZhbHVlW2tleV07IH0uYmluZChudWxsLCBrZXkpKTtcbiBcdFx0cmV0dXJuIG5zO1xuIFx0fTtcblxuIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbiBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiBcdFx0cmV0dXJuIGdldHRlcjtcbiBcdH07XG5cbiBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IFwiLi9ub2RlX21vZHVsZXMvY29tbGluay1sb2FkZXIvZGlzdC9jb21saW5rLXdvcmtlci1sb2FkZXIuanMhLi9ub2RlX21vZHVsZXMvdHMtbG9hZGVyL2luZGV4LmpzIS4vc3JjL2FwcC93b3JrZXJzL2hpZXJhcmNoeS53b3JrZXIudHNcIik7XG4iLCJpbXBvcnQgeyBleHBvc2UgfSBmcm9tICdjb21saW5rJztcbiAgdmFyIEhpZXJhcmNoeVdvcmtlciA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcbiAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgICAvLyBwdWJsaWMgYXBpXG4gICAgZnVuY3Rpb24gSGllcmFyY2h5V29ya2VyKCkge1xuICAgIH1cbiAgICBIaWVyYXJjaHlXb3JrZXIucHJvdG90eXBlLnJlZHVjZUFubm90YXRpb25Ub1ZpZXdhYmxlVGltZUFuZFBhdGggPSBmdW5jdGlvbiAoYW5ub3RhdGlvbiwgcGF0aCwgdmlld1BvcnRTdGFydFNhbXBsZSwgdmlld1BvcnRFbmRTYW1wbGUpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgdGhpcy5pZEhhc2hNYXAgPSB1bmRlZmluZWQ7IC8vIHJlc2V0IDQgICAgICAgXG4gICAgICAgIHRoaXMubGlua1N1YlRvU3VwZXJIYXNoTWFwID0gdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLmNyZWF0ZUlkSGFzaE1hcEZvclBhdGgocGF0aCwgYW5ub3RhdGlvbik7XG4gICAgICAgIHRoaXMuY3JlYXRlTGlua1N1YlRvU3VwZXJIYXNoTWFwKGFubm90YXRpb24pOyAvLyBmcm9tIGNoaWxkIHRvIHBhcmVudHNcbiAgICAgICAgdmFyIGNoaWxkTGV2ZWwgPSB0aGlzLnJlZHVjZVRvSXRlbXNXaXRoVGltZUluVmlldyhhbm5vdGF0aW9uLCBwYXRoLCB2aWV3UG9ydFN0YXJ0U2FtcGxlLCB2aWV3UG9ydEVuZFNhbXBsZSk7XG4gICAgICAgIC8vIGNsb25lIGFuZCBlbXB0eSBhbm5vdGF0aW9uXG4gICAgICAgIHZhciBhbm5vdGF0aW9uQ2xvbmUgPSBzdHJ1Y3R1cmVkQ2xvbmUoYW5ub3RhdGlvbik7XG4gICAgICAgIGFubm90YXRpb25DbG9uZS5sZXZlbHMgPSBbXTtcbiAgICAgICAgYW5ub3RhdGlvbkNsb25lLmxldmVscy5wdXNoKHN0cnVjdHVyZWRDbG9uZShjaGlsZExldmVsKSk7XG4gICAgICAgIGFubm90YXRpb25DbG9uZS5saW5rcyA9IFtdO1xuICAgICAgICBwYXRoLmZvckVhY2goZnVuY3Rpb24gKGxuLCBsbklkeCkge1xuICAgICAgICAgICAgaWYgKGxuICE9PSBwYXRoW3BhdGgubGVuZ3RoIC0gMV0pIHtcbiAgICAgICAgICAgICAgICB2YXIgcGFyZW50TGV2ZWxDbG9uZSA9IHN0cnVjdHVyZWRDbG9uZShfdGhpcy5nZXRMZXZlbERldGFpbHMocGF0aFtsbklkeCArIDFdLCBhbm5vdGF0aW9uKSk7XG4gICAgICAgICAgICAgICAgcGFyZW50TGV2ZWxDbG9uZS5pdGVtcyA9IFtdO1xuICAgICAgICAgICAgICAgIF90aGlzLmdpdmVUaW1lVG9QYXJlbnRzQW5kQXBwZW5kSXRlbXNBbmRMaW5rcyhhbm5vdGF0aW9uQ2xvbmUsIHBhcmVudExldmVsQ2xvbmUsIGNoaWxkTGV2ZWwpO1xuICAgICAgICAgICAgICAgIGFubm90YXRpb25DbG9uZS5sZXZlbHMucHVzaChwYXJlbnRMZXZlbENsb25lKTtcbiAgICAgICAgICAgICAgICBjaGlsZExldmVsID0gYW5ub3RhdGlvbkNsb25lLmxldmVsc1thbm5vdGF0aW9uQ2xvbmUubGV2ZWxzLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGFubm90YXRpb25DbG9uZTtcbiAgICB9O1xuICAgIC8qKlxuICAgICogcmV0dXJucyBsZXZlbCBkZXRhaWxzIGJ5IHBhc3NpbmcgaW4gbGV2ZWwgbmFtZVxuICAgICogaWYgdGhlIGNvcnJlc3BvbmRpbmcgbGV2ZWwgZXhpc3RzXG4gICAgKiBvdGhlcndpc2UgcmV0dXJucyAnbnVsbCdcbiAgICAqICAgIEBwYXJhbSBuYW1lXG4gICAgKi9cbiAgICBIaWVyYXJjaHlXb3JrZXIucHJvdG90eXBlLmdldExldmVsRGV0YWlscyA9IGZ1bmN0aW9uIChuYW1lLCBhbm5vdGF0aW9uKSB7XG4gICAgICAgIHZhciByZXQgPSBudWxsO1xuICAgICAgICBhbm5vdGF0aW9uLmxldmVscy5mb3JFYWNoKGZ1bmN0aW9uIChsZXZlbCkge1xuICAgICAgICAgICAgaWYgKGxldmVsLm5hbWUgPT09IG5hbWUpIHtcbiAgICAgICAgICAgICAgICByZXQgPSBsZXZlbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiByZXQ7XG4gICAgfTtcbiAgICA7XG4gICAgLyoqXG4gICAgICpcbiAgICAgKiBAcGFyYW0gYW5ub3RhdGlvbiBhbm5vdGF0aW9uIHRvIGd1ZXNzIExpbmtEZWZpbml0aW9ucyBmcm9tXG4gICAgICovXG4gICAgSGllcmFyY2h5V29ya2VyLnByb3RvdHlwZS5ndWVzc0xpbmtEZWZpbml0aW9ucyA9IGZ1bmN0aW9uIChhbm5vdGF0aW9uKSB7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKGFubm90YXRpb24pXG4gICAgICAgIHRoaXMuaWRIYXNoTWFwID0gdW5kZWZpbmVkOyAvLyByZXNldCA0ICAgICAgIFxuICAgICAgICB0aGlzLmxpbmtTdWJUb1N1cGVySGFzaE1hcCA9IHVuZGVmaW5lZDtcbiAgICAgICAgdGhpcy5jcmVhdGVJZEhhc2hNYXBGb3JFdmVyeUxldmVsKGFubm90YXRpb24pO1xuICAgICAgICB0aGlzLmNyZWF0ZUxpbmtTdWJUb1N1cGVySGFzaE1hcChhbm5vdGF0aW9uKTsgLy8gZnJvbSBjaGlsZCB0byBwYXJlbnRzXG4gICAgICAgIHRoaXMuY3JlYXRlTGlua1N1cGVyVG9TdWJIYXNoTWFwKGFubm90YXRpb24pOyAvLyBmcm9tIHBhcmVudCB0byBjaGlsZHJlblxuICAgICAgICAvLyBjb25zb2xlLmxvZyh0aGlzLmlkSGFzaE1hcCk7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKHRoaXMubGlua1N1YlRvU3VwZXJIYXNoTWFwKTtcbiAgICAgICAgLy8gY29uc29sZS5sb2codGhpcy5saW5rU3VwZXJUb1N1Ykhhc2hNYXApO1xuICAgICAgICB2YXIgbGlua0RlZnNTdXBlclRvU3ViID0gdGhpcy5maW5kQWxsTGlua0RlZnModGhpcy5saW5rU3VwZXJUb1N1Ykhhc2hNYXAsIGZhbHNlKTtcbiAgICAgICAgdmFyIGxpbmtEZWZzU3ViVG9TdXBlciA9IHRoaXMuZmluZEFsbExpbmtEZWZzKHRoaXMubGlua1N1YlRvU3VwZXJIYXNoTWFwLCB0cnVlKTtcbiAgICAgICAgLy8gY29uc29sZS5sb2cobGlua0RlZnNTdXBlclRvU3ViKTtcbiAgICAgICAgLy8gY29uc29sZS5sb2cobGlua0RlZnNTdWJUb1N1cGVyKTtcbiAgICAgICAgbGlua0RlZnNTdXBlclRvU3ViLmZvckVhY2goZnVuY3Rpb24gKGxpbmtEZWZTdXBlclRvU3ViKSB7XG4gICAgICAgICAgICBsaW5rRGVmc1N1YlRvU3VwZXIuZm9yRWFjaChmdW5jdGlvbiAobGlua0RlZlN1YlRvU3VwZXIpIHtcbiAgICAgICAgICAgICAgICBpZiAobGlua0RlZlN1cGVyVG9TdWIuc3VwZXJsZXZlbE5hbWUgPT09IGxpbmtEZWZTdWJUb1N1cGVyLnN1cGVybGV2ZWxOYW1lICYmIGxpbmtEZWZTdXBlclRvU3ViLnN1YmxldmVsTmFtZSA9PT0gbGlua0RlZlN1YlRvU3VwZXIuc3VibGV2ZWxOYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChsaW5rRGVmU3VwZXJUb1N1Yi50eXBlID09PSBcIk9ORV9UT19PTkVcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGlua0RlZlN1cGVyVG9TdWIudHlwZSA9IGxpbmtEZWZTdWJUb1N1cGVyLnR5cGU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAobGlua0RlZlN1cGVyVG9TdWIudHlwZSA9PT0gXCJPTkVfVE9fTUFOWVwiICYmIGxpbmtEZWZTdWJUb1N1cGVyLnR5cGUgPT09IFwiTUFOWV9UT19NQU5ZXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbmtEZWZTdXBlclRvU3ViLnR5cGUgPSBsaW5rRGVmU3ViVG9TdXBlci50eXBlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gKGxpbmtEZWZzU3VwZXJUb1N1Yik7XG4gICAgfTtcbiAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgICAvLyBwcml2YXRlIGFwaVxuICAgIEhpZXJhcmNoeVdvcmtlci5wcm90b3R5cGUucmVkdWNlVG9JdGVtc1dpdGhUaW1lSW5WaWV3ID0gZnVuY3Rpb24gKGFubm90YXRpb24sIHBhdGgsIHZpZXdQb3J0U3RhcnRTYW1wbGUsIHZpZXdQb3J0RW5kU2FtcGxlKSB7XG4gICAgICAgIHZhciBzdWJMZXZlbFdpdGhUaW1lID0gdGhpcy5nZXRMZXZlbERldGFpbHMocGF0aFswXSwgYW5ub3RhdGlvbik7XG4gICAgICAgIHZhciBzdWJMZXZlbFdpdGhUaW1lQ2xvbmUgPSBzdHJ1Y3R1cmVkQ2xvbmUoc3ViTGV2ZWxXaXRoVGltZSk7XG4gICAgICAgIHN1YkxldmVsV2l0aFRpbWVDbG9uZS5pdGVtcyA9IFtdO1xuICAgICAgICAvLyBsZXQgaXRlbXNJblZpZXcgPSBbXTtcbiAgICAgICAgc3ViTGV2ZWxXaXRoVGltZS5pdGVtcy5mb3JFYWNoKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICAgICAgICBpZiAoaXRlbS5zYW1wbGVTdGFydCArIGl0ZW0uc2FtcGxlRHVyID4gdmlld1BvcnRTdGFydFNhbXBsZSAmJiBpdGVtLnNhbXBsZVN0YXJ0IDwgdmlld1BvcnRFbmRTYW1wbGUpIHtcbiAgICAgICAgICAgICAgICBzdWJMZXZlbFdpdGhUaW1lQ2xvbmUuaXRlbXMucHVzaChpdGVtKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBzdWJMZXZlbFdpdGhUaW1lQ2xvbmU7XG4gICAgfTtcbiAgICBIaWVyYXJjaHlXb3JrZXIucHJvdG90eXBlLmdpdmVUaW1lVG9QYXJlbnRzQW5kQXBwZW5kSXRlbXNBbmRMaW5rcyA9IGZ1bmN0aW9uIChhbm5vdGF0aW9uLCBwYXJlbnRMZXZlbCwgY2hpbGRMZXZlbCkge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICBjaGlsZExldmVsLml0ZW1zLmZvckVhY2goZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgICAgICAgIHZhciBwYXJlbnRJZHMgPSBfdGhpcy5saW5rU3ViVG9TdXBlckhhc2hNYXAuZ2V0KGl0ZW0uaWQpO1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBwYXJlbnRJZHMgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgcGFyZW50SWRzLmZvckVhY2goZnVuY3Rpb24gKHBhcmVudElkKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBwYXJlbnRJdGVtID0gX3RoaXMuaWRIYXNoTWFwLmdldChwYXJlbnRJZCk7XG4gICAgICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKHBhcmVudElkKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2cocGFyZW50SXRlbSk7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgcGFyZW50SXRlbSAhPT0gJ3VuZGVmaW5lZCcpIHsgLy8gYXMgb25seSBsZXZlbHMgaW4gcGF0aCBhcmUgaW4gaWRIYXNoTWFwIFxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHBhcmVudEl0ZW0ubGFiZWxzWzBdLm5hbWUgPT09IHBhcmVudExldmVsLm5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBhcHBlbmQgbGlua1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFubm90YXRpb24ubGlua3MucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZyb21JRDogcGFyZW50SWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvSUQ6IGl0ZW0uaWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBhZGQgdGltZSBpbmZvXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBwYXJlbnRJdGVtLnNhbXBsZVN0YXJ0ID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnRJdGVtLnNhbXBsZVN0YXJ0ID0gaXRlbS5zYW1wbGVTdGFydDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyZW50SXRlbS5zYW1wbGVEdXIgPSBpdGVtLnNhbXBsZUR1cjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoaXRlbS5zYW1wbGVTdGFydCA8IHBhcmVudEl0ZW0uc2FtcGxlU3RhcnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG9sZEVuZCA9IHBhcmVudEl0ZW0uc2FtcGxlU3RhcnQgKyBwYXJlbnRJdGVtLnNhbXBsZUR1cjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyZW50SXRlbS5zYW1wbGVTdGFydCA9IGl0ZW0uc2FtcGxlU3RhcnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudEl0ZW0uc2FtcGxlRHVyID0gb2xkRW5kIC0gcGFyZW50SXRlbS5zYW1wbGVTdGFydDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoaXRlbS5zYW1wbGVTdGFydCArIGl0ZW0uc2FtcGxlRHVyID4gcGFyZW50SXRlbS5zYW1wbGVTdGFydCArIHBhcmVudEl0ZW0uc2FtcGxlRHVyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudEl0ZW0uc2FtcGxlRHVyID0gaXRlbS5zYW1wbGVTdGFydCArIGl0ZW0uc2FtcGxlRHVyIC0gcGFyZW50SXRlbS5zYW1wbGVTdGFydDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gYXBwZW5kIGl0ZW1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnRMZXZlbC5pdGVtcy5wdXNoKHBhcmVudEl0ZW0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIC8vIGNoZWNrIGlmIHBhcmVudCBpcyBvbiByaWdodCBsZXZlbFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9O1xuICAgIEhpZXJhcmNoeVdvcmtlci5wcm90b3R5cGUuZ2l2ZVRpbWVUb1BhcmVudHMgPSBmdW5jdGlvbiAobGV2ZWxOYW1lLCBhbm5vdGF0aW9uLCBzdWJMZXZlbFdpdGhUaW1lKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgIHZhciBsZXZlbDtcbiAgICAgICAgaWYgKGxldmVsTmFtZSA9PT0gc3ViTGV2ZWxXaXRoVGltZS5uYW1lKSB7XG4gICAgICAgICAgICBsZXZlbCA9IHN1YkxldmVsV2l0aFRpbWU7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBsZXZlbCA9IHRoaXMuZ2V0TGV2ZWxEZXRhaWxzKGxldmVsTmFtZSwgYW5ub3RhdGlvbik7XG4gICAgICAgIH1cbiAgICAgICAgbGV2ZWwuaXRlbXMuZm9yRWFjaChmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICAgICAgdmFyIHBhcmVudElkcyA9IF90aGlzLmxpbmtTdWJUb1N1cGVySGFzaE1hcC5nZXQoaXRlbS5pZCk7XG4gICAgICAgICAgICBpZiAocGFyZW50SWRzKSB7XG4gICAgICAgICAgICAgICAgcGFyZW50SWRzLmZvckVhY2goZnVuY3Rpb24gKHBhcmVudElkKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBwYXJlbnQgPSBfdGhpcy5pZEhhc2hNYXAuZ2V0KHBhcmVudElkKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBhcmVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBwYXJlbnQuc2FtcGxlU3RhcnQgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyZW50LnNhbXBsZVN0YXJ0ID0gaXRlbS5zYW1wbGVTdGFydDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnQuc2FtcGxlRHVyID0gaXRlbS5zYW1wbGVEdXI7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChpdGVtLnNhbXBsZVN0YXJ0IDwgcGFyZW50LnNhbXBsZVN0YXJ0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG9sZEVuZCA9IHBhcmVudC5zYW1wbGVTdGFydCArIHBhcmVudC5zYW1wbGVEdXI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyZW50LnNhbXBsZVN0YXJ0ID0gaXRlbS5zYW1wbGVTdGFydDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnQuc2FtcGxlRHVyID0gb2xkRW5kIC0gcGFyZW50LnNhbXBsZVN0YXJ0O1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoaXRlbS5zYW1wbGVTdGFydCArIGl0ZW0uc2FtcGxlRHVyID4gcGFyZW50LnNhbXBsZVN0YXJ0ICsgcGFyZW50LnNhbXBsZUR1cikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudC5zYW1wbGVEdXIgPSBpdGVtLnNhbXBsZVN0YXJ0ICsgaXRlbS5zYW1wbGVEdXIgLSBwYXJlbnQuc2FtcGxlU3RhcnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfTtcbiAgICBIaWVyYXJjaHlXb3JrZXIucHJvdG90eXBlLmNyZWF0ZUlkSGFzaE1hcEZvclBhdGggPSBmdW5jdGlvbiAocGF0aCwgYW5ub3RhdGlvbikge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICB0aGlzLmlkSGFzaE1hcCA9IG5ldyBNYXAoKTtcbiAgICAgICAgcGF0aC5mb3JFYWNoKGZ1bmN0aW9uIChsZXZlbE5hbWUpIHtcbiAgICAgICAgICAgIHZhciBsZXZlbCA9IF90aGlzLmdldExldmVsRGV0YWlscyhsZXZlbE5hbWUsIGFubm90YXRpb24pO1xuICAgICAgICAgICAgbGV2ZWwuaXRlbXMuZm9yRWFjaChmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICAgICAgICAgIF90aGlzLmlkSGFzaE1hcC5zZXQoaXRlbS5pZCwgaXRlbSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfTtcbiAgICBIaWVyYXJjaHlXb3JrZXIucHJvdG90eXBlLmNyZWF0ZUlkSGFzaE1hcEZvckV2ZXJ5TGV2ZWwgPSBmdW5jdGlvbiAoYW5ub3RhdGlvbikge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICB0aGlzLmlkSGFzaE1hcCA9IG5ldyBNYXAoKTtcbiAgICAgICAgYW5ub3RhdGlvbi5sZXZlbHMuZm9yRWFjaChmdW5jdGlvbiAobGV2ZWwpIHtcbiAgICAgICAgICAgIGxldmVsLml0ZW1zLmZvckVhY2goZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgICAgICAgICAgICBfdGhpcy5pZEhhc2hNYXAuc2V0KGl0ZW0uaWQsIGl0ZW0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH07XG4gICAgSGllcmFyY2h5V29ya2VyLnByb3RvdHlwZS5jcmVhdGVMaW5rU3ViVG9TdXBlckhhc2hNYXAgPSBmdW5jdGlvbiAoYW5ub3RhdGlvbikge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICB0aGlzLmxpbmtTdWJUb1N1cGVySGFzaE1hcCA9IG5ldyBNYXAoKTtcbiAgICAgICAgYW5ub3RhdGlvbi5saW5rcy5mb3JFYWNoKGZ1bmN0aW9uIChsaW5rKSB7XG4gICAgICAgICAgICBpZiAoIV90aGlzLmxpbmtTdWJUb1N1cGVySGFzaE1hcC5oYXMobGluay50b0lEKSkge1xuICAgICAgICAgICAgICAgIF90aGlzLmxpbmtTdWJUb1N1cGVySGFzaE1hcC5zZXQobGluay50b0lELCBbbGluay5mcm9tSURdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHZhciBwcmV2UGFyZW50cyA9IF90aGlzLmxpbmtTdWJUb1N1cGVySGFzaE1hcC5nZXQobGluay50b0lEKTtcbiAgICAgICAgICAgICAgICBwcmV2UGFyZW50cy5wdXNoKGxpbmsuZnJvbUlEKTtcbiAgICAgICAgICAgICAgICBfdGhpcy5saW5rU3ViVG9TdXBlckhhc2hNYXAuc2V0KGxpbmsudG9JRCwgcHJldlBhcmVudHMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9O1xuICAgIEhpZXJhcmNoeVdvcmtlci5wcm90b3R5cGUuY3JlYXRlTGlua1N1cGVyVG9TdWJIYXNoTWFwID0gZnVuY3Rpb24gKGFubm90YXRpb24pIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgdGhpcy5saW5rU3VwZXJUb1N1Ykhhc2hNYXAgPSBuZXcgTWFwKCk7XG4gICAgICAgIGFubm90YXRpb24ubGlua3MuZm9yRWFjaChmdW5jdGlvbiAobGluaykge1xuICAgICAgICAgICAgaWYgKCFfdGhpcy5saW5rU3VwZXJUb1N1Ykhhc2hNYXAuaGFzKGxpbmsuZnJvbUlEKSkge1xuICAgICAgICAgICAgICAgIF90aGlzLmxpbmtTdXBlclRvU3ViSGFzaE1hcC5zZXQobGluay5mcm9tSUQsIFtsaW5rLnRvSURdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHZhciBwcmV2Q2hpbGRyZW4gPSBfdGhpcy5saW5rU3VwZXJUb1N1Ykhhc2hNYXAuZ2V0KGxpbmsuZnJvbUlEKTtcbiAgICAgICAgICAgICAgICBwcmV2Q2hpbGRyZW4ucHVzaChsaW5rLnRvSUQpO1xuICAgICAgICAgICAgICAgIF90aGlzLmxpbmtTdXBlclRvU3ViSGFzaE1hcC5zZXQobGluay5mcm9tSUQsIHByZXZDaGlsZHJlbik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH07XG4gICAgLy8gcHJpdmF0ZSB3YWxrQW5kQXBwZW5kVG9MaW5rRGVmaW5pdGlvbnMoa2V5LCBwYXRoLCBmb3VuZFBhdGhzLCBsaW5rSGFzaE1hcCl7XG4gICAgLy8gICAgIC8vIGFkZCB0byBwYXRoIG9ubHkgaWYgd2UgaGF2bid0IHZpc2l0ZWQgaXQgeWV0XG4gICAgLy8gICAgIGxldCBpdGVtID0gdGhpcy5pZEhhc2hNYXAuZ2V0KGtleSk7XG4gICAgLy8gICAgIGxldCBjdXJMZXZlbE5hbWUgPSBpdGVtLmxhYmVsc1swXS5uYW1lO1xuICAgIC8vICAgICBpZighcGF0aC5pbmNsdWRlcyhjdXJMZXZlbE5hbWUpKXtcbiAgICAvLyAgICAgICAgIHBhdGgucHVzaChjdXJMZXZlbE5hbWUpO1xuICAgIC8vICAgICB9XG4gICAgLy8gICAgIC8vIGdldCB2YWx1ZXNcbiAgICAvLyAgICAgbGV0IHZhbHVlcyA9IGxpbmtIYXNoTWFwLmdldChrZXkpO1xuICAgIC8vICAgICBpZih0eXBlb2YgdmFsdWVzICE9PSBcInVuZGVmaW5lZFwiKXtcbiAgICAvLyAgICAgICAgIHZhbHVlcy5mb3JFYWNoKChjb25uZWN0ZWRJdGVtSWQpID0+IHtcbiAgICAvLyAgICAgICAgICAgICAvLyBsZXQgaXRlbSA9IHRoaXMuaWRIYXNoTWFwLmdldChjb25uZWN0ZWRJdGVtSWQpO1xuICAgIC8vICAgICAgICAgICAgIC8vIHBhdGgucHVzaChpdGVtLmxhYmVsc1swXS5uYW1lKTtcbiAgICAvLyAgICAgICAgICAgICB0aGlzLndhbGtBbmRBcHBlbmRUb0xpbmtEZWZpbml0aW9ucyhjb25uZWN0ZWRJdGVtSWQsIHBhdGgsIGZvdW5kUGF0aHMsIGxpbmtIYXNoTWFwKTtcbiAgICAvLyAgICAgICAgIH0pXG4gICAgLy8gICAgIH0gZWxzZSB7XG4gICAgLy8gICAgICAgICAvLyByZWFjaGVkIGVuZCBvZiBwYXRoIFxuICAgIC8vICAgICAgICAgLy8gLT4gYXBwZW5kIHRvIGZvdW5kUGF0aHMgKyByZXNldCBwYXRoXG4gICAgLy8gICAgICAgICAvLyBmb3VuZFBhdGhzLnB1c2gocGF0aC5qb2luKCcg4oaSICcpKTtcbiAgICAvLyAgICAgICAgIC8vIHBhdGggPSBbXTtcbiAgICAvLyAgICAgfVxuICAgIC8vIH1cbiAgICAvLyBwcm9iYWJseSBzaG91bGQgbW92ZSB0aGlzIHRvIHNlcnZpY2VcbiAgICAvLyBwcml2YXRlIG9ubHlVbmlxdWUodmFsdWUsIGluZGV4LCBzZWxmKSB7IFxuICAgIC8vICAgICByZXR1cm4gc2VsZi5pbmRleE9mKHZhbHVlKSA9PT0gaW5kZXg7XG4gICAgLy8gfVxuICAgIEhpZXJhcmNoeVdvcmtlci5wcm90b3R5cGUuZmluZEFsbExpbmtEZWZzID0gZnVuY3Rpb24gKGxpbmtIYXNoTWFwLCByZXZlcnNlKSB7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKFwiaW4gZmluZEFsbExpbmtEZWZzXCIpO1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICB2YXIgZm91bmRMaW5rRGVmcyA9IFtdO1xuICAgICAgICB2YXIgZm91bmRMaW5rRGVmU3RyaW5ncyA9IFtdO1xuICAgICAgICAvLyBsb29wIHRocm91Z2ggbWFwXG4gICAgICAgIGxpbmtIYXNoTWFwLmZvckVhY2goZnVuY3Rpb24gKHZhbHVlcywga2V5LCBtYXApIHtcbiAgICAgICAgICAgIHZhciBjb25uZWN0ZWRMZXZlbHMgPSBbXTtcbiAgICAgICAgICAgIC8vIGlmKFsxNzNdLmluZGV4T2Yoa2V5KSAhPT0gLTEpIHsgLy8gb25seSBzdGFydCBhdCA4IGZvciBub3dcbiAgICAgICAgICAgIHZhciBzdGFydEl0ZW0gPSBfdGhpcy5pZEhhc2hNYXAuZ2V0KGtleSk7XG4gICAgICAgICAgICB2YXIgc3RhcnRMZXZlbE5hbWUgPSBzdGFydEl0ZW0ubGFiZWxzWzBdLm5hbWU7XG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhcInN0YXJ0TGV2ZWxOYW1lOlwiLCBzdGFydExldmVsTmFtZSk7XG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhcImtleTpcIiwga2V5KTtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwidmFsdWVzOlwiLCB2YWx1ZXMpO1xuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coXCJtYXA6XCIsIG1hcCk7XG4gICAgICAgICAgICB2YWx1ZXMuZm9yRWFjaChmdW5jdGlvbiAoY29ubmVjdGVkSXRlbUlkKSB7XG4gICAgICAgICAgICAgICAgdmFyIGNvbm5lY3RlZEl0ZW0gPSBfdGhpcy5pZEhhc2hNYXAuZ2V0KGNvbm5lY3RlZEl0ZW1JZCk7XG4gICAgICAgICAgICAgICAgdmFyIGNvbm5lY3RlZEl0ZW1MZXZlbE5hbWUgPSBjb25uZWN0ZWRJdGVtLmxhYmVsc1swXS5uYW1lO1xuICAgICAgICAgICAgICAgIHZhciBsaW5rRGVmVHlwZTtcbiAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhcImNvbm5lY3RlZEl0ZW1MZXZlbE5hbWU6XCIsIGNvbm5lY3RlZEl0ZW1MZXZlbE5hbWUpO1xuICAgICAgICAgICAgICAgIGlmIChjb25uZWN0ZWRMZXZlbHMuaW5kZXhPZihjb25uZWN0ZWRJdGVtTGV2ZWxOYW1lKSA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgY29ubmVjdGVkTGV2ZWxzLnB1c2goY29ubmVjdGVkSXRlbUxldmVsTmFtZSk7XG4gICAgICAgICAgICAgICAgICAgIGxpbmtEZWZUeXBlID0gXCJPTkVfVE9fT05FXCI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXJldmVyc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbmtEZWZUeXBlID0gXCJPTkVfVE9fTUFOWVwiO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGlua0RlZlR5cGUgPSBcIk1BTllfVE9fTUFOWVwiO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIHRoaXMgYWxzbyBkZXBlbmRzIG9uIHJldmVyc2VcbiAgICAgICAgICAgICAgICB2YXIgbGlua0RlZlN0cmluZyA9IHN0YXJ0TGV2ZWxOYW1lICsgJyDihpIgJyArIGNvbm5lY3RlZEl0ZW1MZXZlbE5hbWU7XG4gICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2cobGlua0RlZlN0cmluZyk7XG4gICAgICAgICAgICAgICAgaWYgKGZvdW5kTGlua0RlZlN0cmluZ3MuaW5kZXhPZihsaW5rRGVmU3RyaW5nKSA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgZm91bmRMaW5rRGVmU3RyaW5ncy5wdXNoKGxpbmtEZWZTdHJpbmcpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXJldmVyc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvdW5kTGlua0RlZnMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogbGlua0RlZlR5cGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3VwZXJsZXZlbE5hbWU6IHN0YXJ0TGV2ZWxOYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1YmxldmVsTmFtZTogY29ubmVjdGVkSXRlbUxldmVsTmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3VuZExpbmtEZWZzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IGxpbmtEZWZUeXBlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1cGVybGV2ZWxOYW1lOiBjb25uZWN0ZWRJdGVtTGV2ZWxOYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1YmxldmVsTmFtZTogc3RhcnRMZXZlbE5hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyB1cGRhdGUgdHlwZSAob25seSBpbiB1cGdyYWRhYmxlIGRpcmVjdGlvbilcbiAgICAgICAgICAgICAgICAgICAgaWYgKGZvdW5kTGlua0RlZnNbZm91bmRMaW5rRGVmU3RyaW5ncy5pbmRleE9mKGxpbmtEZWZTdHJpbmcpXS50eXBlID09PSBcIk9ORV9UT19PTkVcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgZm91bmRMaW5rRGVmc1tmb3VuZExpbmtEZWZTdHJpbmdzLmluZGV4T2YobGlua0RlZlN0cmluZyldLnR5cGUgPSBsaW5rRGVmVHlwZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChmb3VuZExpbmtEZWZzW2ZvdW5kTGlua0RlZlN0cmluZ3MuaW5kZXhPZihsaW5rRGVmU3RyaW5nKV0udHlwZSA9PT0gXCJPTkVfVE9fTUFOWVwiICYmIGxpbmtEZWZUeXBlID09PSBcIk1BTllfVE9fTUFOWVwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3VuZExpbmtEZWZzW2ZvdW5kTGlua0RlZlN0cmluZ3MuaW5kZXhPZihsaW5rRGVmU3RyaW5nKV0udHlwZSA9IGxpbmtEZWZUeXBlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAvLyB9XG4gICAgICAgIH0pO1xuICAgICAgICAvLyBjb25zb2xlLmxvZyhcIi0tLS0tLS0tLS0tLVwiKTtcbiAgICAgICAgLy8gY29uc29sZS5sb2coZm91bmRMaW5rRGVmU3RyaW5ncyk7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKGZvdW5kTGlua0RlZnMpOyAvLyBmb3VuZExpbmtEZWZzLmZpbHRlcih0aGlzLm9ubHlVbmlxdWUpXG4gICAgICAgIHJldHVybiAoZm91bmRMaW5rRGVmcyk7XG4gICAgfTtcbiAgICByZXR1cm4gSGllcmFyY2h5V29ya2VyO1xufSgpKTtcbmV4cG9ydCB7IEhpZXJhcmNoeVdvcmtlciB9O1xuO1xuICBleHBvc2UoXG4gICAgT2JqZWN0LmtleXMoX193ZWJwYWNrX2V4cG9ydHNfXykucmVkdWNlKGZ1bmN0aW9uKHIsayl7XG4gICAgICBpZiAoaz09J19fZXNNb2R1bGUnKSByZXR1cm4gcjtcbiAgICAgIHJba10gPSBfX3dlYnBhY2tfZXhwb3J0c19fW2tdO1xuICAgICAgcmV0dXJuIHJcbiAgICB9LHt9KVxuICApIiwiLyoqXHJcbiAqIENvcHlyaWdodCAyMDE5IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXHJcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XHJcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cclxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XHJcbiAqICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcclxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxyXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXHJcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxyXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXHJcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxyXG4gKi9cclxuY29uc3QgcHJveHlNYXJrZXIgPSBTeW1ib2woXCJDb21saW5rLnByb3h5XCIpO1xyXG5jb25zdCBjcmVhdGVFbmRwb2ludCA9IFN5bWJvbChcIkNvbWxpbmsuZW5kcG9pbnRcIik7XHJcbmNvbnN0IHJlbGVhc2VQcm94eSA9IFN5bWJvbChcIkNvbWxpbmsucmVsZWFzZVByb3h5XCIpO1xyXG5jb25zdCB0aHJvd1NldCA9IG5ldyBXZWFrU2V0KCk7XHJcbmNvbnN0IHRyYW5zZmVySGFuZGxlcnMgPSBuZXcgTWFwKFtcclxuICAgIFtcclxuICAgICAgICBcInByb3h5XCIsXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjYW5IYW5kbGU6IG9iaiA9PiBvYmogJiYgb2JqW3Byb3h5TWFya2VyXSxcclxuICAgICAgICAgICAgc2VyaWFsaXplKG9iaikge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgeyBwb3J0MSwgcG9ydDIgfSA9IG5ldyBNZXNzYWdlQ2hhbm5lbCgpO1xyXG4gICAgICAgICAgICAgICAgZXhwb3NlKG9iaiwgcG9ydDEpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFtwb3J0MiwgW3BvcnQyXV07XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGRlc2VyaWFsaXplOiAocG9ydCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgcG9ydC5zdGFydCgpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHdyYXAocG9ydCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICBdLFxyXG4gICAgW1xyXG4gICAgICAgIFwidGhyb3dcIixcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNhbkhhbmRsZTogb2JqID0+IHRocm93U2V0LmhhcyhvYmopLFxyXG4gICAgICAgICAgICBzZXJpYWxpemUob2JqKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBpc0Vycm9yID0gb2JqIGluc3RhbmNlb2YgRXJyb3I7XHJcbiAgICAgICAgICAgICAgICBsZXQgc2VyaWFsaXplZCA9IG9iajtcclxuICAgICAgICAgICAgICAgIGlmIChpc0Vycm9yKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VyaWFsaXplZCA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaXNFcnJvcixcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogb2JqLm1lc3NhZ2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YWNrOiBvYmouc3RhY2tcclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFtzZXJpYWxpemVkLCBbXV07XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGRlc2VyaWFsaXplKG9iaikge1xyXG4gICAgICAgICAgICAgICAgaWYgKG9iai5pc0Vycm9yKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgT2JqZWN0LmFzc2lnbihuZXcgRXJyb3IoKSwgb2JqKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHRocm93IG9iajtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIF1cclxuXSk7XHJcbmZ1bmN0aW9uIGV4cG9zZShvYmosIGVwID0gc2VsZikge1xyXG4gICAgZXAuYWRkRXZlbnRMaXN0ZW5lcihcIm1lc3NhZ2VcIiwgZnVuY3Rpb24gY2FsbGJhY2soZXYpIHtcclxuICAgICAgICBpZiAoIWV2IHx8ICFldi5kYXRhKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgeyBpZCwgdHlwZSwgcGF0aCB9ID0gT2JqZWN0LmFzc2lnbih7IHBhdGg6IFtdIH0sIGV2LmRhdGEpO1xyXG4gICAgICAgIGNvbnN0IGFyZ3VtZW50TGlzdCA9IChldi5kYXRhLmFyZ3VtZW50TGlzdCB8fCBbXSkubWFwKGZyb21XaXJlVmFsdWUpO1xyXG4gICAgICAgIGxldCByZXR1cm5WYWx1ZTtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBjb25zdCBwYXJlbnQgPSBwYXRoLnNsaWNlKDAsIC0xKS5yZWR1Y2UoKG9iaiwgcHJvcCkgPT4gb2JqW3Byb3BdLCBvYmopO1xyXG4gICAgICAgICAgICBjb25zdCByYXdWYWx1ZSA9IHBhdGgucmVkdWNlKChvYmosIHByb3ApID0+IG9ialtwcm9wXSwgb2JqKTtcclxuICAgICAgICAgICAgc3dpdGNoICh0eXBlKSB7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDAgLyogR0VUICovOlxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuVmFsdWUgPSByYXdWYWx1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDEgLyogU0VUICovOlxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyZW50W3BhdGguc2xpY2UoLTEpWzBdXSA9IGZyb21XaXJlVmFsdWUoZXYuZGF0YS52YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVyblZhbHVlID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDIgLyogQVBQTFkgKi86XHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm5WYWx1ZSA9IHJhd1ZhbHVlLmFwcGx5KHBhcmVudCwgYXJndW1lbnRMaXN0KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDMgLyogQ09OU1RSVUNUICovOlxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBuZXcgcmF3VmFsdWUoLi4uYXJndW1lbnRMaXN0KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuVmFsdWUgPSBwcm94eSh2YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSA0IC8qIEVORFBPSU5UICovOlxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgeyBwb3J0MSwgcG9ydDIgfSA9IG5ldyBNZXNzYWdlQ2hhbm5lbCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBleHBvc2Uob2JqLCBwb3J0Mik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVyblZhbHVlID0gdHJhbnNmZXIocG9ydDEsIFtwb3J0MV0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgNSAvKiBSRUxFQVNFICovOlxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuVmFsdWUgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgIHJldHVyblZhbHVlID0gZTtcclxuICAgICAgICAgICAgdGhyb3dTZXQuYWRkKGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBQcm9taXNlLnJlc29sdmUocmV0dXJuVmFsdWUpXHJcbiAgICAgICAgICAgIC5jYXRjaChlID0+IHtcclxuICAgICAgICAgICAgdGhyb3dTZXQuYWRkKGUpO1xyXG4gICAgICAgICAgICByZXR1cm4gZTtcclxuICAgICAgICB9KVxyXG4gICAgICAgICAgICAudGhlbihyZXR1cm5WYWx1ZSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IFt3aXJlVmFsdWUsIHRyYW5zZmVyYWJsZXNdID0gdG9XaXJlVmFsdWUocmV0dXJuVmFsdWUpO1xyXG4gICAgICAgICAgICBlcC5wb3N0TWVzc2FnZShPYmplY3QuYXNzaWduKE9iamVjdC5hc3NpZ24oe30sIHdpcmVWYWx1ZSksIHsgaWQgfSksIHRyYW5zZmVyYWJsZXMpO1xyXG4gICAgICAgICAgICBpZiAodHlwZSA9PT0gNSAvKiBSRUxFQVNFICovKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBkZXRhY2ggYW5kIGRlYWN0aXZlIGFmdGVyIHNlbmRpbmcgcmVsZWFzZSByZXNwb25zZSBhYm92ZS5cclxuICAgICAgICAgICAgICAgIGVwLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtZXNzYWdlXCIsIGNhbGxiYWNrKTtcclxuICAgICAgICAgICAgICAgIGNsb3NlRW5kUG9pbnQoZXApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxuICAgIGlmIChlcC5zdGFydCkge1xyXG4gICAgICAgIGVwLnN0YXJ0KCk7XHJcbiAgICB9XHJcbn1cclxuZnVuY3Rpb24gaXNNZXNzYWdlUG9ydChlbmRwb2ludCkge1xyXG4gICAgcmV0dXJuIGVuZHBvaW50LmNvbnN0cnVjdG9yLm5hbWUgPT09IFwiTWVzc2FnZVBvcnRcIjtcclxufVxyXG5mdW5jdGlvbiBjbG9zZUVuZFBvaW50KGVuZHBvaW50KSB7XHJcbiAgICBpZiAoaXNNZXNzYWdlUG9ydChlbmRwb2ludCkpXHJcbiAgICAgICAgZW5kcG9pbnQuY2xvc2UoKTtcclxufVxyXG5mdW5jdGlvbiB3cmFwKGVwLCB0YXJnZXQpIHtcclxuICAgIHJldHVybiBjcmVhdGVQcm94eShlcCwgW10sIHRhcmdldCk7XHJcbn1cclxuZnVuY3Rpb24gdGhyb3dJZlByb3h5UmVsZWFzZWQoaXNSZWxlYXNlZCkge1xyXG4gICAgaWYgKGlzUmVsZWFzZWQpIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJQcm94eSBoYXMgYmVlbiByZWxlYXNlZCBhbmQgaXMgbm90IHVzZWFibGVcIik7XHJcbiAgICB9XHJcbn1cclxuZnVuY3Rpb24gY3JlYXRlUHJveHkoZXAsIHBhdGggPSBbXSwgdGFyZ2V0ID0gZnVuY3Rpb24gKCkgeyB9KSB7XHJcbiAgICBsZXQgaXNQcm94eVJlbGVhc2VkID0gZmFsc2U7XHJcbiAgICBjb25zdCBwcm94eSA9IG5ldyBQcm94eSh0YXJnZXQsIHtcclxuICAgICAgICBnZXQoX3RhcmdldCwgcHJvcCkge1xyXG4gICAgICAgICAgICB0aHJvd0lmUHJveHlSZWxlYXNlZChpc1Byb3h5UmVsZWFzZWQpO1xyXG4gICAgICAgICAgICBpZiAocHJvcCA9PT0gcmVsZWFzZVByb3h5KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXF1ZXN0UmVzcG9uc2VNZXNzYWdlKGVwLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IDUgLyogUkVMRUFTRSAqLyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGF0aDogcGF0aC5tYXAocCA9PiBwLnRvU3RyaW5nKCkpXHJcbiAgICAgICAgICAgICAgICAgICAgfSkudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsb3NlRW5kUG9pbnQoZXApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpc1Byb3h5UmVsZWFzZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAocHJvcCA9PT0gXCJ0aGVuXCIpIHtcclxuICAgICAgICAgICAgICAgIGlmIChwYXRoLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7IHRoZW46ICgpID0+IHByb3h5IH07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjb25zdCByID0gcmVxdWVzdFJlc3BvbnNlTWVzc2FnZShlcCwge1xyXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IDAgLyogR0VUICovLFxyXG4gICAgICAgICAgICAgICAgICAgIHBhdGg6IHBhdGgubWFwKHAgPT4gcC50b1N0cmluZygpKVxyXG4gICAgICAgICAgICAgICAgfSkudGhlbihmcm9tV2lyZVZhbHVlKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiByLnRoZW4uYmluZChyKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gY3JlYXRlUHJveHkoZXAsIFsuLi5wYXRoLCBwcm9wXSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBzZXQoX3RhcmdldCwgcHJvcCwgcmF3VmFsdWUpIHtcclxuICAgICAgICAgICAgdGhyb3dJZlByb3h5UmVsZWFzZWQoaXNQcm94eVJlbGVhc2VkKTtcclxuICAgICAgICAgICAgLy8gRklYTUU6IEVTNiBQcm94eSBIYW5kbGVyIGBzZXRgIG1ldGhvZHMgYXJlIHN1cHBvc2VkIHRvIHJldHVybiBhXHJcbiAgICAgICAgICAgIC8vIGJvb2xlYW4uIFRvIHNob3cgZ29vZCB3aWxsLCB3ZSByZXR1cm4gdHJ1ZSBhc3luY2hyb25vdXNseSDCr1xcXyjjg4QpXy/Cr1xyXG4gICAgICAgICAgICBjb25zdCBbdmFsdWUsIHRyYW5zZmVyYWJsZXNdID0gdG9XaXJlVmFsdWUocmF3VmFsdWUpO1xyXG4gICAgICAgICAgICByZXR1cm4gcmVxdWVzdFJlc3BvbnNlTWVzc2FnZShlcCwge1xyXG4gICAgICAgICAgICAgICAgdHlwZTogMSAvKiBTRVQgKi8sXHJcbiAgICAgICAgICAgICAgICBwYXRoOiBbLi4ucGF0aCwgcHJvcF0ubWFwKHAgPT4gcC50b1N0cmluZygpKSxcclxuICAgICAgICAgICAgICAgIHZhbHVlXHJcbiAgICAgICAgICAgIH0sIHRyYW5zZmVyYWJsZXMpLnRoZW4oZnJvbVdpcmVWYWx1ZSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBhcHBseShfdGFyZ2V0LCBfdGhpc0FyZywgcmF3QXJndW1lbnRMaXN0KSB7XHJcbiAgICAgICAgICAgIHRocm93SWZQcm94eVJlbGVhc2VkKGlzUHJveHlSZWxlYXNlZCk7XHJcbiAgICAgICAgICAgIGNvbnN0IGxhc3QgPSBwYXRoW3BhdGgubGVuZ3RoIC0gMV07XHJcbiAgICAgICAgICAgIGlmIChsYXN0ID09PSBjcmVhdGVFbmRwb2ludCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlcXVlc3RSZXNwb25zZU1lc3NhZ2UoZXAsIHtcclxuICAgICAgICAgICAgICAgICAgICB0eXBlOiA0IC8qIEVORFBPSU5UICovXHJcbiAgICAgICAgICAgICAgICB9KS50aGVuKGZyb21XaXJlVmFsdWUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIFdlIGp1c3QgcHJldGVuZCB0aGF0IGBiaW5kKClgIGRpZG7igJl0IGhhcHBlbi5cclxuICAgICAgICAgICAgaWYgKGxhc3QgPT09IFwiYmluZFwiKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gY3JlYXRlUHJveHkoZXAsIHBhdGguc2xpY2UoMCwgLTEpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zdCBbYXJndW1lbnRMaXN0LCB0cmFuc2ZlcmFibGVzXSA9IHByb2Nlc3NBcmd1bWVudHMocmF3QXJndW1lbnRMaXN0KTtcclxuICAgICAgICAgICAgcmV0dXJuIHJlcXVlc3RSZXNwb25zZU1lc3NhZ2UoZXAsIHtcclxuICAgICAgICAgICAgICAgIHR5cGU6IDIgLyogQVBQTFkgKi8sXHJcbiAgICAgICAgICAgICAgICBwYXRoOiBwYXRoLm1hcChwID0+IHAudG9TdHJpbmcoKSksXHJcbiAgICAgICAgICAgICAgICBhcmd1bWVudExpc3RcclxuICAgICAgICAgICAgfSwgdHJhbnNmZXJhYmxlcykudGhlbihmcm9tV2lyZVZhbHVlKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGNvbnN0cnVjdChfdGFyZ2V0LCByYXdBcmd1bWVudExpc3QpIHtcclxuICAgICAgICAgICAgdGhyb3dJZlByb3h5UmVsZWFzZWQoaXNQcm94eVJlbGVhc2VkKTtcclxuICAgICAgICAgICAgY29uc3QgW2FyZ3VtZW50TGlzdCwgdHJhbnNmZXJhYmxlc10gPSBwcm9jZXNzQXJndW1lbnRzKHJhd0FyZ3VtZW50TGlzdCk7XHJcbiAgICAgICAgICAgIHJldHVybiByZXF1ZXN0UmVzcG9uc2VNZXNzYWdlKGVwLCB7XHJcbiAgICAgICAgICAgICAgICB0eXBlOiAzIC8qIENPTlNUUlVDVCAqLyxcclxuICAgICAgICAgICAgICAgIHBhdGg6IHBhdGgubWFwKHAgPT4gcC50b1N0cmluZygpKSxcclxuICAgICAgICAgICAgICAgIGFyZ3VtZW50TGlzdFxyXG4gICAgICAgICAgICB9LCB0cmFuc2ZlcmFibGVzKS50aGVuKGZyb21XaXJlVmFsdWUpO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIHByb3h5O1xyXG59XHJcbmZ1bmN0aW9uIG15RmxhdChhcnIpIHtcclxuICAgIHJldHVybiBBcnJheS5wcm90b3R5cGUuY29uY2F0LmFwcGx5KFtdLCBhcnIpO1xyXG59XHJcbmZ1bmN0aW9uIHByb2Nlc3NBcmd1bWVudHMoYXJndW1lbnRMaXN0KSB7XHJcbiAgICBjb25zdCBwcm9jZXNzZWQgPSBhcmd1bWVudExpc3QubWFwKHRvV2lyZVZhbHVlKTtcclxuICAgIHJldHVybiBbcHJvY2Vzc2VkLm1hcCh2ID0+IHZbMF0pLCBteUZsYXQocHJvY2Vzc2VkLm1hcCh2ID0+IHZbMV0pKV07XHJcbn1cclxuY29uc3QgdHJhbnNmZXJDYWNoZSA9IG5ldyBXZWFrTWFwKCk7XHJcbmZ1bmN0aW9uIHRyYW5zZmVyKG9iaiwgdHJhbnNmZXJzKSB7XHJcbiAgICB0cmFuc2ZlckNhY2hlLnNldChvYmosIHRyYW5zZmVycyk7XHJcbiAgICByZXR1cm4gb2JqO1xyXG59XHJcbmZ1bmN0aW9uIHByb3h5KG9iaikge1xyXG4gICAgcmV0dXJuIE9iamVjdC5hc3NpZ24ob2JqLCB7IFtwcm94eU1hcmtlcl06IHRydWUgfSk7XHJcbn1cclxuZnVuY3Rpb24gd2luZG93RW5kcG9pbnQodywgY29udGV4dCA9IHNlbGYsIHRhcmdldE9yaWdpbiA9IFwiKlwiKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHBvc3RNZXNzYWdlOiAobXNnLCB0cmFuc2ZlcmFibGVzKSA9PiB3LnBvc3RNZXNzYWdlKG1zZywgdGFyZ2V0T3JpZ2luLCB0cmFuc2ZlcmFibGVzKSxcclxuICAgICAgICBhZGRFdmVudExpc3RlbmVyOiBjb250ZXh0LmFkZEV2ZW50TGlzdGVuZXIuYmluZChjb250ZXh0KSxcclxuICAgICAgICByZW1vdmVFdmVudExpc3RlbmVyOiBjb250ZXh0LnJlbW92ZUV2ZW50TGlzdGVuZXIuYmluZChjb250ZXh0KVxyXG4gICAgfTtcclxufVxyXG5mdW5jdGlvbiB0b1dpcmVWYWx1ZSh2YWx1ZSkge1xyXG4gICAgZm9yIChjb25zdCBbbmFtZSwgaGFuZGxlcl0gb2YgdHJhbnNmZXJIYW5kbGVycykge1xyXG4gICAgICAgIGlmIChoYW5kbGVyLmNhbkhhbmRsZSh2YWx1ZSkpIHtcclxuICAgICAgICAgICAgY29uc3QgW3NlcmlhbGl6ZWRWYWx1ZSwgdHJhbnNmZXJhYmxlc10gPSBoYW5kbGVyLnNlcmlhbGl6ZSh2YWx1ZSk7XHJcbiAgICAgICAgICAgIHJldHVybiBbXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogMyAvKiBIQU5ETEVSICovLFxyXG4gICAgICAgICAgICAgICAgICAgIG5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHNlcmlhbGl6ZWRWYWx1ZVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHRyYW5zZmVyYWJsZXNcclxuICAgICAgICAgICAgXTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gW1xyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdHlwZTogMCAvKiBSQVcgKi8sXHJcbiAgICAgICAgICAgIHZhbHVlXHJcbiAgICAgICAgfSxcclxuICAgICAgICB0cmFuc2ZlckNhY2hlLmdldCh2YWx1ZSkgfHwgW11cclxuICAgIF07XHJcbn1cclxuZnVuY3Rpb24gZnJvbVdpcmVWYWx1ZSh2YWx1ZSkge1xyXG4gICAgc3dpdGNoICh2YWx1ZS50eXBlKSB7XHJcbiAgICAgICAgY2FzZSAzIC8qIEhBTkRMRVIgKi86XHJcbiAgICAgICAgICAgIHJldHVybiB0cmFuc2ZlckhhbmRsZXJzLmdldCh2YWx1ZS5uYW1lKS5kZXNlcmlhbGl6ZSh2YWx1ZS52YWx1ZSk7XHJcbiAgICAgICAgY2FzZSAwIC8qIFJBVyAqLzpcclxuICAgICAgICAgICAgcmV0dXJuIHZhbHVlLnZhbHVlO1xyXG4gICAgfVxyXG59XHJcbmZ1bmN0aW9uIHJlcXVlc3RSZXNwb25zZU1lc3NhZ2UoZXAsIG1zZywgdHJhbnNmZXJzKSB7XHJcbiAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XHJcbiAgICAgICAgY29uc3QgaWQgPSBnZW5lcmF0ZVVVSUQoKTtcclxuICAgICAgICBlcC5hZGRFdmVudExpc3RlbmVyKFwibWVzc2FnZVwiLCBmdW5jdGlvbiBsKGV2KSB7XHJcbiAgICAgICAgICAgIGlmICghZXYuZGF0YSB8fCAhZXYuZGF0YS5pZCB8fCBldi5kYXRhLmlkICE9PSBpZCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVwLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtZXNzYWdlXCIsIGwpO1xyXG4gICAgICAgICAgICByZXNvbHZlKGV2LmRhdGEpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGlmIChlcC5zdGFydCkge1xyXG4gICAgICAgICAgICBlcC5zdGFydCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlcC5wb3N0TWVzc2FnZShPYmplY3QuYXNzaWduKHsgaWQgfSwgbXNnKSwgdHJhbnNmZXJzKTtcclxuICAgIH0pO1xyXG59XHJcbmZ1bmN0aW9uIGdlbmVyYXRlVVVJRCgpIHtcclxuICAgIHJldHVybiBuZXcgQXJyYXkoNClcclxuICAgICAgICAuZmlsbCgwKVxyXG4gICAgICAgIC5tYXAoKCkgPT4gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVIpLnRvU3RyaW5nKDE2KSlcclxuICAgICAgICAuam9pbihcIi1cIik7XHJcbn1cblxuZXhwb3J0IHsgY3JlYXRlRW5kcG9pbnQsIGV4cG9zZSwgcHJveHksIHByb3h5TWFya2VyLCByZWxlYXNlUHJveHksIHRyYW5zZmVyLCB0cmFuc2ZlckhhbmRsZXJzLCB3aW5kb3dFbmRwb2ludCwgd3JhcCB9O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Y29tbGluay5tanMubWFwXG4iXSwic291cmNlUm9vdCI6IiJ9