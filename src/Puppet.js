import Game from "./Game";
import Control from './Control';

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

		this.lives=1;

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
		if (this.speedY == 0) {
			if (Control.left && this.speedY == 0) {
				console.log('left');
				this.speedX -= this.velocity_x;
			} else if (Control.right && this.speedY == 0) {
				console.log('right');
				this.speedX += this.velocity_x;
			}
		} else {
			if (Control.left) {
				console.log('left');
				this.speedX -= this.velocity_x_jump;
			} else if (Control.right) {
				console.log('right2');
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



/*



     actor.pos.x += actor.speed.x;
     actor.pos.y += actor.speed.y;

     // block on level edge
     if (actor.pos.x < 0) {
         actor.pos.x = 0;
     } else if (actor.pos.x + actor.target_size.w > current_level.width) {
         actor.pos.x = current_level.width - actor.target_size.w;
     }
     // die on level bottom
     if (actor.pos.y > size.canvas.h) {
         gameOver();
     }

     // add visible items + actors to collision check
     // todo: only add visible items
     collisionMap = collisionMap.concat(items);

     collisionMap.forEach(function (object) {

         var collides = checkCollision(actor, object);

         // apply collision to player movement
         // special actions on collisions
         if (object.solid) {
             if (collides.top) {
                 if (object.type == 'block_coin') {
                     replaceLevelSpriteXY(object.x, object.y, "ß");
                     items.push({ sx:8, sy:9, x:object.x, y:(object.y - size.tile.target.h), type:'coin' });
                 } else {
                     actor.pos.y = object.y + size.tile.target.h;
                     actor.speed.y = 1;
                 }
             } else if (collides.bottom) {
                 // jump on enemy
                 if (object.type == 'enemy_mushroom') {
                     object.deadly = false
                     object.speed = 0
                     object.sx = 2
                     score++;
                     sound_jump_on_enemy()
                 }
                 actor.pos.y = object.y - actor.target_size.h;
                 actor.speed.y = 0;
             } else if (collides.right) {
                 actor.pos.x = object.x - actor.target_size.w;
                 actor.speed.x = 0;
             } else if (collides.left) {
                 actor.pos.x = object.x + size.tile.target.w;
                 actor.speed.x = 0;
             }
         }

         // collide from any side
         if (collides.top || collides.bottom || collides.right || collides.left) {
             if (object.deadly == true) {
                 //items.push({ sx:, sy:9, x:actor.pos.x, y:actor.pos.y, deadly:false, type:'looser' });
                 gameOver()
             }
             if (object.type == 'exit') {
                 levelWin()
             }
             if (object.type == 'trampoline') {
                 actor.speed.y < 0 ? actor.speed.y = 0 : true
                 sound_jump()
                 actor.speed.y = -0.5 * actor.speed.y - 25
             }
             if (object.type == 'coin') {
                 items.splice(items.indexOf(object), 1)
                 score++
                 sound_coin()
             }
         }

     })

     // move the player when the level is at it's border, else move the level
     if (scroll_x <= 0) {
         if (actor.pos.x > (size.canvas.w / 2)) {
             scroll_x = 1;
         }
     } else if (scroll_x >= current_level.width - size.canvas.w && current_level.width > size.canvas.w) {
         scroll_x = current_level.width - size.canvas.w;
         if (actor.pos.x < current_level.width - (size.canvas.w / 2)) {
             scroll_x = current_level.width - size.canvas.w - 1;
         }
     } else if (current_level.width > size.canvas.w) {
         scroll_x += actor.speed.x;
     }




	  */

	  // apply friction
	  this.speedX *= this.friction;


	  this.x += this.speedX;
	  this.y += this.speedY;
	  if(this.y > Game.height-59){
	  	this.y = Game.height-59;
	  	this.speedY = 0;
	  }


		// this.speedY += this.velocity_y;
		//
		// this.x += this.speedX;
		// this.y += this.speedY;
		//
		// if(this.y > Game.height-59){
		// 	this.y = Game.height-59;
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



	get x (){ return this.tag.offsetLeft; }
	set x (x){ this.tag.style.left = x + 'px'; }

	get y (){ return this.tag.offsetTop; }
	set y (y){ this.tag.style.top = y + 'px'; }
}

export {Puppet as default};
