import Inject from './Inject';
import { MoveEvent, CollisionEvent } from './GameEvents';
import fixedStepRaf from './fixedStepRaf';

Number.prototype.inRange = function (a, b) {
	var n = +this;
	return n >= a && n <= b;
};

// SMBDIS skid threshold: Player_XSpeedAbsolute >= $09 (1/16 px per frame)
const SKID_MIN_SPEED = 9 / 16;

class Puppet {
	constructor(tag) {
		this.tag = tag;
		// one-time read of the tag's starting position to seed the logical
		// position - after this, physics never reads position back from
		// the DOM again, see the x/y getters below
		this._x = this.tag.offsetLeft;
		this._y = this.tag.offsetTop;
		// where the player respawns to - the level markup's own starting
		// spot for the .Puppet tag, not a magic number duplicated in
		// respawnPlayer
		this.defaultX = this._x;
		this.defaultY = this._y;
		this.ax = 0;
		this.ay = 0;
		// jump impulse and gravity_hold_factor below are tuned constants.
		// This is a one-time velocity (only ever *set*, in jump() below,
		// never accumulated tick after tick), so halving it if the tick
		// rate ever doubles is correct - contrast with `gravity`/`accelX`,
		// which get ADDED every tick and need to be quartered instead when
		// dt halves (see the dt^2 note on SceneBase.js's `gravity`).
		// holding the jump button the whole rise caps the max jump height
		// at velocity_y^2/(2*gravity*gravity_hold_factor) - a fixed 51px
		// with the old value of 4 was too short to clear a size="4" (64px)
		// pipe no matter how long the button was held; 5 raises that cap
		// to ~83px.
		this.velocity_y_walk = 5;
		this.velocity_y_run = 5;
		this.velocity_y = this.velocity_y_walk;
		// horizontal ground/air acceleration - a flat amount added every
		// tick and clamped at the top speed (maxSpeedX below), not an
		// exponential "speedX *= friction" decay; there's no separate
		// softer "friction while accelerating" curve.
		// kept as overridable fields (not inlined into update()'s literal
		// 0.0371/0.0557 the way they used to be) purely so a game-specific
		// subclass can loosen the ramp-up feel without having to fork
		// update() itself
		this.walkAccel = 0.0371;
		this.runAccel = 0.0557;
		this.accelX = this.walkAccel;
		this.maxSpeedX = 1.5;
		this.speed_limit_y = 5;
		// weaker gravity applied while still rising and the jump button stays held,
		// so holding it longer produces a taller jump (variable jump height);
		// releasing early - or passing the apex - switches back to full gravity.
		this.gravity_hold_factor = 0.3;
		this._jumpConsumed = false;
		// see update()'s jump-input check - only ever set by an actual
		// floor/platform collision, not by speedY reaching 0 (which also
		// happens transiently at the apex of every jump)
		this.onGround = true;
		// see update()'s crouching block - true whenever canCrouch() allows
		// it (always, by this base's own default) and down is held while
		// grounded
		this.crouching = false;
		this.dying = false;
		this.winning = false;
		// freezes update() the same way dying/winning do, for a scripted
		// sequence that isn't either of those (e.g. a scripted walk-into-pipe
		// intro) - real button presses have no effect while this is true,
		// since update() returns before ever reading Inject.control
		this.scripted = false;
		// brief lockout right after a pipe warp (see SceneBase.warp) so the
		// destination pipe - which satisfies the exact same "standing on
		// top, pressing down" condition the player just triggered - doesn't
		// immediately warp the player right back while the key is still held
		this.warpLocked = false;
		this._justWarped = false;

		this._speedX = 0;
		this.speedY = 0;

		this.lives = 3;
		// a consecutive-kill counter, reset the instant the player touches
		// solid ground again (see the collisions.bottom branch in update()
		// below) - generic bookkeeping only; scoring anything off of it
		// (e.g. an escalating combo bonus) is a game-specific call
		this.comboKills = 0;
		// the furthest the camera has ever scrolled this attempt - the
		// original never scrolls (or lets the player walk) back past this, see
		// the scroll-follow block in update() below
		this.maxScrollX = 0;
		this._touching = new Set();

		// how many gameLoop ticks each walk frame lasts - tied to the same
		// interval the debug speed control resizes, so slowing the game
		// down slows the walk animation too, instead of it running on its
		// own clock (like a CSS animation would).
		// doubled from 6 - ticks-per-frame, tied to Game.fps (now 60, see Game.js)
		this.walkFrameTicks = 12;
		this._walkFrame = 0;
		this._walkTick = 0;

		// see update()'s PlayerFacingDir handling - which way the player is
		// currently drawn facing, persisted independent of speedX
		this.facingDir = 'right';
		this.animation('right');
	}

