import Object from '~/engine/src/Object';
import Assets from '../Assets';

const m1 = `background-position: ${-11 * 16}px ${-9 * 16}px`;
const m2 = `background-position: ${-12 * 16}px ${-9 * 16}px`;
const m3 = `background-position: ${-13 * 16}px ${-9 * 16}px`;

export const Stuff = {
	size: 3,
	x: 0,
	y: 2,
	render: (tag) => {
		let width = 16 * tag.size;
		let height = 16;

		tag.style.position = 'absolute';
		tag.style.width = width + 'px';
		tag.style.height = height + 'px';
		tag.style.left = tag.x * 16 + 'px';
		tag.style.bottom = tag.y * 16 + 'px';

		return Object.html`
  		<style>
			vegetation-stuff .g{
				position: relative;
				background: red;
			}
			vegetation-stuff .m{
				background-image: url('${Assets.tileset}');
				background-repeat: no-repeat;
				position: absolute;
				width: 16px;
				height: 16px;
			}
		</style>
		<div class="g">

			<div class="m" style="top: 0; left: 0; ${m1}"></div>
			${Array.from(Array(tag.size - 2)).map((a, i) => Object.html`<div class="m" style="top: 0; left: ${(i + 1) * 16}px; ${m2}"></div>`)}
			<div class="m" style="top: 0; left: ${(tag.size - 1) * 16}px; ${m3}"></div>


		</div>
  `;
	},
};
Object.setupWebComponent('vegetation-stuff', Stuff);
