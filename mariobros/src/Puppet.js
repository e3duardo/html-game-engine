import Inject from '~/engine/src/Inject';
import { pausableTimeout, clearPausableTimeout } from './pausableTimeout';
import Puppet from '~/engine/src/Puppet';
import { scriptedWalk } from '~/engine/src/Sequences';
import fixedStepRaf from '~/engine/src/fixedStepRaf';
import castleCelebration from './castleCelebration';
import ToadMessage from './Components/Screen/ToadMessage';

import deathSound from '../sounds/death.wav';
import fireballSound from '../sounds/fireball.wav';
import flagpoleSound from '../sounds/flagpole.wav';
import groundTheme from '../sounds/groundtheme.mp3';
import groundThemeHurry from '../sounds/groundtheme-hurry.mp3';
import hurrySound from '../sounds/hurryup.wav';
import invincibilityTheme from '../sounds/invincibility.mp3';
import jumpBigSound from '../sounds/jump.wav';
import jumpSmallSound from '../sounds/jumpsmall.wav';
import levelCompleteTheme from '../sounds/levelcomplete.mp3';
// this exact same sound is reused for both entering/leaving a pipe and
// getting hit while big/fire - see Pipe.js for the other use of this same
// file
import pipePowerDownSound from '../sounds/pipepowerdown.wav';

// SMB1's chained-stomp scoring: consecutive enemy kills from landing
// directly on top of one - without mario's feet touching solid ground in
// between - escalate 100, 200, 400, 500, 800, 1000, and every kill from
// the 6th one on also grants an extra life. Only a direct stomp counts - a
// kick, a fireball, or a sliding shell hitting another enemy award their
// own flat score instead (see Goomba.js/KoopaTroopa.js). See
// awardStompScore() below.
const COMBO_SCORE = [100, 200, 400, 500, 800, 1000];

// mirrors marioworld/src/Mario.js's role: the one place SuperMarioBros.js
// instantiates as Inject.puppet, subclassing the generic engine Puppet.
// Unlike marioworld's Mario, this class owns a LOT more than just sound
// effects: SMB1's power-up system (small/big/fire), star power, the
// combo-stomp score table, and the flagpole/castle win sequence all used to
// live in the generic engine Puppet - none of it is something any platformer
// built on this engine necessarily has (marioworld's own Mario has no
// power-ups or win condition at all today), so it belongs here instead. See
// Mushroom.js/Flower.js/Brick.js/Coin.js/Question.js for the rest of the SFX
// hookups, and SuperMarioBros.js's own gameOver() override for the
// game-over jingle.
class MarioPuppet extends Puppet {
	constructor(tag) {
		super(tag);
		// the original's "hurry up" event: once the on-screen timer counts
		// down to 100, a short stinger plays and the level theme switches to
		// a faster-tempo version for the rest of the attempt - reset on every
		// respawn (see respawnPlayer() below) since dying restarts the clock
		// back to 400, same as the original never carrying the hurry state
		// across a death
		this.hurryActive = false;

		// looser than engine Puppet.js's own defaults (still there for
		// marioworld's Mario) - measured this session (see this._jumpPhysics's
		// own Playwright timing capture) that the real bottleneck behind
		// "controls feel stuck" was never input lag (locked 60fps, ~1-frame
		// reaction on both walk and jump) but the ~0.7s/0.75s walk/run
		// ramp-up from a standstill to top speed - genuinely how the NES original feels,
		// but not what was asked for here. Roughly 3x both, at the user's
		// explicit request to trade some of that momentum for a snappier,
		// more modern response; top speed itself (maxSpeedX, and the
		// speed-banded jump arcs keyed off it) is untouched.
		// fidelity pass: integer ramp (152 / 228 over 256,
		// in 1/16 px per frame^2) so recorded inputs replay the same - the 3x
		// snappier values were 0.111 / 0.167
		this.intPhysics = true;
		this.walkAccel = 0.0371;
		this.runAccel = 0.0557;
		// gravity caps the fall at 4 px/frame (+ a force byte that resets at
		// 128), so it oscillates between 4 and 4.5 - 4.25 on average
		this.speed_limit_y = 4.25;

		// the power-up mario is currently holding: null (small), 'super'
		// (big), or 'fire'. What a power-up actually grants is read from
		// this state elsewhere (e.g. `big` below, which is also what lets
		// bricks be broken) - see grow()/becomeFire()/shrink().
		this.powerUp = null;
		// star power-up (see activateStarPower) - unlike `invincible` below
		// (a brief no-op grace window after shrinking), this makes touching
		// an enemy actively kill it, checked first in Goomba/KoopaTroopa
		this.starPower = false;
		this._starPowerTimeout = null;
		this.invincible = false;

		// the NES B button double-duties as both "hold to run" and "press to
		// throw a fireball" - Control already emits a KeyEvent on every real
		// (non-repeat) keydown/keyup, so the rising edge of the same 'shift'
		// key already mapped to running is reused here instead of adding a
		// dedicated fire button.
		// kept so destroy() can drop it - a Router scene swap builds a new
		// Puppet per scene, and a listener left behind by the old one would
		// keep throwing fireballs (and playing the sound) from its own
		// stale powerUp forever
		this._unsubscribeFire = Inject.events.subscribe((event) => {
			if (event.type == 'key' && event.data.key == 'shift' && event.data.pressed) {
				this.throwFireball();
			}
		});
	}

