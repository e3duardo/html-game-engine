import Inject from './Inject';
import {boundMethod} from 'autobind-decorator'

import '@webcomponents/webcomponentsjs/webcomponents-bundle.js';
import { html, define } from 'hybrids';

class Object {

	constructor() {
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

	get x (){ return this.tag.offsetLeft; }
	set x (x){
		x = parseFloat(x.toFixed(1));
		if(x != this.x){
			this.tag.style.left = x + 'px';
		}
	}

	get y (){ return this.tag.offsetTop; }
	set y (y){
		y = parseFloat(y.toFixed(1));
		if(y != this.y){
			this.tag.style.top = y + 'px';
		}
	}

	get width (){ return this.tag.offsetWidth; }
	get height (){ return this.tag.offsetHeight; }
}

export {Object as default};
