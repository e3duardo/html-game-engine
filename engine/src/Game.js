import Inject from './Inject';
import {boundMethod} from 'autobind-decorator'

class Game {
	constructor(){
		this.ticks = 0;
		this.fps = 30;

		// fps measurement
		this.filterStrength = 20;
		this.frameTime = 0;
		this.lastLoop = new Date
		this.thisLoop;
	}

	@boundMethod
	gameLoop(){
		Inject.puppet.update();

		// console.log(Inject.scene.updatableMapVisible);
		// console.warn('0',Inject.scene.updatableMap);
		// Inject.scene.updatableMapVisible.forEach((object)=>{
		Inject.scene.updatableMap.forEach((object)=>{
			object.update();
		});

		this.ticks++;
		let thisFrameTime = (this.thisLoop = new Date) - this.lastLoop;
		this.frameTime += (thisFrameTime - this.frameTime) / this.filterStrength;
		this.lastLoop = this.thisLoop;

		// console.log('fps: '+thisFrameTime);
		// drawLevel();
		// updateCharacters();
		// updateElements();
		// drawElements();
		// drawActors();
		// drawControls();
	}

	@boundMethod
	newGame(){
	    window.clearInterval(this.gameInterval);
	    // hideMenus()
	    // hideControls()
	    // // draw initial level for menu background
	    // load_level()
	    // showStartMenu()
	}

	@boundMethod
	gameOver(){
		//meu
		// sound_dead()
		if (--Inject.puppet.lives > 0) {
			Inject.puppet.respawnPlayer()
		} else {
			document.querySelector('.GameOver').style.display="flex";
		// todo: dying animation
		// actors = []
			//showGameOver()
		}
	}

	@boundMethod
	play(){
		console.log('mandei dar play')
	    // hideMenus();
	    // registerControls()
	    // initializeLevel()
	    // initializeTheme()
	    // sound_theme()
		 Inject.scene.constructCollisionMap();
		 // console.log(Inject.scene.updatableMap);
	    window.clearInterval(this.gameInterval);
	    this.gameInterval = setInterval(this.gameLoop, 1000 / this.fps);
	}

	@boundMethod
	restart(){
	    window.clearInterval(this.gameInterval);
	    // initGame()
	    // startGame()
	}
}

export default Game;