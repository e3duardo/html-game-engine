import Collidable from '~/engine/src/Collidable';
import WalkingItem from '~/engine/src/WalkingItem';
import Assets from '../Assets';

class Star extends WalkingItem {
	static tagName = 'item-star';

	constructor(tag) {
		super(tag);
		// 12x12, 9px below the object's own Y, which sits 8px
		// above this tag's top (see Collidable.hitBox)
		this.hitInset = { l: 2, t: 1, w: 12, h: 12 };
		// the real star never settles - it keeps hopping for as long as it
		// exists (see WalkingItem's bounceOnLand)
		this.bounceOnLand = true;
	}

	collide = (from, collisions) => {
		super.collide(from, collisions);

		if (this.dead || this.untouchable) return;
		if (collisions.top || collisions.bottom || collisions.left || collisions.right) {
			from.activateStarPower();
			this.remove();
		}
	};

	static setupWebComponent() {
		const { tagName } = this;
		const bgy = 48;

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
				tag.style.transition = 'left .0167s linear, top .0167s linear';

				return Collidable.html`
					<style>
						item-star .m{
							background-image: url('${Assets.items}');
							background-position: 0 -${bgy}px;
							background-repeat: no-repeat;
							position: absolute;
							width: 16px;
							height: 16px;
							top: 0;
							left: 0;
							animation: star-flicker .16s steps(1) infinite;
						}
						/* the 4 columns in items.png at this row are the game's own
						   per-world star recolors - cycling through all of them
						   fast reproduces the original star's rapid color flicker
						   without needing a dedicated animation asset */
						@keyframes star-flicker {
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

export default Star;
