import Stage from './Stage';
import Audio from './Audio';

class Inject {
	constructor() {
		this.game = null;
		this.collidableFactory = null;
		this.control = null;
		this.puppet = null;
		this.scene = null;
		this.stage = new Stage();
		this.audio = new Audio();
	}
}

export default new Inject();
