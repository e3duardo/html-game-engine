import Inject from './Inject';
import Object from './Object';

import {boundMethod} from 'autobind-decorator'

class Collidable extends Object{
	constructor(tag) {
		super(tag);
		this.solid = this.tag.classList.contains('solid');
		this.platform = this.tag.classList.contains('platform');

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

		// this.ax=0;
		// this.ay=0;
		// this.speedX=0;
		// this.speedY=0;
		// this.velocity_x=1;
		// this.speed_limit_x=4;
		// this.friction=0.8;

		this.type = 'scenario';
		this.updatable = false;
		this.affectedByGravity = false;
		this.collideWithTheScene = false;
		// console.warn('3', this)
	}

	@boundMethod
	collide(from, collisions){
		// if (collisions.top && this.border.bottom=='solid') {
		// 	  from.ay = this.y + from.height;// + size.tile.target.h;
		// 	  from.speedY = 1;
		// }
		// if (collisions.bottom){
		// 	if(this.border.top=='solid') {
		// 		from.ay = this.y - from.height;
		// 		from.speedY = 0;
		// 	}else if(this.border.top=='platform') {
		// 		if(from.speedY > 0){
		// 			from.ay = this.y - from.height;
		// 			from.speedY = 0;
		// 	 	}
		//  	}
		// }
		// if (collisions.right && this.border.horizontal=='solid' && from.speedX > 0) {
		// 	if(from.border && from.border.horizontal=='elastic') {
		// 		from.speedX *= -1;
		// 	}else{
		// 		from.ax = this.x - from.width;
		// 		from.speedX = 0;
		// 	}
		// }
		// if (collisions.left && this.border.horizontal=='solid' && from.speedX < 0) {
		// 	if(from.border && from.border.horizontal=='elastic') {
		// 		from.speedX *= -1;
		// 	}else{
		// 		from.ax = this.x + this.width;
		// 		from.speedX = 0;
		// 	}
		// }
	}

	@boundMethod
	collides(from){
		let collisions = {top:false, bottom:false, left:false, right:false};
		// we are below or above an object (use the middle of the actor, with tolerance)
		if ((from.ax + from.width / 2).inRange(this.x - 0.25, this.x + this.width + 1.25)) {
			// check bounce bottom:
			if ((from.ay + from.height).inRange(this.y, this.y + this.height - 1) ){//&& from.ay < this.y) {
				collisions.bottom = true;
			// check bounce top:
			} else if (from.ay.inRange(this.y, this.y + this.height)) {
				collisions.top = true;
			}
		}
		// we are right or left of an object
		if ((from.ay + from.height / 2).inRange(this.y - 0.25, this.y + this.height + 1.25)) {
			// check bounce right
			if ((from.ax + from.width).inRange(this.x, this.x + this.width)) {
				collisions.right = true;
			}
			// check bounce left
			if (from.ax.inRange(this.x, this.x + this.width)) {// + this.width)) {
				collisions.left = true;
			}
		}
		return collisions;
	}

	@boundMethod
	update(){
		// console.warn('2', this)
		if(this.updatable){
			// console.log('koopa tick');
			this.ax = this.x;
			this.ay = this.y;

			this.ax += this.speedX;

			if(this.affectedByGravity){
				this.speedY += Inject.scene.gravity;
				if (Math.abs(this.speedY) < 0.2) this.speedY = 0;

				if (this.speedY > this.speed_limit_y) {
					this.speedY = this.speed_limit_y;
				}

				this.ay += this.speedY;
			}

			if(this.collideWithTheScene){
				Inject.scene.sceneMap.forEach((object)=>{
					const collisions = object.collides(this);
					object.collide(this, collisions);
				});
			}

			this.x = this.ax;
			this.y = this.ay;
		}
	}

	get scenario (){ return this.type == 'scenario'; }
	get enemy (){ return this.type == 'enemy'; }
	get item (){ return this.type == 'item'; }
}

export {Collidable as default};