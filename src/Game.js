import Puppet from './Puppet';
import Scene from './Scene';

class Game {
	constructor(){
		this.puppet = new Puppet(this);

		this.ticks = 0;

		this.fps = 30;

		// fps measurement
		this.filterStrength = 20;
		this.frameTime = 0;
		this.lastLoop = new Date
		this.thisLoop;
	}

	gameLoop = ()=>{
		this.puppet.update();

		Scene.updatableMap.forEach((object)=>{
			object.update();
		});

		this.ticks++;
		let thisFrameTime = (this.thisLoop = new Date) - this.lastLoop;
		this.frameTime += (this.thisFrameTime - this.frameTime) / this.filterStrength;
		this.lastLoop = this.thisLoop;

		// console.log('fps: '+thisFrameTime);
		// drawLevel();
		// updateCharacters();
		// updateElements();
		// drawElements();
		// drawActors();
		// drawControls();
	}

	newGame = ()=>{
	    window.clearInterval(this.gameInterval);
	    // hideMenus()
	    // hideControls()
	    // // draw initial level for menu background
	    // load_level()
	    // showStartMenu()
	}

	gameOver = ()=>{
		//meu
		console.error('dead');
		// sound_dead()
		if (--this.puppet.lives > 0) {
			this.puppet.respawnPlayer()
		} else {
			document.querySelector('.GameOver').style.display="flex";
		// todo: dying animation
		// actors = []
			//showGameOver()
		}
	}

	play = ()=>{
	    // hideMenus();
	    // registerControls()
	    // initializeLevel()
	    // initializeTheme()
	    // sound_theme()
	    window.clearInterval(this.gameInterval);
	    this.gameInterval = setInterval(this.gameLoop, 1000 / this.fps);
	}

	restart = ()=>{
	    window.clearInterval(this.gameInterval);
	    // initGame()
	    // startGame()
	}
}

export default new Game();
