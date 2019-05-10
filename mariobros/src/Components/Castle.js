import '@webcomponents/webcomponentsjs/webcomponents-bundle.js';
import { html, define } from 'hybrids';

const tileset = require('../../assets/tileset.png');
const m11 = `background-position: ${-11*16}px ${-0*16}px`;
const m12 = `background-position: ${-12*16}px ${-0*16}px`;
const m13 = `background-position: ${-13*16}px ${-0*16}px`;
const m14 = `background-position: ${-14*16}px ${-0*16}px`;

const m21 = `background-position: ${-11*16}px ${-1*16}px`;
const m22 = `background-position: ${-12*16}px ${-1*16}px`;
const m23 = `background-position: ${-13*16}px ${-1*16}px`;
const m24 = `background-position: ${-14*16}px ${-1*16}px`;


export const Castle = {
	size: 1,
	x: 0,
	y: 2,
  	render: (tag) => {
		let width = 16*5;
		let height = 16*5;
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
				z-index: 2;
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
			<div class="m" style="top: ${16*0}px; left: ${16*1}px; ${m11}"></div>
			<div class="m" style="top: ${16*0}px; left: ${16*2}px; ${m11}"></div>
			<div class="m" style="top: ${16*0}px; left: ${16*3}px; ${m11}"></div>

			<div class="m" style="top: ${16*1}px; left: ${16*1}px; ${m12}"></div>
			<div class="m" style="top: ${16*1}px; left: ${16*2}px; ${m13}"></div>
			<div class="m" style="top: ${16*1}px; left: ${16*3}px; ${m14}"></div>

			<div class="m" style="top: ${16*2}px; left: ${16*0}px; ${m11}"></div>
			<div class="m" style="top: ${16*2}px; left: ${16*1}px; ${m21}"></div>
			<div class="m" style="top: ${16*2}px; left: ${16*2}px; ${m21}"></div>
			<div class="m" style="top: ${16*2}px; left: ${16*3}px; ${m21}"></div>
			<div class="m" style="top: ${16*2}px; left: ${16*4}px; ${m11}"></div>

			<div class="m" style="top: ${16*3}px; left: ${16*0}px; ${m13}"></div>
			<div class="m" style="top: ${16*3}px; left: ${16*1}px; ${m13}"></div>
			<div class="m" style="top: ${16*3}px; left: ${16*2}px; ${m22}"></div>
			<div class="m" style="top: ${16*3}px; left: ${16*3}px; ${m13};z-index:10;"></div>
			<div class="m" style="top: ${16*3}px; left: ${16*4}px; ${m13};z-index:10;"></div>

			<div class="m" style="top: ${16*4}px; left: ${16*0}px; ${m13}"></div>
			<div class="m" style="top: ${16*4}px; left: ${16*1}px; ${m13}"></div>
			<div class="m" style="top: ${16*4}px; left: ${16*2}px; ${m23}"></div>
			<div class="m" style="top: ${16*4}px; left: ${16*3}px; ${m13};z-index:10;"></div>
			<div class="m" style="top: ${16*4}px; left: ${16*4}px; ${m13};z-index:10;"></div>
		</div>
  `},
};
define('building-castle', Castle);
