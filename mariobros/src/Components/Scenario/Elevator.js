import Collidable from '~/engine/src/Collidable';
import Assets from '../Assets';

// a platform that rises/falls on a fixed vertical track. Unlike the
// horizontal version, this one needs no manual
// "carry the player" trick - the existing solid-top collision response in
// Puppet.update() already re-solves mario's own y against this platform's
// CURRENT y every tick (this.ay = object.y - this.height), so he follows
// it up/down for free as long as `platform` (one-way solid, not `solid`)
// lets him land on top in the first place.
class Elevator extends Collidable {

	static tagName = 'scenario-elevator';
	static bgx = 3;
	static bgy = 1;

	constructor(tag) {
		super(tag);
		this.setKind('platform');
		this.type = 'scenario';
		// Collidable defaults this to false - needed here to move every tick
		this.updatable = true;

		// elevators never bounce back and forth between two points - they
		// travel continuously in ONE fixed direction along their track and
		// simply re-emerge at the other end when they go off it (that's
		// how e.g. the World 5-3/8-4 lifts read). So `direction` is fixed
		// for this instance's whole life, never flipped mid-update like
		// the old placeholder did.
		this.direction = tag.direction >= 0 ? 1 : -1;
		this.speed = tag.speed;

		// The track: `y` (tiles, converted to the same px unit render()
		// uses for style.bottom) is always the LOW end, `travel` tiles
		// above it is the HIGH end - regardless of which way this
		// particular lift travels through that span.
		this.trackLow = tag.y * 16;
		this.trackHigh = this.trackLow + tag.travel * 16;

		// Track our own float position directly in style.bottom px units
		// instead of going through Tag's inherited y getter/setter (see
		// engine/src/Tag.js): that setter parseInt()s and writes
		// style.top, which (a) rounds a sub-pixel speed like the 0.5
		// default straight back down to the unchanged integer offsetTop
		// every single tick - the platform visibly never moved at all -
		// and (b) fights with the style.bottom this component (like every
		// other Scenario component) already renders itself with; top +
		// bottom + an explicit height together over-constrain the box.
		// A descending lift starts at the high end so it falls right away
		// instead of visibly teleporting there on its first tick.
		this.bottomPos = this.direction === 1 ? this.trackLow : this.trackHigh;
		this.tag.style.bottom = this.bottomPos + 'px';
	}

	update = () => {
		if (this.direction === 1) {
			this.bottomPos += this.speed;
			if (this.bottomPos > this.trackHigh) this.bottomPos = this.trackLow;
		} else {
			this.bottomPos -= this.speed;
			if (this.bottomPos < this.trackLow) this.bottomPos = this.trackHigh;
		}
		this.tag.style.bottom = this.bottomPos + 'px';
	};

	static setupWebComponent() {
		const {tagName, bgx, bgy} = this;

		Collidable.setupWebComponent(tagName, {
			x: 0,
			y: 0,
			// widened from 2 to 4 tiles (64px) at Eduardo's request, "pra
			// ficar na largura do jogo" - guessed this means a good deal
			// wider than the original 2-tile guess, not literally full
			// screen width; easy to tweak here once real sprites are in
			width: 4,
			travel: 5,
			speed: 0.5,
			direction: 1,
			render: (tag) => {
				tag.classList += 'Collidable';
				tag.style.position = 'absolute';
				tag.style.left = tag.x * 16 + 'px';
				tag.style.bottom = tag.y * 16 + 'px';
				tag.style.width = tag.width * 16 + 'px';
				tag.style.height = 16 + 'px';
				tag.style.zIndex = 2;

				// plain original look (no ripped tile) - a flat plank
				// platform, not a reproduction of any specific game's art -
				// Eduardo's swapping in real sprites later
				return Collidable.html`
					<style>
						${tagName} .g{
							position: relative;
						}
						${tagName} .m{
							background-image: url('${Assets.tileset}');
							background-position: -${bgx * 16}px -${bgy * 16}px;
							background-repeat: no-repeat;
							position: absolute;
							width: 16px;
							height: 16px;
							top: 0;
							left: 0;
						}
					</style>
					<div class="g">
						${Array.from(Array(tag.width)).map((_, col) => {
							return Collidable.html`<div class="m" style="left: ${col * 16}px;"></div>`;
						})}
					</div>
				`;
			},
		});
	}
}

export default Elevator;
