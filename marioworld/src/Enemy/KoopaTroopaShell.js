import Inject from '~/engine/src/Inject';
import Collidable from '~/engine/src/Collidable';
import {boundMethod} from 'autobind-decorator'

class KoopaTroopaShell extends Collidable{
	constructor(tag) {
		super(tag);

		this.ax=0;
		this.ay=0;
		this.velocity_x=5;

		this.updatable = true;
		this.affectedByGravity = false;
		this.collideWithTheScene = true;
		this.type = 'enemy';
	}

	@boundMethod
	animation(classe){
		this.tag.classList.add(classe);
	}

	@boundMethod
	collide(from, collisions){
		// TODO: implementar algoritmo de elasticidade
		if(collisions.bottom){
			Inject.control.pressA();

			setTimeout(()=>{
				this.tag.parentNode.removeChild(this.tag)
			},100)
		}

		if(collisions.right || collisions.left){

			this.animation('animated');

			if(from.speedX > 0.2)
				this.speedX = this.velocity_x;
			else if(from.speedX < -0.2)
				this.speedX = -this.velocity_x;
			else
				from.die();
				//console.error('dead');
		}
	}

	// @boundMethod
	// update(){
	// 	this.ax = this.x;
	// 	this.ay = this.y;
	//
	// 	// apply gravity.
	// 	this.speedY += Inject.scene.gravity;
	// 	if (Math.abs(this.speedY) < 0.1) this.speedY = 0;
	//
	// 	// apply speed limit when falling down
	// 	if (this.speedY > this.speed_limit_y) {
	// 		this.speedY = this.speed_limit_y;
	// 	}
	//
	// 	this.ax += this.speedX;
	// 	this.ay += this.speedY;
	//
	// 	Inject.scene.sceneMap.forEach((object)=>{
	// 		const collisions = object.collisions(this);
	// 		object.collide(this, collisions);
	// 	});
	//   	// apply friction
	// 	// this.speedX *= this.friction;
	//
	// 	this.x = this.ax;
	// 	this.y = this.ay;
	// }
}

export {KoopaTroopaShell as default};
