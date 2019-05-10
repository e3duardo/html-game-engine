import '@webcomponents/webcomponentsjs/webcomponents-bundle.js';
import { html, define } from 'hybrids';

const tileset = require('../../assets/tileset.png');

export const Question = {
	x: 0,
	y: 5,
	hide: false,
  	render: (tag) => {
		tag.style.position = 'absolute';
		tag.style.width = '16px';
		tag.style.height = '16px';
		tag.style.left = tag.x*16+'px';
		tag.style.bottom = tag.y*16+'px';
		tag.style.zIndex = 2;
		console.log(tag.hide);
		if(tag.hide){
			tag.style.opacity = '0.2';
		}

		return html`
  		<style>
			.m{
				background-image: url('${tileset}');
				background-position: -${24*16}px 0;
				background-repeat: no-repeat;
				position: absolute;
				width: 16px;
				height: 16px;
			}
		</style>
		<div class="m" style="top: 0; left: 0;"></div>
  `},
};
define('item-question', Question);
