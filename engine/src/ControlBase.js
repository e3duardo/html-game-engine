import {boundMethod} from 'autobind-decorator'

class ControlBase {
	constructor(){
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

	@boundMethod
	translateKeyboard(key){
		return '';
	}
}

export default ControlBase;
