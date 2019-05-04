import Collidable from './Collidable';

class CollidableFactoryBase {
	constructor(game){
		this.game = game;
	}

	from(tag){
		return new Collidable(this.game, tag);
	}
}

export {CollidableFactoryBase as default};
