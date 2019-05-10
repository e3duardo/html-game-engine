import Inject from '~/engine/Inject';
import {boundMethod} from 'autobind-decorator'

// let stageSound = require('../sounds/overworldbgm.mp3');

import Game from '~/engine/Game';

import Puppet from '~/engine/Puppet';
import Control from './Control';
import CollidableFactory from './CollidableFactory';
import World1 from './Stage/World1';

import Mario from './Components/Actor/Mario';

import Goomba from './Components/Enemy/Goomba';
import KoopaTropa from './Components/Enemy/KoopaTropa';

import Brick from './Components/Item/Brick';
import Flag from './Components/Item/Flag';
import Pipe from './Components/Item/Pipe';
import Question from './Components/Item/Question';

import Block from './Components/Scenario/Block';
import Castle from './Components/Scenario/Castle';
import Cloud from './Components/Scenario/Cloud';
import Montain from './Components/Scenario/Montain';
import Pole from './Components/Scenario/Pole';
import Stuff from './Components/Scenario/Stuff';

class SuperMarioBros extends Game {
	constructor(){
		super();//240px

		Mario.setupWebComponent();

		Goomba.setupWebComponent();
		KoopaTropa.setupWebComponent();

		Brick.setupWebComponent();
		Flag.setupWebComponent();
		Pipe.setupWebComponent();
		Question.setupWebComponent();

		Block.setupWebComponent();
		// Castle.setupWebComponent();
		// Cloud.setupWebComponent();
		// Montain.setupWebComponent();
		// Pole.setupWebComponent();
		// Stuff.setupWebComponent();

		Inject.puppet = new Puppet();
		Inject.scene = new World1();
		Inject.collidableFactory = new CollidableFactory();
		Inject.control = new Control();

		setTimeout(()=>{
			Inject.scene.constructCollisionMap();
		},5)

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
