document.addEventListener("keydown", (e)=>{
}, false);


class Control {
	constructor(){
		console.log('control - constructor');
		this.keys = {
			up: false,
			right: false,
			bottom: false,
			left: false,
			a: false
		};
		document.addEventListener("keydown", (e)=>{
			if(!e.repeat){
				console.log(this.keys);
				this.keys[this.translateKeyboard(e.key)] = true;
			}
		});
		document.addEventListener("keyup", (e)=>{
			if(!e.repeat){
				console.log(this.keys);
				this.keys[this.translateKeyboard(e.key)] = false;
			}
		});
	}

	get up(){ return this.keys.up; }
	get right(){ return this.keys.right; }
	get bottom(){ return this.keys.bottom; }
	get left(){ return this.keys.left; }
	get a(){ return this.keys.a; }
	releaseA=()=>{ console.log(this.keys.a, '<'); this.keys.a = false;}

	translateKeyboard  = (key)=>{
		if(key == "ArrowUp") return 'up';
		if(key == "ArrowRight") return 'right';
		if(key == "ArrowDown") return 'down';
		if(key == "ArrowLeft") return 'left';
		if(key == "a") return 'a';
		return '';
	}
}

export default new Control();
