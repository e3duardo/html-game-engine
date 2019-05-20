import Object from '~/engine/src/Object';
import Assets from '../Assets';

class KoopaTropa extends Object{
	constructor(){
		super();
	}

	static setupWebComponent(){
		const tagName = 'enemy-koopa-tropa';
		const bgx = 6;
		const bgy = .5;

		Object.setupWebComponent(tagName, {
			x: 0,
			y: 2,
		  	render: (tag) => {
				tag.style.position = 'absolute';
				tag.style.width = '16px';
				tag.style.height = '24px';
				tag.style.left = tag.x*16+'px';
				tag.style.bottom = tag.y*16+'px';
				tag.style.zIndex = 2;

				return Object.html`
		  		<style>
					.m{
						background-image: url('${Assets.enemies}');
						background-position: -${bgx*16}px -${bgy*16}px;
						background-repeat: no-repeat;
						position: absolute;
						width: 16px;
						height: 24px;
						top: 0;
						left: 0;
					}
				</style>
				<div class="m"></div>
		  `},
		});
	}
}

export default KoopaTropa;


/////
/*
import Assets from '../Assets';

import '@webcomponents/webcomponentsjs/webcomponents-bundle.js';
import { html, define } from 'hybrids';

export const KoopaTropa = {
	x: 0,
	y: 2,
  	render: (tag) => {
		tag.style.position = 'absolute';
		tag.style.width = '16px';
		tag.style.height = '24px';
		tag.style.left = tag.x*16+'px';
		tag.style.bottom = tag.y*16+'px';
		tag.style.zIndex = 2;

		return html`
  		<style>
			.m{
				background-image: url('${Assets.enemies}');
				background-position: -96px -8px;
				background-repeat: no-repeat;
				position: absolute;
				width: 16px;
				height: 24px;
			}
		</style>
		<div class="m" style="top: 0; left: 0;"></div>
  `},
};
define('enemy-koopa-tropa', KoopaTropa);*/