	// a regular method (not an arrow field) so a game-specific subclass can
	// override it and still call back into this via super to layer its own
	// state/CSS classes on top. This base only ever needs the plain
	// animation name.
	animation(classe) {
		this.tag.classList = 'Puppet ' + classe;
	}

	walk = (direction) => {
		this._walkTick++;
		if (this._walkTick >= this.walkFrameTicks) {
			this._walkTick = 0;
			this._walkFrame = this._walkFrame === 0 ? 1 : 0;
		}
		this.animation('walk-' + direction + '-' + this._walkFrame);
	};

	addLife = () => {
		this.lives += 1;
	};

	// what a Router-driven scene swap (see engine Router.js) carries forward
	// onto the fresh Puppet it constructs for the next scene's own player
	// tag - only `lives` here, since this base Puppet has no concept of a
	// power-up to carry along with it. A regular method (not an arrow
	// field) so a game-specific subclass can override it and still call
	// back into this via super to add its own state to what's
	// captured/restored.
	captureState() {
		return { lives: this.lives };
	}

	restoreState(state) {
		this.lives = state.lives;
	}

	update = () => {
		if (this.dying || this.winning || this.scripted) return;

		const startX = this.x;
		const startY = this.y;
		this.ax = this.x;
		this.ay = this.y;

		// SMBDIS RunningTimer: holding B in the direction he's already moving
		// on the ground keeps the run speed/accel for 10 more frames once B
		// is released, so letting go for a moment doesn't drop him back to a
		// walk mid-stride
		if (Inject.control.shift && this.speedY == 0 && this.speedX * (Inject.control.right ? 1 : Inject.control.left ? -1 : 0) > 0) {
			this._runTimer = 10;
		} else if (this._runTimer > 0) {
			this._runTimer--;
		}
		if (Inject.control.shift || this._runTimer > 0) {
			this.accelX = this.runAccel;
			this.maxSpeedX = 2.5;
			this.velocity_y = this.velocity_y_run;
		} else {
			this.accelX = this.walkAccel;
			this.maxSpeedX = 1.5;
			this.velocity_y = this.velocity_y_walk;
		}

		// the direction the player visually faces is set from whichever direction
		// button is CURRENTLY held, and otherwise just holds its last
		// value - it's never derived from speedX. A quick tap of left
		// while still carrying rightward speed (2 taps right, 1 tap left)
		// used to flip straight back to facing right the instant speedX's
		// sign hadn't caught up yet, which also broke throwing a fireball
		// backwards (see throwFireball, which reads this same direction).
		if (Inject.control.left) this.facingDir = 'left';
		else if (Inject.control.right) this.facingDir = 'right';

		const grounded = this.speedY == 0;
		if (grounded) {
			// the crouch flag is only ever resampled from the down button
			// while ON THE GROUND. The instant the player leaves the ground
			// this is left as whatever it already was for the whole
			// jump/fall - holding or releasing down mid-air has no effect
			// on a pose already locked in, which is why pressing down
			// right before a jump keeps the player drawn crouched for that
			// entire jump. canCrouch() is overridable, see below.
			// stays crouched while something overhead keeps standing up from
			// being possible (releasing Down in a 1-tile gap)
			this.crouching = (this.canCrouch() && Inject.control.down) || (this.crouching && !this.canStandUp());
			this.syncCrouch();
		}

		if (!Inject.control.right && !Inject.control.left) {
			this._walkTick = 0;
			this._walkFrame = 0;
			this.animation(this.facingDir);
		}
		if (Inject.control.up) {
			this.animation('lookup-' + this.facingDir);
		}
		// the crouch pose wins outright over walk/skid/jump/fall whenever
		// it's set, checked before any of those
		if (this.crouching) {
			this.animation('lower-' + this.facingDir);
		}
		if (grounded && !this.crouching && this.canSteer(grounded)) {
			// skidding: pressing a direction opposite to the speed the player
			// is still carrying from before (braking hard enough to turn around)
			const skidding =
				(Inject.control.left && this.speedX >= SKID_MIN_SPEED) || (Inject.control.right && this.speedX <= -SKID_MIN_SPEED);
			if (skidding) {
				this.animation('skid-' + (this.speedX < 0 ? 'left' : 'right'));
			} else if (Inject.control.left) {
				this.walk('left');
			} else if (Inject.control.right) {
				this.walk('right');
			}
		}

		// real horizontal physics: add a flat accelX per tick toward
		// whichever direction is held, clamped at maxSpeedX - no
		// exponential "speedX *= friction" curve. Pressing the direction
		// opposite to the current speed (skidding, in the air or on the
		// ground) doubles accelX. Airborne with *nothing* held does not
		// touch speedX at all - coasting mid-jump with no input held
		// keeps speed perfectly constant, it doesn't decay.
		const dir = this.canSteer(grounded) ? (Inject.control.left ? -1 : Inject.control.right ? 1 : 0) : 0;
		if (dir !== 0) {
			const opposing = dir * this.speedX < 0;
			if (dir * this.speedX > this.maxSpeedX) {
				// faster than the current top speed (B was released while
				// running): the excess wears off through friction instead of
				// being cut in one frame; in the air it's kept as is
				if (grounded) {
					const over = Math.abs(this.speedX) - this.maxSpeedX;
					this.speedX -= dir * Math.min(over, this.overspeedFriction());
				}
			} else {
				const accel = opposing ? this.accelX * 2 : this.accelX;
				let next = this.speedX + dir * accel;
				next = dir > 0 ? Math.min(next, this.maxSpeedX) : Math.max(next, -this.maxSpeedX);
				this.speedX = next;
			}
		} else if (grounded && this.speedX !== 0) {
			// letting go on the ground still coasts to a stop, at the base
			// walking accel regardless of running
			const friction = this.coastFriction();
			if (this.speedX > 0) this.speedX = Math.max(0, this.speedX - friction);
			else this.speedX = Math.min(0, this.speedX + friction);
		}
		// require the key to be released before a new jump can be consumed,
		// so holding 'a' across a landing doesn't auto bunny-hop
		if (!Inject.control.a) {
			this._jumpConsumed = false;
		}
		// `onGround` (not speedY == 0) - speedY passes through 0 at the apex
		// of every jump too (see the snap-to-zero below), so gating on it
		// let a second jump button press mid-air, right at the top of the
		// arc, trigger another jump. onGround is only ever set true by an
		// actual floor/platform collision further down, and reset to false
		// at the start of every tick's collision pass - see the "solid
		// ground" branch below.
		if (Inject.control.a && this.onGround && !this._jumpConsumed) {
			this.jump();
		}

		if (this.crouching) {
			// no-op - the pose set above stays through the whole jump/fall,
			// see the crouching block earlier in this same tick
		} else if (this.speedY < 0) {
			this.animation('jumping-' + this.facingDir);
		} else if (this.speedY > 0) {
			this.animation('falling-' + this.facingDir);
		}

		// apply gravity - weaker while still rising with the jump button held,
		// giving variable jump height; normal gravity otherwise.
		const rising = this.speedY < 0;
		const gravity = this.currentGravity(rising);
		this.speedY += gravity;
		if (Math.abs(this.speedY) < 0.1) this.speedY = 0;

		if (this.speedY > this.speed_limit_y) {
			this.speedY = this.speed_limit_y;
		}

		this.ax += this.speedX;
		this.ay += this.speedY;

		if (this.ax < 0) {
			this.ax = 0;
		} else if (Inject.scene.width && this.ax + this.width > Inject.scene.width) {
			this.ax = Inject.scene.width - this.width;
		}
		// die on level bottom - routed through die() (not gameOver() directly)
		// so falling into a pit gets the same death animation + respawn
		// intro card as touching an enemy or running out of time
		if (this.ay > Inject.scene.height) {
			this.die();
		}

		// reassessed fresh every tick by the collision pass below - only a
		// real floor/platform collision this tick sets it back to true
		this.onGround = false;

		// todo: getCollisionMapVisible() returns every collidable in the
		// level, not just what's actually on/near screen
		const currentlyTouching = new Set();
		Inject.scene.getCollisionMapVisible().forEach((object) => {
			// broad phase: static scenery well away from the player can't touch
			// him (anything that moves, or reacts to more than touching - enemies,
			// items, triggers - still runs every tick)
			if (
				object.scenario &&
				!object.updatable &&
				(object.x > this.ax + this.width + 64 || object.x + object.width < this.ax - 64)
			) {
				return;
			}
			const collisions = object.collides(this);

			if (collisions.top || collisions.bottom || collisions.left || collisions.right) {
				currentlyTouching.add(object);
				if (!this._touching.has(object)) {
					Inject.events.emit(
						new CollisionEvent(
							'player',
							{ type: object.type, tag: object.tag && object.tag.tagName },
							collisions
						)
					);
				}
			}

			if (object.scenario) {
				if (collisions.top && object.border.bottom == 'solid') {
					this.ay = object.y + object.height;
					this.speedY = 1;
				}
				if (
					collisions.bottom &&
					(object.border.top == 'solid' || object.border.top == 'platform')
				) {
					this.ay = object.y - this.height;
					this.speedY = 0;
					this.onGround = true;
					// feet touched solid ground - the stomp combo starts over
					// (see awardStompScore)
					this.comboKills = 0;
				}
				if (collisions.right && object.border.horizontal == 'solid' && this.speedX > 0) {
					this.ax = object.x - this.width;
					this.speedX = 0;
				}
				if (collisions.left && object.border.horizontal == 'solid' && this.speedX < 0) {
					this.ax = object.x + object.width;
					this.speedX = 0;
				}
			}
			object.collide(this, collisions);
		});
		this._touching = currentlyTouching;

		// move the player when the level is at it's border, else move the
		// level - computed into a local first and written to scroll_x
		// exactly once (see below for why that matters)
		let scroll = Inject.scene.scroll_x;
		if (scroll <= 0) {
			// same $50/80px trigger as the steady-state branch below - the
			// real game uses one constant for both, not a wider "still
			// centered" dead zone before scrolling has ever kicked in
			if (this.ax > Inject.scene.line_to_scroll) {
				scroll = 1;
			}
		} else if (
			scroll >= Inject.scene.width - Inject.stage.width &&
			Inject.scene.width > Inject.stage.width
		) {
			scroll = Inject.scene.width - Inject.stage.width;
			if (this.ax < Inject.scene.width - Inject.stage.width / 2) {
				scroll = Inject.scene.width - Inject.stage.width - 1;
			}
		} else if (Inject.scene.width > Inject.stage.width) {
			if (this.ax > Inject.scene.line_to_scroll) {
				scroll = this.ax - Inject.scene.line_to_scroll;
			}
		}

		// the original never scrolls the screen - or lets the player walk -
		// back past the furthest point already reached this attempt.
		// Without this, walking left while still past line_to_scroll (the
		// branch just above) would recompute a smaller scroll directly
		// from the player's own (now smaller) ax, dragging the camera backward.
		if (scroll < this.maxScrollX) {
			scroll = this.maxScrollX;
		} else {
			this.maxScrollX = scroll;
		}
		// assign scroll_x exactly once with the final, already-clamped
		// value - writing the "wrong" pre-clamp value above and correcting
		// it right after (two writes/tick) visibly happened: Tag's own `x`
		// setter reads offsetLeft to compare, which forces a synchronous
		// layout, so both writes actually committed and the CSS transition
		// animated backward and forward again every single tick.
		Inject.scene.scroll_x = scroll;
		if (this.maxScrollX > 0 && this.ax < scroll) {
			this.ax = scroll;
			// speedX is deliberately left alone (still negative while
			// pushing left) - only the position is walled off. Zeroing it
			// here used to make the idle-facing check below (`speedX < 0 ?
			// 'left' : 'right'`) flip the player to face right the instant
			// they got pinned against the wall, even while still holding left.
		}

		// safety net: never let a single frame move the player an unreasonable distance,
		// no matter the cause (guards against transient bad reads of scene/stage size, etc.)
		// - except right after a deliberate teleport (a pipe warp, see SceneBase.warp),
		// which is a legitimate multi-thousand-pixel jump in a single tick and would
		// otherwise get clamped right back to almost where it started.
		if (this._justWarped) {
			this._justWarped = false;
		} else {
			const maxDeltaX = 15;
			if (Math.abs(this.ax - startX) > maxDeltaX) {
				this.ax = startX + Math.sign(this.ax - startX) * maxDeltaX;
			}
		}

		if (this.ax !== startX || this.ay !== startY) {
			Inject.events.emit(new MoveEvent('player', this.ax, this.ay));
		}

		this.x = this.ax;
		this.y = this.ay;
	};

