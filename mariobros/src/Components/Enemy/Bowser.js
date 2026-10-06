import Collidable from '~/engine/src/Collidable';
import Enemy from '~/engine/src/Enemy';
import Inject from '~/engine/src/Inject';
import Assets from '../Assets';
import fireSound from '../../../sounds/fire.wav';
import fallSound from '../../../sounds/bowserfall.wav';
import kickkillSound from '../../../sounds/kickkill.wav';

// Everything below comes from SMBDIS (RunBowser / BowserControl / ChkFireB /
// InitBowser / HurtBowser). One frame of the original = one tick here (60),
// and level/NES pixel coordinates coincide (floor top at 208 in both), so
// pixel values are used as-is. The original keeps Bowser as two 16px halves
// (the "front"/head object and a "rear" one 16px behind it); this is one 32px
// element instead, positioned from the front object's x.
const HIT_POINTS = 5;
// vertical: MoveEnemySlowVert - gravity $0f/256 per frame, max speed 2
const GRAVITY = 15 / 256;
const MAX_FALL = 2;
const JUMP_SPEED = -2;
// he stands with his top at y=$80 (feet on the bridge, 160); once at/below
// that his jump timer is re-rolled, and while it's running he doesn't fall
const GROUND_Y = 0x80;
const JUMP_WAITS = [0x21, 0x41, 0x11, 0x31]; // PRandomRange (also MaxRangeFromOrigin)
// horizontal: only every 4th frame, by BowserMovementSpeed
const START_SPEED = 2;
// feet animation toggles every 32 frames (while the mouth is closed)
const FEET_TICKS = 0x20;
// fire breathing: BowserFireBreathTimer starts at $df, flips the mouth
// every expiry, and the flame leaves when it closes again. The wait before
// the next opening is FlameTimerData[n++ & 7].
const FIRST_BREATH = 0xdf;
const MOUTH_OPEN_TICKS = 0x20;
const FLAME_WAITS = [0xbf, 0x40, 0xbf, 0xbf, 0xbf, 0x40, 0x40, 0xbf];
const FLAME_Y = [0x90, 0x80, 0x70, 0x90]; // FlameYPosData
const MOUTH_X = -14; // flame spawns 14px left of the front object...
const MOUTH_Y = 8; // ...and 8px below its top
// BoundBoxCtrlData entry $0a, per half: x 0..16, y 2..21 - so across both
// halves, the full 32px width and a 19px-tall band
const HIT_TOP = 2;
const HIT_BOTTOM = 21;
const WIDTH = 32;
const HEIGHT = 32;
// FireBall hit with no hit points left: SetupFloateyNumber #$09 / a star
// touch uses the generic defeat score (#$02)
const FIRE_SCORE = 5000;
const STAR_SCORE = 200;
// still being above this means he hasn't fallen out of the level yet
const GONE_Y = 0xe0;

// sprite sheet: enemies.png. TODO: point these at Bowser's real tiles - each
// pose is 32px wide (2 tiles), laid out left to right as walk frame 0, walk
// frame 1, mouth open (see setupWebComponent). Art faces left, mirrored via
// the `right` class when he faces right.
const SPRITE_BGX = 41;
const SPRITE_BGY = 0;

class Bowser extends Enemy {
	static tagName = 'enemy-bowser';

	constructor(tag) {
		super(tag);

		// the original keeps Bowser around until every flame he made is
		// gone too (KillAllEnemies) - this is only the activation window
		this.defaultX = this.x;
		this.defaultY = this.y;
		this.revealsAs = tag.getAttribute('reveals');
		this.resetState();
	}

	resetState() {
		this.frozen = false;
		this.onGone = null;
		this.dead = false;
		this.defeated = false;
		this.hitPoints = HIT_POINTS;
		this._frame = 0;
		this.originX = this.x;
		this.maxRange = JUMP_WAITS[0];
		this.moveSpeed = START_SPEED;
		this.facingRight = false;
		this.feetTimer = FEET_TICKS;
		this.feetFrame = 0;
		this.mouthOpen = false;
		this.breathTimer = FIRST_BREATH;
		this.flameIndex = 0;
		this.jumpTimer = JUMP_WAITS[0];
		this.speedYFall = 0;
		this.tag.classList.remove('right', 'open', 'frame-1', 'defeated', 'revealed');
	}

