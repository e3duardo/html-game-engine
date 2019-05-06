import Collidable from './Collidable';

class CollidableFactoryBase {
	constructor(){
	}

	from(tag){
		return new Collidable(tag);
	}
}

export {CollidableFactoryBase as default};
