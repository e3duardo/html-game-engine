import Stage from './Stage';

class Inject {
	constructor() {
		this.game = null;
		this.collidableFactory = null;
		this.control = null;
		this.puppet = null;
		this.scene = null;
		this.stage = new Stage();
	}
}

export default new Inject();
