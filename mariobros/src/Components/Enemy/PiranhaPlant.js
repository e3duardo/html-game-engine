import Collidable from '~/engine/src/Collidable';
import Enemy from '~/engine/src/Enemy';
import Inject from '~/engine/src/Inject';
import Assets from '../Assets';
import kickkillSound from '../../../sounds/kickkill.wav';

// rises 24px (1.5 tiles) out of its pipe, waits, retracts, waits, and only
// ever starts rising again once mario is more than 33px away horizontally
// - checked only at the fully-retracted rest position (once rising, it
// always completes the rise; once risen, it always retracts next, no
// distance check either way). Moves 1px every other tick (~0.5px/tick
// average); ~64-tick (~1.07s) pause at both the fully-up and fully-down
// ends.
const RISE_DISTANCE = 24;
const RISE_SPEED = 0.5;
const SAFE_DISTANCE = 33;
const PAUSE_TICKS = 64;
// mouth-chomp animation - same 2-frame toggle cadence Goomba/KoopaTroopa use
// for their own walk cycle, just always running (even while paused at full
// extension) rather than only while moving, matching the real sprite's
// continuous open/close while it's out
const CHOMP_FRAME_TICKS = 16;

// extends Enemy (not Collidable directly) purely for isActive()/activated -
// the original's enemy objects don't exist as running objects at all until
// the screen scrolls close enough to allocate them (see Enemy.js's own
// activationLookahead), so a piranha plant's rise/fall cycle can only ever
// start once mario is already approaching it. Without this, our plant was
// ticking its cycle from the moment the whole level's markup loaded -
// completely decoupled from mario's actual position - so by the time he
// reached (or warped to) its pipe, it could already be mid-rise or fully
// risen with zero warning, matching exactly the "piranha plant killed me
// the instant I came out of the pipe" bug report. isActive() also fully
// covers the warp-into-a-hazard case for free: activation and the
// fully-retracted SAFE_DISTANCE check (below) both key off the same tick,
// so a warp landing mario right on top of a just-activated plant simply
// keeps it retracted (distance ~0, well under SAFE_DISTANCE) instead of it
// already being risen from an arbitrary earlier phase.
class PiranhaPlant extends Enemy {
	static tagName = 'enemy-piranha-plant';

	constructor(tag) {
		super(tag);
		this.dead = false;
		// 0 = fully retracted (hidden inside the pipe), -RISE_DISTANCE
		// would be fully risen - matches the sleeve/offset math in render()
		this._offset = 0;
		this._direction = 0; // 0 idle, 1 rising, -1 falling
		this._pauseTicks = 0;
		this._chompTick = 0;
		this._chompFrame = 0;
		this.defaultX = this.x;
		this.defaultY = this.y;
	}

	// only a real hazard while at least partway out of the pipe - mario can
	// walk right through the pipe mouth while this is fully retracted
	get emerged() {
		return this._offset > 0;
	}

	update = () => {
		if (this.dead) return;
		if (!this.isActive()) return;

		this._chompTick++;
		if (this._chompTick >= CHOMP_FRAME_TICKS) {
			this._chompTick = 0;
			this._chompFrame = this._chompFrame === 0 ? 1 : 0;
			this.tag.classList.toggle('frame-1', this._chompFrame === 1);
		}

		if (this._pauseTicks > 0) {
			this._pauseTicks--;
			return;
		}

		if (this._direction === 0) {
			if (this._offset === 0) {
				// fully retracted - only start rising once mario is far
				// enough away not to get a cheap sneak hit
				const distance = Math.abs(Inject.puppet.x - this.x);
				if (distance >= SAFE_DISTANCE) this._direction = 1;
				else return;
			} else {
				// fully risen - always retracts next, no distance check
				this._direction = -1;
			}
		}

		this._offset += this._direction * RISE_SPEED;
		if (this._offset >= RISE_DISTANCE) {
			this._offset = RISE_DISTANCE;
			this._direction = 0;
			this._pauseTicks = PAUSE_TICKS;
		} else if (this._offset <= 0) {
			this._offset = 0;
			this._direction = 0;
			this._pauseTicks = PAUSE_TICKS;
		}

		const m = this.tag.querySelector('.m');
		if (m) m.style.bottom = this._offset - RISE_DISTANCE + 'px';
	};

