import Inject from './Inject';
import {boundMethod} from 'autobind-decorator'

var size = {
    tile:{ // size of tiles
        source:{w:16, h:16},
        target:{w:32, h:32}
    },
    tiles:{ // number of tiles
        target:{w:1, h:1} // this is set dynamically depending on the canvas size
    },
    canvas:{w:1, h:1} // the canvas size is read from the actual html
};
Number.prototype.inRange = function (a, b) {
    var n = +this;
    return ( n >= a && n <= b );
};

class Puppet {

	constructor() {
		this.tag = document.querySelector('.Puppet');
		this.ax=0;
		this.ay=0;
		this.velocity_x=1;
		this.velocity_x_jump=1.2;
		this.velocity_y=22;
		this.friction=0.8;
		this.speed_limit_y=10;

		this._speedX=0;
		this.speedY=0;

		this.lives=3;

		this.animation('right');
	}

	@boundMethod
	animation(classe){
		this.tag.classList = "Puppet "+classe;
	}

	@boundMethod
	update(){
		this.ax = this.x;
		this.ay = this.y;

		if(Inject.control.shift){
			this.velocity_x=2;
			this.velocity_x_jump=2.2;
		}else{
			this.velocity_x=1;
			this.velocity_x_jump=1.2;
		}

		// this.tag.style.backgroundPosition = "-209px 0";

		if(!Inject.control.right && !Inject.control.left){
			if (this.speedX < 0) {
				this.animation('left');
			}else{
				this.animation('right');
			}
		}
		if (Inject.control.up) {
			if (this.speedX < 0) {
				this.animation('lookup-left');
			}else{
				this.animation('lookup-right');
			}
		}
		if(Inject.control.down) {
			if (this.speedX < 0) {
				this.animation('lower-left');
			}else{
				this.animation('lower-right');
			}
		}
		if (this.speedY == 0) {
			if (Inject.control.left) {
				// if(this.speedX > 0){
				// 	console.warn('run with SMOKE left');
				// }else{
				// }
				this.animation('walk-left');
				this.speedX -= this.velocity_x;
			} else if (Inject.control.right) {
				// if(this.speedX < 0){
				// 	console.warn('run with SMOKE right');
				// }else{
				// }
				this.animation('walk-right');
				this.speedX += this.velocity_x;
			}
		}else {
			if (Inject.control.left) {
				this.speedX -= this.velocity_x_jump;
			} else if (Inject.control.right) {
				this.speedX += this.velocity_x_jump;
			}
		}
		if (Inject.control.a && this.speedY == 0) {
			this.jump();
		}

		if(this.speedY < 0){
			if (this.speedX < 0) {
				this.animation('jumping-left');
			}else{
				this.animation('jumping-right');
			}
		}else if(this.speedY > 0){
			if (this.speedX < 0) {
				this.animation('falling-left');
			}else{
				this.animation('falling-right');
			}
		}


		// apply gravity.
		this.speedY += Inject.scene.gravity;
		if (Math.abs(this.speedY) < 0.1) this.speedY = 0;

		// apply speed limit when falling down
		if (this.speedY > this.speed_limit_y) {
			this.speedY = this.speed_limit_y;
		}

		this.ax += this.speedX;
		this.ay += this.speedY;

		// block on level edge
		if (this.ax < 0) {
			this.ax = 0;
		} else if (this.ax + this.width > Inject.scene.width) {
			this.ax = Inject.scene.width - this.width;
		}
		// die on level bottom
		if (this.ay > Inject.scene.height) {
			Inject.game.gameOver();
		}

		// add visible items + actors to collision check
		// todo: only add visible items
		Inject.scene.getCollisionMapVisible().forEach((object)=>{
			const collisions = object.collides(this);
			// console.log(collides);

			if(object.scenario){
				if (collisions.top && object.border.bottom=='solid') {
					this.ay = object.y + this.height;// + size.tile.target.h;
					this.speedY = 1;
				}
				if (collisions.bottom &&
						(object.border.top=='solid' ||
							(object.border.top=='platform' && this.speedY > 0))) {
					this.ay = object.y - this.height;
					this.speedY = 0;
				}
				if (collisions.right && object.border.horizontal=='solid' && this.speedX > 0) {
					this.ax = object.x - this.width;
					this.speedX = 0;
				}
				if (collisions.left && object.border.horizontal=='solid' && this.speedX < 0) {
					this.ax = object.x + object.width;
					this.speedX = 0;
				}
			}
			if(object.enemy || object.item){
				// console.log(object);
				object.collide(this, collisions);
			}
		});


	  // move the player when the level is at it's border, else move the level
	  if (Inject.scene.scroll_x <= 0) {
         if (this.ax > (Inject.stage.width / 2)) {
             Inject.scene.scroll_x = 1;
         }
     } else if (Inject.scene.scroll_x >= Inject.scene.width - Inject.stage.width && Inject.scene.width > Inject.stage.width) {
         Inject.scene.scroll_x = Inject.scene.width - Inject.stage.width;
         if (this.ax < Inject.scene.width - (Inject.stage.width / 2)) {
             Inject.scene.scroll_x = Inject.scene.width - Inject.stage.width - 1;
         }
     } else if (Inject.scene.width > Inject.stage.width) {
			if(this.ax > Inject.scene.line_to_scroll){
				Inject.scene.scroll_x = this.ax-Inject.scene.line_to_scroll;
			}
     }

	  	// apply friction
		this.speedX *= this.friction;

		this.x = this.ax;
		this.y = this.ay;
	}

	@boundMethod
	jump(){
		console.log('puppet jump', this)
		Inject.control.releaseA();
		this.speedY -= this.velocity_y;
	}

	@boundMethod
	die(){
		Inject.game.newGame();

		if (this.speedX < 0) {
			this.animation('dying-left');
		}else{
			this.animation('dying-right');
		}

		setTimeout(()=>{
			Inject.game.gameOver();
			Inject.game.play();
		}, 1000);
	}

	@boundMethod
	lower(){

	}




	// todo: re-spawn player at the closest 'y' to the left
	@boundMethod
	respawnPlayer(){
	    // if (startpos = getLastLevelSpritePosition('y', this.x)) {
	    //     this.x = startpos.x * size.tile.target.w
	    //     if (this.x >= Inject.stage.width/2) {
	    //         Scene.scroll_x = startpos.x * size.tile.target.w - Inject.stage.width/2
	    //     } else {
	    //         Scene.scroll_x = 0
	    //     }
	    //     this.y = (startpos.y + line_offset_y) * size.tile.target.h
	    // } else {
		 this.speedX = 0;
		 this.speedY = 0;
		 this.x = 40;
		 this.y = 0;
		 Inject.scene.scroll_x = 0
		 Inject.scene.x = 0
		 this.animation('right');
	}


	get x (){ return this.tag.offsetLeft; }
	set x (x){
		x = parseFloat(x.toFixed(1));
		if(x != this.x){
			// console.log('x', x, 'velocity_x',  this.velocity_x);
			this.tag.style.left = x + 'px';
		}
	}

	get y (){ return this.tag.offsetTop; }
	set y (y){
		y = parseFloat(y.toFixed(1));
		if(y != this.y){
			// console.log(y);
			this.tag.style.top = y + 'px';
		}
	}
	get speedX (){ return this._speedX; }
	set speedX (speedx){ this._speedX = parseFloat(speedx.toFixed(1)); }

	get width (){ return this.tag.offsetWidth; }
	get height (){ return this.tag.offsetHeight; }
}

export {Puppet as default};
