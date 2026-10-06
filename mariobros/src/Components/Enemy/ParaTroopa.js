import Inject from '~/engine/src/Inject';
import { stepKnockedOff } from '../../knockOff';
import KoopaTroopa from './KoopaTroopa';
import kickkillSound from '../../../sounds/kickkill.wav';

// SMBDIS (InitRedPTroopa / MoveRedPTroopa / ImposeGravity): the red
// paratroopa never walks or falls, it only moves vertically around a
// "central" Y - 48px below where it was placed (32px above instead, if it
// starts in the lower half of the screen). Each frame it accelerates
// towards that center by 3/256 px/frame^2 (down: +3, up: -(6-3)), capped
// at 2px/frame, which is a slow ~6s bob with a 48px amplitude.
const RED_ACCEL = 3 / 256;
const RED_MAX_SPEED = 2;
const RED_CENTER_DOWN = 48;
const RED_CENTER_UP = -32;
// green paratroopa (JumpGreen): hops forever, walking left. The original
// is v=-3 against 0x1c/256 gravity (~41px apex); the same apex under this
// engine's gravity needs a bigger impulse.
const GREEN_JUMP = -6.4;
// SetupFloateyNumber #$03 on a stomp that demotes it
const DEMOTE_SCORE = 400;

class ParaTroopa extends KoopaTroopa {
	static tagName = 'enemy-para-troopa';
	static bgx = 8; // TODO: swap for the paratroopa's own sprite column in enemies.png

	constructor(tag) {
		super(tag);

		this.flying = true;
		this.red = tag.getAttribute('red') === 'true';
		this._speedYFly = 0;
		this._centerY = this.y < 128 ? this.y + RED_CENTER_DOWN : this.y + RED_CENTER_UP;
		if (!this.red) {
			this.bounceOnLand = true;
			this.bounceImpulse = GREEN_JUMP;
		}

		// KoopaTroopa's update/collide/reset are instance fields, not
		// prototype methods - capture them to delegate to once demoted
		const walkingUpdate = this.update;
		const walkingCollide = this.collide;
		const walkingReset = this.reset;

		this.update = () => {
			if (this.knocked) return stepKnockedOff(this);
			if (!this.flying) return walkingUpdate();
			if (this.dead || !this.isActive()) return;

			if (this.red) {
				this.speedX = 0;
				this._speedYFly += this.y < this._centerY ? RED_ACCEL : -RED_ACCEL;
				this._speedYFly = Math.max(-RED_MAX_SPEED, Math.min(RED_MAX_SPEED, this._speedYFly));
				this.y = this.y + this._speedYFly;
			} else {
				this.walk();
			}
			this.animateWalk();
		};

		this.collide = (from, collisions) => {
			if (!this.flying || this.dead || !this.isActive()) return walkingCollide(from, collisions);
			if (from.starPower && (collisions.top || collisions.bottom || collisions.left || collisions.right)) {
				this.defeatByFire();
				return;
			}
			if (collisions.bottom || this.landedOn(from)) {
				this.demote(from);
				return;
			}
			if (collisions.top || collisions.left || collisions.right) {
				if (from.invincible) return;
				if (from.big) from.shrink();
				else from.die();
			}
		};

		const walkingBump = this.bumpedFromBelow;
		this.bumpedFromBelow = () => {
			this.flying = false;
			this.bounceOnLand = false;
			this.tag.classList.add('demoted');
			walkingBump();
		};

		this.reset = () => {
			walkingReset();
			this.flying = true;
			this._speedYFly = 0;
			this.speedY = 0;
			this.tag.classList.remove('demoted', 'right');
		};
	}

	// stomped while flying: loses its wings and becomes an ordinary walking
	// koopa (same object, same color) instead of a shell
	demote = (from) => {
		this.flying = false;
		this.bounceOnLand = false;
		this.speedX = -this.walkSpeed;
		this.speedY = 0;
		this.tag.classList.add('demoted');
		Inject.audio.play(kickkillSound);
		from.speedY = -4;
		Inject.hud.addScore(DEMOTE_SCORE);
		Inject.hud.showScorePopup(this.tag, String(DEMOTE_SCORE));
	};
}

export default ParaTroopa;
