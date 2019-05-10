import Inject from '~/engine/Inject';
import {boundMethod} from 'autobind-decorator'

let stageSound = require('../sounds/overworldbgm.mp3');

import Game from '~/engine/Game';

import Mario from './Mario';
import Control from './Control';
import CollidableFactory from './CollidableFactory';
import YoshisIsland2 from './Stage/YoshisIsland2';

class SuperMarioWord extends Game {
	constructor(){
		super();

		Inject.puppet = new Mario();
		Inject.scene = new YoshisIsland2();
		Inject.collidableFactory = new CollidableFactory();
		Inject.control = new Control();

		Inject.game = this;
	}

	@boundMethod
	play(){
		super.play();
		Inject.audio.playBackground(stageSound);
	}

	@boundMethod
	gameOver(){
		super.gameOver();
		Inject.audio.stopBackground();
	}
}

export default new SuperMarioWord();
