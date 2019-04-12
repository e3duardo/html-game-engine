class Scene {
	constructor() {
		this.tag = document.querySelector('.Scene');
	}

	get x (){ return this.tag.offsetLeft; }
	get y (){ return this.tag.offsetTop; }

	get width (){ return this.tag.clientWidth; }
	get height (){ return this.tag.clientHeight; }

	set x (x){
		if(this.width + this.x <= stage.width){
			this.tag.style.left = -this.width+stage.width+'px';
		}else{
			this.tag.style.left = x+'px';
		}
	}
	set y (y){ this.tag.style.top = y+'px'; }

}
