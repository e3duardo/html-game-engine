class Puppet {
	constructor() {
		this.tag = document.querySelector('.Puppet');
		this.running;
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
		this.x += speedX;

		if(this.x> -scene.x+80){
			scene.x -= speedX;
		}

		const isOutsideScene = this.x >= scene.width-this.width
		if(isOutsideScene){
			this.x = scene.width-this.width;
		}


		this.tag.classList.remove('Puppet-backwards');
		this.tag.classList.remove('Puppet-ahead');
		this.tag.classList.add('Puppet-ahead');


		const tag = this.tag;
		clearTimeout(this.running)
		tag.classList.add('Puppet-running');
		this.running = setTimeout(function(){
			tag.classList.remove('Puppet-running');
		},40);
	}

	goBack = ()=>{
		this.x -= speedX;

		const isOutsideScene = this.x < -scene.x;
		if(isOutsideScene){
			this.x = -scene.x;
		}


		this.tag.classList.remove('Puppet-ahead');
		this.tag.classList.remove('Puppet-backwards');
		this.tag.classList.add('Puppet-backwards');


		const tag = this.tag;
		clearTimeout(this.running)
		tag.classList.add('Puppet-running');
		this.running = setTimeout(function(){
			tag.classList.remove('Puppet-running');
		},40);
	}

	jump = ()=>{
		const tag = this.tag;

		if(this.colide(0, 10)){
			gravitySpeed = -12;
			tag.classList.add('Puppet-blink');
		}

		setTimeout(function(){
			tag.classList.remove('Puppet-blink');
		},50);
	}

	dive = ()=>{
		const tag = this.tag;

		gravitySpeed = +20;

		tag.classList.add('Puppet-blink');

		setTimeout(function(){
			tag.classList.remove('Puppet-olho-fechado');
		},200);

	}
}