	jump() {
		this._jumpConsumed = true;
		this.speedY -= this.jumpImpulse();
	}

	// overridable: whether ducking is currently allowed at all - see the
	// crouching block in update(). A regular method (not an arrow field) so
	// a subclass can restrict it (e.g. to a big/fire-powered player only)
	// without changing this default for every other game.
	canCrouch() {
		return true;
	}

	// how much speed a grounded player with no steering input loses per tick
	coastFriction() {
		return this.walkAccel;
	}

	// per tick, while holding a direction faster than the current top speed
	overspeedFriction() {
		return this.coastFriction();
	}

	// whether there's room above to stand back up - a subclass whose crouch
	// shrinks the collision box overrides this (see MarioPuppet)
	canStandUp() {
		return true;
	}

	// called each time `crouching` is resampled, to let a subclass resize
	// the player's box to match
	syncCrouch() {}

	// whether left/right currently steer the player - a subclass can take
	// that away (e.g. while holding down on the ground, so momentum just
	// carries and friction slows the player). Overridable for the same
	// reason as canCrouch().
	canSteer(grounded) {
		return true;
	}

	jumpImpulse() {
		return this.velocity_y;
	}

	currentGravity(rising) {
		return rising && Inject.control.a
			? Inject.scene.gravity * this.gravity_hold_factor
			: Inject.scene.gravity;
	}

