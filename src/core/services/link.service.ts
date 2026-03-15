export class LinkService {
	DataService!: any;
	ConfigProviderService!: any;

	initDeps(deps: { DataService: any; ConfigProviderService: any }) {
		Object.assign(this, deps);
	}

	public insertLink(fromID, toID) {
		this.DataService.insertLinkData({ 'fromID': fromID, 'toID': toID });
	};

	public insertLinkAt(fromID, toID, order) {
		this.DataService.insertLinkDataAt(order, { 'fromID': fromID, 'toID': toID });
	};

	public deleteLink(fromID, toID) {
		var ret = -1;
		this.DataService.getLinkData().forEach((link, linkIdx) => {
			if (link.fromID === fromID && link.toID === toID) {
				this.DataService.deleteLinkDataAt(linkIdx);
				ret = linkIdx;
			}
		});
		return ret;
	};

	public linkExists(fromID, toID) {
		var ret = false;
		this.DataService.getLinkData().forEach((link) => {
			if (link.fromID === fromID && link.toID === toID) { ret = true; }
		});
		return ret;
	};

	public hasParents(ID) {
		var ret = false;
		this.DataService.getLinkData().forEach((link) => {
			if (link.toID === ID) { ret = true; }
		});
		return ret;
	};

	public hasChildren(ID) {
		var ret = false;
		this.DataService.getLinkData().forEach((link) => {
			if (link.fromID === ID) { ret = true; }
		});
		return ret;
	};

	public isLinked(ID) {
		return (this.hasChildren(ID) || this.hasParents(ID));
	};

	public insertLinksTo(fromID, toIDs) {
		toIDs.forEach((toID) => { this.insertLink(fromID, toID); });
	};

	public deleteLinksTo(fromID, toIDs) {
		var ret = [];
		toIDs.forEach((toID) => { this.deleteLink(fromID, toID); ret.push({fromID: fromID, toID: toID}); });
		return ret;
	};

	public insertLinksFrom(fromIDs, toID) {
		fromIDs.forEach((fromID) => { this.insertLink(fromID, toID); });
	};

	public deleteLinksFrom(fromIDs, toID) {
		var ret = [];
		fromIDs.forEach((fromID) => { ret.push({fromID: fromID, toID: toID}); this.deleteLink(fromID, toID); });
		return ret;
	};

	public getLinksTo(toID) {
		var ret = [];
		this.DataService.getLinkData().forEach((link, linkOrder) => {
			if (link.toID === toID) { ret.push({link: link, order: linkOrder}); }
		});
		return ret;
	};

	public getLinksFrom(fromID) {
		var ret = [];
		this.DataService.getLinkData().forEach((link, linkOrder) => {
			if (link.fromID === fromID) { ret.push({link: link, order: linkOrder}); }
		});
		return ret;
	};

	public changeLinkTo(fromID, toID, toNewID) {
		this.DataService.getLinkData().forEach((link, linkOrder) => {
			if (link.fromID === fromID && link.toID === toID) {
				this.DataService.changeLinkDataAt(linkOrder, fromID, toNewID);
			}
		});
	};

	public changeLinkFrom(fromID, toID, fromNewID) {
		this.DataService.getLinkData().forEach((link, linkOrder) => {
			if (link.fromID === fromID && link.toID === toID) {
				this.DataService.changeLinkDataAt(linkOrder, fromNewID, toID);
			}
		});
	};

	public deleteLinkSegment(segments) {
		var linksTo = [];
		var linksFrom = [];
		segments.forEach((segment) => {
			this.getLinksTo(segment.id).forEach((found) => {
				linksTo.push({fromID: found.link.fromID, toID: found.link.toID});
				this.deleteLink(found.link.fromID, found.link.toID);
			});
			this.getLinksFrom(segment.id).forEach((found) => {
				linksFrom.push({fromID: found.link.fromID, toID: found.link.toID});
				this.deleteLink(found.link.fromID, found.link.toID);
			});
		});
		return {linksTo: linksTo, linksFrom: linksFrom};
	};

	public deleteLinkSegmentInvers(deleted) {
		deleted.linksTo.forEach((found) => { this.insertLink(found.fromID, found.toID); });
		deleted.linksFrom.forEach((found) => { this.insertLink(found.fromID, found.toID); });
	};

	public deleteLinkBoundary(ID, neighbourID, LevelService) {
		var linksTo = [];
		var linksFrom = [];
		var ord = 0;
		var levelName = LevelService.getLevelName(neighbourID);

		var onlyInM2m = true;
		this.ConfigProviderService.curDbConfig.linkDefinitions.forEach((linkDef) => {
			if(linkDef.superlevelName === levelName || linkDef.sublevelName === levelName){
				if(linkDef.type !== 'MANY_TO_MANY'){ onlyInM2m = false; }
			}
		});

		if (neighbourID >= 0) {
			this.getLinksTo(ID).forEach((found) => {
				if (this.linkExists(found.link.fromID, neighbourID)) {
					ord = this.deleteLink(found.link.fromID, ID);
					linksTo.push({fromID: found.link.fromID, toID: ID, deleted: true, order: ord, neighbourID: 0});
				} else {
					if(onlyInM2m){
						this.changeLinkTo(found.link.fromID, ID, neighbourID);
						linksTo.push({ fromID: found.link.fromID, toID: ID, deleted: false, order: ord, neighbourID: neighbourID });
					}
				}
			});
			this.getLinksFrom(ID).forEach((found) => {
				if (this.linkExists(neighbourID, found.link.toID)) {
					ord = this.deleteLink(ID, found.link.toID);
					linksFrom.push({fromID: ID, toID: found.link.toID, deleted: true, order: ord, neighbourID: 0});
				} else {
					this.changeLinkFrom(ID, found.link.toID, neighbourID);
					linksFrom.push({ fromID: ID, toID: found.link.toID, deleted: false, order: ord, neighbourID: neighbourID });
				}
			});
		} else {
			this.getLinksTo(ID).forEach((found) => {
				ord = this.deleteLink(found.link.fromID, ID);
				linksTo.push({fromID: found.link.fromID, toID: ID, deleted: true, order: ord, neighbourID: 0});
			});
			this.getLinksFrom(ID).forEach((found) => {
				ord = this.deleteLink(ID, found.link.toID);
				linksFrom.push({fromID: ID, toID: found.link.toID, deleted: true, order: ord, neighbourID: 0});
			});
		}
		return {linksTo: linksTo, linksFrom: linksFrom};
	};

	public deleteLinkBoundaryInvers(deleted) {
		deleted.linksTo.forEach((found) => {
			if (found.deleted) { this.insertLinkAt(found.fromID, found.toID, found.order); }
			else { this.changeLinkTo(found.fromID, found.neighbourID, found.toID); }
		});
		deleted.linksFrom.forEach((found) => {
			if (found.deleted) { this.insertLinkAt(found.fromID, found.toID, found.order); }
			else { this.changeLinkFrom(found.neighbourID, found.toID, found.fromID); }
		});
	};
}

export const linkService = new LinkService();
