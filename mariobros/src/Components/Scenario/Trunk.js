import Object from '~/engine/src/Object';
import Assets from '../Assets';

class Trunk extends Object {
	constructor() {
		super();
	}

	static setupWebComponent() {
		const tagName = 'platform-trunk';
		const bgx = 5;
		const bgy = 1;

		Object.setupWebComponent(tagName, {
			height: 1,
			width: 1,
			x: 0,
			y: 0,
			render: (tag) => {
				let width = 16 * tag.width;
				let height = 16 * tag.height;
				tag.style.position = 'absolute';
				tag.style.width = width + 'px';
				tag.style.height = height + 'px';
				tag.style.left = tag.x * 16 + 'px';
				// `y` marks the top row (the one touching the platform above
				// it) - anchor there and let extra height grow downward
				// instead of the default bottom-anchored `y*16` (which would
				// grow the trunk up INTO the platform as height increases)
				tag.style.bottom = (tag.y - tag.height + 1) * 16 + 'px';
				tag.style.zIndex = 2;

				return Object.html`
				<style>
					platform-trunk .g{
						position: relative;
					}
					platform-trunk .m{
						background-image: url('${Assets.tileset}');
						background-position: -${bgx * 16}px -${bgy * 16}px;
						background-repeat: no-repeat;
						position: absolute;
						width: 16px;
						height: 16px;
					}
				</style>
				<div class="g">
					${Array.from(Array(tag.width * tag.height)).map((a, idx) => {
						const col = idx % tag.width;
						const row = Math.floor(idx / tag.width);
						return Object.html`<div class="m" style="top: ${row * 16}px; left: ${col * 16}px;"></div>`;
					})}
				</div>
				`;
			},
		});
	}
}

export default Trunk;