	// a regular method (not an arrow field) so a game-specific subclass can
	// override it and still call back into this via super, e.g. to add its
	// own death SFX
	die() {
		// no dedicated death-animation art frame - popped upward once, then
		// pulled down by gravity, animated procedurally instead. Runs on
		// its own interval (independent of the main loop, which `dying`
		// freezes) so it plays out even though `Inject.game.newGame()`
		// below stops the main game loop
		this.dying = true;
		Inject.game.newGame();

		if (this.speedX < 0) {
			this.animation('dying-left');
		} else {
			this.animation('dying-right');
		}

		// halved from -8 (bounce impulse) - see Puppet.js's other dt-scaling
		// notes. Runs on the same fixed-step rAF loop as the main game loop
		// (see Game.js/fixedStepRaf.js) instead of a plain setInterval, for
		// the same jitter/teleport reasons - this one keeps running even
		// though `dying` freezes update() and Inject.game.newGame() stops
		// the main loop, since it's entirely independent of both.
		let speedY = -4;
		const cancelDeath = fixedStepRaf(() => {
			speedY += Inject.scene.gravity;
			this.y += speedY;
		}, Inject.game.tickInterval);

		setTimeout(() => {
			cancelDeath();
			this.dying = false;
			Inject.game.gameOver();
			// gameOver() already decremented `lives` - only resume the loop if
			// respawnPlayer() actually ran; out of lives means the Game Over
			// screen is up and nothing should still be ticking behind it
			if (this.lives > 0) {
				Inject.game.play();
			}
		}, 1000);
	}

