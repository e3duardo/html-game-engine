import Collidable from '~/engine/src/Collidable';
import Assets from '../Assets';

// unlike item-brick/item-block, a floor tile never bumps, breaks, or pops
// anything - it's a static collision rectangle with no per-tile state, so
// unlike bricks (which have to stay one element per tile to keep their own
// independent bump/break/coin state) a whole stretch of floor is safely one
// tag, spanning `width` tiles at once - same x/y/size-in-tiles convention
// as every other scenery piece, instead of the raw left/width-in-px a plain
// <div class="Floor Collidable solid" style="..."> used to need.
class Floor extends Collidable {
	static tagName = 'scene-floor';

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
			height: 2,
			tileset: 'floor',
			render: (tag) => {
				let bgx = 0;
				let bgy = 0;
				if (tag.tileset === 'castle') {
					bgx = 2;
					bgy = 5;
				} else if (tag.tileset === 'underground') {
					bgx = 0;
					bgy = 2;
				}

				tag.classList += `Collidable ${tag.tileset}`;
				tag.style.position = 'absolute';
				tag.style.left = tag.x * 16 + 'px';
				tag.style.bottom = tag.y * 16 + 'px';
				tag.style.width = tag.width * 16 + 'px';
				tag.style.height = tag.height * 16 + 'px';

				return Collidable.html`
					<style>
						${tagName}.${tag.tileset} .g{
							position: relative;
						}
						${tagName}.${tag.tileset} .m{
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
						${Array.from(Array(tag.width * tag.height)).map((a, idx) => {
							const col = idx % tag.width;
							const row = Math.floor(idx / tag.width);
							return Collidable.html`<div class="m" style="top: ${row * 16}px; left: ${col * 16}px;"></div>`;
						})}
					</div>
					`;
			},
		});
	}
}

export default Floor;
