import Object from '~/engine/src/Object';
import Assets from '../Assets';

const m11 = `background-position: ${-0 * 16}px ${-20 * 16}px`;
const m12 = `background-position: ${-0 * 16}px ${-21 * 16}px`;

const m21 = `background-position: ${-1 * 16}px ${-20 * 16}px`;
const m22 = `background-position: ${-1 * 16}px ${-21 * 16}px`;

const m31 = `background-position: ${-2 * 16}px ${-20 * 16}px`;
const m32 = `background-position: ${-2 * 16}px ${-21 * 16}px`;

export const Cloud = {
	size: 3,
	x: 0,
	y: 2,
	render: (tag) => {
		let width = 16 * tag.size;
		let height = 32;
		tag.style.position = 'absolute';
		tag.style.width = width + 'px';
		tag.style.height = height + 'px';
		tag.style.left = tag.x * 16 + 'px';
		tag.style.bottom = tag.y * 16 + 'px';

		return Object.html`
  		<style>
			air-cloud .g{
				position: relative;
				z-index: 1;
			}
			air-cloud .m{
				background-image: url('${Assets.tileset}');
				background-repeat: no-repeat;
				position: absolute;
				width: 16px;
				height: 16px;
			}
		</style>
		<div class="g">
			<div class="m" style="top: 0; left: 0; ${m11}"></div>
			<div class="m" style="top: 16px; left: 0; ${m12}"></div>

			${Array.from(Array(tag.size - 2)).map(
				(a, i) => Object.html`
				<div class="m" style="top: 0; left: ${(i + 1) * 16}px; ${m21}"></div>
				<div class="m" style="top: 16px; left: ${(i + 1) * 16}px; ${m22}"></div>
			`
			)}

			<div class="m" style="top: 0; left: ${(tag.size - 1) * 16}px; ${m31}"></div>
			<div class="m" style="top: 16px; left: ${(tag.size - 1) * 16}px; ${m32}"></div>

		</div>
  `;
	},
};
Object.setupWebComponent('air-cloud', Cloud);
