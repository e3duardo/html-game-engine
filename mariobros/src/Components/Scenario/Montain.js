import Assets from '../Assets';

import '@webcomponents/webcomponentsjs/webcomponents-bundle.js';
import { html, define } from 'hybrids';

const m11 = `background-position: ${-8*16}px ${-8*16}px`;
const m12 = `background-position: ${-9*16}px ${-8*16}px`;
const m13 = `background-position: ${-10*16}px ${-8*16}px`;
const m21 = `background-position: ${-8*16}px ${-9*16}px`;
const m22 = `background-position: ${-9*16}px ${-9*16}px`;
const m23 = `background-position: ${-10*16}px ${-9*16}px`;

export const Montain = {
	size: 1,
	x: 0,
	y: 2,
  	render: (tag) => {
		let width = 16;
		let height = 16;
		let t = 32;
		console.log(tag, tag.size);
		if(tag.size ==2){
			width *= 3;
			height *= 2;
			t /= 2;
		}else{
			width *= 5;
			height *= 3;
			t *= 0;
		}
		tag.style.position = 'absolute';
		tag.style.width = width+'px';
		tag.style.height = height+'px';
		tag.style.left = tag.x*16+'px';
		tag.style.bottom = tag.y*16+'px';

		return html`
  		<style>
			.g{
				position: relative;
				background: red;
			}
			.m{
				background-image: url('${Assets.tileset}');
				background-repeat: no-repeat;
				position: absolute;
				width: 16px;
				height: 16px;
			}
		</style>
		<div class="g">
			<div class="m m12" style="top: 0; left: ${32-t}px; ${m12}"></div>

			${tag.size > 1 && html`
				<div class="m" style="top: 16px; left: ${16-t}px; ${m11}"></div>
				<div class="m" style="top: 16px; left: ${32-t}px; ${m21}"></div>
				<div class="m" style="top: 16px; left: ${48-t}px; ${m13}"></div>

				${tag.size > 2 && html`
					<div class="m" style="top: 32px; left: 0; ${m11}"></div>
					<div class="m" style="top: 32px; left: 16px; ${m21}"></div>
					<div class="m" style="top: 32px; left: 32px; ${m22}"></div>
					<div class="m" style="top: 32px; left: 48px; ${m23}"></div>
					<div class="m" style="top: 32px; left: 64px; ${m13}"></div>
				`}
			`}
		</div>
  `},
};
define('vegetation-mountain', Montain);
