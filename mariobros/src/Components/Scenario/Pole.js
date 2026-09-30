import Collidable from '~/engine/src/Collidable';
import Object from '~/engine/src/Object';
import Assets from '../Assets';

const m11 = `background-position: ${-16 * 16}px ${-8 * 16}px`;
const m12 = `background-position: ${-16 * 16}px ${-9 * 16}px`;

// the flagpole at the end of the stage - purely decorative art (see
// Flag.js, still just a static sprite) plus the actual win trigger: touching
// any part of the pole, at any height, hands off to Puppet.winLevel() for
// the slide-down/walk-to-castle sequence. `type` is 'item' so Puppet's own
// solid-block physics ignores it - Mario passes/lands on it exactly like a
// coin or a mushroom, no separate "grab" collision needed.
class Pole extends Collidable {
	constructor(tag) {
		super(tag);
		this.type = 'item';
	}

	collide = (from, collisions) => {
		super.collide(from, collisions);

		if (!from.winLevel) return;
		if (collisions.top || collisions.bottom || collisions.left || collisions.right) {
			from.winLevel(this);
		}
	};

	static setupWebComponent() {
		const tagName = 'item-pole';

		Collidable.setupWebComponent(tagName, {
			size: 10,
			x: 0,
			y: 3,
			render: (tag) => {
				let width = 16;
				let height = 16 * tag.size;
				tag.classList += 'Collidable';
				tag.style.position = 'absolute';
				tag.style.width = width + 'px';
				tag.style.height = height + 'px';
				tag.style.left = tag.x * 16 + 'px';
				tag.style.bottom = tag.y * 16 + 'px';
				tag.style.zIndex = 2;

				return Object.html`
		  		<style>
					item-pole .g{
						position: relative;
					}
					item-pole .m{
						background-image: url('${Assets.tileset}');
						background-repeat: no-repeat;
						position: absolute;
						width: 16px;
						height: 16px;
					}
				</style>
				<div class="g">
					<div class="m" style="top: 0; left: 0; ${m11}"></div>

					${Array.from(Array(tag.size - 1)).map(
						(a, i) => Object.html`
						<div class="m" style="top: ${(i + 1) * 16}px; left: 0; ${m12}"></div>
					`
					)}
				</div>
	  		`;
			},
		});
	}
}

export default Pole;
