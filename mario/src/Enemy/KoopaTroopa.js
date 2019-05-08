import Inject from '~/engine/Inject';
import Collidable from '~/engine/Collidable';

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
		this.speedX=1;
		this.speedY=0;
		this.velocity_x=1;
		this.speed_limit_y=2;
		this.friction=0.8;
		this.updatable = true;

		console.log('koopa');
	}

	collide = (from, collides)=>{
		// TODO: implementar algoritmo de elasticidade
		if(collides.bottom){
			from.jump();
			setTimeout(()=>{
				this.tag.parentNode.removeChild(this.tag)
			},100)
		}else if(collides.right || collides.left){
			from.die();
		}
	}

	update = ()=>{
		// console.log('koopa tick');
		this.ax = this.x;
		this.ay = this.y;

		// apply gravity.
		this.speedY += Inject.scene.gravity;
		if (Math.abs(this.speedY) < 0.1) this.speedY = 0;

		// apply speed limit when falling down
		if (this.speedY > this.speed_limit_y) {
			this.speedY = this.speed_limit_y;
		}

		this.ax += this.speedX;
		this.ay += this.speedY;

		Inject.scene.sceneMap.forEach((object)=>{
			const collides = object.collides(this);
			object.collide(this, collides);
		});
	  	// apply friction
		// this.speedX *= this.friction;

		this.x = this.ax;
		this.y = this.ay;
	}
}

export {KoopaTroopa as default};
