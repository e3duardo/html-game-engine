import Inject from './Inject';

class SceneBase {
	constructor() {
		this.tag = document.querySelector('.Scene');

		this.gravity=3;

		this.line_to_scroll = 128;
		this._scroll_x = 0;
		this.scroll_x_start = 0;

		this.collisionMap = [];
		this.updatableMap = [];
		this.sceneMap = [];
	}

	constructCollisionMap=()=>{
		this.collisionMap = [];
		this.updatableMap = [];
		this.sceneMap = [];

		document.querySelectorAll('.Collidable').forEach((object)=>{
			object = Inject.collidableFactory.from(object);
			this.collisionMap.push(object);
			if(object.updatable){
				this.updatableMap.push(object);
			}
			if(object.solid || object.platform){
				this.sceneMap.push(object);
			}
		});
	}

	getCollisionMapVisible=()=>{
		return this.collisionMap;

		var visible = []

		this.collisionMap.forEach(co=>{
			if(co.x > (Math.abs(this.x) - 30) && co.x < (Math.abs(this.x)+Inject.stage.width+30))
				visible.push(co);
		});
		// console.log(visible);
		// console.log(Math.abs(this.x), Math.abs(this.x)+Inject.stage.width);
		return visible;
	}

	addTag=(tag)=>{
		this.tag.appendChild(tag);
	}

	get updatableMapVisible(){

		// console.log(this.updatableMap);

		// console.log(this.updatableMap);

		return [];
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
			this.tag.style.left = x + 'px';
		}
	}

	get y (){ return this.tag.offsetTop; }
	set y (y){
		y = parseInt(y);
		if(y != this.y){
			this.tag.style.top = y + 'px';
		}
	}

}

export default SceneBase;