	collide = (from, collisions) => {
		super.collide(from, collisions);

		if (this.dead || !this.emerged) return;
		if (!this.touches(from)) return;

		if (from.starPower) {
			this.defeatByFire();
			return;
		}
		// never a safe stomp, from any direction - matches the original,
		// there's no way to touch this one without star/fire and come
		// away unhurt
		if (from.invincible) return;
		if (from.big) from.shrink();
		else from.die();
	};

	// SMBDIS BoundBoxCtrlData: the plant's own box (ctrl $09) is only 10px
	// wide (3px in from each side) and a 6px band (rows 14..20) of the
	// sprite, measured from its current top - not the whole 16x32 tag. And
	// mario's isn't his whole sprite either: small = 10px wide and the
	// lower 12px (ctrl $01: x 3..13, y 4..16 of the sprite), big = x 2..14,
	// y 8..32 (ctrl $00), a crouching big mario only y 20..32 (ctrl $02).
	// Touching edges count as a hit, like the original's >= compares.
	touches = (from) => {
		let left = 3;
		let right = 13;
		let top = 4;
		let bottom = 16;
		if (from.height > 16) {
			left = 2;
			right = 14;
			top = from.crouching ? 20 : 8;
			bottom = 32;
		}
		return this.touchesBox(from.ax + left, from.ay + top, from.ax + right, from.ay + bottom);
	};

	// the plant's box against any other box, absolute px
	touchesBox = (left, top, right, bottom) => {
		const spriteTop = this.y + (RISE_DISTANCE - this._offset);
		return (
			left <= this.x + 13 &&
			right >= this.x + 3 &&
			top <= spriteTop + 20 &&
			bottom >= spriteTop + 14
		);
	};

	// Fireball.js asks enemies that have their own box (instead of the whole
	// tag) through this - BoundBoxCtrlData ctrl $07, the fireball's own 8x8
	hitByFireball = (fireball) =>
		this.touchesBox(fireball.x, fireball.y, fireball.x + 8, fireball.y + 8);

	// killed by a fireball or star touch, same as any other basic enemy -
	// see Fireball.js, which calls this on any enemy it touches
	defeatByFire = () => {
		if (this.dead) return;
		this.dead = true;
		Inject.audio.play(kickkillSound);
		Inject.hud.addScore(200);
		Inject.hud.showScorePopup(this.tag, '200');
		this.tag.remove();
	};

	reset = () => {
		this.dead = false;
		this.activated = false;
		this._offset = 0;
		this._direction = 0;
		this._pauseTicks = 0;
		this._chompTick = 0;
		this._chompFrame = 0;
		this.tag.classList.remove('frame-1');
		const m = this.tag.querySelector('.m');
		if (m) m.style.bottom = -RISE_DISTANCE + 'px';
		this.originalParent.appendChild(this.tag);
	};

	static setupWebComponent() {
		const { tagName } = this;
		const bgx = 12;

		Collidable.setupWebComponent(tagName, {
			x: 0,
			y: 0,
			render: (tag) => {
				tag.classList += 'Collidable';
				tag.style.position = 'absolute';
				tag.style.width = '16px';
				tag.style.height = '32px';
				tag.style.left = tag.x * 16 + 8 + 'px';
				tag.style.bottom = tag.y * 16 + 'px';
				tag.style.overflow = 'hidden';
				tag.style.zIndex = 2;

				const bgy = tag.underground ? 2 : 0;

				return Collidable.html`
					<style>
						enemy-piranha-plant .m {
							background-image: url('${Assets.enemies}');
							background-position: -${bgx * 16}px -${bgy * 16}px;
							background-repeat: no-repeat;
							position: absolute;
							width: 16px;
							height: 32px;
							bottom: -${RISE_DISTANCE}px;
							left: 0;
						}
						enemy-piranha-plant.frame-1 .m {
							background-position: -${(bgx + 1) * 16}px -${bgy * 16}px;
						}
					</style>
					<div class="m"></div>
				`;
			},
		});
	}
}

export default PiranhaPlant;
