import Stage from './Stage';

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

	constructor(game) {
		this.game = game;

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

	animation = (classe)=>{
		this.tag.classList = "Puppet "+classe;
	}
	update = ()=>{
		this.ax = this.x;
		this.ay = this.y;

		if(this.game.control.shift){
			this.velocity_x=2;
			this.velocity_x_jump=2.2;
		}else{
			this.velocity_x=1;
			this.velocity_x_jump=1.2;
		}

		// this.tag.style.backgroundPosition = "-209px 0";

		if(!this.game.control.right && !this.game.control.left){
			if (this.speedX < 0) {
				this.animation('left');
			}else{
				this.animation('right');
			}
		}
		if (this.game.control.up) {
			if (this.speedX < 0) {
				this.animation('lookup-left');
			}else{
				this.animation('lookup-right');
			}
		}
		if(this.game.control.down) {
			if (this.speedX < 0) {
				this.animation('lower-left');
			}else{
				this.animation('lower-right');
			}
		}
		if (this.speedY == 0) {
			if (this.game.control.left) {
				// if(this.speedX > 0){
				// 	console.warn('run with SMOKE left');
				// }else{
				// }
				this.animation('walk-left');
				this.speedX -= this.velocity_x;
			} else if (this.game.control.right) {
				// if(this.speedX < 0){
				// 	console.warn('run with SMOKE right');
				// }else{
				// }
				this.animation('walk-right');
				this.speedX += this.velocity_x;
			}
		}else {
			if (this.game.control.left) {
				this.speedX -= this.velocity_x_jump;
			} else if (this.game.control.right) {
				this.speedX += this.velocity_x_jump;
			}
		}
		if (this.game.control.a && this.speedY == 0) {
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
		this.speedY += this.game.scene.gravity;
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
		} else if (this.ax + this.width > this.game.scene.width) {
			this.ax = this.game.scene.width - this.width;
		}
		// die on level bottom
		if (this.ay > this.game.scene.height) {
			this.game.gameOver();
		}

		// add visible items + actors to collision check
		// todo: only add visible items
		this.game.scene.collisionMap.forEach((object)=>{
			const collides = object.collides(this);

			object.collide(this, collides);


			// if (object.solid) {
            /* if (collides.top && object.border.top=='solid') {
                 // if (object.type == 'block_coin') {
                 //     replaceLevelSpriteXY(object.x, object.y, "ß");
                 //     items.push({ sx:8, sy:9, x:object.x, y:(object.y - size.tile.target.h), type:'coin' });
                 // } else {
                     this.ay = object.y + this.height;// + size.tile.target.h;
                     this.speedY = 1;
                 // }
             }
				 if (collides.bottom && object.border.bottom=='solid') {
                 // jump on enemy
                 // if (object.type == 'enemy_mushroom') {
                 //     object.deadly = false
                 //     object.speed = 0
                 //     object.sx = 2
                 //     score++;
                 //     sound_jump_on_enemy()
                 // }
                 this.ay = object.y - this.height;
                 this.speedY = 0;
             }
				 if (collides.right && object.border.right=='solid') {
                 this.ax = object.x - this.width;
                 this.speedX = 0;
             }
				 if (collides.left && object.border.left=='solid') {
                 this.ax = object.x + this.width;//+ size.tile.target.w;
                 this.speedX = 0;
             }*/
         // }else if (object.platform) {
			// 	if (collides.bottom) {
			// 		if(this.speedY > 0){
			// 			this.ay = object.y - this.height;
			// 			this.speedY = 0;
			// 		}
			// 	}
         // }

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
			//if (collides.top || collides.bottom || collides.right || collides.left) {

			//	object.collide(this, collides);

			//	if (object.deadly == true) {
/*

					//items.push({ sx:, sy:9, x:this.x, y:this.y, deadly:false, type:'looser' });
					Game.newGame();

					if (this.speedX < 0) {
						this.animation('dying-left');
					}else{
						this.animation('dying-right');
					}

					setTimeout(()=>{
						Game.gameOver();
						Game.play();
					}, 1000);*/
			//	}
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
		    //}
		});



	  // move the player when the level is at it's border, else move the level
	  if (this.game.scene.scroll_x <= 0) {
         if (this.ax > (Stage.width / 2)) {
             this.game.scene.scroll_x = 1;
         }
     } else if (this.game.scene.scroll_x >= this.game.scene.width - Stage.width && this.game.scene.width > Stage.width) {
         this.game.scene.scroll_x = this.game.scene.width - Stage.width;
         if (this.ax < this.game.scene.width - (Stage.width / 2)) {
             this.game.scene.scroll_x = this.game.scene.width - Stage.width - 1;
         }
     } else if (this.game.scene.width > Stage.width) {
			if(this.ax > this.game.scene.line_to_scroll){
				this.game.scene.scroll_x = this.ax-this.game.scene.line_to_scroll;
			}
     }

	  	// apply friction
		this.speedX *= this.friction;

		this.x = this.ax;
		this.y = this.ay;
	}
	jump = ()=>{
		this.game.control.releaseA();
		this.speedY -= this.velocity_y;
	}
	die = ()=>{
		this.game.newGame();

		if (this.speedX < 0) {
			this.animation('dying-left');
		}else{
			this.animation('dying-right');
		}

		setTimeout(()=>{
			this.game.gameOver();
			this.game.play();
		}, 1000);
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
		 this.game.scene.scroll_x = 0
		 this.game.scene.x = 0
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