	destroy() {
		if (this._unsubscribeFire) this._unsubscribeFire();
		this._unsubscribeFire = null;
	}

	// `big` is the size/ability shared by every power-up beyond small
	// ('super' or 'fire') - a getter (not its own field) so `this.powerUp`
	// stays the one source of truth for what mario is currently holding
	get big() {
		return this.powerUp == 'super' || this.powerUp == 'fire';
	}

	// which background track should currently be looping - read by
	// SuperMarioBros.js (starting a life/respawn) and endStarPower() below
	// (returning from the invincibility theme), so both agree on whether
	// the hurry-up swap already happened this life
	currentLevelTheme() {
		return this.hurryActive ? groundThemeHurry : groundTheme;
	}

	// called from SuperMarioBros.js's countdown once Inject.hud.time hits
	// 100 - the stinger plays out in full before the faster theme takes
	// over, same as winLevel()'s flagpole/level-complete handoff below
	triggerHurryUp() {
		if (this.hurryActive || this.dying || this.winning) return;
		this.hurryActive = true;
		Inject.audio.stopBackground();
		Inject.audio.play(hurrySound).then((duration) => {
			setTimeout(
				() => Inject.audio.playBackground(this.currentLevelTheme()),
				(duration || 0) * 1000
			);
		});
	}

	// a regular method (not an arrow field, see engine Puppet.js) so the
	// power-up/star-power/hurry-up state can be reset here, before calling
	// super() (which itself calls animation('right') - that has to see the
	// already-reset powerUp/starPower/invincible, see animation() below, or
	// it'd draw one leftover frame of the previous life's size/status).
	respawnPlayer() {
		this.hurryActive = false;
		this.powerUp = null;
		this.tag.style.height = '16px';
		this._crouchShrunk = false;
		this.invincible = false;
		clearPausableTimeout(this._starPowerTimeout);
		this.starPower = false;
		this.tag.classList.remove('star-power');
		super.respawnPlayer();
		// dying restarts the whole level attempt from the beginning, so the
		// clock goes back to its starting value too - it's not a checkpoint
		Inject.hud.time = 400;
		// 1-2's own start is a decorative castle-init walk-up into a pipe
		// (see World2.js's openingCutscene/walkIntoPipe), not a
		// real checkpoint - it only ever plays once, right after boot.
		// Dying mid-level instead respawns straight at the underground
		// entrance, reusing the exact same exit-a warp the intro pipe
		// itself lands on (falls in from above, camera locked the same
		// way), rather than super's generic "back to defaultX/defaultY,
		// scroll 0" reset, which would otherwise put mario back at the
		// castle-init spot with the underground section not even loaded
		// into view.
		if (Inject.hud.stage === 12) {
			Inject.scene.warp('exit-a', this);
		}
	}

	// the jump's strength and gravity while rising/falling both depend on
	// how fast mario's going *at takeoff*, not one fixed arc for every jump
	// - walking into a jump is weaker and floatier than running into one.
	// These 3 tables are indexed 0-4 by 5 speed bands (breakpoints, in
	// 1/16px, converted below to this engine's px/tick speedX) - and a
	// version of this table kept here earlier had wrongly collapsed bands
	// 0-2 into one, reusing band 0's weakest values for the whole
	// 0-1.5625 walking range. Below 1.0px/tick uses that weakest jump
	// (impulse 4, riseGravity 0x20/256); from 1.0 up to 1.5625 (band 2 -
	// most of a normal walking approach, not just a barely-moving one)
	// it's already noticeably taller (riseGravity 0x1e/256, ~68px
	// continuous max vs ~64px) - which is exactly the difference between
	// comfortably clearing a size="4" (64px) pipe on a normal walking
	// approach and not, confirmed by isolated Playwright testing (real
	// keyboard-driven walk + jump, not teleported/scripted) both before
	// and after this fix. Bands 3-4 (and the merged 0-1) share identical
	// values, hence only 4 distinct rows below instead of 5.
	static JUMP_PHYSICS = [
		{ maxSpeed: 1.0, impulse: 4, riseGravity: 0x20 / 256, fallGravity: 0x70 / 256 },
		{ maxSpeed: 1.5625, impulse: 4, riseGravity: 0x1e / 256, fallGravity: 0x60 / 256 },
		{ maxSpeed: 1.75, impulse: 5, riseGravity: 0x28 / 256, fallGravity: 0x90 / 256 },
		{ maxSpeed: Infinity, impulse: 5, riseGravity: 0x28 / 256, fallGravity: 0x90 / 256 },
	];

