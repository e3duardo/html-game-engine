import Collidable from '~/engine/src/Collidable';
import Assets from '../Assets';

class  Bridge extends Collidable {
	static tagName = 'scene-bridge';

	constructor(tag) {
		super(tag);
		this.setKind('solid');
	}

	static setupWebComponent() {
		const { tagName } = this;

		Collidable.setupWebComponent(tagName, {
			x: 0,
			y: 0,
			width: 1,
			render: (tag) => {
				let bgx = 4;
				let bgy = 24;

				tag.classList += 'Collidable';
				tag.style.position = 'absolute';
				tag.style.left = tag.x * 16 + 'px';
				tag.style.bottom = tag.y * 16 + 'px';
				tag.style.width = tag.width * 16 + 'px';
				tag.style.height = 16 + 'px';

				return Collidable.html`
					<style>
						scene-bridge .g{
							position: relative;
						}
						scene-bridge .m{
							background-image: url('${Assets.tileset}');
							background-position: -${bgx * 16}px -${bgy * 16}px;
							background-repeat: no-repeat;
							position: absolute;
							width: 16px;
							height: 16px;
							top: 0;
							left: 0;
						}
					</style>
					<div class="g">
						${Array.from(Array(tag.width)).map((_, col) => {
							return Collidable.html`<div class="m" style="left: ${col * 16}px;"></div>`;
						})}
					</div>
					`;
				},
			});
		}
	}

export default Bridge;
