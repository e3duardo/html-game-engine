import Game from "./Game";
import Scene from './Scene';
import Stage from './Stage';
import Control from './Control';

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
		this.velocity_x=1.5;
		this.velocity_x_jump=1.0;
		this.velocity_y=22;
		this.gravity=3;
		this.friction=0.8;
		this.speed_limit_y=10;

		this._speedX=0;
		this.speedY=0;

		this.lives=3;

		this.animation('right');
	}

	animation = (classe)=>{
		this.tag.classList = "Puppet "+classe;
	}
	update = ()=>{
		let calcX = this.x;
		let calcY = this.y;

		// this.tag.style.backgroundPosition = "-209px 0";

		if(!Control.right && !Control.left){
			if (this.speedX < 0) {
				this.animation('left');
			}else{
				this.animation('right');
			}
		}
		if (Control.up) {
			if (this.speedX < 0) {
				this.animation('lookup-left');
			}else{
				this.animation('lookup-right');
			}
		}
		if(Control.down) {
			if (this.speedX < 0) {
				this.animation('lower-left');
			}else{
				this.animation('lower-right');
			}
		}
		if (this.speedY == 0) {
			if (Control.left) {
				// if(this.speedX > 0){
				// 	console.warn('run with SMOKE left');
				// }else{
				// }
				this.animation('walk-left');
				this.speedX -= this.velocity_x;
			} else if (Control.right) {
				// if(this.speedX < 0){
				// 	console.warn('run with SMOKE right');
				// }else{
				// }
				this.animation('walk-right');
				this.speedX += this.velocity_x;
			}
		}else {
			if (Control.left) {
				this.speedX -= this.velocity_x_jump;
			} else if (Control.right) {
				this.speedX += this.velocity_x_jump;
			}
		}
		if (Control.a && this.speedY == 0) {
			Control.releaseA();
			this.speedY -= this.velocity_y;
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
		this.speedY += this.gravity;
		if (Math.abs(this.speedY) < 0.1) this.speedY = 0;

		// apply speed limit when falling down
		if (this.speedY > this.speed_limit_y) {
			this.speedY = this.speed_limit_y;
		}

		calcX += this.speedX;
		calcY += this.speedY;

		// block on level edge
		if (calcX < 0) {
			calcX = 0;
		} else if (calcX + this.width > Scene.width) {
			calcX = Scene.width - this.width;
		}
		// die on level bottom
		if (calcY > Scene.height) {
			Game.gameOver();
		}

		// add visible items + actors to collision check
		// todo: only add visible items
		Scene.collisionMap.forEach((object)=>{


			var collides = {top:false, bottom:false, left:false, right:false};
			// we are below or above an object (use the middle of the actor, with tolerance)
			if ((calcX + this.width / 2).inRange(object.x - 0.25, object.x + object.width + 1.25)) {
				// check bounce bottom:
				if ((calcY + this.height).inRange(object.y, object.y + object.height - 1) && calcY < object.y) {
					collides.bottom = true;
				// check bounce top:
				} else if (calcY.inRange(object.y, object.y + object.height)) {
					collides.top = true;
				}
			}
			// we are right or left of an object
			if ((calcY + this.height / 2).inRange(object.y - 0.25, object.y + object.height + 1.25)) {
				// check bounce right
				if ((calcX + this.width).inRange(object.x, object.x + object.width)) {
					collides.right = true;
				}
				// check bounce left
				if (calcX.inRange(object.x, object.x + object.width)) {
					collides.left = true;
				}
			}

			if (object.solid) {
             if (collides.top) {
                 // if (object.type == 'block_coin') {
                 //     replaceLevelSpriteXY(object.x, object.y, "ß");
                 //     items.push({ sx:8, sy:9, x:object.x, y:(object.y - size.tile.target.h), type:'coin' });
                 // } else {
                     calcY = object.y + this.height;// + size.tile.target.h;
                     this.speedY = 1;
                 // }
             } else if (collides.bottom) {
                 // jump on enemy
                 // if (object.type == 'enemy_mushroom') {
                 //     object.deadly = false
                 //     object.speed = 0
                 //     object.sx = 2
                 //     score++;
                 //     sound_jump_on_enemy()
                 // }
                 calcY = object.y - this.height;
                 this.speedY = 0;
             } else if (collides.right) {
                 calcX = object.x - this.width;
                 this.speedX = 0;
             } else if (collides.left) {
                 calcX = object.x + this.width;//+ size.tile.target.w;
                 this.speedX = 0;
             }
         }else if (object.platform) {
				if (collides.bottom) {
					if(this.speedY > 0){
						calcY = object.y - this.height;
						this.speedY = 0;
					}
				}
         }

			// const collides = this.checkCollision(object);

		    // apply collision to player movement
		    // special actions on collisions
		    // if (object.solid) {
		    //     if (collides.top) {
		    //         // if (object.type == 'block_coin') {
		    //         //     replaceLevelSpriteXY(object.x, object.y, "ß");
		    //         //     items.push({ sx:8, sy:9, x:object.x, y:(object.y - size.tile.target.h), type:'coin' });
		    //         // } else {
				// 		// if
		    //             this.y = object.y-object.height;
		    //             this.speedY = 0;
		    //         // }
		    //     } else if (collides.bottom) {
		    //         // jump on enemy
		    //         // if (object.type == 'enemy_mushroom') {
		    //         //     object.deadly = false
		    //         //     object.speed = 0
		    //         //     object.sx = 2
		    //         //     score++;
		    //         //     sound_jump_on_enemy()
		    //         // }
				// 		this.y = object.y+object.height;
				// 		this.speedY = 0;
		    //     } else if (collides.right) {
		    //         this.x = object.x - this.width;
		    //         this.speedX = 0;
		    //     } else if (collides.left) {
		    //         this.x = object.x + size.tile.target.w;
		    //         this.speedX = 0;
		    //     }
		    // }

		    // collide from any side
		    if (collides.top || collides.bottom || collides.right || collides.left) {
		        if (object.deadly == true) {
		            //items.push({ sx:, sy:9, x:this.x, y:this.y, deadly:false, type:'looser' });
						Game.gameOver()
		        }
		    //     if (object.type == 'exit') {
		    //         levelWin()
		    //     }
		    //     if (object.type == 'trampoline') {
		    //         this.speedY < 0 ? this.speedY = 0 : true
		    //         sound_jump()
		    //         this.speedY = -0.5 * this.speedY - 25
		    //     }
		    //     if (object.type == 'coin') {
		    //         items.splice(items.indexOf(object), 1)
		    //         score++
		    //         sound_coin()
		    //     }
		    }
		});



	  // move the player when the level is at it's border, else move the level
	  if (Scene.scroll_x <= 0) {
         if (calcX > (Stage.width / 2)) {
             Scene.scroll_x = 1;
         }
     } else if (Scene.scroll_x >= Scene.width - Stage.width && Scene.width > Stage.width) {
         Scene.scroll_x = Scene.width - Stage.width;
         if (calcX < Scene.width - (Stage.width / 2)) {
             Scene.scroll_x = Scene.width - Stage.width - 1;
         }
     } else if (Scene.width > Stage.width) {
			if(calcX > Scene.line_to_scroll){
				Scene.scroll_x = calcX-Scene.line_to_scroll;
			}
     }

	  	// apply friction
		this.speedX *= this.friction;

		this.x = calcX;
		this.y = calcY;
	}

	walk = (direction)=>{
		this.speedX += this.velocity_x;
		this.tag.classList.add('walk');
		this.tag.classList.remove('walk-back');
	}
	walkReverse = (direction)=>{
		this.speedX -= this.velocity_x;
		this.tag.classList.remove('walk');
		this.tag.classList.add('walk-back');
	}
	jump = ()=>{
		this.speedY -= this.velocity_y;
	}
	lower = ()=>{

	}




	// todo: re-spawn player at the closest 'y' to the left
	respawnPlayer = ()=>{
	    // if (startpos = getLastLevelSpritePosition('y', this.x)) {
	    //     this.x = startpos.x * size.tile.target.w
	    //     if (this.x >= Stage.width/2) {
	    //         Scene.scroll_x = startpos.x * size.tile.target.w - Stage.width/2
	    //     } else {
	    //         Scene.scroll_x = 0
	    //     }
	    //     this.y = (startpos.y + line_offset_y) * size.tile.target.h
	    // } else {
		 this.speedX = 0;
		 this.speedY = 0;
		 this.x = 40;
		 this.y = 0;
		 Scene.scroll_x = 0
		 Scene.x = 0
		 this.animation('right');
	}


	get x (){ return this.tag.offsetLeft; }
	set x (x){
		x = parseFloat(x.toFixed(1));
		if(x != this.x){
			console.log('x', x, 'velocity_x',  this.velocity_x);
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
