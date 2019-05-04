class SceneBase {
	constructor(collidableFactory) {
		// this.game = game;
		this.tag = document.querySelector('.Scene');

		this.gravity=3;

		this.line_to_scroll = 128;
		this._scroll_x = 0;
		this.scroll_x_start = 0;

		this.collisionMap = [];
		this.updatableMap = [];
		this.sceneMap = [];
		document.querySelectorAll('.Collidable').forEach((object)=>{
			object = collidableFactory.from(object);
			this.collisionMap.push(object);
			if(object.updatable){
				this.updatableMap.push(object);
			}
			if(object.solid || object.platform){
				this.sceneMap.push(object);
			}
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
