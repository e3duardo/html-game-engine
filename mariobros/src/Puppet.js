import Inject from '~/engine/src/Inject';
import Puppet from '~/engine/src/Puppet';
import { scriptedWalk } from '~/engine/src/Sequences';
import fixedStepRaf from '~/engine/src/fixedStepRaf';

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
		this.walkAccel = 0.111;
		this.runAccel = 0.167;

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
		Inject.events.subscribe((event) => {
			if (event.type == 'key' && event.data.key == 'shift' && event.data.pressed) {
				this.throwFireball();
			}
		});
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
		this.invincible = false;
		clearTimeout(this._starPowerTimeout);
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

	jump() {
		this._jumpPhysics = MarioPuppet.JUMP_PHYSICS.find((p) => Math.abs(this.speedX) < p.maxSpeed);
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
		super.animation(
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

	_freezeForSizeChange() {
		this.scripted = true;
		setTimeout(() => {
			this.scripted = false;
		}, MarioPuppet.SIZE_CHANGE_FREEZE_MS);
	}

	grow() {
		if (this.big) return;
		this.powerUp = 'super';
		this.y -= 16;
		this.tag.style.height = '32px';
		this._freezeForSizeChange();
	}

	// the fire flower only ever spawns when mario is already big (the
	// question block checks this.big before deciding mushroom vs flower -
	// see Question.js), so normally there's no size change here, just the
	// power-up switching from 'super' to 'fire' - the height adjustment
	// below only matters if this is ever reached while still small.
	becomeFire() {
		if (this.powerUp === 'fire') return;
		if (!this.big) {
			this.y -= 16;
			this.tag.style.height = '32px';
		}
		this.powerUp = 'fire';
		this._freezeForSizeChange();
	}

	shrink() {
		if (!this.big) return;
		this.powerUp = null;
		this.y += 16;
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
		setTimeout(() => {
			this.invincible = false;
		}, 2800);
		Inject.audio.play(pipePowerDownSound);
		this._freezeForSizeChange();
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
		if (state.powerUp === 'super') this.grow();
		else if (state.powerUp === 'fire') {
			this.grow();
			this.becomeFire();
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
		if (this.powerUp != 'fire' || this.dying) return;
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
		clearTimeout(this._starPowerTimeout);
		this._starPowerTimeout = setTimeout(() => this.endStarPower(), 11000);
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
	// the castle, then show the level-clear title card - this engine only
	// has the one continuous scrolling stage per route, no multi-room
	// chaining exists (see the "no multi-room" note on SceneBase.warp), so
	// there's nowhere else to send the player within THIS stage afterwards
	// (see SceneBase.js's own onLevelComplete for what happens next, at the
	// Stage level).
	winLevel(pole) {
		if (this.winning || this.dying) return;
		this.winning = true;
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
		// lowest. This is a proportional 5-band approximation of a
		// per-tile-row score table, not a pixel-for-pixel port of one.
		const poleTop = pole.tag.offsetTop;
		const poleHeight = pole.tag.offsetHeight;
		let relative = poleHeight > 0 ? (this.y - poleTop) / poleHeight : 1;
		relative = Math.max(0, Math.min(1, relative));
		const POLE_SCORE_BANDS = [5000, 2000, 800, 400, 100];
		const band = Math.min(
			POLE_SCORE_BANDS.length - 1,
			Math.floor(relative * POLE_SCORE_BANDS.length)
		);
		const poleScore = POLE_SCORE_BANDS[band];
		Inject.hud.addScore(poleScore);
		Inject.hud.showScorePopup(this.tag, String(poleScore));

		this.speedX = 0;
		this.speedY = 0;
		this.x = pole.x + (pole.width - this.width) / 2;
		// the NES original reuses the skid pose for pole-sliding too - no
		// dedicated "climbing" sprite exists, and it already looks the part
		this.animation('skid-right');

		// the flag itself slides down the pole too, independently of mario's
		// own descent below (see Flag.js - it's purely decorative art today,
		// nothing ever animates it) - it always starts at the same spot near
		// the pole's top regardless of how high up mario grabbed, and drops
		// to the pole's own base, same as the original's flag-drop. Reusing
		// the pole's own already-computed `bottom` (both share the same
		// bottom-anchored .Scene parent) needs no unit conversion.
		const flagTag = document.querySelector('item-flag');
		if (flagTag) {
			const flagBottomTarget = parseFloat(pole.tag.style.bottom) || 0;
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
		const groundCandidates = Inject.scene.sceneMap.filter(
			(object) => object.solid && this.x + this.width > object.x && this.x < object.x + object.width
		);
		const floor = groundCandidates.length
			? groundCandidates.reduce((highest, o) => (o.y < highest.y ? o : highest))
			: null;
		const groundY = floor ? floor.y - this.height : pole.y + pole.height - this.height;
		// halved from 4 (slide speed) - see the note on die()'s cancelDeath
		// (engine Puppet.js) for why this runs on fixedStepRaf instead of
		// setInterval
		const cancelSlide = fixedStepRaf(() => {
			this.y += 2;
			if (this.y >= groundY) {
				this.y = groundY;
				cancelSlide();
				// mario holds still at the base of the pole for ~48 frames
				// (~800ms) before walking - during which he briefly faces left (the original's
				// own scripted "turn around" beat, reusing the plain turn
				// sprite) before turning back right to walk to the castle
				this.animation('left');
				setTimeout(() => {
					this.animation('right');
					this.walkToCastle();
				}, 800);
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
		scriptedWalk(this, targetX, {
			onTick: () => {
				let scroll = this.x - Inject.stage.width / 2;
				const maxScroll = Inject.scene.width - Inject.stage.width;
				if (scroll < 0) scroll = 0;
				else if (scroll > maxScroll) scroll = maxScroll;
				Inject.scene.scroll_x = scroll;
			},
			onComplete: () => {
				// converts the leftover clock into score first (see
				// Hud.playTimeBonus) - the level-clear screen only appears
				// once that countdown finishes, same as the original
				setTimeout(
					() =>
						Inject.hud.playTimeBonus(() => {
							Inject.hud.showLevelClear();
							// what happens next is stage knowledge, not the
							// puppet's own - see SceneBase.js's own
							// onLevelComplete
							Inject.scene.onLevelComplete();
						}),
					400
				);
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
