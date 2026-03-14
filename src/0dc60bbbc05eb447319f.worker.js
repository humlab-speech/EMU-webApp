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
        path.forEach(function (ln, lnIdx) {
            if (ln !== path[path.length - 1]) {
                var parentLevelClone = JSON.parse(JSON.stringify(_this.getLevelDetails(path[lnIdx + 1], annotation)));
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vc3JjL2FwcC93b3JrZXJzL2hpZXJhcmNoeS53b3JrZXIudHMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2NvbWxpbmsvZGlzdC9lc20vY29tbGluay5tanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtRQUFBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBOzs7UUFHQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0EsMENBQTBDLGdDQUFnQztRQUMxRTtRQUNBOztRQUVBO1FBQ0E7UUFDQTtRQUNBLHdEQUF3RCxrQkFBa0I7UUFDMUU7UUFDQSxpREFBaUQsY0FBYztRQUMvRDs7UUFFQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0EseUNBQXlDLGlDQUFpQztRQUMxRSxnSEFBZ0gsbUJBQW1CLEVBQUU7UUFDckk7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQSwyQkFBMkIsMEJBQTBCLEVBQUU7UUFDdkQsaUNBQWlDLGVBQWU7UUFDaEQ7UUFDQTtRQUNBOztRQUVBO1FBQ0Esc0RBQXNELCtEQUErRDs7UUFFckg7UUFDQTs7O1FBR0E7UUFDQTs7Ozs7Ozs7Ozs7OztBQ2xGQTtBQUFBO0FBQUE7QUFBaUM7QUFDakM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtQ0FBbUM7QUFDbkM7QUFDQTtBQUNBLHFEQUFxRDtBQUNyRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsbUNBQW1DO0FBQ25DO0FBQ0E7QUFDQSxxREFBcUQ7QUFDckQscURBQXFEO0FBQ3JEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2IsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw0REFBNEQ7QUFDNUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDZCQUE2QjtBQUM3QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYixTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0JBQWdCO0FBQ2hCLFlBQVk7QUFDWjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLCtDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw4Q0FBOEM7QUFDOUM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EseUJBQXlCO0FBQ3pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHlCQUF5QjtBQUN6QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQSxzQ0FBc0M7QUFDdEM7QUFDQTtBQUNBO0FBQ0EsQ0FBQztBQUMwQjtBQUMzQjtBQUNBLEVBQUUsc0RBQU07QUFDUjtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUssR0FBRztBQUNSLEc7Ozs7Ozs7Ozs7OztBQ3pUQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsdUJBQXVCLGVBQWU7QUFDdEM7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGVBQWUsaUJBQWlCLGtCQUFrQixXQUFXO0FBQzdEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLCtCQUErQixlQUFlO0FBQzlDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQSx5REFBeUQsZUFBZSxLQUFLO0FBQzdFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1QsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMERBQTBELEVBQUU7QUFDNUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscUJBQXFCO0FBQ3JCO0FBQ0E7QUFDQSxxQkFBcUI7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQSw0QkFBNEI7QUFDNUI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYixTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwrQkFBK0Isc0JBQXNCO0FBQ3JEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBLHNDQUFzQyxLQUFLO0FBQzNDLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFc0g7QUFDdEgiLCJmaWxlIjoiMGRjNjBiYmJjMDVlYjQ0NzMxOWYud29ya2VyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZ2V0dGVyIH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSBmdW5jdGlvbihleHBvcnRzKSB7XG4gXHRcdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuIFx0XHR9XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG4gXHR9O1xuXG4gXHQvLyBjcmVhdGUgYSBmYWtlIG5hbWVzcGFjZSBvYmplY3RcbiBcdC8vIG1vZGUgJiAxOiB2YWx1ZSBpcyBhIG1vZHVsZSBpZCwgcmVxdWlyZSBpdFxuIFx0Ly8gbW9kZSAmIDI6IG1lcmdlIGFsbCBwcm9wZXJ0aWVzIG9mIHZhbHVlIGludG8gdGhlIG5zXG4gXHQvLyBtb2RlICYgNDogcmV0dXJuIHZhbHVlIHdoZW4gYWxyZWFkeSBucyBvYmplY3RcbiBcdC8vIG1vZGUgJiA4fDE6IGJlaGF2ZSBsaWtlIHJlcXVpcmVcbiBcdF9fd2VicGFja19yZXF1aXJlX18udCA9IGZ1bmN0aW9uKHZhbHVlLCBtb2RlKSB7XG4gXHRcdGlmKG1vZGUgJiAxKSB2YWx1ZSA9IF9fd2VicGFja19yZXF1aXJlX18odmFsdWUpO1xuIFx0XHRpZihtb2RlICYgOCkgcmV0dXJuIHZhbHVlO1xuIFx0XHRpZigobW9kZSAmIDQpICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgdmFsdWUgJiYgdmFsdWUuX19lc01vZHVsZSkgcmV0dXJuIHZhbHVlO1xuIFx0XHR2YXIgbnMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLnIobnMpO1xuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkobnMsICdkZWZhdWx0JywgeyBlbnVtZXJhYmxlOiB0cnVlLCB2YWx1ZTogdmFsdWUgfSk7XG4gXHRcdGlmKG1vZGUgJiAyICYmIHR5cGVvZiB2YWx1ZSAhPSAnc3RyaW5nJykgZm9yKHZhciBrZXkgaW4gdmFsdWUpIF9fd2VicGFja19yZXF1aXJlX18uZChucywga2V5LCBmdW5jdGlvbihrZXkpIHsgcmV0dXJuIHZhbHVlW2tleV07IH0uYmluZChudWxsLCBrZXkpKTtcbiBcdFx0cmV0dXJuIG5zO1xuIFx0fTtcblxuIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbiBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiBcdFx0cmV0dXJuIGdldHRlcjtcbiBcdH07XG5cbiBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IFwiLi9ub2RlX21vZHVsZXMvY29tbGluay1sb2FkZXIvZGlzdC9jb21saW5rLXdvcmtlci1sb2FkZXIuanMhLi9ub2RlX21vZHVsZXMvdHMtbG9hZGVyL2luZGV4LmpzIS4vc3JjL2FwcC93b3JrZXJzL2hpZXJhcmNoeS53b3JrZXIudHNcIik7XG4iLCJpbXBvcnQgeyBleHBvc2UgfSBmcm9tICdjb21saW5rJztcbiAgdmFyIEhpZXJhcmNoeVdvcmtlciA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcbiAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgICAvLyBwdWJsaWMgYXBpXG4gICAgZnVuY3Rpb24gSGllcmFyY2h5V29ya2VyKCkge1xuICAgIH1cbiAgICBIaWVyYXJjaHlXb3JrZXIucHJvdG90eXBlLnJlZHVjZUFubm90YXRpb25Ub1ZpZXdhYmxlVGltZUFuZFBhdGggPSBmdW5jdGlvbiAoYW5ub3RhdGlvbiwgcGF0aCwgdmlld1BvcnRTdGFydFNhbXBsZSwgdmlld1BvcnRFbmRTYW1wbGUpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgdGhpcy5pZEhhc2hNYXAgPSB1bmRlZmluZWQ7IC8vIHJlc2V0IDQgICAgICAgXG4gICAgICAgIHRoaXMubGlua1N1YlRvU3VwZXJIYXNoTWFwID0gdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLmNyZWF0ZUlkSGFzaE1hcEZvclBhdGgocGF0aCwgYW5ub3RhdGlvbik7XG4gICAgICAgIHRoaXMuY3JlYXRlTGlua1N1YlRvU3VwZXJIYXNoTWFwKGFubm90YXRpb24pOyAvLyBmcm9tIGNoaWxkIHRvIHBhcmVudHNcbiAgICAgICAgdmFyIGNoaWxkTGV2ZWwgPSB0aGlzLnJlZHVjZVRvSXRlbXNXaXRoVGltZUluVmlldyhhbm5vdGF0aW9uLCBwYXRoLCB2aWV3UG9ydFN0YXJ0U2FtcGxlLCB2aWV3UG9ydEVuZFNhbXBsZSk7XG4gICAgICAgIC8vIGNsb25lIGFuZCBlbXB0eSBhbm5vdGF0aW9uXG4gICAgICAgIHZhciBhbm5vdGF0aW9uQ2xvbmUgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGFubm90YXRpb24pKTtcbiAgICAgICAgYW5ub3RhdGlvbkNsb25lLmxldmVscyA9IFtdO1xuICAgICAgICBhbm5vdGF0aW9uQ2xvbmUubGV2ZWxzLnB1c2goSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShjaGlsZExldmVsKSkpO1xuICAgICAgICBhbm5vdGF0aW9uQ2xvbmUubGlua3MgPSBbXTtcbiAgICAgICAgcGF0aC5mb3JFYWNoKGZ1bmN0aW9uIChsbiwgbG5JZHgpIHtcbiAgICAgICAgICAgIGlmIChsbiAhPT0gcGF0aFtwYXRoLmxlbmd0aCAtIDFdKSB7XG4gICAgICAgICAgICAgICAgdmFyIHBhcmVudExldmVsQ2xvbmUgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KF90aGlzLmdldExldmVsRGV0YWlscyhwYXRoW2xuSWR4ICsgMV0sIGFubm90YXRpb24pKSk7XG4gICAgICAgICAgICAgICAgcGFyZW50TGV2ZWxDbG9uZS5pdGVtcyA9IFtdO1xuICAgICAgICAgICAgICAgIF90aGlzLmdpdmVUaW1lVG9QYXJlbnRzQW5kQXBwZW5kSXRlbXNBbmRMaW5rcyhhbm5vdGF0aW9uQ2xvbmUsIHBhcmVudExldmVsQ2xvbmUsIGNoaWxkTGV2ZWwpO1xuICAgICAgICAgICAgICAgIGFubm90YXRpb25DbG9uZS5sZXZlbHMucHVzaChwYXJlbnRMZXZlbENsb25lKTtcbiAgICAgICAgICAgICAgICBjaGlsZExldmVsID0gYW5ub3RhdGlvbkNsb25lLmxldmVsc1thbm5vdGF0aW9uQ2xvbmUubGV2ZWxzLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGFubm90YXRpb25DbG9uZTtcbiAgICB9O1xuICAgIC8qKlxuICAgICogcmV0dXJucyBsZXZlbCBkZXRhaWxzIGJ5IHBhc3NpbmcgaW4gbGV2ZWwgbmFtZVxuICAgICogaWYgdGhlIGNvcnJlc3BvbmRpbmcgbGV2ZWwgZXhpc3RzXG4gICAgKiBvdGhlcndpc2UgcmV0dXJucyAnbnVsbCdcbiAgICAqICAgIEBwYXJhbSBuYW1lXG4gICAgKi9cbiAgICBIaWVyYXJjaHlXb3JrZXIucHJvdG90eXBlLmdldExldmVsRGV0YWlscyA9IGZ1bmN0aW9uIChuYW1lLCBhbm5vdGF0aW9uKSB7XG4gICAgICAgIHZhciByZXQgPSBudWxsO1xuICAgICAgICBhbm5vdGF0aW9uLmxldmVscy5mb3JFYWNoKGZ1bmN0aW9uIChsZXZlbCkge1xuICAgICAgICAgICAgaWYgKGxldmVsLm5hbWUgPT09IG5hbWUpIHtcbiAgICAgICAgICAgICAgICByZXQgPSBsZXZlbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiByZXQ7XG4gICAgfTtcbiAgICA7XG4gICAgLyoqXG4gICAgICpcbiAgICAgKiBAcGFyYW0gYW5ub3RhdGlvbiBhbm5vdGF0aW9uIHRvIGd1ZXNzIExpbmtEZWZpbml0aW9ucyBmcm9tXG4gICAgICovXG4gICAgSGllcmFyY2h5V29ya2VyLnByb3RvdHlwZS5ndWVzc0xpbmtEZWZpbml0aW9ucyA9IGZ1bmN0aW9uIChhbm5vdGF0aW9uKSB7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKGFubm90YXRpb24pXG4gICAgICAgIHRoaXMuaWRIYXNoTWFwID0gdW5kZWZpbmVkOyAvLyByZXNldCA0ICAgICAgIFxuICAgICAgICB0aGlzLmxpbmtTdWJUb1N1cGVySGFzaE1hcCA9IHVuZGVmaW5lZDtcbiAgICAgICAgdGhpcy5jcmVhdGVJZEhhc2hNYXBGb3JFdmVyeUxldmVsKGFubm90YXRpb24pO1xuICAgICAgICB0aGlzLmNyZWF0ZUxpbmtTdWJUb1N1cGVySGFzaE1hcChhbm5vdGF0aW9uKTsgLy8gZnJvbSBjaGlsZCB0byBwYXJlbnRzXG4gICAgICAgIHRoaXMuY3JlYXRlTGlua1N1cGVyVG9TdWJIYXNoTWFwKGFubm90YXRpb24pOyAvLyBmcm9tIHBhcmVudCB0byBjaGlsZHJlblxuICAgICAgICAvLyBjb25zb2xlLmxvZyh0aGlzLmlkSGFzaE1hcCk7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKHRoaXMubGlua1N1YlRvU3VwZXJIYXNoTWFwKTtcbiAgICAgICAgLy8gY29uc29sZS5sb2codGhpcy5saW5rU3VwZXJUb1N1Ykhhc2hNYXApO1xuICAgICAgICB2YXIgbGlua0RlZnNTdXBlclRvU3ViID0gdGhpcy5maW5kQWxsTGlua0RlZnModGhpcy5saW5rU3VwZXJUb1N1Ykhhc2hNYXAsIGZhbHNlKTtcbiAgICAgICAgdmFyIGxpbmtEZWZzU3ViVG9TdXBlciA9IHRoaXMuZmluZEFsbExpbmtEZWZzKHRoaXMubGlua1N1YlRvU3VwZXJIYXNoTWFwLCB0cnVlKTtcbiAgICAgICAgLy8gY29uc29sZS5sb2cobGlua0RlZnNTdXBlclRvU3ViKTtcbiAgICAgICAgLy8gY29uc29sZS5sb2cobGlua0RlZnNTdWJUb1N1cGVyKTtcbiAgICAgICAgbGlua0RlZnNTdXBlclRvU3ViLmZvckVhY2goZnVuY3Rpb24gKGxpbmtEZWZTdXBlclRvU3ViKSB7XG4gICAgICAgICAgICBsaW5rRGVmc1N1YlRvU3VwZXIuZm9yRWFjaChmdW5jdGlvbiAobGlua0RlZlN1YlRvU3VwZXIpIHtcbiAgICAgICAgICAgICAgICBpZiAobGlua0RlZlN1cGVyVG9TdWIuc3VwZXJsZXZlbE5hbWUgPT09IGxpbmtEZWZTdWJUb1N1cGVyLnN1cGVybGV2ZWxOYW1lICYmIGxpbmtEZWZTdXBlclRvU3ViLnN1YmxldmVsTmFtZSA9PT0gbGlua0RlZlN1YlRvU3VwZXIuc3VibGV2ZWxOYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChsaW5rRGVmU3VwZXJUb1N1Yi50eXBlID09PSBcIk9ORV9UT19PTkVcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGlua0RlZlN1cGVyVG9TdWIudHlwZSA9IGxpbmtEZWZTdWJUb1N1cGVyLnR5cGU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAobGlua0RlZlN1cGVyVG9TdWIudHlwZSA9PT0gXCJPTkVfVE9fTUFOWVwiICYmIGxpbmtEZWZTdWJUb1N1cGVyLnR5cGUgPT09IFwiTUFOWV9UT19NQU5ZXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbmtEZWZTdXBlclRvU3ViLnR5cGUgPSBsaW5rRGVmU3ViVG9TdXBlci50eXBlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gKGxpbmtEZWZzU3VwZXJUb1N1Yik7XG4gICAgfTtcbiAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgICAvLyBwcml2YXRlIGFwaVxuICAgIEhpZXJhcmNoeVdvcmtlci5wcm90b3R5cGUucmVkdWNlVG9JdGVtc1dpdGhUaW1lSW5WaWV3ID0gZnVuY3Rpb24gKGFubm90YXRpb24sIHBhdGgsIHZpZXdQb3J0U3RhcnRTYW1wbGUsIHZpZXdQb3J0RW5kU2FtcGxlKSB7XG4gICAgICAgIHZhciBzdWJMZXZlbFdpdGhUaW1lID0gdGhpcy5nZXRMZXZlbERldGFpbHMocGF0aFswXSwgYW5ub3RhdGlvbik7XG4gICAgICAgIHZhciBzdWJMZXZlbFdpdGhUaW1lQ2xvbmUgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHN1YkxldmVsV2l0aFRpbWUpKTtcbiAgICAgICAgc3ViTGV2ZWxXaXRoVGltZUNsb25lLml0ZW1zID0gW107XG4gICAgICAgIC8vIGxldCBpdGVtc0luVmlldyA9IFtdO1xuICAgICAgICBzdWJMZXZlbFdpdGhUaW1lLml0ZW1zLmZvckVhY2goZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgICAgICAgIGlmIChpdGVtLnNhbXBsZVN0YXJ0ICsgaXRlbS5zYW1wbGVEdXIgPiB2aWV3UG9ydFN0YXJ0U2FtcGxlICYmIGl0ZW0uc2FtcGxlU3RhcnQgPCB2aWV3UG9ydEVuZFNhbXBsZSkge1xuICAgICAgICAgICAgICAgIHN1YkxldmVsV2l0aFRpbWVDbG9uZS5pdGVtcy5wdXNoKGl0ZW0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHN1YkxldmVsV2l0aFRpbWVDbG9uZTtcbiAgICB9O1xuICAgIEhpZXJhcmNoeVdvcmtlci5wcm90b3R5cGUuZ2l2ZVRpbWVUb1BhcmVudHNBbmRBcHBlbmRJdGVtc0FuZExpbmtzID0gZnVuY3Rpb24gKGFubm90YXRpb24sIHBhcmVudExldmVsLCBjaGlsZExldmVsKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgIGNoaWxkTGV2ZWwuaXRlbXMuZm9yRWFjaChmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICAgICAgdmFyIHBhcmVudElkcyA9IF90aGlzLmxpbmtTdWJUb1N1cGVySGFzaE1hcC5nZXQoaXRlbS5pZCk7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHBhcmVudElkcyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICBwYXJlbnRJZHMuZm9yRWFjaChmdW5jdGlvbiAocGFyZW50SWQpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHBhcmVudEl0ZW0gPSBfdGhpcy5pZEhhc2hNYXAuZ2V0KHBhcmVudElkKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2cocGFyZW50SWQpO1xuICAgICAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhwYXJlbnRJdGVtKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBwYXJlbnRJdGVtICE9PSAndW5kZWZpbmVkJykgeyAvLyBhcyBvbmx5IGxldmVscyBpbiBwYXRoIGFyZSBpbiBpZEhhc2hNYXAgXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocGFyZW50SXRlbS5sYWJlbHNbMF0ubmFtZSA9PT0gcGFyZW50TGV2ZWwubmFtZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGFwcGVuZCBsaW5rXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5ub3RhdGlvbi5saW5rcy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZnJvbUlEOiBwYXJlbnRJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9JRDogaXRlbS5pZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGFkZCB0aW1lIGluZm9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHBhcmVudEl0ZW0uc2FtcGxlU3RhcnQgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudEl0ZW0uc2FtcGxlU3RhcnQgPSBpdGVtLnNhbXBsZVN0YXJ0O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnRJdGVtLnNhbXBsZUR1ciA9IGl0ZW0uc2FtcGxlRHVyO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChpdGVtLnNhbXBsZVN0YXJ0IDwgcGFyZW50SXRlbS5zYW1wbGVTdGFydCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgb2xkRW5kID0gcGFyZW50SXRlbS5zYW1wbGVTdGFydCArIHBhcmVudEl0ZW0uc2FtcGxlRHVyO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnRJdGVtLnNhbXBsZVN0YXJ0ID0gaXRlbS5zYW1wbGVTdGFydDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyZW50SXRlbS5zYW1wbGVEdXIgPSBvbGRFbmQgLSBwYXJlbnRJdGVtLnNhbXBsZVN0YXJ0O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChpdGVtLnNhbXBsZVN0YXJ0ICsgaXRlbS5zYW1wbGVEdXIgPiBwYXJlbnRJdGVtLnNhbXBsZVN0YXJ0ICsgcGFyZW50SXRlbS5zYW1wbGVEdXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyZW50SXRlbS5zYW1wbGVEdXIgPSBpdGVtLnNhbXBsZVN0YXJ0ICsgaXRlbS5zYW1wbGVEdXIgLSBwYXJlbnRJdGVtLnNhbXBsZVN0YXJ0O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBhcHBlbmQgaXRlbVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudExldmVsLml0ZW1zLnB1c2gocGFyZW50SXRlbSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgLy8gY2hlY2sgaWYgcGFyZW50IGlzIG9uIHJpZ2h0IGxldmVsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH07XG4gICAgSGllcmFyY2h5V29ya2VyLnByb3RvdHlwZS5naXZlVGltZVRvUGFyZW50cyA9IGZ1bmN0aW9uIChsZXZlbE5hbWUsIGFubm90YXRpb24sIHN1YkxldmVsV2l0aFRpbWUpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgdmFyIGxldmVsO1xuICAgICAgICBpZiAobGV2ZWxOYW1lID09PSBzdWJMZXZlbFdpdGhUaW1lLm5hbWUpIHtcbiAgICAgICAgICAgIGxldmVsID0gc3ViTGV2ZWxXaXRoVGltZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGxldmVsID0gdGhpcy5nZXRMZXZlbERldGFpbHMobGV2ZWxOYW1lLCBhbm5vdGF0aW9uKTtcbiAgICAgICAgfVxuICAgICAgICBsZXZlbC5pdGVtcy5mb3JFYWNoKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICAgICAgICB2YXIgcGFyZW50SWRzID0gX3RoaXMubGlua1N1YlRvU3VwZXJIYXNoTWFwLmdldChpdGVtLmlkKTtcbiAgICAgICAgICAgIGlmIChwYXJlbnRJZHMpIHtcbiAgICAgICAgICAgICAgICBwYXJlbnRJZHMuZm9yRWFjaChmdW5jdGlvbiAocGFyZW50SWQpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHBhcmVudCA9IF90aGlzLmlkSGFzaE1hcC5nZXQocGFyZW50SWQpO1xuICAgICAgICAgICAgICAgICAgICBpZiAocGFyZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHBhcmVudC5zYW1wbGVTdGFydCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnQuc2FtcGxlU3RhcnQgPSBpdGVtLnNhbXBsZVN0YXJ0O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudC5zYW1wbGVEdXIgPSBpdGVtLnNhbXBsZUR1cjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGl0ZW0uc2FtcGxlU3RhcnQgPCBwYXJlbnQuc2FtcGxlU3RhcnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgb2xkRW5kID0gcGFyZW50LnNhbXBsZVN0YXJ0ICsgcGFyZW50LnNhbXBsZUR1cjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnQuc2FtcGxlU3RhcnQgPSBpdGVtLnNhbXBsZVN0YXJ0O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudC5zYW1wbGVEdXIgPSBvbGRFbmQgLSBwYXJlbnQuc2FtcGxlU3RhcnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChpdGVtLnNhbXBsZVN0YXJ0ICsgaXRlbS5zYW1wbGVEdXIgPiBwYXJlbnQuc2FtcGxlU3RhcnQgKyBwYXJlbnQuc2FtcGxlRHVyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyZW50LnNhbXBsZUR1ciA9IGl0ZW0uc2FtcGxlU3RhcnQgKyBpdGVtLnNhbXBsZUR1ciAtIHBhcmVudC5zYW1wbGVTdGFydDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9O1xuICAgIEhpZXJhcmNoeVdvcmtlci5wcm90b3R5cGUuY3JlYXRlSWRIYXNoTWFwRm9yUGF0aCA9IGZ1bmN0aW9uIChwYXRoLCBhbm5vdGF0aW9uKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgIHRoaXMuaWRIYXNoTWFwID0gbmV3IE1hcCgpO1xuICAgICAgICBwYXRoLmZvckVhY2goZnVuY3Rpb24gKGxldmVsTmFtZSkge1xuICAgICAgICAgICAgdmFyIGxldmVsID0gX3RoaXMuZ2V0TGV2ZWxEZXRhaWxzKGxldmVsTmFtZSwgYW5ub3RhdGlvbik7XG4gICAgICAgICAgICBsZXZlbC5pdGVtcy5mb3JFYWNoKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICAgICAgICAgICAgX3RoaXMuaWRIYXNoTWFwLnNldChpdGVtLmlkLCBpdGVtKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9O1xuICAgIEhpZXJhcmNoeVdvcmtlci5wcm90b3R5cGUuY3JlYXRlSWRIYXNoTWFwRm9yRXZlcnlMZXZlbCA9IGZ1bmN0aW9uIChhbm5vdGF0aW9uKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgIHRoaXMuaWRIYXNoTWFwID0gbmV3IE1hcCgpO1xuICAgICAgICBhbm5vdGF0aW9uLmxldmVscy5mb3JFYWNoKGZ1bmN0aW9uIChsZXZlbCkge1xuICAgICAgICAgICAgbGV2ZWwuaXRlbXMuZm9yRWFjaChmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICAgICAgICAgIF90aGlzLmlkSGFzaE1hcC5zZXQoaXRlbS5pZCwgaXRlbSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfTtcbiAgICBIaWVyYXJjaHlXb3JrZXIucHJvdG90eXBlLmNyZWF0ZUxpbmtTdWJUb1N1cGVySGFzaE1hcCA9IGZ1bmN0aW9uIChhbm5vdGF0aW9uKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgIHRoaXMubGlua1N1YlRvU3VwZXJIYXNoTWFwID0gbmV3IE1hcCgpO1xuICAgICAgICBhbm5vdGF0aW9uLmxpbmtzLmZvckVhY2goZnVuY3Rpb24gKGxpbmspIHtcbiAgICAgICAgICAgIGlmICghX3RoaXMubGlua1N1YlRvU3VwZXJIYXNoTWFwLmhhcyhsaW5rLnRvSUQpKSB7XG4gICAgICAgICAgICAgICAgX3RoaXMubGlua1N1YlRvU3VwZXJIYXNoTWFwLnNldChsaW5rLnRvSUQsIFtsaW5rLmZyb21JRF0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdmFyIHByZXZQYXJlbnRzID0gX3RoaXMubGlua1N1YlRvU3VwZXJIYXNoTWFwLmdldChsaW5rLnRvSUQpO1xuICAgICAgICAgICAgICAgIHByZXZQYXJlbnRzLnB1c2gobGluay5mcm9tSUQpO1xuICAgICAgICAgICAgICAgIF90aGlzLmxpbmtTdWJUb1N1cGVySGFzaE1hcC5zZXQobGluay50b0lELCBwcmV2UGFyZW50cyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH07XG4gICAgSGllcmFyY2h5V29ya2VyLnByb3RvdHlwZS5jcmVhdGVMaW5rU3VwZXJUb1N1Ykhhc2hNYXAgPSBmdW5jdGlvbiAoYW5ub3RhdGlvbikge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICB0aGlzLmxpbmtTdXBlclRvU3ViSGFzaE1hcCA9IG5ldyBNYXAoKTtcbiAgICAgICAgYW5ub3RhdGlvbi5saW5rcy5mb3JFYWNoKGZ1bmN0aW9uIChsaW5rKSB7XG4gICAgICAgICAgICBpZiAoIV90aGlzLmxpbmtTdXBlclRvU3ViSGFzaE1hcC5oYXMobGluay5mcm9tSUQpKSB7XG4gICAgICAgICAgICAgICAgX3RoaXMubGlua1N1cGVyVG9TdWJIYXNoTWFwLnNldChsaW5rLmZyb21JRCwgW2xpbmsudG9JRF0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdmFyIHByZXZDaGlsZHJlbiA9IF90aGlzLmxpbmtTdXBlclRvU3ViSGFzaE1hcC5nZXQobGluay5mcm9tSUQpO1xuICAgICAgICAgICAgICAgIHByZXZDaGlsZHJlbi5wdXNoKGxpbmsudG9JRCk7XG4gICAgICAgICAgICAgICAgX3RoaXMubGlua1N1cGVyVG9TdWJIYXNoTWFwLnNldChsaW5rLmZyb21JRCwgcHJldkNoaWxkcmVuKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfTtcbiAgICAvLyBwcml2YXRlIHdhbGtBbmRBcHBlbmRUb0xpbmtEZWZpbml0aW9ucyhrZXksIHBhdGgsIGZvdW5kUGF0aHMsIGxpbmtIYXNoTWFwKXtcbiAgICAvLyAgICAgLy8gYWRkIHRvIHBhdGggb25seSBpZiB3ZSBoYXZuJ3QgdmlzaXRlZCBpdCB5ZXRcbiAgICAvLyAgICAgbGV0IGl0ZW0gPSB0aGlzLmlkSGFzaE1hcC5nZXQoa2V5KTtcbiAgICAvLyAgICAgbGV0IGN1ckxldmVsTmFtZSA9IGl0ZW0ubGFiZWxzWzBdLm5hbWU7XG4gICAgLy8gICAgIGlmKCFwYXRoLmluY2x1ZGVzKGN1ckxldmVsTmFtZSkpe1xuICAgIC8vICAgICAgICAgcGF0aC5wdXNoKGN1ckxldmVsTmFtZSk7XG4gICAgLy8gICAgIH1cbiAgICAvLyAgICAgLy8gZ2V0IHZhbHVlc1xuICAgIC8vICAgICBsZXQgdmFsdWVzID0gbGlua0hhc2hNYXAuZ2V0KGtleSk7XG4gICAgLy8gICAgIGlmKHR5cGVvZiB2YWx1ZXMgIT09IFwidW5kZWZpbmVkXCIpe1xuICAgIC8vICAgICAgICAgdmFsdWVzLmZvckVhY2goKGNvbm5lY3RlZEl0ZW1JZCkgPT4ge1xuICAgIC8vICAgICAgICAgICAgIC8vIGxldCBpdGVtID0gdGhpcy5pZEhhc2hNYXAuZ2V0KGNvbm5lY3RlZEl0ZW1JZCk7XG4gICAgLy8gICAgICAgICAgICAgLy8gcGF0aC5wdXNoKGl0ZW0ubGFiZWxzWzBdLm5hbWUpO1xuICAgIC8vICAgICAgICAgICAgIHRoaXMud2Fsa0FuZEFwcGVuZFRvTGlua0RlZmluaXRpb25zKGNvbm5lY3RlZEl0ZW1JZCwgcGF0aCwgZm91bmRQYXRocywgbGlua0hhc2hNYXApO1xuICAgIC8vICAgICAgICAgfSlcbiAgICAvLyAgICAgfSBlbHNlIHtcbiAgICAvLyAgICAgICAgIC8vIHJlYWNoZWQgZW5kIG9mIHBhdGggXG4gICAgLy8gICAgICAgICAvLyAtPiBhcHBlbmQgdG8gZm91bmRQYXRocyArIHJlc2V0IHBhdGhcbiAgICAvLyAgICAgICAgIC8vIGZvdW5kUGF0aHMucHVzaChwYXRoLmpvaW4oJyDihpIgJykpO1xuICAgIC8vICAgICAgICAgLy8gcGF0aCA9IFtdO1xuICAgIC8vICAgICB9XG4gICAgLy8gfVxuICAgIC8vIHByb2JhYmx5IHNob3VsZCBtb3ZlIHRoaXMgdG8gc2VydmljZVxuICAgIC8vIHByaXZhdGUgb25seVVuaXF1ZSh2YWx1ZSwgaW5kZXgsIHNlbGYpIHsgXG4gICAgLy8gICAgIHJldHVybiBzZWxmLmluZGV4T2YodmFsdWUpID09PSBpbmRleDtcbiAgICAvLyB9XG4gICAgSGllcmFyY2h5V29ya2VyLnByb3RvdHlwZS5maW5kQWxsTGlua0RlZnMgPSBmdW5jdGlvbiAobGlua0hhc2hNYXAsIHJldmVyc2UpIHtcbiAgICAgICAgLy8gY29uc29sZS5sb2coXCJpbiBmaW5kQWxsTGlua0RlZnNcIik7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgIHZhciBmb3VuZExpbmtEZWZzID0gW107XG4gICAgICAgIHZhciBmb3VuZExpbmtEZWZTdHJpbmdzID0gW107XG4gICAgICAgIC8vIGxvb3AgdGhyb3VnaCBtYXBcbiAgICAgICAgbGlua0hhc2hNYXAuZm9yRWFjaChmdW5jdGlvbiAodmFsdWVzLCBrZXksIG1hcCkge1xuICAgICAgICAgICAgdmFyIGNvbm5lY3RlZExldmVscyA9IFtdO1xuICAgICAgICAgICAgLy8gaWYoWzE3M10uaW5kZXhPZihrZXkpICE9PSAtMSkgeyAvLyBvbmx5IHN0YXJ0IGF0IDggZm9yIG5vd1xuICAgICAgICAgICAgdmFyIHN0YXJ0SXRlbSA9IF90aGlzLmlkSGFzaE1hcC5nZXQoa2V5KTtcbiAgICAgICAgICAgIHZhciBzdGFydExldmVsTmFtZSA9IHN0YXJ0SXRlbS5sYWJlbHNbMF0ubmFtZTtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwic3RhcnRMZXZlbE5hbWU6XCIsIHN0YXJ0TGV2ZWxOYW1lKTtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwia2V5OlwiLCBrZXkpO1xuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coXCJ2YWx1ZXM6XCIsIHZhbHVlcyk7XG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhcIm1hcDpcIiwgbWFwKTtcbiAgICAgICAgICAgIHZhbHVlcy5mb3JFYWNoKGZ1bmN0aW9uIChjb25uZWN0ZWRJdGVtSWQpIHtcbiAgICAgICAgICAgICAgICB2YXIgY29ubmVjdGVkSXRlbSA9IF90aGlzLmlkSGFzaE1hcC5nZXQoY29ubmVjdGVkSXRlbUlkKTtcbiAgICAgICAgICAgICAgICB2YXIgY29ubmVjdGVkSXRlbUxldmVsTmFtZSA9IGNvbm5lY3RlZEl0ZW0ubGFiZWxzWzBdLm5hbWU7XG4gICAgICAgICAgICAgICAgdmFyIGxpbmtEZWZUeXBlO1xuICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwiY29ubmVjdGVkSXRlbUxldmVsTmFtZTpcIiwgY29ubmVjdGVkSXRlbUxldmVsTmFtZSk7XG4gICAgICAgICAgICAgICAgaWYgKGNvbm5lY3RlZExldmVscy5pbmRleE9mKGNvbm5lY3RlZEl0ZW1MZXZlbE5hbWUpID09PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICBjb25uZWN0ZWRMZXZlbHMucHVzaChjb25uZWN0ZWRJdGVtTGV2ZWxOYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgbGlua0RlZlR5cGUgPSBcIk9ORV9UT19PTkVcIjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghcmV2ZXJzZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGlua0RlZlR5cGUgPSBcIk9ORV9UT19NQU5ZXCI7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsaW5rRGVmVHlwZSA9IFwiTUFOWV9UT19NQU5ZXCI7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gdGhpcyBhbHNvIGRlcGVuZHMgb24gcmV2ZXJzZVxuICAgICAgICAgICAgICAgIHZhciBsaW5rRGVmU3RyaW5nID0gc3RhcnRMZXZlbE5hbWUgKyAnIOKGkiAnICsgY29ubmVjdGVkSXRlbUxldmVsTmFtZTtcbiAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhsaW5rRGVmU3RyaW5nKTtcbiAgICAgICAgICAgICAgICBpZiAoZm91bmRMaW5rRGVmU3RyaW5ncy5pbmRleE9mKGxpbmtEZWZTdHJpbmcpID09PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICBmb3VuZExpbmtEZWZTdHJpbmdzLnB1c2gobGlua0RlZlN0cmluZyk7XG4gICAgICAgICAgICAgICAgICAgIGlmICghcmV2ZXJzZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZm91bmRMaW5rRGVmcy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBsaW5rRGVmVHlwZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdXBlcmxldmVsTmFtZTogc3RhcnRMZXZlbE5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3VibGV2ZWxOYW1lOiBjb25uZWN0ZWRJdGVtTGV2ZWxOYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvdW5kTGlua0RlZnMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogbGlua0RlZlR5cGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3VwZXJsZXZlbE5hbWU6IGNvbm5lY3RlZEl0ZW1MZXZlbE5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3VibGV2ZWxOYW1lOiBzdGFydExldmVsTmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHVwZGF0ZSB0eXBlIChvbmx5IGluIHVwZ3JhZGFibGUgZGlyZWN0aW9uKVxuICAgICAgICAgICAgICAgICAgICBpZiAoZm91bmRMaW5rRGVmc1tmb3VuZExpbmtEZWZTdHJpbmdzLmluZGV4T2YobGlua0RlZlN0cmluZyldLnR5cGUgPT09IFwiT05FX1RPX09ORVwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3VuZExpbmtEZWZzW2ZvdW5kTGlua0RlZlN0cmluZ3MuaW5kZXhPZihsaW5rRGVmU3RyaW5nKV0udHlwZSA9IGxpbmtEZWZUeXBlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGZvdW5kTGlua0RlZnNbZm91bmRMaW5rRGVmU3RyaW5ncy5pbmRleE9mKGxpbmtEZWZTdHJpbmcpXS50eXBlID09PSBcIk9ORV9UT19NQU5ZXCIgJiYgbGlua0RlZlR5cGUgPT09IFwiTUFOWV9UT19NQU5ZXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvdW5kTGlua0RlZnNbZm91bmRMaW5rRGVmU3RyaW5ncy5pbmRleE9mKGxpbmtEZWZTdHJpbmcpXS50eXBlID0gbGlua0RlZlR5cGU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIC8vIH1cbiAgICAgICAgfSk7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKFwiLS0tLS0tLS0tLS0tXCIpO1xuICAgICAgICAvLyBjb25zb2xlLmxvZyhmb3VuZExpbmtEZWZTdHJpbmdzKTtcbiAgICAgICAgLy8gY29uc29sZS5sb2coZm91bmRMaW5rRGVmcyk7IC8vIGZvdW5kTGlua0RlZnMuZmlsdGVyKHRoaXMub25seVVuaXF1ZSlcbiAgICAgICAgcmV0dXJuIChmb3VuZExpbmtEZWZzKTtcbiAgICB9O1xuICAgIHJldHVybiBIaWVyYXJjaHlXb3JrZXI7XG59KCkpO1xuZXhwb3J0IHsgSGllcmFyY2h5V29ya2VyIH07XG47XG4gIGV4cG9zZShcbiAgICBPYmplY3Qua2V5cyhfX3dlYnBhY2tfZXhwb3J0c19fKS5yZWR1Y2UoZnVuY3Rpb24ocixrKXtcbiAgICAgIGlmIChrPT0nX19lc01vZHVsZScpIHJldHVybiByO1xuICAgICAgcltrXSA9IF9fd2VicGFja19leHBvcnRzX19ba107XG4gICAgICByZXR1cm4gclxuICAgIH0se30pXG4gICkiLCIvKipcclxuICogQ29weXJpZ2h0IDIwMTkgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cclxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcclxuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxyXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcclxuICogICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxyXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXHJcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcclxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXHJcbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcclxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXHJcbiAqL1xyXG5jb25zdCBwcm94eU1hcmtlciA9IFN5bWJvbChcIkNvbWxpbmsucHJveHlcIik7XHJcbmNvbnN0IGNyZWF0ZUVuZHBvaW50ID0gU3ltYm9sKFwiQ29tbGluay5lbmRwb2ludFwiKTtcclxuY29uc3QgcmVsZWFzZVByb3h5ID0gU3ltYm9sKFwiQ29tbGluay5yZWxlYXNlUHJveHlcIik7XHJcbmNvbnN0IHRocm93U2V0ID0gbmV3IFdlYWtTZXQoKTtcclxuY29uc3QgdHJhbnNmZXJIYW5kbGVycyA9IG5ldyBNYXAoW1xyXG4gICAgW1xyXG4gICAgICAgIFwicHJveHlcIixcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNhbkhhbmRsZTogb2JqID0+IG9iaiAmJiBvYmpbcHJveHlNYXJrZXJdLFxyXG4gICAgICAgICAgICBzZXJpYWxpemUob2JqKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB7IHBvcnQxLCBwb3J0MiB9ID0gbmV3IE1lc3NhZ2VDaGFubmVsKCk7XHJcbiAgICAgICAgICAgICAgICBleHBvc2Uob2JqLCBwb3J0MSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gW3BvcnQyLCBbcG9ydDJdXTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZGVzZXJpYWxpemU6IChwb3J0KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBwb3J0LnN0YXJ0KCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gd3JhcChwb3J0KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIF0sXHJcbiAgICBbXHJcbiAgICAgICAgXCJ0aHJvd1wiLFxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY2FuSGFuZGxlOiBvYmogPT4gdGhyb3dTZXQuaGFzKG9iaiksXHJcbiAgICAgICAgICAgIHNlcmlhbGl6ZShvYmopIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGlzRXJyb3IgPSBvYmogaW5zdGFuY2VvZiBFcnJvcjtcclxuICAgICAgICAgICAgICAgIGxldCBzZXJpYWxpemVkID0gb2JqO1xyXG4gICAgICAgICAgICAgICAgaWYgKGlzRXJyb3IpIHtcclxuICAgICAgICAgICAgICAgICAgICBzZXJpYWxpemVkID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpc0Vycm9yLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBvYmoubWVzc2FnZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhY2s6IG9iai5zdGFja1xyXG4gICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gW3NlcmlhbGl6ZWQsIFtdXTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZGVzZXJpYWxpemUob2JqKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAob2JqLmlzRXJyb3IpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBPYmplY3QuYXNzaWduKG5ldyBFcnJvcigpLCBvYmopO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGhyb3cgb2JqO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgXVxyXG5dKTtcclxuZnVuY3Rpb24gZXhwb3NlKG9iaiwgZXAgPSBzZWxmKSB7XHJcbiAgICBlcC5hZGRFdmVudExpc3RlbmVyKFwibWVzc2FnZVwiLCBmdW5jdGlvbiBjYWxsYmFjayhldikge1xyXG4gICAgICAgIGlmICghZXYgfHwgIWV2LmRhdGEpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCB7IGlkLCB0eXBlLCBwYXRoIH0gPSBPYmplY3QuYXNzaWduKHsgcGF0aDogW10gfSwgZXYuZGF0YSk7XHJcbiAgICAgICAgY29uc3QgYXJndW1lbnRMaXN0ID0gKGV2LmRhdGEuYXJndW1lbnRMaXN0IHx8IFtdKS5tYXAoZnJvbVdpcmVWYWx1ZSk7XHJcbiAgICAgICAgbGV0IHJldHVyblZhbHVlO1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHBhcmVudCA9IHBhdGguc2xpY2UoMCwgLTEpLnJlZHVjZSgob2JqLCBwcm9wKSA9PiBvYmpbcHJvcF0sIG9iaik7XHJcbiAgICAgICAgICAgIGNvbnN0IHJhd1ZhbHVlID0gcGF0aC5yZWR1Y2UoKG9iaiwgcHJvcCkgPT4gb2JqW3Byb3BdLCBvYmopO1xyXG4gICAgICAgICAgICBzd2l0Y2ggKHR5cGUpIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgMCAvKiBHRVQgKi86XHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm5WYWx1ZSA9IHJhd1ZhbHVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgMSAvKiBTRVQgKi86XHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnRbcGF0aC5zbGljZSgtMSlbMF1dID0gZnJvbVdpcmVWYWx1ZShldi5kYXRhLnZhbHVlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuVmFsdWUgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgMiAvKiBBUFBMWSAqLzpcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVyblZhbHVlID0gcmF3VmFsdWUuYXBwbHkocGFyZW50LCBhcmd1bWVudExpc3QpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgMyAvKiBDT05TVFJVQ1QgKi86XHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZSA9IG5ldyByYXdWYWx1ZSguLi5hcmd1bWVudExpc3QpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm5WYWx1ZSA9IHByb3h5KHZhbHVlKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDQgLyogRU5EUE9JTlQgKi86XHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB7IHBvcnQxLCBwb3J0MiB9ID0gbmV3IE1lc3NhZ2VDaGFubmVsKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4cG9zZShvYmosIHBvcnQyKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuVmFsdWUgPSB0cmFuc2Zlcihwb3J0MSwgW3BvcnQxXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSA1IC8qIFJFTEVBU0UgKi86XHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm5WYWx1ZSA9IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgcmV0dXJuVmFsdWUgPSBlO1xyXG4gICAgICAgICAgICB0aHJvd1NldC5hZGQoZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFByb21pc2UucmVzb2x2ZShyZXR1cm5WYWx1ZSlcclxuICAgICAgICAgICAgLmNhdGNoKGUgPT4ge1xyXG4gICAgICAgICAgICB0aHJvd1NldC5hZGQoZSk7XHJcbiAgICAgICAgICAgIHJldHVybiBlO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgICAgIC50aGVuKHJldHVyblZhbHVlID0+IHtcclxuICAgICAgICAgICAgY29uc3QgW3dpcmVWYWx1ZSwgdHJhbnNmZXJhYmxlc10gPSB0b1dpcmVWYWx1ZShyZXR1cm5WYWx1ZSk7XHJcbiAgICAgICAgICAgIGVwLnBvc3RNZXNzYWdlKE9iamVjdC5hc3NpZ24oT2JqZWN0LmFzc2lnbih7fSwgd2lyZVZhbHVlKSwgeyBpZCB9KSwgdHJhbnNmZXJhYmxlcyk7XHJcbiAgICAgICAgICAgIGlmICh0eXBlID09PSA1IC8qIFJFTEVBU0UgKi8pIHtcclxuICAgICAgICAgICAgICAgIC8vIGRldGFjaCBhbmQgZGVhY3RpdmUgYWZ0ZXIgc2VuZGluZyByZWxlYXNlIHJlc3BvbnNlIGFib3ZlLlxyXG4gICAgICAgICAgICAgICAgZXAucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1lc3NhZ2VcIiwgY2FsbGJhY2spO1xyXG4gICAgICAgICAgICAgICAgY2xvc2VFbmRQb2ludChlcCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH0pO1xyXG4gICAgaWYgKGVwLnN0YXJ0KSB7XHJcbiAgICAgICAgZXAuc3RhcnQoKTtcclxuICAgIH1cclxufVxyXG5mdW5jdGlvbiBpc01lc3NhZ2VQb3J0KGVuZHBvaW50KSB7XHJcbiAgICByZXR1cm4gZW5kcG9pbnQuY29uc3RydWN0b3IubmFtZSA9PT0gXCJNZXNzYWdlUG9ydFwiO1xyXG59XHJcbmZ1bmN0aW9uIGNsb3NlRW5kUG9pbnQoZW5kcG9pbnQpIHtcclxuICAgIGlmIChpc01lc3NhZ2VQb3J0KGVuZHBvaW50KSlcclxuICAgICAgICBlbmRwb2ludC5jbG9zZSgpO1xyXG59XHJcbmZ1bmN0aW9uIHdyYXAoZXAsIHRhcmdldCkge1xyXG4gICAgcmV0dXJuIGNyZWF0ZVByb3h5KGVwLCBbXSwgdGFyZ2V0KTtcclxufVxyXG5mdW5jdGlvbiB0aHJvd0lmUHJveHlSZWxlYXNlZChpc1JlbGVhc2VkKSB7XHJcbiAgICBpZiAoaXNSZWxlYXNlZCkge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlByb3h5IGhhcyBiZWVuIHJlbGVhc2VkIGFuZCBpcyBub3QgdXNlYWJsZVwiKTtcclxuICAgIH1cclxufVxyXG5mdW5jdGlvbiBjcmVhdGVQcm94eShlcCwgcGF0aCA9IFtdLCB0YXJnZXQgPSBmdW5jdGlvbiAoKSB7IH0pIHtcclxuICAgIGxldCBpc1Byb3h5UmVsZWFzZWQgPSBmYWxzZTtcclxuICAgIGNvbnN0IHByb3h5ID0gbmV3IFByb3h5KHRhcmdldCwge1xyXG4gICAgICAgIGdldChfdGFyZ2V0LCBwcm9wKSB7XHJcbiAgICAgICAgICAgIHRocm93SWZQcm94eVJlbGVhc2VkKGlzUHJveHlSZWxlYXNlZCk7XHJcbiAgICAgICAgICAgIGlmIChwcm9wID09PSByZWxlYXNlUHJveHkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlcXVlc3RSZXNwb25zZU1lc3NhZ2UoZXAsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogNSAvKiBSRUxFQVNFICovLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXRoOiBwYXRoLm1hcChwID0+IHAudG9TdHJpbmcoKSlcclxuICAgICAgICAgICAgICAgICAgICB9KS50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2xvc2VFbmRQb2ludChlcCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlzUHJveHlSZWxlYXNlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChwcm9wID09PSBcInRoZW5cIikge1xyXG4gICAgICAgICAgICAgICAgaWYgKHBhdGgubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHsgdGhlbjogKCkgPT4gcHJveHkgfTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNvbnN0IHIgPSByZXF1ZXN0UmVzcG9uc2VNZXNzYWdlKGVwLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogMCAvKiBHRVQgKi8sXHJcbiAgICAgICAgICAgICAgICAgICAgcGF0aDogcGF0aC5tYXAocCA9PiBwLnRvU3RyaW5nKCkpXHJcbiAgICAgICAgICAgICAgICB9KS50aGVuKGZyb21XaXJlVmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHIudGhlbi5iaW5kKHIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBjcmVhdGVQcm94eShlcCwgWy4uLnBhdGgsIHByb3BdKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHNldChfdGFyZ2V0LCBwcm9wLCByYXdWYWx1ZSkge1xyXG4gICAgICAgICAgICB0aHJvd0lmUHJveHlSZWxlYXNlZChpc1Byb3h5UmVsZWFzZWQpO1xyXG4gICAgICAgICAgICAvLyBGSVhNRTogRVM2IFByb3h5IEhhbmRsZXIgYHNldGAgbWV0aG9kcyBhcmUgc3VwcG9zZWQgdG8gcmV0dXJuIGFcclxuICAgICAgICAgICAgLy8gYm9vbGVhbi4gVG8gc2hvdyBnb29kIHdpbGwsIHdlIHJldHVybiB0cnVlIGFzeW5jaHJvbm91c2x5IMKvXFxfKOODhClfL8KvXHJcbiAgICAgICAgICAgIGNvbnN0IFt2YWx1ZSwgdHJhbnNmZXJhYmxlc10gPSB0b1dpcmVWYWx1ZShyYXdWYWx1ZSk7XHJcbiAgICAgICAgICAgIHJldHVybiByZXF1ZXN0UmVzcG9uc2VNZXNzYWdlKGVwLCB7XHJcbiAgICAgICAgICAgICAgICB0eXBlOiAxIC8qIFNFVCAqLyxcclxuICAgICAgICAgICAgICAgIHBhdGg6IFsuLi5wYXRoLCBwcm9wXS5tYXAocCA9PiBwLnRvU3RyaW5nKCkpLFxyXG4gICAgICAgICAgICAgICAgdmFsdWVcclxuICAgICAgICAgICAgfSwgdHJhbnNmZXJhYmxlcykudGhlbihmcm9tV2lyZVZhbHVlKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGFwcGx5KF90YXJnZXQsIF90aGlzQXJnLCByYXdBcmd1bWVudExpc3QpIHtcclxuICAgICAgICAgICAgdGhyb3dJZlByb3h5UmVsZWFzZWQoaXNQcm94eVJlbGVhc2VkKTtcclxuICAgICAgICAgICAgY29uc3QgbGFzdCA9IHBhdGhbcGF0aC5sZW5ndGggLSAxXTtcclxuICAgICAgICAgICAgaWYgKGxhc3QgPT09IGNyZWF0ZUVuZHBvaW50KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVxdWVzdFJlc3BvbnNlTWVzc2FnZShlcCwge1xyXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IDQgLyogRU5EUE9JTlQgKi9cclxuICAgICAgICAgICAgICAgIH0pLnRoZW4oZnJvbVdpcmVWYWx1ZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gV2UganVzdCBwcmV0ZW5kIHRoYXQgYGJpbmQoKWAgZGlkbuKAmXQgaGFwcGVuLlxyXG4gICAgICAgICAgICBpZiAobGFzdCA9PT0gXCJiaW5kXCIpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBjcmVhdGVQcm94eShlcCwgcGF0aC5zbGljZSgwLCAtMSkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnN0IFthcmd1bWVudExpc3QsIHRyYW5zZmVyYWJsZXNdID0gcHJvY2Vzc0FyZ3VtZW50cyhyYXdBcmd1bWVudExpc3QpO1xyXG4gICAgICAgICAgICByZXR1cm4gcmVxdWVzdFJlc3BvbnNlTWVzc2FnZShlcCwge1xyXG4gICAgICAgICAgICAgICAgdHlwZTogMiAvKiBBUFBMWSAqLyxcclxuICAgICAgICAgICAgICAgIHBhdGg6IHBhdGgubWFwKHAgPT4gcC50b1N0cmluZygpKSxcclxuICAgICAgICAgICAgICAgIGFyZ3VtZW50TGlzdFxyXG4gICAgICAgICAgICB9LCB0cmFuc2ZlcmFibGVzKS50aGVuKGZyb21XaXJlVmFsdWUpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgY29uc3RydWN0KF90YXJnZXQsIHJhd0FyZ3VtZW50TGlzdCkge1xyXG4gICAgICAgICAgICB0aHJvd0lmUHJveHlSZWxlYXNlZChpc1Byb3h5UmVsZWFzZWQpO1xyXG4gICAgICAgICAgICBjb25zdCBbYXJndW1lbnRMaXN0LCB0cmFuc2ZlcmFibGVzXSA9IHByb2Nlc3NBcmd1bWVudHMocmF3QXJndW1lbnRMaXN0KTtcclxuICAgICAgICAgICAgcmV0dXJuIHJlcXVlc3RSZXNwb25zZU1lc3NhZ2UoZXAsIHtcclxuICAgICAgICAgICAgICAgIHR5cGU6IDMgLyogQ09OU1RSVUNUICovLFxyXG4gICAgICAgICAgICAgICAgcGF0aDogcGF0aC5tYXAocCA9PiBwLnRvU3RyaW5nKCkpLFxyXG4gICAgICAgICAgICAgICAgYXJndW1lbnRMaXN0XHJcbiAgICAgICAgICAgIH0sIHRyYW5zZmVyYWJsZXMpLnRoZW4oZnJvbVdpcmVWYWx1ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gcHJveHk7XHJcbn1cclxuZnVuY3Rpb24gbXlGbGF0KGFycikge1xyXG4gICAgcmV0dXJuIEFycmF5LnByb3RvdHlwZS5jb25jYXQuYXBwbHkoW10sIGFycik7XHJcbn1cclxuZnVuY3Rpb24gcHJvY2Vzc0FyZ3VtZW50cyhhcmd1bWVudExpc3QpIHtcclxuICAgIGNvbnN0IHByb2Nlc3NlZCA9IGFyZ3VtZW50TGlzdC5tYXAodG9XaXJlVmFsdWUpO1xyXG4gICAgcmV0dXJuIFtwcm9jZXNzZWQubWFwKHYgPT4gdlswXSksIG15RmxhdChwcm9jZXNzZWQubWFwKHYgPT4gdlsxXSkpXTtcclxufVxyXG5jb25zdCB0cmFuc2ZlckNhY2hlID0gbmV3IFdlYWtNYXAoKTtcclxuZnVuY3Rpb24gdHJhbnNmZXIob2JqLCB0cmFuc2ZlcnMpIHtcclxuICAgIHRyYW5zZmVyQ2FjaGUuc2V0KG9iaiwgdHJhbnNmZXJzKTtcclxuICAgIHJldHVybiBvYmo7XHJcbn1cclxuZnVuY3Rpb24gcHJveHkob2JqKSB7XHJcbiAgICByZXR1cm4gT2JqZWN0LmFzc2lnbihvYmosIHsgW3Byb3h5TWFya2VyXTogdHJ1ZSB9KTtcclxufVxyXG5mdW5jdGlvbiB3aW5kb3dFbmRwb2ludCh3LCBjb250ZXh0ID0gc2VsZiwgdGFyZ2V0T3JpZ2luID0gXCIqXCIpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgcG9zdE1lc3NhZ2U6IChtc2csIHRyYW5zZmVyYWJsZXMpID0+IHcucG9zdE1lc3NhZ2UobXNnLCB0YXJnZXRPcmlnaW4sIHRyYW5zZmVyYWJsZXMpLFxyXG4gICAgICAgIGFkZEV2ZW50TGlzdGVuZXI6IGNvbnRleHQuYWRkRXZlbnRMaXN0ZW5lci5iaW5kKGNvbnRleHQpLFxyXG4gICAgICAgIHJlbW92ZUV2ZW50TGlzdGVuZXI6IGNvbnRleHQucmVtb3ZlRXZlbnRMaXN0ZW5lci5iaW5kKGNvbnRleHQpXHJcbiAgICB9O1xyXG59XHJcbmZ1bmN0aW9uIHRvV2lyZVZhbHVlKHZhbHVlKSB7XHJcbiAgICBmb3IgKGNvbnN0IFtuYW1lLCBoYW5kbGVyXSBvZiB0cmFuc2ZlckhhbmRsZXJzKSB7XHJcbiAgICAgICAgaWYgKGhhbmRsZXIuY2FuSGFuZGxlKHZhbHVlKSkge1xyXG4gICAgICAgICAgICBjb25zdCBbc2VyaWFsaXplZFZhbHVlLCB0cmFuc2ZlcmFibGVzXSA9IGhhbmRsZXIuc2VyaWFsaXplKHZhbHVlKTtcclxuICAgICAgICAgICAgcmV0dXJuIFtcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0eXBlOiAzIC8qIEhBTkRMRVIgKi8sXHJcbiAgICAgICAgICAgICAgICAgICAgbmFtZSxcclxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogc2VyaWFsaXplZFZhbHVlXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgdHJhbnNmZXJhYmxlc1xyXG4gICAgICAgICAgICBdO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBbXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0eXBlOiAwIC8qIFJBVyAqLyxcclxuICAgICAgICAgICAgdmFsdWVcclxuICAgICAgICB9LFxyXG4gICAgICAgIHRyYW5zZmVyQ2FjaGUuZ2V0KHZhbHVlKSB8fCBbXVxyXG4gICAgXTtcclxufVxyXG5mdW5jdGlvbiBmcm9tV2lyZVZhbHVlKHZhbHVlKSB7XHJcbiAgICBzd2l0Y2ggKHZhbHVlLnR5cGUpIHtcclxuICAgICAgICBjYXNlIDMgLyogSEFORExFUiAqLzpcclxuICAgICAgICAgICAgcmV0dXJuIHRyYW5zZmVySGFuZGxlcnMuZ2V0KHZhbHVlLm5hbWUpLmRlc2VyaWFsaXplKHZhbHVlLnZhbHVlKTtcclxuICAgICAgICBjYXNlIDAgLyogUkFXICovOlxyXG4gICAgICAgICAgICByZXR1cm4gdmFsdWUudmFsdWU7XHJcbiAgICB9XHJcbn1cclxuZnVuY3Rpb24gcmVxdWVzdFJlc3BvbnNlTWVzc2FnZShlcCwgbXNnLCB0cmFuc2ZlcnMpIHtcclxuICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcclxuICAgICAgICBjb25zdCBpZCA9IGdlbmVyYXRlVVVJRCgpO1xyXG4gICAgICAgIGVwLmFkZEV2ZW50TGlzdGVuZXIoXCJtZXNzYWdlXCIsIGZ1bmN0aW9uIGwoZXYpIHtcclxuICAgICAgICAgICAgaWYgKCFldi5kYXRhIHx8ICFldi5kYXRhLmlkIHx8IGV2LmRhdGEuaWQgIT09IGlkKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZXAucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1lc3NhZ2VcIiwgbCk7XHJcbiAgICAgICAgICAgIHJlc29sdmUoZXYuZGF0YSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgaWYgKGVwLnN0YXJ0KSB7XHJcbiAgICAgICAgICAgIGVwLnN0YXJ0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVwLnBvc3RNZXNzYWdlKE9iamVjdC5hc3NpZ24oeyBpZCB9LCBtc2cpLCB0cmFuc2ZlcnMpO1xyXG4gICAgfSk7XHJcbn1cclxuZnVuY3Rpb24gZ2VuZXJhdGVVVUlEKCkge1xyXG4gICAgcmV0dXJuIG5ldyBBcnJheSg0KVxyXG4gICAgICAgIC5maWxsKDApXHJcbiAgICAgICAgLm1hcCgoKSA9PiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBOdW1iZXIuTUFYX1NBRkVfSU5URUdFUikudG9TdHJpbmcoMTYpKVxyXG4gICAgICAgIC5qb2luKFwiLVwiKTtcclxufVxuXG5leHBvcnQgeyBjcmVhdGVFbmRwb2ludCwgZXhwb3NlLCBwcm94eSwgcHJveHlNYXJrZXIsIHJlbGVhc2VQcm94eSwgdHJhbnNmZXIsIHRyYW5zZmVySGFuZGxlcnMsIHdpbmRvd0VuZHBvaW50LCB3cmFwIH07XG4vLyMgc291cmNlTWFwcGluZ1VSTD1jb21saW5rLm1qcy5tYXBcbiJdLCJzb3VyY2VSb290IjoiIn0=