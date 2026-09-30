import Inject from '~/engine/src/Inject';
import stageSound from '../sounds/overworldbgm.mp3';

import Game from '~/engine/src/Game';

import Mario from './Mario';
import Control from './Control';
import CollidableFactory from './CollidableFactory';
import YoshisIsland2 from './Stage/YoshisIsland2';

class SuperMarioWord extends Game {
	constructor() {
		super();

		Inject.puppet = new Mario(document.querySelector('.Puppet'));
		Inject.scene = new YoshisIsland2();
		Inject.collidableFactory = new CollidableFactory();
		Inject.control = new Control();

		Inject.game = this;
	}

	play() {
		super.play();
		Inject.audio.playBackground(stageSound);
	}

	gameOver() {
		super.gameOver();
		Inject.audio.stopBackground();
	}
}

export default new SuperMarioWord();
