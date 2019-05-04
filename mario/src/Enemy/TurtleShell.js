import Collidable from '~/engine/Collidable';

class TurtleShell extends Collidable{
	constructor(game, tag) {
		super(game, tag);

		this.ax=0;
		this.ay=0;
		this.speedX=0;
		this.speedY=0;
		this.velocity_x=1;
		this.speed_limit_x=10;
		this.friction=0.8;

		this.updatable = true;
		this.border.horizontal='elastic';
	}

	collide = (from, collides)=>{
		// TODO: implementar algoritmo de elasticidade
		if(collides.bottom){
			from.jump();
			setTimeout(()=>{
				this.tag.parentNode.removeChild(this.tag)
			},100)
		}

		if(collides.right || collides.left){
			if(from.speedX > 0.2)
				this.speedX += this.velocity_x;
			else if(from.speedX < -0.2)
				this.speedX -= this.velocity_x;
			else
				from.die();
				//console.error('dead');
		}
	}

	update = ()=>{
		this.ax = this.x;
		this.ay = this.y;

		// apply gravity.
		this.speedY += this.game.scene.gravity;
		if (Math.abs(this.speedY) < 0.1) this.speedY = 0;

		// apply speed limit when falling down
		if (this.speedY > this.speed_limit_y) {
			this.speedY = this.speed_limit_y;
		}

		this.ax += this.speedX;
		this.ay += this.speedY;

		this.game.scene.sceneMap.forEach((object)=>{
			const collides = object.collides(this);
			object.collide(this, collides);
		});
	  	// apply friction
		// this.speedX *= this.friction;

		this.x = this.ax;
		this.y = this.ay;
	}
}

export {TurtleShell as default};
