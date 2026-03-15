import { deepCopy } from '../util/deep-copy';

export class ConfigProviderService {
	ViewStateService!: any;

	public vals;
	public curDbConfig;
	public initDbConfig;
	public embeddedVals;

	constructor() {
		this.resetState();
	}

	resetState() {
		this.vals = {};
		this.curDbConfig = {};
		this.initDbConfig = {};
		this.embeddedVals = {
			audioGetUrl: '',
			labelGetUrl: '',
			labelType: '',
			fromUrlParams: false
		};
	}

	initDeps(deps: { ViewStateService: any }) {
		Object.assign(this, deps);
	}

	public initTheme() {
		const savedTheme = localStorage.getItem('grazer-theme');
		if (savedTheme) {
			this.setTheme(savedTheme as any);
		} else {
			if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
				this.setTheme('light');
			}
		}
	}

	public setTheme(theme: 'light' | 'dark') {
		localStorage.setItem('grazer-theme', theme);
		const htmlElement = document.documentElement;
		if (theme === 'light') {
			htmlElement.setAttribute('data-theme', 'light');
		} else {
			htmlElement.removeAttribute('data-theme');
		}
	}

	public getTheme(): string {
		const theme = localStorage.getItem('grazer-theme');
		return theme || 'dark';
	}

	private onlyUnique(value, index, self) {
		return self.indexOf(value) === index;
	}

	public validateGetUrl(url: string): boolean {
		if (!url) return false;
		try {
			const parsed = new URL(url, window.location.origin);
			return parsed.protocol === 'http:' || parsed.protocol === 'https:';
		} catch (e) {
			return false;
		}
	}

	setVals(data) {
		if ($.isEmptyObject(this.vals)) {
			this.vals = data;
		} else {
			Object.keys(data).forEach((key1) => {
				if (Array.isArray(this.vals[key1])) {
					this.vals[key1] = [];
					data[key1].forEach((itm) => {
						this.vals[key1].push(itm);
					});
				} else {
					Object.keys(data[key1]).forEach((key2) => {
						if (this.vals[key1][key2] !== undefined) {
							this.vals[key1][key2] = data[key1][key2];
						} else {
							console.error('BAD ENTRY IN CONFIG! Key1: ' + key1 + ' key2: ' + key2);
						}
					});
				}
			});
		}
	};

	public getDelta(current) {
		var ret = this.getDeltas(current, this.initDbConfig);
		return Promise.resolve(ret);
	};

	public getDeltas(current, start) {
		var ret = {};
		current.forEach((value, key) => {
			if (JSON.stringify(value) !== JSON.stringify(start[key])) {
				if (Array.isArray(value)) {
					ret[key] = [];
					deepCopy(value, ret[key]);
				}
				else if (typeof value === 'object') {
					ret[key] = {};
					ret[key] = this.getDeltas(value, start[key]);
				}
				else {
					if (key !== 'clear' && key !== 'openDemoDB' && key !== 'specSettings') {
						ret[key] = value;
					}
				}
			}
		});
		return ret;
	};

	public getSsffTrackConfig(name) {
		var res;
		if (this.curDbConfig.ssffTrackDefinitions !== undefined) {
			this.curDbConfig.ssffTrackDefinitions.forEach((tr) => {
				if (tr.name === name) {
					res = tr;
				}
			});
		}
		return res;
	};

	public getValueLimsOfTrack(trackName) {
		var res = {};
		if (typeof this.vals.perspectives[this.ViewStateService.curPerspectiveIdx].signalCanvases.minMaxValLims !== 'undefined') {
			this.vals.perspectives[this.ViewStateService.curPerspectiveIdx].signalCanvases.minMaxValLims.forEach((vL) => {
				if (vL.ssffTrackName === trackName) {
					res = vL;
				}
			});
		}
		return res;
	};

	public getHorizontalLinesOfTrack(trackName) {
		var res;
		if (typeof this.vals.perspectives[this.ViewStateService.curPerspectiveIdx].signalCanvases.horizontalLines !== 'undefined') {
			this.vals.perspectives[this.ViewStateService.curPerspectiveIdx].signalCanvases.horizontalLines.forEach((vL) => {
				if (vL.ssffTrackName === trackName) {
					res = vL;
				}
			});
		}
		return res;
	};

	public getContourLimsOfTrack(trackName) {
		var res = {};
		this.vals.perspectives[this.ViewStateService.curPerspectiveIdx].signalCanvases.contourLims.forEach((cL) => {
			if (cL.ssffTrackName === trackName) {
				res = cL;
			}
		});
		return res;
	};

	public getContourColorsOfTrack(trackName) {
		var res;
		if (typeof this.vals.perspectives[this.ViewStateService.curPerspectiveIdx].signalCanvases.contourColors !== 'undefined') {
			this.vals.perspectives[this.ViewStateService.curPerspectiveIdx].signalCanvases.contourColors.forEach((cC) => {
				if (cC.ssffTrackName === trackName) {
					res = cC;
				}
			});
		}
		return res;
	};

	public getAssignment(signalName) {
		var res = {};
		this.vals.perspectives[this.ViewStateService.curPerspectiveIdx].signalCanvases.assign.forEach((a) => {
			if (a.signalCanvasName === signalName) {
				res = a;
			}
		});
		return res;
	};

	public getLevelDefinition(levelName) {
		var res = {} as any;
		this.curDbConfig.levelDefinitions.forEach((ld) => {
			if (ld.name === levelName) {
				res = ld;
			}
		});
		return res;
	};

	public getAttrDefsNames(levelName) {
		var res = [];
		this.getLevelDefinition(levelName).attributeDefinitions.forEach((ad) => {
			res.push(ad.name);
		});
		return res;
	};

	public setPerspectivesOrder(curPerspective, levelName) {
		if (this.vals !== undefined) {
			if (this.vals.perspectives !== undefined) {
				if (this.vals.perspectives[curPerspective] !== undefined) {
					if (this.vals.perspectives[curPerspective].levelCanvases !== undefined) {
						this.vals.perspectives[curPerspective].levelCanvases.order = levelName;
					}
				}
			}
		}
	};

	public getStrRep(code) {
		var str;
		switch (code) {
			case 8: str = 'BACKSPACE'; break;
			case 9: str = 'TAB'; break;
			case 13: str = 'ENTER'; break;
			case 16: str = 'SHIFT'; break;
			case 18: str = 'ALT'; break;
			case 32: str = 'SPACE'; break;
			case 37: str = '\u2190'; break;
			case 39: str = '\u2192'; break;
			case 38: str = '\u2191'; break;
			case 40: str = '\u2193'; break;
			case 42: str = '+'; break;
			case 43: str = '+'; break;
			case 45: str = '-'; break;
			case 95: str = '-'; break;
			default: str = String.fromCharCode(code);
		}
		return str;
	};

	public findAllTracksInDBconfigNeededByEMUwebApp() {
		var DBconfig = this.curDbConfig;
		var allTracks = [];

		DBconfig.levelDefinitions.forEach((ld) => {
			if (ld.anagestConfig !== undefined) {
				allTracks.push(ld.anagestConfig.verticalPosSsffTrackName);
				allTracks.push(ld.anagestConfig.velocitySsffTrackName);
			}
		});

		DBconfig.EMUwebAppConfig.perspectives.forEach((p) => {
			p.signalCanvases.order.forEach((sco) => {
				allTracks.push(sco);
			});
			if (p.signalCanvases.assign !== undefined) {
				p.signalCanvases.assign.forEach((sca) => {
					allTracks.push(sca.ssffTrackName);
				});
			}
			if (p.twoDimCanvases !== undefined) {
				if (p.twoDimCanvases.order[0] === 'EPG') {
					allTracks.push('EPG');
				}
				if (p.twoDimCanvases.twoDimDrawingDefinitions !== undefined) {
					p.twoDimCanvases.twoDimDrawingDefinitions.forEach((tddd) => {
						tddd.dots.forEach((dot) => {
							allTracks.push(dot.xSsffTrack);
							allTracks.push(dot.ySsffTrack);
						});
					});
				}
			}
		});
		allTracks = allTracks.filter(this.onlyUnique);
		var osciIdx = allTracks.indexOf('OSCI');
		if (osciIdx > -1) { allTracks.splice(osciIdx, 1); }
		var specIdx = allTracks.indexOf('SPEC');
		if (specIdx > -1) { allTracks.splice(specIdx, 1); }

		var allTrackDefs = [];
		DBconfig.ssffTrackDefinitions.forEach((std) => {
			if (allTracks.indexOf(std.name) > -1) {
				allTrackDefs.push(std);
			}
		});
		return (allTrackDefs);
	};
}

export const configProviderService = new ConfigProviderService();
