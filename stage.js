class Stage {

	constructor() {
		this.tag = document.querySelector('.Stage');
	}

	get x (){ return this.tag.offsetLeft; }
	get y (){ return this.tag.offsetTop; }

	get width (){ return this.tag.clientWidth; }
	get height (){ return this.tag.clientHeight; }

	// set x (x){ this.tag.style.left = x; }
	// set y (y){ this.tag.style.top = y; }

}
