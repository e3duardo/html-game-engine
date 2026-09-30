import Collidable from '~/engine/src/Collidable';
// import Inject from '~/engine/src/Inject';

class Switch extends Collidable {
	constructor(tag) {
		super(tag);
		this.updatable = true;
		this.type = 'item';
	}
}

export { Switch as default };
