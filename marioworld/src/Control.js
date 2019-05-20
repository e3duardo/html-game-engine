import ControlBase from '~/engine/src/ControlBase';

class Control extends ControlBase{
	constructor(){
		super();
		this.keys = {
			up: false,
			right: false,
			down: false,
			left: false,
			a: false,
			shift: false
		};
	}

	get up(){ return this.keys.up; }
	get right(){ return this.keys.right; }
	get down(){ return this.keys.down; }
	get left(){ return this.keys.left; }
	get a(){ return this.keys.a; }
	get shift(){ return this.keys.shift; }

	pressA=()=>{ this.keys.a = true;}
	releaseA=()=>{ this.keys.a = false;}

	translateKeyboard  = (key)=>{
		if(key == "ArrowUp") return 'up';
		if(key == "ArrowRight") return 'right';
		if(key == "ArrowDown") return 'down';
		if(key == "ArrowLeft") return 'left';
		if(key == "a" || key == "A" ) return 'a';
		if(key == "Shift" ) return 'shift';
		return '';
	}
}

export default Control;