	// jump impulse and rise/fall force bytes, indexed by the
	// walking speed at takeoff (in 1/16 px: <9, <16, <25, <28, faster)
	static INT_JUMP = [
		{ impulse: 4, rise: 0x20, fall: 0x70 },
		{ impulse: 4, rise: 0x20, fall: 0x70 },
		{ impulse: 4, rise: 0x1e, fall: 0x60 },
		{ impulse: 5, rise: 0x28, fall: 0x90 },
		{ impulse: 5, rise: 0x28, fall: 0x90 },
	];

	jump() {
		this._jumpPhysics = MarioPuppet.JUMP_PHYSICS.find((p) => Math.abs(this.speedX) < p.maxSpeed);
		if (this.intPhysics) {
			const a = this._xAbs | 0;
			const band = a < 0x09 ? 0 : a < 0x10 ? 1 : a < 0x19 ? 2 : a < 0x1c ? 3 : 4;
			const j = MarioPuppet.INT_JUMP[band];
			this._jumpConsumed = true;
			this._intJump(j.impulse, j.rise, j.fall);
			Inject.audio.play(this.big ? jumpBigSound : jumpSmallSound);
			return;
		}
		super.jump();
		Inject.audio.play(this.big ? jumpBigSound : jumpSmallSound);
	}

	jumpImpulse() {
		return this._jumpPhysics ? this._jumpPhysics.impulse : super.jumpImpulse();
	}

	// small mario can never duck at all - only big/fire mario can (see
	// engine Puppet.js's canCrouch()/update()).
	canCrouch() {
		return this.big;
	}

	// SMBDIS BoundBoxCtrlData: a crouching big mario's box is only the lower
	// 12px of his 32px sprite (ctrl $02), which is what lets him slide under
	// a 1-tile gap. Here that means the real box shrinks to 16px - tag height
	// and y, feet planted - while Down is held, and grows back after.
	syncCrouch() {
		if (this.crouching && this.big && !this._crouchShrunk) {
			this._crouchShrunk = true;
			this.tag.style.height = '16px';
			this._shiftY(16);
		} else if (!this.crouching && this._crouchShrunk) {
			this._endCrouchShrink();
		}
	}

	_endCrouchShrink() {
		if (!this._crouchShrunk) return;
		this._crouchShrunk = false;
		this.tag.style.height = '32px';
		this._shiftY(-16);
	}

	// SMBDIS ImposeFriction / FrictionData: while he can't steer (Down held on
	// the ground) friction is the original's - $d0/256 of a 1/16px unit per
	// frame above $21 units/frame (~2.06px/frame), $98 below - so a run into
	// a slide carries on for ~75px. The ordinary coast after letting go keeps
	// the snappier feel the controls were tuned to (see walkAccel above).
	coastFriction() {
		if (this.canSteer(true)) return super.coastFriction();
		return Math.abs(this.speedX) >= 2.0625 ? 0.0508 : 0.0371;
	}

	// letting go of B while running: the excess over the walking top speed
	// goes away at the original's friction rate (see above)
	overspeedFriction() {
		return Math.abs(this.speedX) >= 2.0625 ? 0.0508 : 0.0371;
	}

	// standing needs the 16px above his crouched head to be free
	// Collision box (x0, y0, x1, y1 inside the 16px-wide cell): small 3,20,13,32 -
	// 10x12 planted at the bottom of the cell; big 2,8,14,32 - 12x24;
	// big crouching 2,20,14,32 - 12x12. Here the tag is 16 tall when
	// small or crouching (feet at the bottom) and 32 when big.
	hitBox() {
		if (!this.big) return { l: 3, t: 4, w: 10, h: 12 };
		if (this._crouchShrunk) return { l: 2, t: 4, w: 12, h: 12 };
		return { l: 2, t: 8, w: 12, h: 24 };
	}

	// BlockBuffer_X_Adder / Y_Adder rows for the player (see engine _intBG).
	// small and crouching share one set, big another; the tag of a small or
	// crouched mario is 16px tall at the bottom of the 32px cell
	bgProbes() {
		if (!this.big || this._crouchShrunk) {
			return { offY: 16, headX: 8, headY: 0x12, upperExt: 0x10, feetX: [3, 12], feetY: 32, sideX: [2, 13], sideY: [24, 24, 24, 24] };
		}
		return { offY: 0, headX: 8, headY: 4, upperExt: 0x20, feetX: [3, 12], feetY: 32, sideX: [2, 13], sideY: [8, 24, 8, 24] };
	}

	canStandUp() {
		if (!this._crouchShrunk) return true;
		return !Inject.scene.collisionMap.some(
			(o) =>
				o.scenario &&
				!o.dead &&
				o.border.bottom == 'solid' &&
				this.x + this.width > o.x + 1 &&
				this.x < o.x + o.width - 1 &&
				o.y < this.y &&
				o.y + o.height > this.y - 16
		);
	}

	// SMBDIS PlayerCtrlRoutine: holding Down on the ground while Left/Right
	// are held wipes the directional bits for that frame - at any size, not
	// just while crouching - so mario can't steer or accelerate, he just
	// coasts on whatever speed he had (the slide under low gaps in 1-2)
	canSteer(grounded) {
		return !(grounded && Inject.control.down);
	}

