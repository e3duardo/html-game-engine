import Collidable from '~/engine/src/Collidable';
import Enemy from '~/engine/src/Enemy';
import Inject from '~/engine/src/Inject';
import { knockOff, stepKnockedOff, resetKnockOff } from '../../knockOff';
import Assets from '../Assets';
import kickkillSound from '../../../sounds/kickkill.wav';
import stompSound from '../../../sounds/stompswim.wav';

// three states, same shell art reused throughout (see setupWebComponent):
// 'walking' (default) -> stomped from above -> 'shell' (stationary) ->
// kicked from the side -> 'shell-sliding' (fast, defeats anything it hits)
// -> stomped again -> back to 'shell'.
// SMBDIS RevivalRateData ($10 interval-timer units, one unit = 21 frames):
// a stunned shell wakes up on its own after that long
const UNIT_TICKS = 21;
const REVIVE_UNITS = 0x10;
const REVIVE_TICKS = REVIVE_UNITS * UNIT_TICKS;
// SetupFloateyNumber's score table, by index
const FLOATEY = [0, 100, 200, 400, 500, 800, 1000, 2000, 4000, 5000, 8000];
// KickedShellPtsData: kicking a shell that's about to wake up is worth more
const KICK_NEAR_WAKE = [8000, 1000, 500];

class KoopaTroopa extends Enemy {

	static tagName = 'enemy-koopa-troopa';
	static bgx = 6;
	static shellBgx = 10;

	constructor(tag) {
		super(tag);

		this.state = 'walking';
		this.speedX = -this.walkSpeed;

		// doubled from 8 - ticks-per-frame, tied to Game.fps (now 60)
		this.walkFrameTicks = 16;
		this._walkFrame = 0;
		this._walkTick = 0;
		this._shellTicks = 0;
		// kills made by this sliding shell since it was kicked - each one
		// worth more than the last (ShellChainCounter)
		this._chain = 0;
		// frame counter and the last frame mario was touching us: a shell is
		// only kicked by a FRESH touch (SMBDIS keeps a per-enemy collision bit
		// set while the overlap lasts), so the stomp that made it a shell
		// doesn't also kick it on the very next tick
		this._tick = 0;
		this._lastTouch = -10;

		// where this koopa goes back to on reset() (see SceneBase.resetLevel,
		// called from Puppet.respawnPlayer)
		this.defaultX = this.x;
		this.defaultY = this.y;
	}

	reset = () => {
		resetKnockOff(this);
		this.dead = false;
		this.activated = false;
		this.state = 'walking';
		this.speedX = -this.walkSpeed;
		this._walkFrame = 0;
		this._walkTick = 0;
		this._shellTicks = 0;
		this._chain = 0;
		this.tag.classList.remove('frame-1', 'shell');
		this._shellBox = false;
		this.tag.style.height = '24px';
		this.x = this.defaultX;
		this.y = this.defaultY;
		this.originalParent.appendChild(this.tag);
	};

	update = () => {
		if (this.knocked) return stepKnockedOff(this);
		if (this.dead) return;
		if (!this.isActive()) return;

		// gravity/ground/wall-turn from WalkingItem.walk() already fits every
		// state as-is: speedX 0 while sitting as a shell, a full turn-around
		// off walls while sliding fast - no per-state branching needed here.
		// a red koopa never walks off a ledge: it turns around at the edge
		// (the green ones and the goombas just fall)
		if (this.tag.red && this.state == 'walking') this.turnAtLedge();
		this._tick++;
		this.walk();

		// the base art (enemies.png, bgx=6) faces left - mirror it when
		// actually moving right (WalkingItem.walk() flips speedX's sign on
		// a wall bounce but has no idea about facing/sprites at all, same
		// as every other WalkingItem subclass). Shell states reset this via
		// their own CSS rule below - the shell art is symmetric, and a
		// kicked shell's speedX sign is "which way it's sliding", not a
		// pose that should ever mirror.
		this.tag.classList.toggle('right', this.speedX > 0);

		// walking alternates between the 2 leg frames to animate the stride;
		// a kicked shell reuses the same toggle to spin between its 2 shell
		// frames instead - a stationary shell (plain 'shell') always shows
		// just frame 0, no toggling
		this.animateWalk();

		if (this.state == 'shell' && ++this._shellTicks >= REVIVE_TICKS) this.revive();

		if (this.state == 'shell-sliding') {
			// a moving shell is itself a weapon - defeats any other enemy it touches
			Inject.scene.getCollisionMapVisible().forEach((object) => {
				if (this.dead || object === this || !object.enemy || object.dead) return;
				const collisions = object.collides(this);
				if (collisions.top || collisions.bottom || collisions.left || collisions.right) {
					if (object.defeatByFire) object.defeatByFire(this.chainScore());
				}
			});
		}
	};

