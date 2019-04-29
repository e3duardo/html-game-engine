import Game from "./Game";

class Puppet0 {

	constructor() {
		this.tag = document.querySelector('.Puppet');
		this.velocity_x=1.5;
		this.velocity_y=25;
		this.gravity=2;
		this.friction=0.8;

		this.speedX=0;
		this.speedY=0;

		// var speed = {
		//   player:{
		//     velocity_x:1.5, velocity_y:25, gravity:2, friction:0.8
		//   }
		// }
		//
		// // run
		// if (held.right) {
		//   actor.speed.x += speed.player.velocity_x;
		// }
		//
		// // jump
		// if (held.up) { actor.speed.y -= speed.player.velocity_y; }
		//
		// // apply gravity.
		// actor.speed.y += speed.player.gravity;




		// this.running;
	}

	update = ()=>{
		this.speedY += this.velocity_y;

		this.x += this.speedX;
		this.y += this.speedY;
		if(this.y > Game.height-59){
			this.y = Game.height-59;
			this.speedY = 0;
		}

		if(this.speedX>0){
			this.speedX -= this.velocity_x;
		}else if(this.speedX<0){
			this.speedX += this.velocity_x;
		}
	}

	walk = (direction)=>{
		if(direction == 'back'){
			this.speedX -= this.velocity_x;
			this.tag.classList.remove('walk');
			this.tag.classList.add('walk-back');
		}else{
			this.speedX += this.velocity_x;
			this.tag.classList.add('walk');
			this.tag.classList.remove('walk-back');
		}
	}
	jump = ()=>{
		this.speedY -= this.velocity_y;
	}



	get x (){ return this.tag.offsetLeft; }
	set x (x){ this.tag.style.left = x + 'px'; }

	get y (){ return this.tag.offsetTop; }
	set y (y){ this.tag.style.top = y + 'px'; }
	//
	// get width (){ return this.tag.clientWidth; }
	// get height (){ return this.tag.clientHeight; }
	//
	// colide = (previewX, previewY, topColliders)=>{
	// 	let collidables = document.querySelectorAll('.collidable');
	// 	if(topColliders){
	// 		collidables = [...collidables,...document.querySelectorAll('.collidable-top')];
	// 	}
	//
	// 	for (var i = 0; i < collidables.length; i++) {
	// 		const collidable = collidables[i];
	//
	// 		//console.log(previewY, this.tag.clientHeight+this.tag.offsetTop+previewY > collidable.offsetTop, this.tag.clientHeight+this.tag.offsetTop+previewY, collidable.offsetTop)
	// 		const colideTop = this.y+this.height+previewY > collidable.offsetTop;
	// 		const colideLeft = this.x+this.width+previewX > collidable.offsetLeft;
	// 		const colideRight = this.x+previewX < collidable.offsetLeft+collidable.clientWidth;
	//
	// 		if(colideTop && colideLeft && colideRight){
	// 			return true
	// 		}
	// 	}
	//
	// 	return false;
	// }
	//
	// gravity = ()=>{
	// 	if(gravitySpeed<0 || !this.colide(0, speedY+gravitySpeed, true)){
	// 		gravitySpeed += gravity;
	// 		this.y = (this.y + (speedY+gravitySpeed));
	// 	}
	// }
	//
	// goAhead = ()=>{
	// 	this.x += speedX;
	//
	// 	if(this.x> -scene.x+80){
	// 		scene.x -= speedX;
	// 	}
	//
	// 	const isOutsideScene = this.x >= scene.width-this.width
	// 	if(isOutsideScene){
	// 		this.x = scene.width-this.width;
	// 	}
	//
	//
	// 	this.tag.classList.remove('Puppet-backwards');
	// 	this.tag.classList.remove('Puppet-ahead');
	// 	this.tag.classList.add('Puppet-ahead');
	//
	//
	// 	const tag = this.tag;
	// 	clearTimeout(this.running)
	// 	tag.classList.add('Puppet-running');
	// 	this.running = setTimeout(function(){
	// 		tag.classList.remove('Puppet-running');
	// 	},40);
	// }
	//
	// goBack = ()=>{
	// 	this.x -= speedX;
	//
	// 	const isOutsideScene = this.x < -scene.x;
	// 	if(isOutsideScene){
	// 		this.x = -scene.x;
	// 	}
	//
	//
	// 	this.tag.classList.remove('Puppet-ahead');
	// 	this.tag.classList.remove('Puppet-backwards');
	// 	this.tag.classList.add('Puppet-backwards');
	//
	//
	// 	const tag = this.tag;
	// 	clearTimeout(this.running)
	// 	tag.classList.add('Puppet-running');
	// 	this.running = setTimeout(function(){
	// 		tag.classList.remove('Puppet-running');
	// 	},40);
	// }
	//
	// jump = ()=>{
	// 	const tag = this.tag;
	//
	// 	if(this.colide(0, 10)){
	// 		gravitySpeed = -12;
	// 		tag.classList.add('Puppet-blink');
	// 	}
	//
	// 	setTimeout(function(){
	// 		tag.classList.remove('Puppet-blink');
	// 	},50);
	// }
	//
	// dive = ()=>{
	// 	const tag = this.tag;
	//
	// 	gravitySpeed = +20;
	//
	// 	tag.classList.add('Puppet-blink');
	//
	// 	setTimeout(function(){
	// 		tag.classList.remove('Puppet-olho-fechado');
	// 	},200);
	//
	// }
}

export {Puppet0 as default};
