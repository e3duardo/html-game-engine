import Collidable from '~/engine/src/Collidable';
import Inject from '~/engine/src/Inject';
import Assets from '../Assets';
import coinSound from '../../../sounds/coin.wav';

// a static collectible - no gravity, no movement, just sits there spinning
// until mario touches it: +1 coin, +200 points, then it's gone. `type`
// is 'item' (not the default 'scenario'), so Puppet's solid-block collision
// resolution skips it entirely and mario just walks straight through it.
class Coin extends Collidable {
	constructor(tag) {
		super(tag);
		this.type = 'item';
		this.collected = false;
	}

	reset = () => {
		this.collected = false;
		this.originalParent.appendChild(this.tag);
	};

	collide = (from, collisions) => {
		super.collide(from, collisions);

		if (this.collected) return;
		if (collisions.top || collisions.bottom || collisions.left || collisions.right) {
			this.collected = true;
			Inject.hud.addCoin();
			Inject.hud.showScorePopup(this.tag, '200');
			Inject.audio.play(coinSound);
			this.tag.remove();
		}
	};

	static setupWebComponent() {
		const tagName = 'item-coin';
		// same tileset section already used by the question block (bgy=0) -
		// this coin spin animation sits right below it, same 3 columns
		const bgx = 24;
		const bgy = 1;

		Collidable.setupWebComponent(tagName, {
			x: 0,
			y: 5,
			render: (tag) => {
				tag.classList += 'Collidable';
				tag.style.position = 'absolute';
				tag.style.width = '16px';
				tag.style.height = '16px';
				tag.style.left = tag.x * 16 + 'px';
				tag.style.bottom = tag.y * 16 + 'px';
				tag.style.zIndex = 2;

				return Collidable.html`
					<style>
						item-coin .m{
							background-image: url('${Assets.tileset}');
							background-position: -${bgx * 16}px -${bgy * 16}px;
							background-repeat: no-repeat;
							position: absolute;
							width: 16px;
							height: 16px;
							top: 0;
							left: 0;
							animation-timing-function: steps(1);
							animation-name: coin-spin;
							animation-duration: .40s;
							animation-iteration-count: infinite;
						}
						@keyframes coin-spin {
							0% { background-position: -${bgx * 16}px -${bgy * 16}px; }
							33% { background-position: -${(bgx + 1) * 16}px -${bgy * 16}px; }
							66% { background-position: -${(bgx + 2) * 16}px -${bgy * 16}px; }
							100% { background-position: -${bgx * 16}px -${bgy * 16}px; }
						}
					</style>
					<div class="m"></div>
				`;
			},
		});
	}
}

export default Coin;