	// no onGround-based clearing here on purpose: onGround isn't updated to
	// its real value until *later* in the same tick's collision pass (see
	// engine Puppet.js's update()), so checking it right here - straight
	// after jump() just set _jumpPhysics earlier in this same tick - would
	// see the previous tick's stale "true" and immediately wipe out the
	// band before it's ever used. Leaving a stale band around while
	// genuinely resting on the ground is harmless (the collision pass
	// clamps speedY back to 0 every tick regardless of what gravity value
	// this returns), and jump() always overwrites it fresh on the next
	// real jump anyway.
	currentGravity(rising) {
		if (!this._jumpPhysics) return super.currentGravity(rising);
		return rising && Inject.control.a
			? this._jumpPhysics.riseGravity
			: this._jumpPhysics.fallGravity;
	}

	// engine Puppet.js's own animation() only ever needs the plain
	// animation name - this layers SMB1's power-up sprite row (fire-/big-)
	// and status-effect classes (star power, hurt-flicker) on top, since
	// neither concept exists in the generic base.
	animation(classe) {
		// 'fire-' and 'big-' select the same-shaped frames as the small
		// sprite, just from a different row of the sheet (see Mario.js) -
		// fire takes priority since a fire-powered mario is still `big`
		let prefix = '';
		if (this.powerUp == 'fire') prefix = 'fire-';
		else if (this.powerUp == 'super') prefix = 'big-';
		// this replaces the whole class string every call (many times a
		// tick, from walk/jump/idle/etc) - starPower's own 'star-power'
		// class has to be re-added here too, or it gets wiped the instant
		// any other animation() call runs right after activateStarPower().
		// same deal for 'hurt-flicker' below (see shrink()) - it needs to
		// survive every walk/jump/idle animation() call during its ~2.8s
		// window, same as star-power needs to survive its own 11s.
		// during a grow/shrink animation the drawn size is whatever the
		// current step says (see _sizeChange), not what powerUp says
		let sizing = this._crouchShrunk ? 'crouch-box ' : '';
		if (this._sizePose !== null && this._sizePose !== undefined) {
			prefix = this._sizePose === 0 ? '' : 'big-';
			sizing = 'sizing sizing-pose-' + this._sizePose + ' ';
		}
		this._lastClasse = classe;
		super.animation(
			sizing +
				(this._flashing ? 'power-flash ' : '') +
				(this.starPower ? 'star-power ' : '') +
				(this.invincible ? 'hurt-flicker ' : '') +
				prefix +
				classe
		);
	}

	// grows/shrinks in place - the tag height changes but `y` is adjusted by
	// the same amount so mario's feet stay planted instead of sinking into
	// the floor (growing extends him upward, matching the original game).
	// any size change - growing OR shrinking - halts player control
	// outright for 59 NES frames, ~982ms at 60.0988fps. Input has zero
	// effect and mario doesn't move at all for that whole window - it's
	// not just a visual flourish (see _freezeForSizeChange below, shared
	// by grow/becomeFire/shrink).
	static SIZE_CHANGE_FREEZE_MS = (59 * 1000) / 60.0988;

	// grow/becomeFire/shrink run from inside an object's collide(), i.e.
	// mid-update(), which ends with `this.y = this.ay` - a bare `this.y -= 16`
	// is overwritten by that stale ay and mario ends up 16px inside whatever
	// he's standing on (solid floors push him back out, a 16px-tall
	// platform doesn't, so he fell straight through it). Moving ay too
	// keeps the adjustment.
	_shiftY(dy) {
		this.y += dy;
		if (this.ay !== undefined) this.ay += dy;
	}

	// SMBDIS HandleChangeSize / ChangeSizeOffsetAdder: for the first 40
	// frames a step advances every 4 frames. Growing cycles the drawn size
	// through [small, middle, big] as 0 1 0 1 0 1 2 0 1 2; shrinking
	// alternates big/small five times (it reuses the swimming poses).
	// Everything but mario - enemies, items, the clock - stands still the
	// whole time (TimerControl), then he's back after the full freeze.
	static GROW_POSES = [0, 1, 0, 1, 0, 1, 2, 0, 1, 2];
	static SHRINK_POSES = [2, 0, 2, 0, 2, 0, 2, 0, 2, 0];
	static SIZE_STEP_TICKS = 4;

	// `poses`: null for a plain freeze (the fire flower has no size
	// animation), otherwise one of the sequences above
	_freezeForSizeChange(poses = null, frames = 59, controlFrames = frames) {
		// the freeze starts on the pickup frame (mario has already moved
		// that frame) and the world stands still until the task ends:
		// 59 frames for growing, 63 for the fire flower, 55 for the
		// injury blink - which only freezes mario himself for the first 16,
		// after that he is back in control while everything else waits
		this.scripted = true;
		Inject.game.worldFrozen = true;
		let controlBack = frames - controlFrames;
		const totalTicks = Math.round(((frames * 1000) / 60.0988) / Inject.game.tickInterval);
		let tick = 0;
		const cancel = fixedStepRaf(() => {
			if (controlBack > 0 && tick + 1 === controlFrames) this.scripted = false;
			if (poses) {
				const step = Math.floor(tick / MarioPuppet.SIZE_STEP_TICKS);
				const pose = step < poses.length ? poses[step] : null;
				if (pose !== this._sizePose && step < poses.length) {
					this._sizePose = pose;
					this.animation(this._lastClasse || this.facingDir);
				}
			}
			if (++tick >= totalTicks) {
				cancel();
				this._sizePose = null;
				this._flashing = false;
				this.scripted = false;
				Inject.game.worldFrozen = false;
				this.animation(this._lastClasse || this.facingDir);
			}
		}, Inject.game.tickInterval);
	}