	reset = () => {
		this.activated = false;
		this.resetState();
		this.x = this.defaultX;
		this.y = this.defaultY;
		this.originalParent.appendChild(this.tag);
	};

	// the x the original calls Bowser's position: the front object. Facing
	// left (default) that's the element's own left edge; facing right the
	// body is the half before it
	get headX() {
		return this.facingRight ? this.x + 16 : this.x;
	}

	randomWait = () => JUMP_WAITS[Math.floor(Math.random() * JUMP_WAITS.length)];

	update = () => {
		if (this.dead) return;
		if (this.defeated) {
			this.fall();
			return;
		}
		if (this.frozen || !this.isActive()) return;

		this._frame++;
		if (this.jumpTimer > 0) this.jumpTimer--;
		if (this.breathTimer > 0) this.breathTimer--;

		// the mouth being open freezes the whole walking/facing block
		// (ChkMouth -> HammerChk)
		if (!this.mouthOpen) this.walkAndFace();
		this.jumpAndFall();
		this.breathe();
		this.render();
	};

	walkAndFace = () => {
		this.feetTimer--;
		if (this.feetTimer <= 0) {
			this.feetTimer = FEET_TICKS;
			this.feetFrame = this.feetFrame === 0 ? 1 : 0;
		}
		// back to facing left every 16 frames
		if (this._frame % 16 === 0) this.facingRight = false;

		// B_FaceP: while the jump timer is running and mario is to his
		// right, turn towards him and charge for a moment
		if (this.jumpTimer > 0 && this.headX < Inject.puppet.x) {
			this.facingRight = true;
			this.moveSpeed = 2;
			this.jumpTimer = 0x20;
			this.breathTimer = 0x20;
			// too far right on screen (x >= $c8): no stepping this frame
			if (this.headX - Inject.scene.scroll_x >= 0xc8) return;
		}

		if (this._frame % 4 !== 0) return;
		if (this.headX === this.originX) this.maxRange = this.randomWait();
		this.x += this.moveSpeed;
		if (this.facingRight) return;
		// wandering: drift out to MaxRangeFromOrigin either side of where he
		// started, then turn around
		let diff = this.headX - this.originX;
		let toward = -1;
		if (diff < 0) {
			diff = -diff;
			toward = 1;
		}
		if (diff >= this.maxRange) this.moveSpeed = toward;
	};

	jumpAndFall = () => {
		if (this.jumpTimer === 0) {
			// MoveEnemySlowVert
			this.y += this.speedYFall;
			this.speedYFall = Math.min(MAX_FALL, this.speedYFall + GRAVITY);
			if (this.y >= GROUND_Y) this.jumpTimer = this.randomWait();
		} else if (this.jumpTimer === 1) {
			// MakeBJump
			this.y -= 1;
			this.speedYFall = JUMP_SPEED;
		}
	};

	// BowserFireBreathTimer: expiry opens the mouth (32 frames), the next
	// closes it and a flame leaves
	breathe = () => {
		if (this.breathTimer > 0) return;
		this.breathTimer = MOUTH_OPEN_TICKS;
		this.mouthOpen = !this.mouthOpen;
		if (this.mouthOpen) return;
		this.breathTimer = FLAME_WAITS[this.flameIndex++ & 7];
		this.spitFlame();
	};

	spitFlame = () => {
		const targetY = FLAME_Y[Math.floor(Math.random() * FLAME_Y.length)];
		const flame = Inject.scene.spawn('enemy-koopa-fire', { x: 0, y: 0 });
		flame.x = this.headX + MOUTH_X;
		flame.y = this.y + MOUTH_Y;
		flame.targetY = targetY;
		Inject.audio.play(fireSound);
	};

	render = () => {
		this.tag.classList.toggle('right', this.facingRight);
		this.tag.classList.toggle('open', this.mouthOpen);
		this.tag.classList.toggle('frame-1', this.feetFrame === 1);
	};

	collide = (from, collisions) => {
		if (this.dead || this.defeated || !this.activated) return;
		if (!from.die || from.dying || from.winning) return;

		const touching =
			from.ax < this.x + WIDTH &&
			from.ax + from.width > this.x &&
			from.ay < this.y + HIT_BOTTOM &&
			from.ay + from.height > this.y + HIT_TOP;
		if (!touching) return;

		// ShellOrBlockDefeat: a star touch defeats anything it touches
		if (from.starPower) {
			this.defeat(STAR_SCORE, false);
			return;
		}
		// never stompable (cpy #$15 bcs InjurePlayer): any touch hurts
		if (from.invincible) return;
		if (from.big) from.shrink();
		else from.die();
	};

