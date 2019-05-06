import Collidable from '~/engine/Collidable';

class Question extends Collidable{
	constructor(tag) {
		super(tag);
	}

	collide = (from, collides)=>{
		console.log('from')
	}
}

export {Question as default};
