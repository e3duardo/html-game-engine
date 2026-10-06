import Stage from './Stage';
import Audio from './Audio';
import { EventBus } from './GameEvents';
import Router from './Router';
import DebugContext from './DebugContext';

class Inject {
	constructor() {
		this.game = null;
		this.collidableFactory = null;
		this.control = null;
		this.puppet = null;
		this.scene = null;
		this.hud = null;
		this.stage = new Stage();
		this.audio = new Audio();
		this.events = new EventBus();
		this.router = new Router();
		this.debug = new DebugContext();
	}
}

export default new Inject();