	// `animate` false: restoreState() carrying the power-up over to the next
	// scene - the size just applies, no transformation plays
	grow(animate = true) {
		if (this.big) return;
		this.powerUp = 'super';
		this._shiftY(-16);
		this.tag.style.height = '32px';
		if (animate) this._freezeForSizeChange(MarioPuppet.GROW_POSES);
	}

	// the fire flower only ever spawns when mario is already big (the
	// question block checks this.big before deciding mushroom vs flower -
	// see Question.js), so normally there's no size change here, just the
	// power-up switching from 'super' to 'fire' - the height adjustment
	// below only matters if this is ever reached while still small.
	becomeFire(animate = true) {
		if (this.powerUp === 'fire') return;
		if (!this.big) {
			this._shiftY(-16);
			this.tag.style.height = '32px';
		}
		this.powerUp = 'fire';
		if (animate) this._freezeForSizeChange(null, 63);
	}

	shrink() {
		if (!this.big) return;
		this._endCrouchShrink();
		this.powerUp = null;
		this._shiftY(16);
		this.tag.style.height = '16px';
		// grace window: without it, the same enemy still overlapping mario
		// on the very next tick (collide() fires every tick while touching,
		// not just once) would kill him right after shrinking - matches the
		// manual's "mario flickers, can't be killed" note. Duration is an
		// "interval timer" set to 8, decremented once every 21 frames
		// rather than every frame - 8*21 = 168 frames, ~2.8s at 60fps.
		// animation() re-adds the 'hurt-flicker' CSS class every tick this
		// is true, same pattern as starPower/'star-power'.
		this.invincible = true;
		clearPausableTimeout(this._invincibleTimeout);
		this._invincibleTimeout = pausableTimeout(() => {
			this.invincible = false;
		}, 2800);
		Inject.audio.play(pipePowerDownSound);
		this._freezeForSizeChange(MarioPuppet.SHRINK_POSES, 55, 16);
	}

	// what a Router-driven scene swap (see engine Router.js) carries forward
	// onto the fresh MarioPuppet it constructs for the next scene's own
	// <player-mario> tag - lives and power-up survive a level transition,
	// unlike a death, which already resets both via respawnPlayer().
	// Position/speed are deliberately left out - the new scene has its
	// own spawn point.
	captureState() {
		return { ...super.captureState(), powerUp: this.powerUp };
	}

	restoreState(state) {
		super.restoreState(state);
		// reuses grow()/becomeFire() rather than setting `powerUp`/tag height
		// by hand, so this stays correct if either ever grows other side
		// effects later
		if (state.powerUp === 'super') this.grow(false);
		else if (state.powerUp === 'fire') {
			this.grow(false);
			this.becomeFire(false);
		}
	}

	// consecutive enemy kills from landing directly on top of one - see
	// COMBO_SCORE above. `comboKills` itself is generic bookkeeping owned by
	// engine Puppet.js (reset to 0 the instant mario touches solid ground
	// again) - only the actual point values/1-up-at-6 rule are SMB1-specific.
	awardStompScore(tag) {
		const points = COMBO_SCORE[Math.min(this.comboKills, COMBO_SCORE.length - 1)];
		Inject.hud.addScore(points);
		Inject.hud.showScorePopup(tag, String(points));
		if (this.comboKills >= COMBO_SCORE.length - 1) {
			this.addLife();
		}
		this.comboKills++;
	}

	// max 2 fireballs alive at once, same limit as the original game -
	// spawned via the same runtime `spawn()` Question.js already uses for
	// mushrooms, then repositioned to mario's exact pixel position (spawn's
	// x/y attributes only place things on the 16px tile grid, too coarse
	// for a projectile that should leave from mario's own hands).
	throwFireball() {
		// the original doesn't let a crouching player throw (PlayerCtrlRoutine / CrouchingFlag)
		if (this.powerUp != 'fire' || this.dying || this.crouching) return;
		// no commands during a scripted sequence (walking into a pipe, the
		// flagpole, a power-up transformation...), over a title card, or
		// while paused - the same keypress that throws mid-level is ignored
		if (this.scripted || this.winning || Inject.hud.introShowing || Inject.game.paused) return;
		if (document.querySelectorAll('item-fireball').length >= 2) return;
		// facingDir (not the current sprite class) - matches the original
		// throwing in whichever direction PlayerFacingDir last held, not
		// whatever pose the skid/momentum animation happens to be showing
		const dir = this.facingDir === 'left' ? -1 : 1;
		const fireball = Inject.scene.spawn('item-fireball', { facing: dir });
		fireball.x = this.x + dir * 12;
		fireball.y = this.y + this.height / 2;
		Inject.audio.play(fireballSound);
		return fireball;
	}

