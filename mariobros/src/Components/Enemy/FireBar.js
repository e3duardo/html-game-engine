import Collidable from '~/engine/src/Collidable';
import Enemy from '~/engine/src/Enemy';
import Inject from '~/engine/src/Inject';
import Assets from '../Assets';

// SMBDIS (FirebarSpinSpdData / FirebarSpinDirData / ProcFirebar): the spin
// state is a 16-bit counter, bumped by a per-bar speed every frame; its
// high byte (masked to 5 bits, so 32 steps = one full turn, 11.25deg each)
// is what actually picks where the balls are drawn. $28 (40) per frame is
// the slow bar (~205 frames/turn), $38 (56) the fast one (~146 frames/turn).
// Direction is just add vs. subtract on that same counter.
const STEPS = 32;
const STATE_RANGE = STEPS * 256;
const SPEEDS = { slow: 0x28, fast: 0x38 };
// balls are 8x8 and spaced 8px apart along the bar, starting at the pivot
const BALL_SIZE = 8;
const BALL_SPACING = 8;

// short bar = pivot + 5 balls, long bar = pivot + 11 (see ProcFirebar's $ed)
class FireBar extends Enemy {
	static tagName = 'enemy-fire-bar';

	constructor(tag) {
		super(tag);

		// the tag itself is just the pivot point (0x0, positioned at x/y) -
		// WalkingItem's offsetLeft/offsetTop seed in the constructor is
		// therefore already the pivot's logical position in px, top-left
		// origin like every other object
		this.length = Number(tag.length);
		this.reach = this.length * BALL_SPACING + BALL_SIZE / 2;
		this.spinSpeed = SPEEDS[tag.speed] ?? (Number(tag.speed) || SPEEDS.slow);
		this.spinDirection = tag.direction === 'ccw' ? -1 : 1;
		this.startState = (((Number(tag.start) || 0) / 360) * STATE_RANGE + STATE_RANGE) % STATE_RANGE;
		this.g = tag.querySelector('.g');

		this.resetSpin();
	}

	resetSpin() {
		this._state = this.startState;
		this._step = -1;
		this.updateBalls();
	}

	// the original's firebar never actually touches the "horizontal" steps
	// (8 and 24) for long bars - they bump past them to dodge a pose where
	// the bar would be flat across the player's head height
	get step() {
		let step = Math.floor(this._state / 256) % STEPS;
		if (this.length > 5 && (step === 8 || step === 24)) step++;
		return step;
	}

	// step 0 points straight up and the angle grows clockwise, same as the
	// original's mirror table (right+up, right+down, left+down, left+up)
	ballOffset(index, step) {
		const angle = (step / STEPS) * Math.PI * 2;
		const radius = index * BALL_SPACING;
		return { dx: Math.round(radius * Math.sin(angle)), dy: -Math.round(radius * Math.cos(angle)) };
	}

	updateBalls() {
		const step = this.step;
		if (step === this._step) return;
		this._step = step;
		this.g.style.transform = `rotate(${(step / STEPS) * 360}deg)`;
	}

	// own latch instead of Enemy.isActive(): that one keys off the tag's own
	// (0px) width, but this object really spans `reach` px around its pivot
	isNear = () => {
		const scroll = Inject.scene.scroll_x;
		if (this.x + this.reach < scroll) return false;
		if (this.activated) return true;
		if (this.x - this.reach > scroll + Inject.stage.width + this.activationLookahead) return false;
		this.activated = true;
		return true;
	};

	update = () => {
		if (!this.isNear()) return;
		this._state = (this._state + this.spinDirection * this.spinSpeed + STATE_RANGE) % STATE_RANGE;
		this.updateBalls();
	};

	// called every tick for the player (see Puppet.update), regardless of
	// `collisions` - the bar is rotating balls, not a single box, so it
	// does its own overlap test per ball instead of using Collidable's
	collide = (from, collisions) => {
		if (!this.activated || !from.die || from.dying || from.winning) return;
		// star mario is skipped entirely (FirebarCollision bails on
		// StarInvincibleTimer) - not killed by it, but not hurt either
		if (from.starPower || from.invincible) return;

		const half = BALL_SIZE / 2;
		const step = this._step;
		for (let i = 0; i <= this.length; i++) {
			const { dx, dy } = this.ballOffset(i, step);
			const bx = this.x + dx - half;
			const by = this.y + dy - half;
			if (
				from.ax < bx + BALL_SIZE &&
				from.ax + from.width > bx &&
				from.ay < by + BALL_SIZE &&
				from.ay + from.height > by
			) {
				if (from.big) from.shrink();
				else from.die();
				return;
			}
		}
	};

	reset = () => {
		this.activated = false;
		this.resetSpin();
	};

	static setupWebComponent() {
		const { tagName } = this;
		const bgx = 6;
		const bgy = 9;

		// x/y are the pivot (centre of the first ball) in tile units,
		// y counted from the bottom like every other component - a firebar
		// sitting on a hard block wants x/y at that block's centre, e.g.
		// x="5.5" y="3.5" for the block at tile (5, 3)
		// direction: 'cw' | 'ccw'. speed: 'slow' | 'fast' or the raw
		// per-frame spin counter increment. start: initial angle in degrees
		// clockwise from straight up. length: balls beyond the pivot (5
		// short, 11 long)
		Collidable.setupWebComponent(tagName, {
			x: 0,
			y: 0,
			length: 5,
			direction: 'cw',
			speed: 'slow',
			start: 0,
			render: (tag) => {
				tag.classList += 'Collidable';
				tag.style.position = 'absolute';
				tag.style.width = '0px';
				tag.style.height = '0px';
				tag.style.left = (tag.x * 16) + 'px';
				tag.style.bottom = (tag.y * 16) + 'px';
				tag.style.zIndex = 3;

 8				// TODO: swap the placeholder ball for the firebar tile in tileset.png
				return Collidable.html`
					<style>
						${tagName} .g {
							position: absolute;
							left: 0;
							top: 0;
							width: 0;
							height: 0;
						}
						${tagName} .m {
							position: absolute;
							left: -${BALL_SIZE / 2}px;
							width: ${BALL_SIZE}px;
							height: ${BALL_SIZE}px;
							background-image: url('${Assets.items}');
							background-position: -${(bgx * 16)}px -${(bgy * 16)+8}px;
							background-repeat: no-repeat;
						}
					</style>
					<div class="g">
						${Array.from(Array(Number(tag.length) + 1)).map((_, i) => `<div class="m" style="top: ${-i * BALL_SPACING - BALL_SIZE / 2}px"></div>`)}
					</div>
				`;
			},
		});
	}
}

export default FireBar;
