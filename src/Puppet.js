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
		this.velocity_x_jump=1.5;
		this.velocity_y=25;
		this.gravity=2;
		this.friction=0.8;
		this.speed_limit_y=25;

		this.speedX=0;
		this.speedY=0;

		this.lives=3;

		// var speed = {
		//   player:{
		//     velocity_x:1.5, velocity_y:25, gravity:2, friction:0.8
		//   }
		// }
		//
		// // run
		// if (held.right) {
		//   this.speedX += speed.player.velocity_x;
		// }
		//
		// // jump
		// if (held.up) { this.speedY -= speed.player.velocity_y; }
		//
		// // apply gravity.
		// this.speedY += speed.player.gravity;




		// this.running;
	}

	update = ()=>{
		if (this.speedY == 0) {
			if (Control.left && this.speedY == 0) {
				// console.log('left');
				this.speedX -= this.velocity_x;
			} else if (Control.right && this.speedY == 0) {
				// console.log('right');
				this.speedX += this.velocity_x;
			}
		} else {
			if (Control.left) {
				// console.log('left');
				this.speedX -= this.velocity_x_jump;
			} else if (Control.right) {
				// console.log('right2');
				this.speedX += this.velocity_x_jump;
			}
		}
		if (Control.up && this.speedY == 0) {
			// sound_jump()
			this.speedY -= this.velocity_y;
		} else if (Control.down) {
			console.warn('duck');
			// this only causes a duck animation, nothing happens in term of speed
		}
		Control.up = false

		  //function animate_actor(actor) {
		    if (this.speedX > 0) {
		        // actor.sprite.y = actor.source_size.h;
				  this.tag.style.backgroundPosition = '-209px 0';
		    } else if (this.speedX < 0) {
		        // actor.sprite.y = actor.source_size.h * 3;
				  this.tag.style.backgroundPosition = '-169px 0';
		    }
			 //
		    if (this.speedY != 0) {
					if (this.speedX > 0) {
						  this.tag.style.backgroundPosition = '-208px -39px';
		  		    } else if (this.speedX < 0) {
		  				  this.tag.style.backgroundPosition = '-168px -39px';
		  		    }
		    } else {
		    }
		    if (Control.down) {
		    //     // todo: ducken
		    }
		 //}

		// apply gravity.
		this.speedY += this.gravity;
		// if (Math.abs(this.speedX) < 0.8) this.speedX = 0;
		if (Math.abs(this.speedY) < 0.1) this.speedY = 0;

		// apply speed limit when falling down
		if (this.speedY > this.speed_limit_y) {
			this.speedY = this.speed_limit_y;
		}


		this.x += this.speedX;
		this.y += this.speedY;

		// block on level edge
		if (this.x < 0) {
			this.x = 0;
		} else if (this.x + this.width > Scene.width) {
			this.x = Scene.width - this.width;
		}
		// die on level bottom
		// console.warn(this.y, Stage.height)
		if (this.y > Stage.height) {
			Game.gameOver();
		}

		// add visible items + actors to collision check
		// todo: only add visible items
		Scene.collisionMap.forEach((object)=>{


			var collides = {top:false, bottom:false, left:false, right:false};
			// we are below or above an object (use the middle of the actor, with tolerance)
			if ((this.x + this.width / 2).inRange(object.x - 0.25, object.x + object.width + 1.25)) {
			// if ((this.x + this.width / 2).inRange(object.x - 0.25 * size.tile.target.w, object.x + 1.25 * size.tile.target.w)) {
				// check bounce bottom:
				// if ((this.y + this.height).inRange(object.y, object.y + size.tile.target.h - 1) && this.y < object.y) {

				if ((this.y + this.height).inRange(object.y, object.y + object.height - 1) && this.y < object.y) {
					collides.bottom = true;
				// check bounce top:
				// } else if (this.y.inRange(object.y, object.y + size.tile.target.h)) {
				} else if (this.y.inRange(object.y, object.y + object.height)) {
					collides.top = true;
				}
			}
			// we are right or left of an object
			// if ((this.y + this.height / 2).inRange(object.y - 0.25 * size.tile.target.h, object.y + 1.25 * size.tile.target.h)) {
			if ((this.y + this.height / 2).inRange(object.y - 0.25, object.y + object.height + 1.25)) {
				// check bounce right
				// if ((this.x + this.width).inRange(object.x, object.x + size.tile.target.w)) {
				if ((this.x + this.width).inRange(object.x, object.x + object.width)) {
					collides.right = true;
				}
				// check bounce left
				// if (this.x.inRange(object.x, object.x + size.tile.target.w)) {
				if (this.x.inRange(object.x, object.x + object.width)) {
					collides.left = true;
				}
			}

			if (object.solid) {
             if (collides.top) {
                 // if (object.type == 'block_coin') {
                 //     replaceLevelSpriteXY(object.x, object.y, "ß");
                 //     items.push({ sx:8, sy:9, x:object.x, y:(object.y - size.tile.target.h), type:'coin' });
                 // } else {
                     this.y = object.y + this.height;// + size.tile.target.h;
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
                 this.y = object.y - this.height;
                 this.speedY = 0;
             } else if (collides.right) {
                 this.x = object.x - this.width;
                 this.speedX = 0;
             } else if (collides.left) {
                 this.x = object.x + this.width;//+ size.tile.target.w;
                 this.speedX = 0;
             }
         }else if (object.platform) {
				if (collides.bottom) {
					if(this.speedY > 0){
						this.y = object.y - this.height;
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
		    // if (collides.top || collides.bottom || collides.right || collides.left) {
		    //     if (object.deadly == true) {
		    //         //items.push({ sx:, sy:9, x:this.x, y:this.y, deadly:false, type:'looser' });
		    //         gameOver()
		    //     }
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
		    // }
		});






		// console.log('scroll', Scene.scroll_x);
	  // move the player when the level is at it's border, else move the level
	  if (Scene.scroll_x <= 0) {
		  // console.log('aquii2');
         if (this.x > (Stage.width / 2)) {
             Scene.scroll_x = 1;
         }
     } else if (Scene.scroll_x >= Scene.width - Stage.width && Scene.width > Stage.width) {
		  // console.log('aquii');
         Scene.scroll_x = Scene.width - Stage.width;
         if (this.x < Scene.width - (Stage.width / 2)) {
             Scene.scroll_x = Scene.width - Stage.width - 1;
         }
     } else if (Scene.width > Stage.width) {
			if(this.x > 200){
				Scene.scroll_x = this.x-200;
			}
     }

	  // apply friction
	  this.speedX *= this.friction;


	  // this.x += this.speedX;
	  // this.y += this.speedY;
	  // if(this.y > Stage.height-59){
	  // 	this.y = Stage.height-59;
	  // 	this.speedY = 0;
	  // }


		// this.speedY += this.velocity_y;
		//
		// this.x += this.speedX;
		// this.y += this.speedY;
		//
		// if(this.y > Stage.height-59){
		// 	this.y = Stage.height-59;
		// 	this.speedY = 0;
		// }
		//
		// if(this.speedX>0){
		// 	this.speedX -= this.velocity_x;
		// }else if(this.speedX<0){
		// 	this.speedX += this.velocity_x;
		// }
		//
		// if(Control.right){
		// 	this.walk();
		// }
		// if(Control.left){
		// 	this.walkReverse();
		// }
		// if(Control.up){
		// 	this.jump();
		// }
		// if(Control.down){
		// 	this.lower();
		// }
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


	// checkCollision = (object)=>{
	// 	var collides = {top:false, bottom:false, left:false, right:false};
	//
	// 	// we are below or above an object (use the middle of the actor, with tolerance)
	// 	if ((this.x + this.width / 2).inRange(object.x - 0.25, object.x + 1.25 + object.width)) {
   //      // check bounce bottom:
   //      if ((this.y + this.height).inRange(object.y, object.y + size.tile.target.h - 1) && this.y < object.y) {
   //          collides.bottom = true;
   //          // check bounce top:
   //      } else if (this.y.inRange(object.y, object.y+object.height)){// object.y + size.tile.target.h)) {
   //          collides.top = true;
   //      }
	// 	// we are right or left of an object
	// 	// if ((this.y + this.height / 2).inRange(object.y - 0.25 * size.tile.target.h, object.y + 1.25 * size.tile.target.h)) {
	// 	// 	// check bounce right
	// 	// 	if ((this.x + this.width).inRange(object.x, object.x + size.tile.target.w)) {
	// 	// 		collides.right = true;
	// 	// 	}
	// 	// 	// check bounce left
	// 	// 	if (this.x.inRange(object.x, object.x + size.tile.target.w)) {
	// 	// 		collides.left = true;
	// 	// 	}
	// 	// }
	// }
	// //console.log(collides);
	// 	return collides;
	// }


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
	        this.x = 2 * size.tile.target.w
	        this.y = 5 * size.tile.target.h
	        Scene.scroll_x = 0
	    // }
	    this.speedX = 0
	    this.speedY = 0
	}


	get x (){ return this.tag.offsetLeft; }
	set x (x){ this.tag.style.left = x + 'px'; }

	get y (){ return this.tag.offsetTop; }
	set y (y){ this.tag.style.top = y + 'px'; }

	get width (){ return this.tag.offsetWidth; }
	get height (){ return this.tag.offsetHeight; }
}

export {Puppet as default};
