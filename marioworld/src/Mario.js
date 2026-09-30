import Inject from '~/engine/src/Inject';
import Puppet from '~/engine/src/Puppet';
import jumpSound from '../sounds/jump.wav';

class Mario extends Puppet {
	constructor(tag) {
		super(tag);
	}

	jump() {
		super.jump();
		Inject.audio.play(jumpSound);
		console.log('mario, jump!');
	}
}

export default Mario;
