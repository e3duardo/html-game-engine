import Collidable from '~/engine/src/Collidable';
import Assets from '../Assets';

// the chain holding up Bowser's bridge (SMBDIS BridgeCollapseData: the axe,
// then the chain, then the bridge tiles). Purely scenery - it only goes away
// when Puppet.reachAxe() cuts it. It sits one tile above the bridge's last
// tile, one tile left of the axe.
class Chain extends Collidable {
	static tagName = 'item-chain';

	constructor(tag) {
		super(tag);
		// pass-through, never solid - see Collidable.js on why `type` has to
		// be set explicitly
		this.type = 'item';
	}

	cut = () => {
		this.tag.style.visibility = 'hidden';
	};

	reset = () => {
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
						${tagName} .m {
							position: absolute;
							left: 0;
							top: 0;
							width: 16px;
							height: 16px;
							background-image: url('${Assets.tileset}');
							background-position: -${12 * 16}px -${16 * 16}px;
							background-repeat: no-repeat;
						}
					</style>
					<div class="m"></div>
				`;
			},
		});
	}
}

export default Chain;
