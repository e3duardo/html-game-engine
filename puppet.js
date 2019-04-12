class Puppet {
	constructor() {
		this.tag = document.querySelector('.Puppet');
	}

	get x (){ return this.tag.offsetLeft; }
	set x (x){ this.tag.style.left = x + 'px'; }

	get y (){ return this.tag.offsetTop; }
	set y (y){ this.tag.style.top = y + 'px'; }

	get width (){ return this.tag.clientWidth; }
	get height (){ return this.tag.clientHeight; }

	colide = (previewX, previewY)=>{
		const collidables = document.querySelectorAll('.collidable');

		for (var i = 0; i < collidables.length; i++) {
			const collidable = collidables[i];

			//console.log(previewY, this.tag.clientHeight+this.tag.offsetTop+previewY > collidable.offsetTop, this.tag.clientHeight+this.tag.offsetTop+previewY, collidable.offsetTop)
			const colideTop = this.y+this.height+previewY > collidable.offsetTop;
			const colideLeft = this.x+this.width+previewX > collidable.offsetLeft;
			const colideRight = this.x+previewX < collidable.offsetLeft+collidable.clientWidth;

			if(colideTop && colideLeft && colideRight){
				return true
			}
		}

		return false;
	}

	gravity = ()=>{
		if(gravitySpeed<0 || !this.colide(0, speedY+gravitySpeed)){
			gravitySpeed += gravity;
			this.y = (this.y + (speedY+gravitySpeed));
		}
	}

	goAhead = ()=>{

		if(!this.colide(speedX, 0)){
			this.x += speedX;

			if(this.x>100){
				scene.x -= speedX;
			}
		}

		const puppetOutsideScene = this.x >= scene.width-this.width
		if(puppetOutsideScene){
			this.x = scene.width-this.width;
		}
	}
	goBack = ()=>{
		if(!this.colide(-speedX, 0)  && (this.x - speedX)>0 && this.x > -(scene.x) ){
			this.x -= speedX;
		}
	}
	jump = ()=>{
		console.log(gravitySpeed);
		gravitySpeed = -20;
		//gravity = 0;
		// if(this.colide(0, scale)){
		//   this.tag.style.top = (this.tag.offsetTop - (scale*10)) + 'px';
		// }
	}
}
