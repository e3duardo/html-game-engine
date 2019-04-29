class Control {
	constructor(){
		this.keys = {
			up: false,
			right: false,
			bottom: false,
			left: false
		};
		document.addEventListener("keydown", (e)=>{
			this.keys[this.translateKeyboard(e.key)] = true;
		});
		document.addEventListener("keyup", (e)=>{
			this.keys[this.translateKeyboard(e.key)] = false;
		});
	}

	get up(){ return this.keys.up; }
	set up(key){ this.keys.up = key; }
	get right(){ return this.keys.right; }
	get bottom(){ return this.keys.bottom; }
	get left(){ return this.keys.left; }

	translateKeyboard  = (key)=>{
		if(key == "ArrowUp") return 'up';
		if(key == "ArrowRight") return 'right';
		if(key == "ArrowDown") return 'down';
		if(key == "ArrowLeft") return 'left';
		return '';
	}
}

export default new Control();
