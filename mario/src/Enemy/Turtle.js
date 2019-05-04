import Collidable from '~/engine/Collidable';

class Turtle extends Collidable{
	constructor(game, tag) {
		super(game, tag);

		this.border = {
			top: 'solid',
			right: 'deadly',
			bottom: 'deadly',
			left: 'deadly'
		}
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
}

export {Turtle as default};
