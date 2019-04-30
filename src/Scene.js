import Collidable from './Collidable'

class Scene {
	constructor() {
		this.tag = document.querySelector('.Scene');

		this._scroll_x = 0;
		this.scroll_x_start = 0;

		this.collisionMap = [];
		document.querySelectorAll('.Collidable').forEach((object)=>{
				this.collisionMap.push(new Collidable(object));
		});
	}

	get scroll_x(){
		return this._scroll_x;
	}
	set scroll_x(scroll){
		this.x = -scroll;
		this._scroll_x = scroll;
	}
	get x (){ return this.tag.offsetLeft; }
	get y (){ return this.tag.offsetTop; }

	get width (){ return this.tag.clientWidth; }
	get height (){ return this.tag.clientHeight; }

	set x (x){ this.tag.style.left = x+'px'; }
	set y (y){ this.tag.style.top = y+'px'; }

}

export default new Scene();
