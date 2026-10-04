import Collidable from '~/engine/src/Collidable';
import Enemy from '~/engine/src/Enemy';
import Inject from '~/engine/src/Inject';
import Assets from '../Assets';
import kickkillSound from '../../../sounds/kickkill.wav';

// SMBDIS (ProcBowserFlame): every frame the flame moves 1px left plus a
// 0x40/256 movement-force remainder, i.e. 1.25px/tick, and flips its sprite
// vertically every 2 frames. It ignores the level geometry entirely.
// (Secondary hard mode uses 0x60 -> 1.375px/tick, not modelled.)
const SPEED = 1.25;
const FLIP_TICKS = 2;
// BoundBoxCtrlData entry $08: a small 4x4 box inside the 16x8 sprite, not
// the whole thing - (left, top, right, bottom) offsets from the sprite's
// top-left corner
const HIT = { left: 6, top: 4, right: 10, bottom: 8 };

// Bowser's flame, as a plain enemy for now - flies left from wherever it's
// placed, hurts on touch, and goes away once it leaves the screen. Bowser
// itself (spawn from his mouth, the Y-target wobble towards FlameYPosData)
// isn't modelled yet.
class KoopaFire extends Enemy {
	static tagName = 'enemy-koopa-fire';

	constructor(tag) {
		super(tag);

		this.speedX = 0;
		this._tick = 0;
		this.defaultX = this.x;
		this.defaultY = this.y;
	}

	update = () => {
		if (this.dead) return;
		if (!this.isActive()) {
			// scrolled past the left edge for good - the original frees the
			// slot; hide it the same way the other enemies do
			if (this.activated) this.remove_();
			return;
		}

		this.x = this.x - SPEED;

		this._tick++;
		if (this._tick >= FLIP_TICKS) {
			this._tick = 0;
			this.tag.classList.toggle('flip');
		}
	};

	collide = (from, collisions) => {
		if (this.dead || !this.activated || !from.die || from.dying || from.winning) return;

		const hx = this.x + HIT.left;
		const hy = this.y + HIT.top;
		const touching =
			from.ax < this.x + HIT.right &&
			from.ax + from.width > hx &&
			from.ay < this.y + HIT.bottom &&
			from.ay + from.height > hy;
		if (!touching) return;

		// star mario kills it like any other enemy (EColl -> ShellOrBlockDefeat)
		if (from.starPower) {
			Inject.audio.play(kickkillSound);
			this.remove_();
			return;
		}
		if (from.invincible) return;
		if (from.big) from.shrink();
		else from.die();
	};

	// Fireball.js calls this on any enemy it touches - the original's
	// flame is immune to mario's fireballs, so deliberately absent here

	remove_ = () => {
		this.dead = true;
		this.tag.remove();
	};

	reset = () => {
		this.dead = false;
		this.activated = false;
		this._tick = 0;
		this.tag.classList.remove('flip');
		this.x = this.defaultX;
		this.y = this.defaultY;
		this.originalParent.appendChild(this.tag);
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
				tag.style.height = '8px';
				tag.style.left = tag.x * 16 + 'px';
				tag.style.bottom = tag.y * 16 + 'px';
				tag.style.zIndex = 2;

				// TODO: swap the placeholder flame for its sprite in enemies.png
				return Collidable.html`
					<style>
						${tagName} .m {
							position: absolute;
							left: 0;
							top: 0;
							width: 16px;
							height: 8px;
							border-radius: 60% 20% 20% 60% / 50%;
							background: linear-gradient(90deg, #fc7460, #fcbcb0 60%, #fff);
						}
						${tagName}.flip .m {
							transform: scaleY(-1);
						}
					</style>
					<div class="m"></div>
				`;
			},
		});
	}
}

export default KoopaFire;