	// deliberately no winLevel() hook here (unlike SceneBase.js's own
	// onLevelComplete) - touching a flagpole/goal is a platformer
	// convention, not something every game on this engine has. A game that
	// wants one can build it on engine/src/Sequences.js's scriptedWalk().

	// todo: re-spawn player at the closest 'y' to the left
	// a regular method (not an arrow field) so a game-specific subclass can
	// override it and still call back into this via super to add its own
	// state resets (power-ups, timers, etc.) on top
	respawnPlayer() {
		this.speedX = 0;
		this.speedY = 0;
		this.onGround = true;
		this.x = this.defaultX;
		this.y = this.defaultY;
		this.warpLocked = false;
		this._justWarped = false;
		this.comboKills = 0;
		this.maxScrollX = 0;
		Inject.scene.scroll_x = 0;
		Inject.scene.x = 0;
		this.facingDir = 'right';
		this.animation('right');
		// every enemy/block/coin goes back to how it was at boot too - only
		// `lives` (decremented by gameOver(), just before this runs) carries
		// over between attempts
		Inject.scene.resetLevel();
	}

	// `_x`/`_y` are the logical position and the only thing the physics
	// reads back - never the DOM. Reading offsetLeft/offsetTop back (the old
	// approach) reports whatever the browser is currently rendering, which
	// lags behind the real target while a CSS transition is animating -
	// that was silently cutting jump height nearly in half. Keeping our own
	// field as the source of truth means a CSS transition can be used
	// purely for visual smoothing without corrupting the simulation.
	get x() {
		return this._x;
	}
	set x(x) {
		x = parseFloat(x.toFixed(1));
		if (x != this._x) {
			this._x = x;
			this.tag.style.left = x + 'px';
		}
	}

	get y() {
		return this._y;
	}
	set y(y) {
		y = parseFloat(y.toFixed(1));
		if (y != this._y) {
			this._y = y;
			this.tag.style.top = y + 'px';
		}
	}
	get speedX() {
		return this._speedX;
	}
	set speedX(speedx) {
		// 2 decimals, not 1 - see the residual-speed kill threshold in
		// update() for why the coarser rounding stopped being safe at 60fps
		this._speedX = parseFloat(speedx.toFixed(2));
	}

	get width() {
		return this.tag.offsetWidth;
	}
	get height() {
		return this.tag.offsetHeight;
	}
}

export { Puppet as default };
