import Collidable from '~/engine/src/Collidable';
import Inject from '~/engine/src/Inject';
import WalkingItem from '~/engine/src/WalkingItem';
import Assets from '../Assets';
import oneUpSound from '../../../sounds/1up.wav';
import powerupSound from '../../../sounds/powerup.wav';

class Mushroom extends WalkingItem {
	static tagName = 'item-mushroom';

	constructor(tag) {
		super(tag);
		// same shape and movement as the regular mushroom, just a green
		// recolor and a different effect - picked by the `life` attribute
		// in the level markup (see Question.js's `hasLife` block)
		this.isLife = tag.hasAttribute('life');
	}

	collide = (from, collisions) => {
		super.collide(from, collisions);

		if (this.dead) return;
		if (collisions.top || collisions.bottom || collisions.left || collisions.right) {
			if (this.isLife) {
				from.addLife();
				Inject.audio.play(oneUpSound);
			} else {
				from.grow();
				Inject.audio.play(powerupSound);
			}
			this.remove();
		}
	};

	static setupWebComponent() {
		const { tagName } = this;

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
				// purely visual smoothing between game ticks - safe because
				// WalkingItem's x/y getters read back an internal field instead
				// of offsetLeft/offsetTop, so this can't corrupt the physics
				// the way it used to for mario (see Puppet.js/Mario.js)
				tag.style.transition = 'left .0167s linear, top .0167s linear';

				// items.png: column 0 is the regular (grow) mushroom, column 1
				// is the green 1-up mushroom - same shape, just a color swap
				const bgx = tag.hasAttribute('life') ? 1 : 0;

				return Collidable.html`
					<style>
						item-mushroom .m{
							background-image: url('${Assets.items}');
							background-position: -${bgx * 16}px 0;
							background-repeat: no-repeat;
							position: absolute;
							width: 16px;
							height: 16px;
							top: 0;
							left: 0;
						}
					</style>
					<div class="m"></div>
				`;
			},
		});
	}
}

export default Mushroom;
