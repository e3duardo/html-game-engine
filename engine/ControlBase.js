class ControlBase {
	constructor(game){
		this.game = game;
		this.keys = {
		};
		document.addEventListener("keydown", (e)=>{
			if(!e.repeat){
				this.keys[this.translateKeyboard(e.key)] = true;
			}
		});
		document.addEventListener("keyup", (e)=>{
			if(!e.repeat){
				this.keys[this.translateKeyboard(e.key)] = false;
			}
		});
	}

	translateKeyboard  = (key)=>{
		return '';
	}
}

export default ControlBase;
