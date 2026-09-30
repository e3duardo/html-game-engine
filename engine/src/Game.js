import Inject from './Inject';
import fixedStepRaf from './fixedStepRaf';

class Game {
	constructor() {
		this.ticks = 0;
		this.fps = 60;
		// ms per physics tick - every per-tick constant in Puppet.js/Collidable.js
		// etc. assumes this fixed duration, see fixedStepRaf.js
		this.tickInterval = 1000 / this.fps;

		// fps measurement
		this.filterStrength = 20;
		this.frameTime = 0;
		this.lastLoop = new Date();
		this.thisLoop;

		this._cancelLoop = null;
	}

	gameLoop = () => {
		Inject.puppet.update();

		Inject.scene.updatableMap.forEach((object) => {
			object.update();
		});

		this.ticks++;
		let thisFrameTime = (this.thisLoop = new Date()) - this.lastLoop;
		this.frameTime += (thisFrameTime - this.frameTime) / this.filterStrength;
		this.lastLoop = this.thisLoop;
	};

	newGame = () => {
		if (this._cancelLoop) {
			this._cancelLoop();
			this._cancelLoop = null;
		}
	};

	gameOver() {
		if (--Inject.puppet.lives > 0) {
			Inject.puppet.respawnPlayer();
		} else {
			document.querySelector('.GameOver').style.display = 'flex';
		}
	}

	play() {
		Inject.scene.constructCollisionMap();
		if (this._cancelLoop) this._cancelLoop();
		this._cancelLoop = fixedStepRaf(this.gameLoop, this.tickInterval);
	}

	restart = () => {
		if (this._cancelLoop) {
			this._cancelLoop();
			this._cancelLoop = null;
		}
	};
}

export default Game;
