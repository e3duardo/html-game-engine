'use strict'

const speedX = 30;
const speedY = 0;
const gravity = 0.30;
let gravitySpeed = 0;

const puppet = new Puppet();
let isPaused = false;

const scene = document.querySelector('.Scene');

setInterval(function(){
	puppet.gravity();
}, 10);


document.addEventListener("keydown", function(e){

  switch (e.key) {
    case "ArrowLeft":
      puppet.goBack();
    break;
    case "ArrowUp":
	 	puppet.jump();
      //puppet.style.top -= (puppet.offsetTop * scale) +'px';
    break;
    case "ArrowRight":
      puppet.goAhead();
    break;
    case "ArrowDown":
      //puppet.style.left += (puppet.offsetTop + scale) +'px';
    break;
  }
}, false);
