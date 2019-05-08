import Collidable from '~/engine/Collidable';
import Inject from '~/engine/Inject';

class Switch extends Collidable{
	constructor(tag) {
		super(tag);
		this.updatable = true;
	}
}

export {Switch as default};
