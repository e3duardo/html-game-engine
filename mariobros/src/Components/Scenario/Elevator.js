import Collidable from '~/engine/src/Collidable';
import Inject from '~/engine/src/Inject';
import Assets from '../Assets';

// a platform that rises/falls on a fixed vertical track. Unlike the
// horizontal version, this one needs no manual
// "carry the player" trick - the existing solid-top collision response in
// Puppet.update() already re-solves mario's own y against this platform's
// CURRENT y every tick (this.ay = object.y - this.height), so he follows
// it up/down for free as long as `platform` (one-way solid, not `solid`)
// lets him land on top in the first place.
const SWAY_HALF_TRAVEL = 64;
const SWAY_ACCEL = 5 / 256;
const SWAY_MAX_SPEED = 3;
const SLIDE_MAX_COUNTER = 14;

// SMBDIS PlatLiftUp / PlatLiftDown (ids $26 / $27, the lifts across 1-2's
// pit): speed $ff (-1) or $00 with a 16/256 or 240/256 move force per frame,
// i.e. 0.9375 px/frame either way. The Y position is one byte, so a lift that
// leaves the top of the 256px-tall coordinate space comes back in at the
// bottom - the "teleport" happens while it's off screen (below the 240px
// stage), never in view. Objects in the original only exist once the screen
// gets near them, which is why they all start from their data position when
// you arrive - LIFT_WAKE_AHEAD mirrors the 48px spawn margin.
const LIFT_SPEED = 0.9375;
const LIFT_WRAP = 256;
const LIFT_TOP = 224; // platform bottom (css) when its top touches y=0
const LIFT_WAKE_AHEAD = 48;

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
		this._liftStart = this.trackLow;
		this._awake = false;
		this.tag.style.bottom = this.bottomPos + 'px';

		// 'lift' (default): the continuous one-way lift above. The other two
		// are the 1-3 platforms (SMBDIS ids $25 / $28):
		// 'sway' - YMovingPlatform: starts at its top, speeds up and slows
		//   down around a centre 64px below (swinging 128px in total, 5/256
		//   px/frame^2, max 3px/frame), forever - a slow bob.
		// 'slide' - XMovingPlatform: starts at its origin and slides 52px
		//   to the right and back, speeding up and down in steps (see slide()).
		this.motion = tag.motion;
		if (this.motion === 'lift') {
			// starts exactly where its `y` puts it, whichever way it goes
			this.bottomPos = this.trackLow;
			this.tag.style.bottom = this.bottomPos + 'px';
		}
		if (this.motion === 'sway') {
			this._swayCenter = this.bottomPos - SWAY_HALF_TRAVEL;
			this._swaySpeed = 0;
		} else if (this.motion === 'slide') {
			this._originLeft = this.tag.offsetLeft;
			// `wake` (tiles): wake up when the screen nears THIS column instead of
			// our own, so a pair of platforms starts in lockstep
			this._wakeLeft = tag.wake >= 0 ? tag.wake * 16 : this._originLeft;
			this._left = this._originLeft;
			this._frame = 0;
			// the primary counter is NOT cleared on spawn (InitHoriPlatform only
			// zeroes the secondary one): it keeps what the object slot held, so
			// phase 0 starts going right and 2 going left. 1-3's two neighbouring
			// platforms end up in opposite phases.
			this._phase = Number(tag.phase) || 0;
			this._primary = this._phase;
			this._secondary = 0;
			// how far the platform moved this tick - carries mario along,
			// see collide()
			this._dx = 0;
		}
	}

	// MoveWithXMCntrs / XMoveCntr_Platform: every 4th frame the secondary
	// counter steps 0 -> 14 and back (the primary counter counts those
	// phases: even = rising, odd = falling), and every frame the platform
	// moves counter/16 px - RIGHT while the primary's bit 1 is clear (Y=1 /
	// moving dir 1 in MoveWithXMCntrs), left once it's set (counter negated,
	// dir 2). It starts at primary 0, so it goes right first: out 52px to the
	// right of its origin, then back to it.
	slide = () => {
		// counters are zeroed when the object spawns (InitVStf), i.e. when the
		// screen gets close - so every arrival finds it at its origin, going
		// right, instead of at a phase that depends on how long the level has
		// been running
		if (!this._awake) {
			if (Inject.scene.scroll_x + Inject.stage.width + LIFT_WAKE_AHEAD < this._wakeLeft) return;
			this._awake = true;
		}
		this._frame++;
		if (this._frame % 4 === 0) {
			if (this._primary & 1) {
				if (this._secondary === 0) this._primary++;
				else this._secondary--;
			} else if (this._secondary === SLIDE_MAX_COUNTER) {
				this._primary++;
			} else {
				this._secondary++;
			}
		}
		const sign = this._primary & 2 ? -1 : 1;
		this._dx = (sign * this._secondary) / 16;
		this._left += this._dx;
		this.tag.style.left = this._left + 'px';
	};

	sway = () => {
		// speed/force are zeroed at spawn (InitVStf) - same wake-up as slide
		if (!this._awake) {
			if (Inject.scene.scroll_x + Inject.stage.width + LIFT_WAKE_AHEAD < this.tag.offsetLeft) return;
			this._awake = true;
		}
		this._swaySpeed += this.bottomPos > this._swayCenter ? -SWAY_ACCEL : SWAY_ACCEL;
		this._swaySpeed = Math.max(-SWAY_MAX_SPEED, Math.min(SWAY_MAX_SPEED, this._swaySpeed));
		this.bottomPos += this._swaySpeed;
		this.tag.style.bottom = this.bottomPos + 'px';
	};

	// anything standing on the platform rides along with a slide
	collide = (from, collisions) => {
		if (this.motion === 'slide' && collisions.bottom && this._dx) from.ax += this._dx;
	};

	update = () => {
		if (this.motion === 'sway') return this.sway();
		if (this.motion === 'slide') return this.slide();
		this.lift();
	};

	// the lifts only start moving once the screen is close enough to spawn
	// them (see LIFT_WAKE_AHEAD), so each arrival finds them at their data
	// positions instead of at a phase that depends on how long the level has
	// been running
	lift = () => {
		if (!this._awake) {
			if (Inject.scene.scroll_x + Inject.stage.width + LIFT_WAKE_AHEAD < this.tag.offsetLeft) return;
			this._awake = true;
		}
		this.bottomPos += this.direction * LIFT_SPEED;
		// one-byte Y wrap, off screen at the bottom
		if (this.bottomPos > LIFT_TOP) this.bottomPos -= LIFT_WRAP;
		else if (this.bottomPos < LIFT_TOP - LIFT_WRAP) this.bottomPos += LIFT_WRAP;
		this.tag.style.bottom = this.bottomPos + 'px';
	};

	reset = () => {
		this._awake = false;
		if (this.motion === 'sway') {
			this.bottomPos = this._swayCenter + SWAY_HALF_TRAVEL;
			this._swaySpeed = 0;
			this.tag.style.bottom = this.bottomPos + 'px';
		}
		if (this.motion === 'slide') {
			this._left = this._originLeft;
			this._frame = 0;
			this._primary = this._phase;
			this._secondary = 0;
			this._dx = 0;
			this.tag.style.left = this._left + 'px';
		}
		if (this.motion === 'lift') {
			this.bottomPos = this._liftStart;
			this.tag.style.bottom = this.bottomPos + 'px';
		}
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
			speed: 0.9375,
			direction: 1,
			motion: 'lift',
			phase: 0,
			wake: -1,
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