	// grounded and nothing solid under the foot a step ahead: turn back
	turnAtLedge = () => {
		if (this.speedY !== 0 || !this.speedX) return;
		const dir = this.speedX > 0 ? 1 : -1;
		const probeX = this.x + this.width / 2 + dir * 6;
		const feet = this.y + this.height;
		const supported = Inject.scene.sceneMap.some(
			(o) =>
				(o.border.top == 'solid' || o.border.top == 'platform') &&
				o.x <= probeX &&
				o.x + o.width > probeX &&
				Math.abs(o.y - feet) <= 2
		);
		if (!supported) this.speedX *= -1;
	};

	animateWalk = () => {
		if (this.state == 'walking' || this.state == 'shell-sliding') {
			this._walkTick++;
			if (this._walkTick >= this.walkFrameTicks) {
				this._walkTick = 0;
				this._walkFrame = this._walkFrame === 0 ? 1 : 0;
				this.tag.classList.toggle('frame-1', this._walkFrame === 1);
			}
		}
	};

	collide = (from, collisions) => {
		super.collide(from, collisions);

		if (this.dead) return;
		if (!this.isActive()) return;

		const touching = collisions.top || collisions.bottom || collisions.left || collisions.right;
		const freshTouch = touching && this._tick - this._lastTouch > 1;
		if (touching) this._lastTouch = this._tick;

		if (from.starPower && (collisions.top || collisions.bottom || collisions.left || collisions.right)) {
			this.defeatByFire();
			return;
		}

		// collisions.bottom needs mario's horizontal center already inside
		// this object's span - loosened here the same way Goomba does, so a
		// diagonal jump onto the koopa isn't misread as a side hit on the
		// tick contact first starts (see Enemy.landedOn)
		const landed = collisions.bottom || this.landedOn(from);

		if (this.state == 'walking') {
			if (landed) {
				this.becomeShell(from);
			} else if (collisions.top || collisions.left || collisions.right) {
				if (from.invincible) return;
				if (from.big) from.shrink();
				else from.die();
			}
		} else if (this.state == 'shell') {
			// SMBDIS: ANY fresh touch of a stationary shell - from above too -
			// kicks it away from mario (no bounce)
			if (freshTouch && (landed || collisions.left || collisions.right || collisions.top)) {
				Inject.audio.play(kickkillSound);
				this.awardKick(from);
				this.kick(from.x < this.x ? 1 : -1);
			}
		} else if (this.state == 'shell-sliding') {
			// same fresh-touch rule: the overlap left over from the kick itself
			// must not read as a stomp / a hit
			if (!freshTouch) return;
			if (landed) {
				Inject.audio.play(stompSound);
				this.stop();
			} else if (collisions.left || collisions.right) {
				if (from.invincible) return;
				if (from.big) from.shrink();
				else from.die();
			}
		}
	};

	// 400 normally (+ the stomp chain), but much more if it was about to wake
	awardKick = (from) => {
		const unitsLeft = Math.floor((REVIVE_TICKS - this._shellTicks) / UNIT_TICKS);
		const points =
			unitsLeft < 3
				? KICK_NEAR_WAKE[Math.max(0, unitsLeft)]
				: FLOATEY[Math.min(3 + (from.comboKills || 0), FLOATEY.length - 1)];
		Inject.hud.addScore(points);
		Inject.hud.showScorePopup(this.tag, String(points));
	};

	// the next kill's score: 500, 800, 1000, 2000, 4000, 5000, 8000, then
	// a 1-up for every one after (the original runs out of table there)
	chainScore = () => {
		const index = 4 + this._chain++;
		if (index >= FLOATEY.length) {
			Inject.puppet.addLife();
			return 0;
		}
		return FLOATEY[index];
	};