	// Fireball.js calls this on every enemy it touches (and removes the
	// fireball itself): it costs a hit point, the last one defeats him
	defeatByFire = () => {
		if (this.dead || this.defeated) return;
		if (--this.hitPoints > 0) return;
		this.defeat(FIRE_SCORE, true);
	};

	defeat = (score, byFire) => {
		this.defeated = true;
		this.speedYFall = JUMP_SPEED; // jumps a little on the way down
		Inject.audio.play(fallSound);
		Inject.hud.addScore(score);
		Inject.hud.showScorePopup(this.tag, String(score));
		// worlds 1-3: it was never Bowser (BowserIdentities) - revealed
		// as whatever `reveals` names
		this.tag.classList.add(this.revealsAs && byFire ? 'revealed' : 'defeated');
		if (byFire) this.tag.classList.add('defeated');
		this.tag.classList.remove('open');
	};

	// the axe was grabbed while he's still alive: he stops where he is
	// (the original just draws him, BowserControl no longer runs) until the
	// bridge is gone, then drops with it - `onGone` fires once he's out of
	// the level
	freezeForEnding = () => {
		this.frozen = true;
		this.tag.classList.remove('open');
	};

	dropWithBridge = (onGone) => {
		this.frozen = false;
		this.onGone = onGone;
		this.defeated = true;
		this.speedYFall = 0;
		Inject.audio.play(fallSound);
		this.tag.classList.add('defeated');
	};

	// MoveD_Bowser: falls (no collisions) until below the screen; then
	// KillAllEnemies - whatever flames are still flying go with him
	fall = () => {
		this.y += this.speedYFall;
		this.speedYFall = Math.min(MAX_FALL, this.speedYFall + GRAVITY);
		if (this.y < GONE_Y) return;
		this.dead = true;
		Inject.scene.collisionMap.forEach((object) => {
			if (object.enemy && object !== this && !object.dead) {
				object.dead = true;
				object.tag.remove();
			}
		});
		this.tag.remove();
		if (this.onGone) this.onGone();
	};

	static setupWebComponent() {
		const { tagName } = this;

		Collidable.setupWebComponent(tagName, {
			x: 0,
			y: 5,
			reveals: '',
			render: (tag) => {
				tag.classList += 'Collidable';
				tag.style.position = 'absolute';
				tag.style.width = WIDTH + 'px';
				tag.style.height = HEIGHT + 'px';
				tag.style.left = tag.x * 16 + 'px';
				tag.style.bottom = tag.y * 16 + 'px';
				tag.style.zIndex = 2;

				const pose = (n) => `-${(SPRITE_BGX + n * 2) * 16}px -${SPRITE_BGY * 16}px`;

				return Collidable.html`
					<style>
						${tagName} .m {
							background-image: url('${Assets.enemies}');
							background-position: ${pose(0)};
							background-repeat: no-repeat;
							position: absolute;
							width: ${WIDTH}px;
							height: ${HEIGHT}px;
							top: 0;
							left: 0;
						}
						${tagName}.frame-1 .m { background-position: ${pose(1)}; }
						${tagName}.open .m { background-position: ${pose(2)}; }
						/* the art faces left - mirrored when he faces right */
						${tagName}.right .m { transform: scaleX(-1); }
						${tagName}.defeated .m { transform: scaleY(-1); }
						${tagName}.right.defeated .m { transform: scale(-1, -1); }
						/* a defeated fake Bowser: the creature it really was (a
						   goomba, enemies.png column 0, row 1). TODO: other worlds */
						${tagName} .r { display: none; }
						${tagName}.revealed .m { display: none; }
						${tagName}.revealed .r {
							display: block;
							position: absolute;
							left: 8px;
							top: 16px;
							width: 16px;
							height: 16px;
							background-image: url('${Assets.enemies}');
							background-position: 0 -16px;
							background-repeat: no-repeat;
							transform: scaleY(-1);
						}
					</style>
					<div class="m"></div>
					<div class="r"></div>
				`;
			},
		});
	}
}

export default Bowser;