	// see item-star's Star.js. ~11s, matching the original's timer (a fresh
	// pickup restarts the full duration rather than stacking with time left
	// over, same as the real game). Swaps the level's background music for
	// the invincibility theme while active, then swaps it back once it wears
	// off - matches the original, which does the same full-track swap
	// rather than just adding a sound effect on top.
	activateStarPower() {
		this.starPower = true;
		this.tag.classList.add('star-power');
		clearPausableTimeout(this._starPowerTimeout);
		this._starPowerTimeout = pausableTimeout(() => this.endStarPower(), 11000);
		Inject.audio.playBackground(invincibilityTheme);
	}

	endStarPower() {
		this.starPower = false;
		this.tag.classList.remove('star-power');
		// resume whichever theme was actually playing before the star - the
		// hurry-up swap may have happened while starPower was active, and
		// the original still comes back to the fast theme in that case
		Inject.audio.playBackground(this.currentLevelTheme());
	}

	die() {
		// dying is only ever flipped true here, so this guards against
		// re-stopping/re-triggering the jingle twice if two things kill
		// mario on the same tick. The level theme stops the instant mario
		// dies, same as the original - it doesn't keep playing through the
		// death animation/respawn intro. Clearing it here (rather than
		// leaving that to gameOver()) also means playBackground(groundTheme)
		// in _startGameAfterIntro's respawn path no longer hits its
		// same-src no-op guard, so the theme actually restarts from the
		// top once mario regains control - matches the original, which
		// never resumes a level theme mid-track.
		if (!this.dying) {
			Inject.audio.stopBackground();
			Inject.audio.play(deathSound);
		}
		super.die();
	}

