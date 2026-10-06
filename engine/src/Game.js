import Inject from './Inject';
import fixedStepRaf, { setLoopsPaused } from './fixedStepRaf';

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
		this.worldFrozen = false;
	}

	gameLoop = () => {
		Inject.puppet.update();

		// a game can stop everything but the player (SMB1's power-up
		// transformation does) without stopping the loop itself
		if (!this.worldFrozen) {
			Inject.scene.updatableMap.forEach((object) => {
				object.update();
			});
		}

		this.ticks++;
		let thisFrameTime = (this.thisLoop = new Date()) - this.lastLoop;
		this.frameTime += (thisFrameTime - this.frameTime) / this.filterStrength;
		this.lastLoop = this.thisLoop;
	};

	newGame = () => {
		this._paused = false;
		setLoopsPaused(false);
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

	// stops/resumes the loop without rebuilding the scene (play() would
	// re-run constructCollisionMap and reset the level's runtime state)
	get paused() {
		return this._paused === true;
	}

	// every fixedStepRaf loop stops, the main one included - see
	// fixedStepRaf.js's setLoopsPaused. The main loop itself is left running
	// (paused) so resuming is just flipping the switch back.
	pause = () => {
		if (!this._cancelLoop || this._paused) return false;
		this._paused = true;
		setLoopsPaused(true);
		return true;
	};

	resume = () => {
		if (!this._paused) return false;
		this._paused = false;
		setLoopsPaused(false);
		return true;
	};

	restart = () => {
		this._paused = false;
		setLoopsPaused(false);
		if (this._cancelLoop) {
			this._cancelLoop();
			this._cancelLoop = null;
		}
	};
}

export default Game;
