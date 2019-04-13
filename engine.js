'use strict'

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
});
