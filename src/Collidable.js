class Collidable {
	constructor(tag) {
		this.tag = tag;
		this.solid = this.tag.classList.contains('solid');
		this.platform = this.tag.classList.contains('platform');
		this.elastic = this.tag.classList.contains('elastic');
		this.deadly = this.tag.classList.contains('deadly');
	}

	get x (){ return this.tag.offsetLeft; }
	get y (){ return this.tag.offsetTop; }

	get width (){ return this.tag.offsetWidth; }
	get height (){ return this.tag.offsetHeight; }
}

export {Collidable as default};