	// a shell is a 16px-tall object, not the 24px koopa it came from (SMBDIS
	// swaps the bounding box when the koopa is stunned) - which is what lets
	// a kicked shell slide through a 1-tile gap the walking koopa can't enter.
	// Feet stay planted: the box shrinks from the top.
	setShellBox = (on) => {
		if (on === !!this._shellBox) return;
		this._shellBox = on;
		this.tag.style.height = on ? '16px' : '24px';
		this.y = this.y + (on ? 8 : -8);
	};

	// room above for the taller walking koopa to stand back up
	canStandUp = () =>
		!Inject.scene.sceneMap.some(
			(o) =>
				o.border.bottom == 'solid' &&
				o.x < this.x + this.width &&
				o.x + o.width > this.x &&
				o.y < this.y &&
				o.y + o.height > this.y - 8
		);

	// the stunned shell shakes itself back into a walking koopa
	revive = () => {
		// stays a shell until there's room to stand
		if (!this.canStandUp()) {
			this._shellTicks = REVIVE_TICKS - 1;
			return;
		}
		this.setShellBox(false);
		this.state = 'walking';
		this._shellTicks = 0;
		this.speedX = (Math.random() < 0.5 ? -1 : 1) * this.walkSpeed;
		this.tag.classList.remove('shell');
	};

	// a block was hit from underneath while this koopa stood on top of it:
	// it's knocked into a shell, hopping a little (SetStun) - 100 points
	bumpedFromBelow = () => {
		if (this.dead) return;
		this.state = 'shell';
		this._shellTicks = 0;
		this.speedX = 0;
		this.speedY = -3;
		this.tag.classList.remove('frame-1');
		this.tag.classList.add('shell');
		this.setShellBox(true);
		Inject.hud.addScore(100);
		Inject.hud.showScorePopup(this.tag, '100');
	};

	becomeShell = (from) => {
		this._lastTouch = this._tick;
		this.state = 'shell';
		this._shellTicks = 0;
		this.speedX = 0;
		this.tag.classList.remove('frame-1');
		this.tag.classList.add('shell');
		this.setShellBox(true);
		Inject.audio.play(stompSound);
		from.speedY = -4; // halved, tied to Game.fps
		// a direct stomp feeds mario's chained-kill combo, same as a goomba
		// (100/200/400/..., see Puppet.awardStompScore)
		from.awardStompScore(this.tag);
	};

	kick = (direction) => {
		this._chain = 0;
		this.state = 'shell-sliding';
		this.speedX = this.walkSpeed * 6 * direction;
	};

	stop = () => {
		this._shellTicks = 0;
		this.state = 'shell';
		this.speedX = 0;
		this.tag.classList.remove('frame-1');
		this._walkFrame = 0;
		this._walkTick = 0;
	};

	// killed outright by a fireball, in any state - see Fireball.js
	defeatByFire = (points = 200) => {
		if (this.dead) return;
		Inject.audio.play(kickkillSound);
		this.die(points);
	};

	die = (points = 200) => {
		if (this.dead) return;
		if (points) {
			Inject.hud.addScore(points);
			Inject.hud.showScorePopup(this.tag, String(points));
		}
		knockOff(this);
	};

