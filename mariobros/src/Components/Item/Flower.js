import Collidable from '~/engine/src/Collidable';
import Inject from '~/engine/src/Inject';
import Assets from '../Assets';
import powerupSound from '../../../sounds/powerup.wav';

// unlike the mushroom, the fire flower doesn't walk or fall - it just sits
// in place where it spawns until mario touches it. `type` is 'item' (not
// the default 'scenario'), so Puppet's solid-block collision resolution
// skips it entirely and mario just walks through it to collect it.
class Flower extends Collidable {
	static tagName = 'item-flower';

	constructor(tag) {
		super(tag);
		// 12x12, 9px below the object's own Y, which sits 8px
		// above this tag's top (see Collidable.hitBox)
		this.hitInset = { l: 2, t: 1, w: 12, h: 12 };
		this.type = 'item';
		this.collected = false;
		this.updatable = true;
	}

	// same emergence as the mushroom (see WalkingItem.startRise), it just never
	// moves afterwards
	startRise = () => {
		this._riseTicks = 0;
		this._riseTargetY = this.y;
		this.y = this.y + 16;
		this.rising = true;
		this.tag.style.zIndex = 1;
	};

	update = () => {
		if (!this.rising) return;
		this._riseTicks++;
		if (this._riseTicks % 4 === 0 && this.y > this._riseTargetY) this.y = this.y - 1;
		if (this._riseTicks >= 68) {
			this.rising = false;
			this.y = this._riseTargetY;
			this.tag.style.zIndex = 2;
		}
	};

	collide = (from, collisions) => {
		super.collide(from, collisions);

		if (this.collected || (this.rising && this._riseTicks < 24)) return;
		if (collisions.top || collisions.bottom || collisions.left || collisions.right) {
			this.collected = true;
			from.becomeFire();
			Inject.audio.play(powerupSound);
			this.tag.remove();
		}
	};

	static setupWebComponent() {
		const { tagName } = this;
		// items.png row y=32: the 4 per-world recolors of the same flower
		// shape (x=0/16/32/48) - the original flicks the fire flower
		// through several palettes instead of showing it static; cycling
		// through these (same trick Star.js uses for its own flicker, no
		// dedicated animation asset exists for either) reproduces that
		const bgy = 32;

		Collidable.setupWebComponent(tagName, {
			x: 0,
			y: 0,
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
						item-flower .m{
							background-image: url('${Assets.items}');
							background-position: 0 -${bgy}px;
							background-repeat: no-repeat;
							position: absolute;
							width: 16px;
							height: 16px;
							top: 0;
							left: 0;
							animation: flower-flicker .16s steps(1) infinite;
						}
						@keyframes flower-flicker {
							0% { background-position: 0 -${bgy}px; }
							25% { background-position: -16px -${bgy}px; }
							50% { background-position: -32px -${bgy}px; }
							75% { background-position: -48px -${bgy}px; }
							100% { background-position: 0 -${bgy}px; }
						}
					</style>
					<div class="m"></div>
				`;
			},
		});
	}
}

export default Flower;
