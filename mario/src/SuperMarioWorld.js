import Game from '~/engine/Game';

import Mario from './Mario';
import Control from './Control';
import CollidableFactory from './CollidableFactory';
import YoshisIsland2 from './Stage/YoshisIsland2';

class SuperMarioWord extends Game {
	constructor(){
		super();
		const mario = new Mario(this);
		const collidableFactory = new CollidableFactory(this);
		const scene = new YoshisIsland2(collidableFactory);
		const control = new Control(this);

		this.inject(scene, mario, control, collidableFactory);
	}
}

export default new SuperMarioWord();
