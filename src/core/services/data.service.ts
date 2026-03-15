import { deepCopy } from '../util/deep-copy';

export class DataService {

	private data;
	private maxItemID;

	constructor() {
		this.data = {
			levels: []
		};
		this.maxItemID = 0;
	}

	public getData() {
		return this.data;
	}

	public setLevelData(data) {
		this.data.levels = data;
	}

	public getLevelData() {
		return this.data.levels;
	}

	public getLevelOrder(order) {
		if (this.data.levels !== undefined) {
			return this.data.levels.sort((a, b) => {
				return order.indexOf(a.name) - order.indexOf(b.name);
			});
		}
	}

	public getLevelDataAt(position) {
		return this.data.levels[position];
	}

	public insertLevelDataAt(position, newLevel) {
		this.data.levels.splice(position, 0, newLevel);
	}

	public deleteLevelDataAt(position) {
		this.data.levels.splice(position, 1);
	}

	public getLinkData() {
		return this.data.links;
	}

	public setLinkData(data) {
		this.data.links = data;
	}

	public insertLinkData(newLink) {
		this.data.links.push(newLink);
	}

	public deleteLinkDataAt(position) {
		this.data.links.splice(position, 1);
	}

	public insertLinkDataAt(position, newLink) {
		this.data.links.splice(position, 0, newLink);
	}

	public changeLinkDataAt(position, fromNewID, toNewID) {
		this.data.links[position].fromID = fromNewID;
		this.data.links[position].toID = toNewID;
	}

	public setData(data) {
		deepCopy(data, this.data);
		if (typeof this.data.levels !== "undefined") {
			this.data.levels.forEach((level) => {
				level.items.forEach((item) => {
					if (item.id > this.maxItemID) {
						this.maxItemID = item.id;
					}
				});
			});
		}
	}

	public getNewId() {
		this.maxItemID += 1;
		return this.maxItemID;
	}

	public raiseId(amount) {
		this.maxItemID += amount;
	}

	public lowerId(amount) {
		this.maxItemID -= amount;
	}
}

export const dataService = new DataService();
