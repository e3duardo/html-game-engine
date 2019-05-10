import '@webcomponents/webcomponentsjs/webcomponents-bundle.js';
import { html, define } from 'hybrids';

const tileset = require('../../assets/tileset.png');
const m11 = `background-position: ${-0*16}px ${-8*16}px`;
const m12 = `background-position: ${-1*16}px ${-8*16}px`;
const m21 = `background-position: ${-0*16}px ${-9*16}px`;
const m22 = `background-position: ${-1*16}px ${-9*16}px`;


export const Pipe = {
	size: 2,
	x: 0,
	y: 2,
  	render: (tag) => {
		let width = 32;
		let height = 16*tag.size;
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
				background-image: url('${tileset}');
				background-repeat: no-repeat;
				position: absolute;
				width: 16px;
				height: 16px;
			}
		</style>
		<div class="g">
			<div class="m" style="top: 0; left: 0; ${m11}"></div>
			<div class="m" style="top: 0; left: 16px; ${m12}"></div>

			${Array.from(Array(tag.size-1)).map((a,i) => html`
				<div class="m" style="top: ${(i+1)*16}px; left: 0; ${m21}"></div>
				<div class="m" style="top: ${(i+1)*16}px; left: 16px; ${m22}"></div>
			`)}
		</div>
  `},
};
define('item-pipe', Pipe);
