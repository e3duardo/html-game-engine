import Inject from './Inject';
import Tag from './Tag';

import {boundMethod} from 'autobind-decorator'

class SceneBase extends Tag{
	constructor() {
		super(document.querySelector('.Scene'))

		this.gravity=3;

		this.line_to_scroll = 128;
		this._scroll_x = 0;
		this.scroll_x_start = 0;

		this.collisionMap = [];
		this.updatableMap = [];
		this.sceneMap = [];
	}

	@boundMethod
	constructCollisionMap(){
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

	@boundMethod
	getCollisionMapVisible(){
		return this.collisionMap;
		/*
		var visible = []

		this.collisionMap.forEach(co=>{
			if(co.x > (Math.abs(this.x) - 30) && co.x < (Math.abs(this.x)+Inject.stage.width+30))
				visible.push(co);
		});
		// console.log(visible);
		// console.log(Math.abs(this.x), Math.abs(this.x)+Inject.stage.width);
		return visible;*/
	}

	@boundMethod
	addTag(tag){
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

}

export default SceneBase;