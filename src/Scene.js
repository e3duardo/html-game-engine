import Collidable from './Collidable'

class Scene {
	constructor() {
		this.tag = document.querySelector('.Scene');

		this.line_to_scroll = 128;
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

	get width (){ return this.tag.clientWidth; }
	get height (){ return this.tag.clientHeight; }

	get x (){ return this.tag.offsetLeft; }
	set x (x){
		x = parseInt(x);
		if(x != this.x){
			// console.log('x', x, 'velocity_x',  this.velocity_x);
			this.tag.style.left = x + 'px';
		}
	}

	get y (){ return this.tag.offsetTop; }
	set y (y){
		y = parseInt(y);
		if(y != this.y){
			// console.log(y);
			this.tag.style.top = y + 'px';
		}
	}

}

export default new Scene();
