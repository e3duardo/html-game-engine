import Puppet from './Puppet';

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
		console.error('dead');
		// sound_dead()
		if (--this.puppet.lives > 0) {
			this.puppet.respawnPlayer()
		} else {
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






/* 'use strict'

const speedX = 9;
const speedY = 0;
const gravity = 0.60;
let gravitySpeed = 0;

const stage = new Stage();
const scene = new Scene();
const puppet = new Puppet();

let isPaused = false;
let keys = [];

setInterval(function(){
	puppet.gravity();

	if (keys.includes("ArrowLeft")) {
		puppet.goBack();
	}
	if (keys.includes("ArrowUp")) {
		puppet.jump();
	}
	if (keys.includes("ArrowRight")) {
		puppet.goAhead();
	}
	if (keys.includes("ArrowDown")) {
		puppet.dive();
	}
}, 20);

document.addEventListener("keydown", function(e){
	if(keys.indexOf(e.key) == -1){
		keys.push(e.key);
	}
});
document.addEventListener("keyup", function(e){
	keys.splice(keys.indexOf(e.key), 1);
});*/