	static setupWebComponent() {
		const { tagName, bgx, shellBgx } = this;

		// enemies.png, confirmed pixel by pixel: x=96/112 (bgx/bgx+1) is the
		// walking pose (legs+shell, 24px tall, y offset 8px into the sheet)
		// and its 2nd stride frame. The shell-only pose (no legs) is NOT
		// directly below that same column - x=96,y=16 bleeds into the
		// neighboring Koopa Paratroopa's wing art. The clean shell art (2
		// near-identical frames, used to spin the shell while it slides) is
		// 4 columns over, at x=160/176 (shellBgx/shellBgx+1), y=16.
		// 4 palette rows, evenly spaced 32px apart, confirmed by color
		// sample at the shell's own position (x=160): normal green
		// (114,160,62) y=16, underground teal (85,131,125) y=48, red
		// (189,104,81) y=80, a 4th grey/beige row at y=112 (unused here).
		//
		// the palette is picked by CSS attribute selector ([red="true"] /
		// [underground="true"]) rather than a JS-computed y-offset baked
		// into a plain `enemy-koopa-troopa .m` selector - every instance's
		// own <style> block is plain light-DOM markup (not scoped to a
		// shadow root), so it applies globally to every koopa on the page,
		// not just itself. With a JS-computed offset, whichever koopa
		// happened to render LAST in the document won that shared selector
		// for every koopa on screen (this is exactly why every koopa was
		// showing red - the one red="true" koopa sits last in 1-2.html).
		// An attribute selector keeps each instance's own <style> block
		// text identical (harmless to duplicate) while still only matching
		// elements that actually carry that attribute. `red` is listed
		// after `underground` so it wins if both were somehow set - same
		// "only one row per koopa" priority as before, just resolved by
		// source order at equal specificity instead of by last-write-wins.
		Collidable.setupWebComponent(tagName, {
			x: 0,
			y: 2,
			underground: false,
			red: false,
			render: (tag) => {
				tag.classList += 'Collidable';
				tag.style.position = 'absolute';
				tag.style.width = '16px';
				tag.style.height = '24px';
				tag.style.left = tag.x * 16 + 'px';
				tag.style.bottom = tag.y * 16 + 'px';
				tag.style.zIndex = 2;
				tag.style.transition = 'left .0167s linear, top .0167s linear';

				return Collidable.html`
					<style>
						${tagName} .m{
							background-image: url('${Assets.enemies}');
							background-position: -${bgx * 16}px -8px;
							background-repeat: no-repeat;
							position: absolute;
							width: 16px;
							height: 24px;
							top: 0;
							left: 0;
						}
						${tagName}.frame-1 .m{
							background-position: -${(bgx + 1) * 16}px -8px;
						}
						${tagName}[underground="true"] .m{
							background-position: -${bgx * 16}px -${8 + 32}px;
						}
						${tagName}[underground="true"].frame-1 .m{
							background-position: -${(bgx + 1) * 16}px -${8 + 32}px;
						}
						${tagName}[red="true"] .m{
							background-position: -${bgx * 16}px -${8 + 64}px;
						}
						${tagName}[red="true"].frame-1 .m{
							background-position: -${(bgx + 1) * 16}px -${8 + 64}px;
						}

						/* base art faces left - mirror for a rightward-walking
						   koopa (see update()'s 'right' class toggle). Shells
						   are symmetric and explicitly reset this below. */
						${tagName}.right .m{
							transform: scaleX(-1);
						}

						/* a demoted paratroopa (see ParaTroopa.js) reuses this tag
						   but switches back to the plain koopa's walk art */
						${tagName}.demoted:not(.shell) .m{
							background-position: -${KoopaTroopa.bgx * 16}px -8px;
						}
						${tagName}.demoted:not(.shell).frame-1 .m{
							background-position: -${(KoopaTroopa.bgx + 1) * 16}px -8px;
						}
						${tagName}[underground="true"].demoted:not(.shell) .m{
							background-position: -${KoopaTroopa.bgx * 16}px -${8 + 32}px;
						}
						${tagName}[underground="true"].demoted:not(.shell).frame-1 .m{
							background-position: -${(KoopaTroopa.bgx + 1) * 16}px -${8 + 32}px;
						}
						${tagName}[red="true"].demoted:not(.shell) .m{
							background-position: -${KoopaTroopa.bgx * 16}px -${8 + 64}px;
						}
						${tagName}[red="true"].demoted:not(.shell).frame-1 .m{
							background-position: -${(KoopaTroopa.bgx + 1) * 16}px -${8 + 64}px;
						}

						/* killed by fire/star/shell/block: flipped over while it falls */
						${tagName}.knocked .m{
							transform: scaleY(-1);
						}
						${tagName}.right.knocked .m{
							transform: scale(-1, -1);
						}

						${tagName}.shell .m{
							top: 0;
							height: 16px;
							background-position: -${shellBgx * 16}px -16px;
							transform: none;
						}
						${tagName}.shell.frame-1 .m{
							background-position: -${(shellBgx + 1) * 16}px -16px;
						}
						${tagName}[underground="true"].shell .m{
							background-position: -${shellBgx * 16}px -${16 + 32}px;
						}
						${tagName}[underground="true"].shell.frame-1 .m{
							background-position: -${(shellBgx + 1) * 16}px -${16 + 32}px;
						}
						${tagName}[red="true"].shell .m{
							background-position: -${shellBgx * 16}px -${16 + 64}px;
						}
						${tagName}[red="true"].shell.frame-1 .m{
							background-position: -${(shellBgx + 1) * 16}px -${16 + 64}px;
						}
					</style>
					<div class="m"></div>
				`;
			},
		});
	}
}

export default KoopaTroopa;
