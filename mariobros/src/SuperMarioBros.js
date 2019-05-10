import Inject from '~/engine/Inject';
import {boundMethod} from 'autobind-decorator'

// let stageSound = require('../sounds/overworldbgm.mp3');

import Game from '~/engine/Game';

import Puppet from '~/engine/Puppet';
import ControlBase from '~/engine/ControlBase';
import CollidableFactoryBase from '~/engine/CollidableFactoryBase';
import World1 from './Stage/World1';

class SuperMarioBros extends Game {
	constructor(){
		super();//240px

		Inject.puppet = new Puppet();
		Inject.scene = new World1();
		Inject.collidableFactory = new CollidableFactoryBase();
		Inject.control = new ControlBase();

		Inject.game = this;
	}

	// @boundMethod
	// play(){
	// 	super.play();
	// 	Inject.audio.playBackground(stageSound);
	// }
	//
	// @boundMethod
	// gameOver(){
	// 	super.gameOver();
	// 	Inject.audio.stopBackground();
	// }
}

export default new SuperMarioBros();
