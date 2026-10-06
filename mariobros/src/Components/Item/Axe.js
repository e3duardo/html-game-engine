import Collidable from '~/engine/src/Collidable';
import Inject from '~/engine/src/Inject';
import Assets from '../Assets';

// the axe at the far end of Bowser's bridge (SMBDIS HandleAxeMetatile).
// Touching it hands off to Puppet.reachAxe(), which runs the whole ending -
// the bridge falling, Bowser with it, then the walk to Toad. The chain it cuts
// is its own element, see Chain.js.
class Axe extends Collidable {
	static tagName = 'item-axe';

	constructor(tag) {
		super(tag);
		this.type = 'item';
		this.used = false;
	}

	collide = (from, collisions) => {
		if (this.used || !from.reachAxe || from.dying || from.winning) return;
		if (collisions.top || collisions.bottom || collisions.left || collisions.right) {
			this.used = true;
			from.reachAxe(this);
		}
	};

	// the axe vanishes the moment the bridge starts to go
	consume = () => {
		this.tag.style.visibility = 'hidden';
	};

	reset = () => {
		this.used = false;
		this.tag.style.visibility = 'visible';
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

				return Collidable.html`
					<style>
						${tagName} .axe {
							position: absolute;
							left: 0px;
							top: 0px;
							width: 16px;
							height: 16px;
							background-image: url('${Assets.items}');
							background-position: -${0 * 16}px -${8 * 16}px;
							background-repeat: no-repeat;
						}
					</style>
					<div class="axe"></div>
				`;
			},
		});
	}
}

export default Axe;
