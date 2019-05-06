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

export {KoopaTroopa as default};
