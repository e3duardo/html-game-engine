import Object from '~/engine/src/Object';
import Assets from '../Assets';

class Flag extends Object {
	static tagName = 'item-flag';

	constructor() {
		super();
	}

	static setupWebComponent() {
		const { tagName } = this;
		const bgx = 35;
		const bgy = 2;

		Object.setupWebComponent(tagName, {
			x: 0,
			y: 5,
			render: (tag) => {
				// purely decorative - not marked '.Collidable' (unlike Pole.js,
				// the actual win trigger), so it never enters the collision
				// map and can't accidentally act as an invisible solid wall
				tag.style.position = 'absolute';
				tag.style.width = '16px';
				tag.style.height = '16px';
				tag.style.left = tag.x * 16 + 'px';
				tag.style.bottom = tag.y * 16 + 'px';
				tag.style.zIndex = 2;
				// smooths the per-tick jumps of the flag-drop slide (see
				// Puppet.winLevel) - same idea as Mario.js's own left/top
				// transition
				tag.style.transition = 'bottom .0167s linear';
				return Object.html`
		  		<style>
					item-flag .m{
						background-image: url('${Assets.items}');
						background-position: -${bgx * 16}px -${bgy * 16}px;
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

export default Flag;
