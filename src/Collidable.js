class Collidable {
	constructor(tag) {
		this.tag = tag;
		this.solid = this.tag.classList.contains('solid');
		this.platform = this.tag.classList.contains('platform');
		this.elastic = this.tag.classList.contains('elastic');
		this.deadly = this.tag.classList.contains('deadly');

		this.border = {
			top: 'solid',
			bottom: 'solid',
			horizontal: 'solid'
		}
		if(this.platform){
			this.border.top='platform';
			this.border.bottom=false;
			this.border.horizontal=false;
		}
	}

	collide = (from, collides)=>{
		if (collides.top && this.border.bottom=='solid') {
			  from.ay = this.y + from.height;// + size.tile.target.h;
			  from.speedY = 1;
		}
		if (collides.bottom){
			if(this.border.top=='solid') {
				from.ay = this.y - from.height;
				from.speedY = 0;
			}else if(this.border.top=='platform') {
				if(from.speedY > 0){
					from.ay = this.y - from.height;
					from.speedY = 0;
			 	}
		 	}
		}
		if (collides.right && this.border.horizontal=='solid' && from.speedX > 0) {
			if(from.border && from.border.horizontal=='elastic') {
				from.speedX *= -1;
				console.log('teste1');
			}else{
				from.ax = this.x - from.width;
				from.speedX = 0;
			}
		}
		if (collides.left && this.border.horizontal=='solid' && from.speedX < 0) {
			if(from.border && from.border.horizontal=='elastic') {
				from.speedX *= -1;
				console.log('teste2');
			}else{
				from.ax = this.x + this.width;
				from.speedX = 0;
			}
		}
	}

	collides = (from)=>{
		let collides = {top:false, bottom:false, left:false, right:false};
		// we are below or above an object (use the middle of the actor, with tolerance)
		if ((from.ax + from.width / 2).inRange(this.x - 0.25, this.x + this.width + 1.25)) {
			// check bounce bottom:
			if ((from.ay + from.height).inRange(this.y, this.y + this.height - 1) && from.ay < this.y) {
				collides.bottom = true;
			// check bounce top:
			} else if (from.ay.inRange(this.y, this.y + this.height)) {
				collides.top = true;
			}
		}
		// we are right or left of an object
		if ((from.ay + from.height / 2).inRange(this.y - 0.25, this.y + this.height + 1.25)) {
			// check bounce right
			if ((from.ax + from.width).inRange(this.x, this.x + this.width)) {
				collides.right = true;
			}
			// check bounce left
			if (from.ax.inRange(this.x, this.x + this.width)) {// + this.width)) {
				collides.left = true;
			}
		}
		return collides;
	}

	get x (){ return this.tag.offsetLeft; }
	set x (x){ this.tag.style.left = x +'px'; }
	get y (){ return this.tag.offsetTop; }
	set y (y){ this.tag.style.top = y +'px'; }

	get width (){ return this.tag.offsetWidth; }
	get height (){ return this.tag.offsetHeight; }
}

export {Collidable as default};
