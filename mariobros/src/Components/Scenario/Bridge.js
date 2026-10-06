import Collidable from '~/engine/src/Collidable';
import Assets from '../Assets';
import brickSound from '../../../sounds/brick.wav';
import Inject from '~/engine/src/Inject';

class  Bridge extends Collidable {
	static tagName = 'scene-bridge';

	constructor(tag) {
		super(tag);
		this.setKind('solid');
	}

	// SMBDIS RemoveBridge: the axe takes the bridge out one tile at a time
	// from the far (axe) end, one every 4 frames, each with a crack
	collapse = (onDone) => {
		const tiles = Array.from(this.tag.querySelectorAll('.m'));
		const interval = setInterval(() => {
			const tile = tiles.pop();
			if (!tile) {
				clearInterval(interval);
				onDone();
				return;
			}
			tile.style.visibility = 'hidden';
			this.tag.style.width = tiles.length * 16 + 'px';
			this.invalidateBox();
			Inject.audio.play(brickSound);
		}, 4 * Inject.game.tickInterval);
	};

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