	// the flagpole/castle "you win" sequence - Pole.js hands off here the
	// instant mario touches any part of the pole. Freezes normal control the
	// same way die() does (stops the main loop entirely, nothing else moves)
	// and instead plays out its own short scripted sequence on its own
	// timers: slide down to the pole's base, award a score band, walk into
	// the castle, then move on to the next level - this engine only
	// has the one continuous scrolling stage per route, no multi-room
	// chaining exists (see the "no multi-room" note on SceneBase.warp), so
	// there's nowhere else to send the player within THIS stage afterwards
	// (see SceneBase.js's own onLevelComplete for what happens next, at the
	// Stage level).
	winLevel(pole) {
		if (this.winning || this.dying) return;
		this.winning = true;
		// the original lets you pause the slide and the walk, but here the
		// steps are chained with setTimeouts that keep running while the
		// frame loops freeze, so pausing mid-sequence desyncs everything
		this.noPause = true;
		Inject.game.newGame();

		// winning is only ever flipped true above, so nothing here can
		// re-trigger the jingle even though collide() keeps firing every
		// tick mario still overlaps the pole. Only start the level-complete
		// theme once the flagpole SFX has actually finished (matches the
		// original: the flag jingle plays out in full before the
		// level-complete stinger takes over, they never overlap) - play()
		// resolves with the clip's real decoded duration, so this isn't a
		// guessed timeout. play(), not playBackground() - the stinger plays
		// once and stops, it doesn't loop like the level/invincibility
		// themes do.
		Inject.audio.stopBackground();
		Inject.audio.play(flagpoleSound).then((duration) => {
			setTimeout(() => Inject.audio.play(levelCompleteTheme), (duration || 0) * 1000);
		});

		// the original doesn't award a flat bonus here - how high up the
		// pole mario is when he first touches it decides the score (measured
		// now, before the slide-to-ground animation below moves `this.y`):
		// touching near the very top scores highest, the bottom scores
		// lowest.
		// SMBDIS FlagpoleCollision / FlagpoleYPosData: the player's own top Y
		// (same coordinate system as here) against $90 / $68 / $50 / $22
		const POLE_SCORES = [
			[0x90, 100],
			[0x68, 400],
			[0x50, 800],
			[0x22, 2000],
		];
		const hit = POLE_SCORES.find(([minY]) => this.y >= minY);
		const poleScore = hit ? hit[1] : 5000;
		Inject.hud.addScore(poleScore);
		Inject.hud.showScorePopup(this.tag, String(poleScore));

		this.speedX = 0;
		this.speedY = 0;
		// three beats, like the original: slide down the pole's left side
		// (climb frames, hands on the pole), flip to its right side facing
		// left, then hop off to the right onto the ground. `poleX` is the
		// pole's centre line: the grabbing hand sits on it
		// the lowered flag stops a few px above the base block, not touching it
		const FLAG_REST_GAP = 5;
		const poleX = pole.x + pole.width / 2;
		const hangLeftX = poleX - this.width + 1 ;
		const hangRightX = poleX - 1;
		this.animation('climb-right-0');

		// the flag itself slides down the pole too, independently of mario's
		// own descent below (see Flag.js - it's purely decorative art today,
		// nothing ever animates it) - it always starts at the same spot near
		// the pole's top regardless of how high up mario grabbed, and drops
		// to the pole's own base, same as the original's flag-drop. Reusing
		// the pole's own already-computed `bottom` (both share the same
		// bottom-anchored .Scene parent) needs no unit conversion.
		const flagTag = document.querySelector('item-flag');
		if (flagTag) {
			const flagBottomTarget = (parseFloat(pole.tag.style.bottom) || 0) + FLAG_REST_GAP;
			const cancelFlag = fixedStepRaf(() => {
				const current = parseFloat(flagTag.style.bottom) || 0;
				const next = current - 4;
				if (next <= flagBottomTarget) {
					flagTag.style.bottom = flagBottomTarget + 'px';
					cancelFlag();
				} else {
					flagTag.style.bottom = next + 'px';
				}
			}, Inject.game.tickInterval);
		}

		// the pole's own collidable box doesn't necessarily reach all the way
		// down to the real floor (its bottom edge can sit a tile above the
		// ground - see Pole.js's `y` default), so sliding to *its* bottom
		// left mario floating there instead of landing on the ground. Find
		// the actual solid under the pole's x and land on that instead -
		// there can be more than one solid overlapping that x (the flagpole
		// always rests on its own single Hard Block, one tile above the
		// surrounding floor - see index.html's item-block at the
		// pole's x), so take the HIGHEST one (the smallest `y`, since y
		// grows downward) rather than the deepest: mario is falling straight
		// down this column and should stop on the first solid he reaches,
		// same as any other landing, not sink through it to whatever's
		// further down. The pole-based calc is only a fallback if none is
		// found.
		const findFloor = (x) => {
			const candidates = Inject.scene.sceneMap.filter(
				(object) =>
					object.solid &&
					x + this.width > object.x &&
					x < object.x + object.width &&
					object.y >= this.y + this.height - 16 // not a ceiling above him
			);
			return candidates.length ? candidates.reduce((highest, o) => (o.y < highest.y ? o : highest)) : null;
		};
		const floor = findFloor(poleX - this.width / 2);
		// he stops with his feet right on top of the lowered flag (about a
		// tile above the base block, tile y=4 on the grid), not on the block
		const groundY = (floor ? floor.y : pole.y + pole.height) - FLAG_REST_GAP - 16 - this.height;
		const walkAfterHop = () => {
			this.animation('right');
			setTimeout(() => this.walkToCastle(), 200);
		};
		// halved from 4 (slide speed) - see the note on die()'s cancelDeath
		// (engine Puppet.js) for why this runs on fixedStepRaf instead of
		// setInterval
		let slideTicks = 0;
		const cancelSlide = fixedStepRaf(() => {
			this.y += 2;
			// re-asserted every tick: this runs inside the collision pass
			// that triggered winLevel(), which writes mario's own x back
			// after us on that first tick
			this.x = hangLeftX;
			// the two climb frames alternate while he moves (hands swap)
			this.animation('climb-right-' + (Math.floor(slideTicks++ / 4) % 2));
			if (this.y >= groundY) {
				this.y = groundY;
				cancelSlide();
				// holds still at the base for a beat, then turns to the other
				// side of the pole (facing left)...
				setTimeout(() => {
					this.x = hangRightX;
					this.animation('climb-left-0');
					// ...and after another beat hops off to the right
					setTimeout(() => this._hopOffPole(findFloor, walkAfterHop), 500);
				}, 500);
			}
		}, Inject.game.tickInterval);
	}

	// last beat of winLevel(): a small jump to the right, falling until he
	// lands on whatever solid is under him (the ground, one tile below the
	// pole's hard block)
	_hopOffPole(findFloor, onLand) {
		this.animation('jumping-right');
		const HOP_SPEED_X = 1;
		const GRAVITY = 0.4;
		let speedY = -2;
		const cancelHop = fixedStepRaf(() => {
			this.x += HOP_SPEED_X;
			speedY += GRAVITY;
			this.y += speedY;
			const floor = findFloor(this.x);
			const groundY = floor ? floor.y - this.height : this.y;
			if (speedY > 0 && this.y >= groundY) {
				this.y = groundY;
				cancelHop();
				onLand();
			}
		}, Inject.game.tickInterval);
	}

