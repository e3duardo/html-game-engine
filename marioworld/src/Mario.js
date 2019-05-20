import Inject from '~/engine/src/Inject';
import Puppet from '~/engine/src/Puppet';
import {boundMethod} from 'autobind-decorator'

let jumpSound = require('../sounds/jump.wav');

class Mario extends Puppet{
	constructor(){
		super();
	}

	@boundMethod
	jump(){
		super.jump();
		Inject.audio.play(jumpSound);
		console.log('mario, jump!');
	}



}

export default Mario;
