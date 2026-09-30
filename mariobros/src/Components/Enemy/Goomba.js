import Collidable from '~/engine/src/Collidable';
import Enemy from '~/engine/src/Enemy';
import Inject from '~/engine/src/Inject';
import Assets from '../Assets';
import kickkillSound from '../../../sounds/kickkill.wav';
import stompSound from '../../../sounds/stompswim.wav';

class Goomba extends Enemy {
	constructor(tag) {
		super(tag);

		// goombas always start out walking left, regardless of where mario
		// is - the moving direction is hardcoded, not read from mario's
		// position
		this.speedX = -this.walkSpeed;

		// doubled from 8 - ticks-per-frame, tied to Game.fps (now 60)
		this.walkFrameTicks = 16;
		this._walkFrame = 0;
		this._walkTick = 0;

		// where this goomba goes back to on reset() (see SceneBase.resetLevel,
		// called from Puppet.respawnPlayer)
		this.defaultX = this.x;
		this.defaultY = this.y;
	}

	update = () => {
		if (this.dead) return;
		if (!this.isActive()) return;

		this.walk();

		this._walkTick++;
		if (this._walkTick >= this.walkFrameTicks) {
			this._walkTick = 0;
			this._walkFrame = this._walkFrame === 0 ? 1 : 0;
			this.tag.classList.toggle('frame-1', this._walkFrame === 1);
		}
	};

	collide = (from, collisions) => {
		super.collide(from, collisions);

		if (this.dead) return;
		if (!this.isActive()) return;

		const touching = collisions.top || collisions.bottom || collisions.left || collisions.right;
		if (from.starPower && touching) {
			this.defeatByFire();
			return;
		}
		if (collisions.bottom || this.landedOn(from)) {
			// mario's bottom edge is touching goomba's top - he landed on it
			this.squish(from);
		} else if (collisions.top || collisions.left || collisions.right) {
			if (from.invincible) return;
			if (from.big) {
				from.shrink();
			} else {
				from.die();
			}
		}
	};

	reset = () => {
		this.dead = false;
		this.activated = false;
		this.speedX = -this.walkSpeed;
		this._walkFrame = 0;
		this._walkTick = 0;
		this.tag.classList.remove('frame-1', 'squished');
		this.x = this.defaultX;
		this.y = this.defaultY;
		// die()/squish() remove the tag from the DOM - reattaching is harmless
		// even if it was never removed (position:absolute doesn't care about
		// DOM order), and connectedCallback's own __rendered guard means this
		// never re-runs render() or touches the state just restored above
		this.originalParent.appendChild(this.tag);
	};

	squish = (from) => {
		this.die();
		Inject.audio.play(stompSound);
		// halved from -8 (bounce impulse), tied to Game.fps (now 60)
		from.speedY = -4;
		// a direct stomp feeds mario's chained-kill combo (100/200/400/...,
		// see Puppet.awardStompScore) - a fireball kill below doesn't
		from.awardStompScore(this.tag);
	};

	// killed by a fireball instead of a stomp - same death, just no bounce
	// to give mario (see Fireball.js, which calls this on any enemy it touches)
	defeatByFire = () => {
		this.die();
		Inject.audio.play(kickkillSound);
		Inject.hud.addScore(100);
		Inject.hud.showScorePopup(this.tag, '100');
	};

	die = () => {
		if (this.dead) return;
		this.dead = true;
		this.tag.classList.remove('frame-1');
		this.tag.classList.add('squished');

		setTimeout(() => {
			this.tag.remove();
		}, 300);
	};

	static setupWebComponent() {
		const tagName = 'enemy-goomba';
		const bgx = 0;
		// row 1 (y=16) is the normal overworld brown recolor; row 3 (y=48)
		// is the same 3 frames (walk/walk2/squished) redrawn in the cyan
		// underground recolor - same convention as .UndergroundPalette's
		// hue-rotate for bricks/floor, just a real separate row in
		// enemies.png instead of a CSS filter, since that's how the sheet
		// itself already stores the underground variant
		Collidable.setupWebComponent(tagName, {
			x: 0,
			y: 2,
			underground: false,
			render: (tag) => {
				tag.classList += 'Collidable';
				tag.style.position = 'absolute';
				tag.style.width = '16px';
				tag.style.height = '16px';
				tag.style.left = tag.x * 16 + 'px';
				tag.style.bottom = tag.y * 16 + 'px';
				tag.style.zIndex = 2;
				// purely visual smoothing between game ticks - safe because
				// WalkingItem's x/y getters read back an internal field instead
				// of offsetLeft/offsetTop, so this can't corrupt the physics
				// the way it used to for mario (see Puppet.js/Mario.js)
				tag.style.transition = 'left .0167s linear, top .0167s linear';

				const bgy = tag.underground ? 3 : 1;

				return Collidable.html`
			  		<style>
						enemy-goomba .m{
							background-image: url('${Assets.enemies}');
							background-position: -${bgx * 16}px -${bgy * 16}px;
							background-repeat: no-repeat;
							position: absolute;
							width: 16px;
							height: 16px;
							top: 0;
							left: 0;
						}
						enemy-goomba.frame-1 .m{
							background-position: -${(bgx + 1) * 16}px -${bgy * 16}px;
						}
						enemy-goomba.squished .m{
							background-position: -${(bgx + 2) * 16}px -${bgy * 16}px;
						}
					</style>
					<div class="m"></div>
			  `;
			},
		});
	}
}

export default Goomba;