	// second half of winLevel() - once mario's feet are back on the ground
	// at the pole's base, auto-walk him the rest of the way to the castle
	// (reading its real DOM position rather than a guessed distance) with
	// the camera following exactly the way the normal scroll-follow does,
	// using the engine's generic scriptedWalk() (see Sequences.js). A stage
	// can contain more than one <building-castle> - mariobros' own 1-2 has
	// both this real level-end one AND a second, purely decorative one
	// behind its own opening cutscene (see World2.js's openingCutscene) - so
	// picking plain `document.querySelector` (always the first one in
	// document order) grabbed the WRONG, already-passed castle here, sending
	// mario walking backward toward it instead of forward. The real target
	// is always the closest castle still ahead of mario's current position -
	// never one already behind him.
	walkToCastle() {
		const castle = Array.from(document.querySelectorAll('building-castle'))
			.filter((c) => c.offsetLeft >= this.x)
			.sort((a, b) => a.offsetLeft - b.offsetLeft)[0];
		// the door is the 3rd of the castle's 5 16px-wide tile columns (see
		// Castle.js's m22/m23 tiles, the only ones that differ from the
		// repeated wall tile around them) - center mario on it instead of
		// stopping at the castle's outer left wall
		const doorX = castle ? castle.offsetLeft + 32 + (16 - this.width) / 2 : null;
		const targetX = doorX !== null ? doorX : this.x + 96;
		// no camera follow here: SMBDIS FlagpoleCollision does `inc ScrollLock`
		// the moment the pole is touched, so the screen stays where it was
		// (the level is built so the castle is already in view). Following him
		// to the door scrolled the camera past the end of the level's own art,
		// into whatever sits beyond it (1-2's bonus room).
		scriptedWalk(this, targetX, {
			onComplete: () => {
				// mario disappears through the door
				this.noPause = true;
				this.tag.style.visibility = 'hidden';
				// the clock's last digit now decides the fireworks
				const digit = Inject.hud.time % 10;
				// converts the leftover clock into score first (see
				// Hud.playTimeBonus) - then the castle's flag goes up (and
				// fireworks, see castleCelebration.js); the next level only
				// loads after all of that, same as the original (there's no
				// "course clear" card in SMB1)
				setTimeout(
					() =>
						Inject.hud.playTimeBonus(() => {
							castleCelebration(castle, digit, () => {
								// what happens next is stage knowledge, not the
								// puppet's own - see SceneBase.js's own
								// onLevelComplete
								Inject.scene.onLevelComplete();
							});
						}),
					400
				);
			},
		});
	}

	// SMBDIS HandleAxeMetatile / BridgeCollapse: touching the axe ends the
	// fight. If Bowser's still standing, the bridge goes tile by tile and he
	// falls with it; if he was already beaten with fireballs there's no
	// collapse. Either way mario then walks to Toad.
	reachAxe(axe) {
		if (this.winning || this.dying) return;
		this.winning = true;
		this.noPause = true;
		this.speedX = 0;
		this.speedY = 0;
		Inject.audio.stopBackground();
		axe.consume();
		Inject.scene.collisionMap.forEach((o) => o.tag.tagName === 'ITEM-CHAIN' && o.cut());

		const bowser = Inject.scene.collisionMap.find((o) => o.tag.tagName === 'ENEMY-BOWSER');
		const bridge = Inject.scene.collisionMap.find((o) => o.tag.tagName === 'SCENE-BRIDGE');
		if (bowser && !bowser.defeated && !bowser.dead && bridge) {
			bowser.freezeForEnding();
			// the flames still in the air go with the music
			Inject.scene.collisionMap.forEach((o) => {
				if (o.tag.tagName === 'ENEMY-KOOPA-FIRE' && !o.dead) o.remove_();
			});
			bridge.collapse(() => bowser.dropWithBridge(() => this.walkToToad()));
		} else {
			this.walkToToad();
		}
	}

	// the camera follows him the same way walkToCastle() does; the message
	// shows once he's next to Toad
	walkToToad() {
		const toad = document.querySelector('npc-toad');
		const targetX = toad ? toad.offsetLeft - this.width - 4 : this.x + 64;
		Inject.audio.play(levelCompleteTheme);
		scriptedWalk(this, targetX, {
			onTick: () => {
				let scroll = this.x - Inject.stage.width / 2;
				const maxScroll = Inject.scene.width - Inject.stage.width;
				if (scroll < 0) scroll = 0;
				else if (scroll > maxScroll) scroll = maxScroll;
				Inject.scene.scroll_x = scroll;
			},
			onComplete: () => {
				setTimeout(() => {
					ToadMessage.show();
					Inject.scene.onLevelComplete();
				}, 600);
			},
		});
	}

	// 1-2's own opening cutscene (see World2.js's openingCutscene, the only
	// caller): mario auto-walks right into the castle-init pipe before the
	// player gets any control, then hands off to the exact same
	// SceneBase.warp() a real pipe entry uses - same shape as winLevel()'s
	// walkToCastle() at the other end of a level (freeze via `scripted`,
	// reuse the engine's own scriptedWalk - see Sequences.js), except the
	// camera is deliberately never touched here: the whole castle-init area
	// is one screen wide (16 tiles, matching Inject.stage.width), so
	// there's nothing off-screen yet to reveal by scrolling.
	walkIntoPipe = (pipeTag, warpToId) => {
		this.scripted = true;
		const targetX = pipeTag.offsetLeft - this.width;
		scriptedWalk(this, targetX, {
			onComplete: () => {
				Inject.audio.play(pipePowerDownSound);
				Inject.scene.warp(warpToId, this);
				this.scripted = false;
			},
		});
	};
}

export default MarioPuppet;
