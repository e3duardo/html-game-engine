import Collidable from '~/engine/src/Collidable';
import Enemy from '~/engine/src/Enemy';
import Inject from '~/engine/src/Inject';
import Assets from '../Assets';
import kickkillSound from '../../../sounds/kickkill.wav';
import stompSound from '../../../sounds/stompswim.wav';

// three states, same shell art reused throughout (see setupWebComponent):
// 'walking' (default) -> stomped from above -> 'shell' (stationary) ->
// kicked from the side -> 'shell-sliding' (fast, defeats anything it hits)
// -> stomped again -> back to 'shell'.
class KoopaTropa extends Enemy {
	constructor(tag) {
		super(tag);

		this.state = 'walking';
		this.speedX = -this.walkSpeed;

		// doubled from 8 - ticks-per-frame, tied to Game.fps (now 60)
		this.walkFrameTicks = 16;
		this._walkFrame = 0;
		this._walkTick = 0;

		// where this koopa goes back to on reset() (see SceneBase.resetLevel,
		// called from Puppet.respawnPlayer)
		this.defaultX = this.x;
		this.defaultY = this.y;
	}

	reset = () => {
		this.dead = false;
		this.activated = false;
		this.state = 'walking';
		this.speedX = -this.walkSpeed;
		this._walkFrame = 0;
		this._walkTick = 0;
		this.tag.classList.remove('frame-1', 'shell');
		this.x = this.defaultX;
		this.y = this.defaultY;
		this.originalParent.appendChild(this.tag);
	};

	update = () => {
		if (this.dead) return;
		if (!this.isActive()) return;

		// gravity/ground/wall-turn from WalkingItem.walk() already fits every
		// state as-is: speedX 0 while sitting as a shell, a full turn-around
		// off walls while sliding fast - no per-state branching needed here.
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
		if (this.state == 'walking' || this.state == 'shell-sliding') {
			this._walkTick++;
			if (this._walkTick >= this.walkFrameTicks) {
				this._walkTick = 0;
				this._walkFrame = this._walkFrame === 0 ? 1 : 0;
				this.tag.classList.toggle('frame-1', this._walkFrame === 1);
			}
		}

		if (this.state == 'shell-sliding') {
			// a moving shell is itself a weapon - defeats any other enemy it touches
			Inject.scene.getCollisionMapVisible().forEach((object) => {
				if (this.dead || object === this || !object.enemy || object.dead) return;
				const collisions = object.collides(this);
				if (collisions.top || collisions.bottom || collisions.left || collisions.right) {
					if (object.defeatByFire) object.defeatByFire();
				}
			});
		}
	};

	collide = (from, collisions) => {
		super.collide(from, collisions);

		if (this.dead) return;
		if (!this.isActive()) return;

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
			if (landed) {
				Inject.audio.play(stompSound);
				from.speedY = -4; // bounce off the stationary shell, same as any stomp (halved, tied to Game.fps)
			} else if (collisions.left || collisions.right) {
				Inject.audio.play(kickkillSound);
				this.kick(from.x < this.x ? 1 : -1);
			}
		} else if (this.state == 'shell-sliding') {
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

	becomeShell = (from) => {
		this.state = 'shell';
		this.speedX = 0;
		this.tag.classList.remove('frame-1');
		this.tag.classList.add('shell');
		Inject.audio.play(stompSound);
		from.speedY = -4; // halved, tied to Game.fps
		// a direct stomp feeds mario's chained-kill combo, same as a goomba
		// (100/200/400/..., see Puppet.awardStompScore)
		from.awardStompScore(this.tag);
	};

	kick = (direction) => {
		this.state = 'shell-sliding';
		this.speedX = this.walkSpeed * 6 * direction;
	};

	stop = () => {
		this.state = 'shell';
		this.speedX = 0;
		this.tag.classList.remove('frame-1');
		this._walkFrame = 0;
		this._walkTick = 0;
	};

	// killed outright by a fireball, in any state - see Fireball.js
	defeatByFire = () => {
		Inject.audio.play(kickkillSound);
		this.die();
	};

	die = () => {
		if (this.dead) return;
		this.dead = true;
		Inject.hud.addScore(100);
		Inject.hud.showScorePopup(this.tag, '100');
		this.tag.remove();
	};

	static setupWebComponent() {
		const tagName = 'enemy-koopa-tropa';
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
		// into a plain `enemy-koopa-tropa .m` selector - every instance's
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
		const bgx = 6;
		const shellBgx = 10;

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
						enemy-koopa-tropa .m{
							background-image: url('${Assets.enemies}');
							background-position: -${bgx * 16}px -8px;
							background-repeat: no-repeat;
							position: absolute;
							width: 16px;
							height: 24px;
							top: 0;
							left: 0;
						}
						enemy-koopa-tropa.frame-1 .m{
							background-position: -${(bgx + 1) * 16}px -8px;
						}
						enemy-koopa-tropa[underground="true"] .m{
							background-position: -${bgx * 16}px -${8 + 32}px;
						}
						enemy-koopa-tropa[underground="true"].frame-1 .m{
							background-position: -${(bgx + 1) * 16}px -${8 + 32}px;
						}
						enemy-koopa-tropa[red="true"] .m{
							background-position: -${bgx * 16}px -${8 + 64}px;
						}
						enemy-koopa-tropa[red="true"].frame-1 .m{
							background-position: -${(bgx + 1) * 16}px -${8 + 64}px;
						}

						/* base art faces left - mirror for a rightward-walking
						   koopa (see update()'s 'right' class toggle). Shells
						   are symmetric and explicitly reset this below. */
						enemy-koopa-tropa.right .m{
							transform: scaleX(-1);
						}

						enemy-koopa-tropa.shell .m{
							top: 8px;
							height: 16px;
							background-position: -${shellBgx * 16}px -16px;
							transform: none;
						}
						enemy-koopa-tropa.shell.frame-1 .m{
							background-position: -${(shellBgx + 1) * 16}px -16px;
						}
						enemy-koopa-tropa[underground="true"].shell .m{
							background-position: -${shellBgx * 16}px -${16 + 32}px;
						}
						enemy-koopa-tropa[underground="true"].shell.frame-1 .m{
							background-position: -${(shellBgx + 1) * 16}px -${16 + 32}px;
						}
						enemy-koopa-tropa[red="true"].shell .m{
							background-position: -${shellBgx * 16}px -${16 + 64}px;
						}
						enemy-koopa-tropa[red="true"].shell.frame-1 .m{
							background-position: -${(shellBgx + 1) * 16}px -${16 + 64}px;
						}
					</style>
					<div class="m"></div>
				`;
			},
		});
	}
}

export default KoopaTropa;
