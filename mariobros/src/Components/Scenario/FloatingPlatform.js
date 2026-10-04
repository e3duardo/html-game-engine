import Collidable from '~/engine/src/Collidable';
import Assets from '../Assets';

class FloatingPlatform extends Collidable {
	static tagName = 'floating-platform';

	constructor(tag) {
		super(tag);
		// SMBDIS: the mushroom ledge's metatiles ($19/$1a/$1b) fall in the
		// solid range (>= $10 for metatiles $00-$3f, see SolidMTileUpperExt /
		// CheckForSolidMTiles) - same as ground and bricks, so the player
		// bumps his head from below and is stopped from the sides. Only the
		// stem underneath ($4f/$50, below that group's $61 threshold) is
		// background, see platform-trunk.
		this.setKind('solid');
	}

	static setupWebComponent() {
		const { tagName } = this;
		const bgxl = 5;
		const bgxm = 6;
		const bgxr = 7;
		const bgy = 8;

		Collidable.setupWebComponent(tagName, {
			size: 2,
			x: 0,
			y: 0,
			render: (tag) => {
				if (tag.size < 2) {
					tag.size = 2;
				}
				let width = 16 * tag.size;
				let height = 16;
				tag.classList += 'Collidable';
				tag.style.position = 'absolute';
				tag.style.width = width + 'px';
				tag.style.height = height + 'px';
				tag.style.left = tag.x * 16 + 'px';
				tag.style.bottom = tag.y * 16 + 'px';
				tag.style.zIndex = 2;

				const n = Array.from(Array(tag.size - 2));

				return Collidable.html`
				<style>
					floating-platform .g{
						position: relative;
					}
					floating-platform .l, floating-platform .r, floating-platform .m{
						background-image: url('${Assets.tileset}');
						background-repeat: no-repeat;
						position: absolute;
						width: 16px;
						height: 16px;
						top: 0;
						left: 0;
					}
					floating-platform .l{
						background-position: -${bgxl * 16}px -${bgy * 16}px;
					}
					floating-platform .m{
						background-position: -${bgxm * 16}px -${bgy * 16}px;
					}
					floating-platform .r{
						background-position: -${bgxr * 16}px -${bgy * 16}px;
					}
				</style>
				<div class="g">
					<div class="l"></div>
					${n.map(
						(a, i) => Collidable.html`
						<div class="m" style="left: ${(i + 1) * 16}px;"></div>
					`
					)}
					<div class="r" style="left: ${(n.length + 1) * 16}px;"></div>
				</div>
				`;
			},
		});
	}
}

export default FloatingPlatform;
