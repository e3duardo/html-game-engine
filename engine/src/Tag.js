class Tag {
	constructor(tag) {
		this.tag = tag;
	}

	get width (){ return this.tag.clientWidth; }
	get height (){ return this.tag.clientHeight; }

	get x (){ return this.tag.offsetLeft; }
	set x (x){
		x = parseInt(x);
		if(x != this.x){
			this.tag.style.left = x + 'px';
		}
	}

	get y (){ return this.tag.offsetTop; }
	set y (y){
		y = parseInt(y);
		if(y != this.y){
			this.tag.style.top = y + 'px';
		}
	}
}

export default Tag;