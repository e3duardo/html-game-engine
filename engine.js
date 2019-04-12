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


	//

document.addEventListener("keydown", function(e){
	if(keys.indexOf(e.key) == -1){
		keys.push(e.key);
	}
});
document.addEventListener("keyup", function(e){
	keys.splice(keys.indexOf(e.key), 1);
});



//
//
// $(document.body).keydown(function (evt) {
//   var li = pressedKeys[evt.keyCode];
//   if (!li) {
// 		li = log.appendChild(document.createElement('li'));
// 		pressedKeys[evt.keyCode] = li;
//   }
//   $(li).text('Down: ' + evt.keyCode);
//   $(li).removeClass('key-up');
// });
//
// $(document.body).keyup(function (evt) {
//   var li = pressedKeys[evt.keyCode];
//   if (!li) {
// 	  li = log.appendChild(document.createElement('li'));
//   }
//   $(li).text('Up: ' + evt.keyCode);
//   $(li).addClass('key-up');
// });
