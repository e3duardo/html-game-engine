import Object from '~/engine/src/Object';
import Assets from '../Assets';

// the Mushroom Retainer waiting past Bowser's bridge (SMBDIS RetainerObject).
// Purely decorative - the ending sequence in Puppet.reachAxe() walks mario up
// to it and shows its message.
class Toad extends Object {
	static tagName = 'npc-toad';

	static setupWebComponent() {
		const { tagName } = this;

		Object.setupWebComponent(tagName, {
			x: 0,
			y: 0,
			render: (tag) => {
				tag.style.position = 'absolute';
				tag.style.width = '16px';
				tag.style.height = '32px';
				tag.style.left = tag.x * 16 + 'px';
				tag.style.bottom = tag.y * 16 + 'px';
				tag.style.zIndex = 2;

				// two tiles tall, standing on the tile at x/y (the original's
				// retainer is 16x24 - 3 rows of 2 tiles - but the sheet cell is
				// 32px; `.m` is anchored to the feet either way)
				return Object.html`
					<style>
						${tagName} .m {
							position: absolute;
							left: 0;
							bottom: 0;
							width: 16px;
							height: 32px;
							background-image: url('${Assets.items}');
							background-position: -${0 * 16}px -${14 * 16}px;
							background-repeat: no-repeat;
						}
					</style>
					<div class="m"></div>
				`;
			},
		});
	}
}

export default Toad;
