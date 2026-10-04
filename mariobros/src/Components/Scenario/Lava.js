import Collidable from '~/engine/src/Collidable';
import Object from '~/engine/src/Object';
import Assets from '../Assets';

// castle lava - instant death on touch, from any side, big/star/invincible
// or not (same as the original, lava is really just a pit). `type` is
// 'item' so Puppet's solid-stop physics lets mario sink into it instead
// of standing on top of it.
class Lava extends Collidable {
	static tagName = 'scene-lava';

	constructor(tag) {
		super(tag);
		this.type = 'item';
	}

	collide = (from, collisions) => {
		super.collide(from, collisions);

		if (!from.die || from.dying) return;
		if (collisions.top || collisions.bottom || collisions.left || collisions.right) {
			from.die();
		}
	};

	static setupWebComponent() {
		const { tagName } = this;

		Collidable.setupWebComponent(tagName, {
			x: 0,
			y: 0,
			width: 1,
			height: 2,
			render: (tag) => {
				let bgx = 3;
				let bgy = 24;

				tag.classList += 'Collidable';
				tag.style.position = 'absolute';
				tag.style.left = tag.x * 16 + 'px';
				tag.style.bottom = tag.y * 16 + 'px';
				tag.style.width = tag.width * 16 + 'px';
				tag.style.height = tag.height * 16 + 'px';

				return Object.html`
					<style>
						scene-lava .g{
							position: relative;
						}
						scene-lava .m{
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
							// top row is the lava surface tile, everything below it the body
							const tileY = row === 0 ? bgy : bgy + 1;
							return Object.html`<div class="m" style="top: ${row * 16}px; left: ${col * 16}px; background-position: -${bgx * 16}px -${tileY * 16}px;"></div>`;
						})}
					</div>
					`;
				},
			});
		}
	}

export default Lava;
