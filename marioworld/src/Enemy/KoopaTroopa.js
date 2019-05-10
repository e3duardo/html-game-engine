import Inject from '~/engine/Inject';
import Collidable from '~/engine/Collidable';
import {boundMethod} from 'autobind-decorator'

//https://www.mariowiki.com/Koopa_Troopa
class KoopaTroopa extends Collidable{
	constructor(tag) {
		super(tag);

		this.border = {
			top: 'solid',
			right: 'deadly',
			bottom: 'deadly',
			left: 'deadly'
		}

		this.ax=0;
		this.ay=0;
		// this.speedX=1;
		this.speedY=0;
		// this.velocity_x=1;
		// this.speed_limit_y=2;
		// this.friction=0.8;
		this.updatable = true;
		this.type = 'enemy';


		// .walking-r
		// .walking-l
		// .angry-beach-walking-r
		// .angry-beach-walking-l
		// .beach-walking-r
		// .beach-walking-l
		// .angry-falling-beach-walking-r
		// .angry-falling-beach-walking-l
		// .crushed
	}

	@boundMethod
	collide(from, collisions){
		// TODO: implementar algoritmo de elasticidade
		console.log(collisions.bottom, collisions.top)
		if(collisions.bottom){
			Inject.control.pressA();

			setTimeout(()=>{
				this.tag.parentNode.removeChild(this.tag)
			},100)
		}else if(collisions.right || collisions.left){
			from.die();
		}
	}

	// @boundMethod
	// update(){
	// 	// console.log('koopa tick');
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

export {KoopaTroopa as default};
