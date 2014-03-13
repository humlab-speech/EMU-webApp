'use strict';

angular.module('emuwebApp')
	.service('Levelservice', function Levelservice($rootScope, uuid, Soundhandlerservice) {
		// shared service object
		var sServObj = {};

		sServObj.data = {};

		sServObj.getData = function () {
			return sServObj.data;
		};

		/**
		 * sets annotation data and generates unique uuid if id in element is not set
		 */
		sServObj.setData = function (data) {
			data.levels.forEach(function (level, lid) {
				if (level.type === 'SEGMENT') {
				    level.items.forEach(function (item, iid) {
				        if(item.id===undefined) {
				            item.id = uuid.new();
				        }
				    });
				}
				if (level.type === 'EVENT') {
				    level.items.forEach(function (item, iid) {
				        if(item.id===undefined) {
				            item.id = uuid.new();
				        }				    
				    });
				}
			});		    
			angular.copy(data, sServObj.data);
		};

		/**
		 * returns level details (level object and sorting id) by passing in level Name
		 */
		sServObj.getLevelDetails = function (levelName) {
			var curLevel = null;
			var id = null;
			sServObj.data.levels.forEach(function (t, num) {
				if (t.name === levelName) {
					curLevel = t;
					id = num;
				}
			});
			return {
				level: curLevel,
				id: id
			};
		};

		/**
		 * get's element details by passing in levelName and elemtentid
		 */
		sServObj.getElementDetails = function (levelName, elementid) {
			var details = null;
			sServObj.data.levels.forEach(function (t) {
				if (t.name === levelName) {
					t.items.forEach(function (element, num) {
						if (element.id == elementid) {
							details = element;
						}
					});
				}
			});
			return details;
		};
	
		

		/**
		 * get's element details by passing in levelName and elemtentid
		 */
		sServObj.setElementDetails = function (levelname, id, labelname, start, duration) {
			sServObj.data.levels.forEach(function (level) {
				if (level.name === levelname) {
					level.items.forEach(function (element) {
						if (element.id == id) {
						    if( start !== undefined )  {
						      element.sampleStart = start;
						    }
						    if( duration !== undefined )  {
						      element.sampleDur = duration;
						    }
						    if( labelname !== undefined )  {
						      element.labels[0].value = labelname;
						    }
						}
					});
				}
			});
		};

		/**
		 * get's element details by passing in levelName and elemtentid
		 */
		sServObj.setPointDetails = function (levelname, id, labelname, start) {
			sServObj.data.levels.forEach(function (level) {
				if (level.name === levelname) {
					level.items.forEach(function (element) {
						if (element.id == id) {
						    element.samplePoint = start;
					        element.labels[0].value = labelname;
						}
					});
				}
			});
		};		
		
		/**
		 * get's element details by passing in levelName and elemtentid
		 */
		sServObj.getElementNeighbourDetails = function (levelName, firstid, lastid) {
			var left = null;
			var right = null;
			sServObj.data.levels.forEach(function (level) {
				if (level.name === levelName) {
					level.items.forEach(function (element,num) {
						if (element.id == firstid) {
							left = level.items[num-1];
						}
						if (element.id == lastid) {
							right = level.items[num+1];
						}			
					});
				}
			});
			return {left: left, right: right};
		};		


		/**
		 * get's element details by passing in level, pcm position and maximum pcm
		 */
		sServObj.getEvent = function (pcm, level, maximum) {
			var evtr = null;
			var evtrNearest = null;
			if (level.type === "SEGMENT") {
				angular.forEach(level.items, function (evt, index) {
				    if (pcm >= evt.sampleStart) {
					    if(pcm <= (evt.sampleStart + evt.sampleDur)) {
							if (pcm - evt.sampleStart >= evt.sampleDur / 2) {
								evtrNearest = level.items[index+1];
							} else {
								evtrNearest = level.items[index];
							}
						}
					}
					if (pcm >= evt.sampleStart) {
					    if(pcm <= (evt.sampleStart + evt.sampleDur)) {
						    evtr = evt;
					    }
					}
				});
			} else {
				var spaceLower = 0;
				var spaceHigher = 0;
				angular.forEach(level.items, function (evt, index) {
					if (index < level.items.length - 1) {
						spaceHigher = evt.samplePoint + (level.items[index + 1].samplePoint - level.items[index].samplePoint) / 2;
					} else {
						spaceHigher = maximum;
					}
					if (index > 0) {
						spaceLower = evt.samplePoint - (level.items[index].samplePoint - level.items[index - 1].samplePoint) / 2;
					} else {
					    spaceLower = 0;
					}
					if (pcm <= spaceHigher && pcm >= spaceLower) {
						evtr = evt;				
						evtrNearest = evt;
					}
				});
			}
			return {evtr:evtr, nearest: evtrNearest};
		};

		/**
		 * deletes a level by its name
		 */
		sServObj.deleteLevel = function (levelName) {
			var y = 0;
			var curLevel;
			angular.forEach(sServObj.data.levels, function (t, x) {
				if (t.name === levelName) {
					curLevel = t;
					y = x;
					sServObj.data.levels.splice(x, 1);
				}
			});
			return {
				level: curLevel,
				id: y,
				name: levelName
			};
		};

		/**
		 * rename the label of a level by passing in level name and id
		 */
		sServObj.renameLabel = function (levelName, id, newLabelName) {
		console.log(levelName, id, newLabelName);
			sServObj.setElementDetails(levelName, id, newLabelName);
		};

		/**
		 * rename the label of a level by passing in level name and id
		 */
		sServObj.renameLevel = function (oldname, newname) {
			angular.forEach(sServObj.data.levels, function (t, i) {
				if (t.name === oldname) {
					t.name = newname;
				}
			});
		};


		sServObj.deleteSegmentsInvers = function (levelname, segments, neighbours) {
			var length1 = 0;
			var length2 = 0;
			for (var x in segments) {
				length1 += segments[x].sampleDur;
			}
			if(length1%2==0) {
			  length1 /= 2;
			  length2 = length1;
			}
			else {
			  length1 = Math.ceil(length1/2);
			  length2 = length1-1;
			}
			sServObj.setElementDetails(levelname, neighbours.left.id, neighbours.left.labels[0].value, neighbours.left.sampleStart, (neighbours.left.sampleDur-length1));
			sServObj.setElementDetails(levelname, neighbours.right.id, neighbours.right.labels[0].value, neighbours.right.sampleStart+length2, (neighbours.right.sampleDur-length2));			
			var insertPoint = 0;
			angular.forEach(sServObj.data.levels, function (level) {
				if (level.name === levelname) {
					if (level.type === "SEGMENT") {
					    angular.forEach(level.items, function (evt, num) {
					        if (evt.id == neighbours.left.id) {
					            insertPoint = num + 1;								
					        }
					    });
					    for(x in segments) {
					        level.items.splice(insertPoint++, 0, segments[x]);
					    }
					    
					}
				}
			});
			
			
		};

		sServObj.deleteSegments = function (levelname, segments, neighbours) {
			var length1 = 0;
			var length2 = 0;
			var length = 0;
			var text = '';
			for (var x in segments) {
				length += segments[x].sampleDur;
			}
			if(length1%2==0) {
			  length1 = length / 2;
			  length2 = length1;
			}
			else {
			  length1 = Math.ceil(length/2);
			  length2 = length1-1;
			}
			angular.forEach(sServObj.data.levels, function (level) {
				if (level.name === levelname) {
				angular.forEach(level.items, function (evt, id) {
					if (evt.id == segments[0].id) {
					    level.items.splice(id, segments.length);
					}
				});
				}
			});
			if(neighbours.left!==undefined) {
			  sServObj.setElementDetails(levelname, neighbours.left.id, neighbours.left.labels[0].value, neighbours.left.sampleStart, (neighbours.left.sampleDur+length1));
			}
			if(neighbours.right!==undefined) {
			  sServObj.setElementDetails(levelname, neighbours.right.id, neighbours.right.labels[0].value, neighbours.right.sampleStart - length2, (neighbours.right.sampleDur+length2));
			}
			
		};

		sServObj.insertSegmentInvers = function (start, end, levelName, newLabel) {
			var ret = true;
			angular.forEach(sServObj.data.levels, function (t) {
				if (t.name === levelName) {
					if (start == end) {
						var startID = -1;
						angular.forEach(t.items, function (evt, id) {
							if (start == evt.sampleStart) {
								startID = id;
								ret = true;
							}
						});
						if (ret) {
							var diff = t.items[startID].sampleDur;
							t.items[startID - 1].sampleDur += diff;
							t.items.splice(startID, 1);
						}
					} else {
						var startID = -1;
						angular.forEach(t.items, function (evt, id) {
							if (start == evt.sampleStart) {
								startID = id;
								ret = true;
							}
						});
						if (ret) {
							var diff = t.items[startID].sampleDur;
							var diff2 = t.items[startID + 1].sampleDur;
							t.items[startID - 1].sampleDur += (diff + diff2);
							t.items.splice(startID, 2);
						}
					}
				}
			});
			return ret;
		};

		sServObj.insertSegment = function (start, end, levelName, newLabel) {
			var ret = true;
			angular.forEach(sServObj.data.levels, function (t) {
				if (t.name === levelName) {
					if (start == end) {
						var startID = -1;
						angular.forEach(t.items, function (evt, id) {
							if (start >= evt.sampleStart && start <= (evt.sampleStart + evt.sampleDur)) {
								startID = id;
							}
							if (evt.sampleStart == start) {
								ret = false;
							}
							if (evt.sampleStart + evt.sampleDur == start) {
								ret = false;
							}
						});
						if (ret) {
							var diff = start - t.items[startID].sampleStart;
							t.items.splice(startID, 0, angular.copy(t.items[startID]));
							t.items[startID + 1].sampleStart = start;
							t.items[startID + 1].sampleDur = t.items[startID].sampleDur - diff;
							t.items[startID + 1].label = newLabel;
							t.items[startID].sampleDur = diff;
						}
					} else {
						var startID = -1;
						var endID = -1;
						angular.forEach(t.items, function (evt, id) {
							if (start >= evt.sampleStart && start <= (evt.sampleStart + evt.sampleDur)) {
								startID = id;
							}
							if (end >= evt.sampleStart && end <= (evt.sampleStart + evt.sampleDur)) {
								endID = id;
							}
						});
						ret = (startID === endID);
						if (startID === endID) {
							var diff = start - t.items[startID].sampleStart;
							var diff2 = end - start;
							t.items.splice(startID, 0, angular.copy(t.items[startID]));
							t.items.splice(startID, 0, angular.copy(t.items[startID]));
							t.items[startID + 1].sampleStart = start;
							t.items[startID + 1].sampleDur = diff2;
							t.items[startID + 1].label = newLabel;
							t.items[startID + 2].sampleStart = end;
							t.items[startID + 2].sampleDur = t.items[startID].sampleDur - diff - diff2;
							t.items[startID + 2].label = newLabel;
							t.items[startID].sampleDur = diff;

						}
					}
				}
			});
			return ret;
		};

		sServObj.insertPoint = function (startP, levelName, pointName) {
			var ret = false;
			angular.forEach(sServObj.data.levels, function (t) {
				if (t.name === levelName && t.type == "point") {
					var pid = 0;
					var last = 0;
					angular.forEach(t.items, function (evt, id) {
						if (!ret) {
							if (startP > last && startP < evt.sampleStart && (Math.floor(startP) != Math.floor(evt.sampleStart))) {

								console.log(t.items);
								console.log(id);


								t.items.splice(id - 1, 0, angular.copy(t.items[id - 1]));

								console.log(t.items);

								t.items[id].sampleStart = startP;
								t.items[id].label = pointName;
								ret = true;
							}
							last = evt.sampleStart;
						}

					});
				}
			});
			return ret;
		};

		sServObj.insertPointInvers = function (startP, levelName, pointName) {
			var ret = false;
			angular.forEach(sServObj.data.levels, function (t) {
				if (t.name === levelName && t.type == "point") {
					var pid = 0;
					var last = 0;
					angular.forEach(t.items, function (evt, id) {
						if (!ret) {
							if (startP == evt.sampleStart) {
								t.items.splice(id, 1);
								ret = true;
							}
						}
					});
				}
			});
			return ret;
		};

		sServObj.deleteBoundary = function (toDelete, levelName, levelType) {
		    var last = null;
			angular.forEach(sServObj.data.levels, function (t) {
				if (t.name === levelName) {
					angular.forEach(t.items, function (evt, id) {
					    if(t.type === 'SEGMENT') {
					      	if (evt.id == toDelete.id) {
								last.labels[0].value += evt.labels[0].value;
								last.sampleDur += evt.sampleDur;
								t.items.splice(id, 1);
							}
					    }
					    else {
					        if (evt.samplePoint == toDelete.samplePoint) {
					            t.items.splice(id, 1);
					        }
					    }
						last = evt;
					});
				}
			});
		};


		sServObj.snapBoundary = function (toTop, sample, levelName, segID) {
			var neighTd;
			var thisTd;
			var neighTdIdx;
			var absMinDist = Infinity;
			var absDist;
			var minDist;
			sServObj.data.levels.forEach(function (t, tIdx) {
				if (t.name === levelName) {
					thisTd = t;
					if (toTop) {
						if (tIdx >= 1) {
							neighTd = sServObj.data.levels[tIdx - 1];
						} else {
							return false;
						}
					} else {
						if (tIdx < sServObj.data.levels.length - 1) {
							neighTd = sServObj.data.levels[tIdx + 1];
						} else {
							return false;
						}
					}
					neighTd.items.forEach(function (itm) {
						absDist = Math.abs(sample - itm.sampleStart);
						if (absDist < absMinDist) {
							absMinDist = absDist;
							minDist = itm.sampleStart - sample;
						}
					});
				}
			});


			if (minDist !== undefined) {
				this.moveBoundry(minDist, thisTd, segID);
				return minDist;
			} else {
				return false;
			}
		};

		sServObj.moveBoundry = function (changeTime, name, seg, lastNeighbours) {
		  var orig = sServObj.getElementDetails(name, seg.id);
		  if(lastNeighbours.left !== undefined) {
    		  var origLeft = sServObj.getElementDetails(name, lastNeighbours.left.id);
	    	  if((lastNeighbours.left.sampleDur+changeTime > 0) && (seg.sampleStart+changeTime > 0 ) && (seg.sampleDur-changeTime>0)) {
		          sServObj.setElementDetails(name, lastNeighbours.left.id, origLeft.labels[0].value, origLeft.sampleStart, (origLeft.sampleDur+changeTime));
		          sServObj.setElementDetails(name, seg.id, orig.labels[0].value, (orig.sampleStart+changeTime), (orig.sampleDur-changeTime));
		      }
		  }
		  else {
		      if((seg.sampleStart+changeTime > 0 ) && (seg.sampleDur-changeTime>0)) {
		          sServObj.setElementDetails(name, seg.id, orig.labels[0].value, (orig.sampleStart+changeTime), (orig.sampleDur-changeTime));
		      }
		  }
		};

		sServObj.movePoint = function (changeTime, name, seg) {
		  var orig = sServObj.getElementDetails(name, seg.id);
		  sServObj.setPointDetails(name, seg.id, orig.labels[0].value, (orig.samplePoint+changeTime));
		};


		sServObj.moveSegment = function (changeTime, name, selected, lastNeighbours) {
		  if(lastNeighbours.left === undefined ) {
		    var origRight = sServObj.getElementDetails(name, lastNeighbours.right.id);		
			if( ( (0 + changeTime) >= 1) && ((lastNeighbours.right.sampleDur - changeTime) >= 1) ) {  
	    	    sServObj.setElementDetails(name, lastNeighbours.right.id, origRight.labels[0].value, (origRight.sampleStart+changeTime), (origRight.sampleDur-changeTime));
  		        angular.forEach(selected, function (s) {
		            var orig = sServObj.getElementDetails(name, s.id);
		            sServObj.setElementDetails(name, s.id, orig.labels[0].value, (orig.sampleStart+changeTime), orig.sampleDur);
    		    });	    
			}		  	  
		  }
		  else if(lastNeighbours.right === undefined ) {
		    var origLeft = sServObj.getElementDetails(name, lastNeighbours.left.id);
		    var origRight = sServObj.getElementDetails(name, selected[selected.length-1].id);
			if((lastNeighbours.left.sampleDur + changeTime) >= 1) {
			  if((origRight.sampleStart + origRight.sampleDur + changeTime ) < Soundhandlerservice.wavJSO.Data.length ) {  
    		    sServObj.setElementDetails(name, lastNeighbours.left.id, origLeft.labels[0].value, origLeft.sampleStart, (origLeft.sampleDur+changeTime));
  		        angular.forEach(selected, function (s) {
		            var orig = sServObj.getElementDetails(name, s.id);
		            sServObj.setElementDetails(name, s.id, orig.labels[0].value, (orig.sampleStart+changeTime), orig.sampleDur);
    		    });	    			  
			  }
			}		  		  
		  }
		  else {
		    var origLeft = sServObj.getElementDetails(name, lastNeighbours.left.id);
		    var origRight = sServObj.getElementDetails(name, lastNeighbours.right.id);		
			if( ( (lastNeighbours.left.sampleDur + changeTime) >= 1) && ((lastNeighbours.right.sampleDur - changeTime) >= 1) ) {  
    		    sServObj.setElementDetails(name, lastNeighbours.left.id, origLeft.labels[0].value, origLeft.sampleStart, (origLeft.sampleDur+changeTime));
	    	    sServObj.setElementDetails(name, lastNeighbours.right.id, origRight.labels[0].value, (origRight.sampleStart+changeTime), (origRight.sampleDur-changeTime));
  		        angular.forEach(selected, function (s) {
		            var orig = sServObj.getElementDetails(name, s.id);
		            sServObj.setElementDetails(name, s.id, orig.labels[0].value, (orig.sampleStart+changeTime), orig.sampleDur);
    		    });	    
			}		  
		  }
		};

		sServObj.expandSegment = function (rightSide, segments, name, changeTime) {
			var startTime = 0;
			var i;
			if (rightSide) {
			
				angular.forEach(segments, function (seg) {
					sServObj.setElementDetails(name, seg.id, seg.labels[0].value, seg.sampleStart, seg.sampleDur+changeTime);
			    });
						
			
			
			
			
			
				/*angular.forEach(sServObj.data.levels, function (level) {
					if (level.name === name && level.type === 'SEGMENT') {
					
					    angular.forEach(segments, function (seg) {
					        var exp = segments.get({id: item.id});
					        console.log();
					    });
						
						if (t.items[selected[selected.length - 1] + 1].sampleDur > (selected.length * changeTime)) {
							if (t.items[selected[0]].sampleDur > -(selected.length * changeTime)) {
								var found = false;
								for (i = 1; i <= selected.length; i++) {
									if (t.items[selected[i - 1]].sampleDur + changeTime <= 0) {
										found = true;
									}
								}
								if (found) {
									$rootScope.$broadcast('errorMessage', 'Expand Segements Error: Cannot Expand/Shrink. Segment would be too small');

								} else {
									for (i = 1; i <= selected.length; i++) {
										t.items[selected[i - 1]].sampleStart += startTime;
										t.items[selected[i - 1]].sampleDur += changeTime;
										startTime = i * changeTime;
									}
									t.items[selected[selected.length - 1] + 1].sampleStart += startTime;
									t.items[selected[selected.length - 1] + 1].sampleDur -= startTime;
								}
							} else {
								$rootScope.$broadcast('errorMessage', 'Expand Segements Error: No Space left to decrease');

							}
						} else {
							$rootScope.$broadcast('errorMessage', 'Expand Segements Error: No Space left to increase');
						}
						
						
					}
				});*/
			} else {
				angular.forEach(sServObj.data.levels, function (t) {
					if (t.name === tN) {
						if (t.items[selected[0] - 1].sampleDur > (selected.length * changeTime)) {
							if (t.items[selected[selected.length - 1]].sampleDur > (selected.length * changeTime)) {
								var found = false;
								for (i = 1; i <= selected.length; i++) {
									if (t.items[selected[i - 1]].sampleDur + changeTime <= 0) {
										found = true;
									}
								}
								if (found) {
									$rootScope.$broadcast('errorMessage', 'Expand Segements Error : Cannot Expand/Shrink. Segment would be too small');
								} else {
									for (i = 0; i < selected.length; i++) {
										t.items[selected[i]].sampleStart -= (changeTime * (selected.length - i));
										t.items[selected[i]].sampleDur += changeTime;
									}
									t.items[selected[0] - 1].sampleDur -= changeTime * selected.length;
								}
							} else {
								$rootScope.$broadcast('errorMessage', 'Expand Segements Error : No Space left to increase');
							}
						} else {
							$rootScope.$broadcast('errorMessage', 'Expand Segements Error : No Space left to decrease');
						}
					}
				});
			}
		};



		return sServObj;

	});