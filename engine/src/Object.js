// import Inject from './Inject';
import Tag from './Tag';
import {boundMethod} from 'autobind-decorator'

import '@webcomponents/webcomponentsjs/webcomponents-bundle.js';
import { html, define } from 'hybrids';

class Object extends Tag{

	constructor(tag) {
		super(tag);
		this.ax=0;
		this.ay=0;
		this.velocity_x=1;
		this.velocity_x_jump=1.2;
		this.velocity_y=22;
		this.friction=0.8;
		this.speed_limit_y=10;

		this._speedX=0;
		this._speedY=0;
	}

	static setupWebComponent(tag, object){
		define(tag, object);
	}
	static html(parts, ...args){
		return html(parts, ...args);
	}

	@boundMethod
	animation(classe){
		this.tag.classList = "Puppet "+classe;
	}


	get speedX (){ return this._speedX; }
	set speedX (speedx){ this._speedX = parseFloat(speedx.toFixed(1)); }

	get speedY (){ return this._speedY; }
	set speedY (speedy){ this._speedY = parseFloat(speedy.toFixed(1)); }
}

export {Object as default};