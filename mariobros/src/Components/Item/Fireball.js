import Collidable from '~/engine/src/Collidable';
import WalkingItem from '~/engine/src/WalkingItem';
import Inject from '~/engine/src/Inject';

class Fireball extends WalkingItem {
	static tagName = 'item-fireball';

	constructor(tag) {
		super(tag);
		// 4px/frame - a continuous per-tick velocity, not a one-time
		// impulse, but this engine's tick already runs 1:1 with a real NES
		// frame (see Game.js's `fps`), so this value applies directly, no
		// halving needed. Faster than mario's own top run speed (2.5) on
		// purpose - a thrown fireball is supposed to immediately pull ahead
		// and roll off screen, not lag behind him (the previous 1.25 here
		// was slower than even a walk, letting mario outrun his own
		// fireballs, backwards from the original).
		this.speedX = 4 * this.tag.facing;
		this.speedY = 0;
	}

	// overrides WalkingItem's own `update`/`walk` entirely - a fireball
	// bounces off the ground (classic NES fireball hop) instead of stopping,
	// disappears outright on a wall hit instead of turning around, and can
	// defeat enemies it touches, none of which WalkingItem's generic
	// wandering behavior does
	update = () => {
		if (this.dead) return;

		this.ax = this.x + this.speedX;
		this.speedY += Inject.scene.gravity;
		if (this.speedY > this.speed_limit_y) this.speedY = this.speed_limit_y;
		this.ay = this.y + this.speedY;

		let hitWall = false;
		Inject.scene.sceneMap.forEach((object) => {
			const collisions = object.collides(this);
			if (collisions.bottom && (object.border.top == 'solid' || object.border.top == 'platform')) {
				this.ay = object.y - this.height;
				this.speedY = -2; // bounce instead of resting on the ground (halved, tied to Game.fps)
			}
			if ((collisions.left || collisions.right) && object.border.horizontal == 'solid') {
				hitWall = true;
			}
		});

		this.x = this.ax;
		this.y = this.ay;

		if (hitWall || this.ay > Inject.scene.height) {
			this.remove();
			return;
		}
		// off either edge of the *current* screen for good, matching the
		// original's FBall_OffscreenBits check (any edge kills it, not
		// just falling behind the camera) - without the right-edge half of
		// this, a fireball that never hits a wall (bouncing down an open
		// stretch of floor, keeping pace with or outrunning the camera)
		// stays alive forever, silently tying up one of only 2 slots
		if (
			this.x + this.width < Inject.scene.scroll_x ||
			this.x > Inject.scene.scroll_x + Inject.stage.width
		) {
			this.remove();
			return;
		}

		Inject.scene.getCollisionMapVisible().forEach((object) => {
			if (this.dead || !object.enemy || object.dead) return;
			const collisions = object.collides(this);
			if (collisions.top || collisions.bottom || collisions.left || collisions.right) {
				if (object.defeatByFire) object.defeatByFire();
				this.remove();
			}
		});
	};

	static setupWebComponent() {
		const { tagName } = this;

		Collidable.setupWebComponent(tagName, {
			x: 0,
			y: 0,
			// named `facing`, not `dir` - `dir` collides with HTMLElement's own
			// built-in `dir` property (text direction, ltr/rtl), and the
			// generic attribute-parsing loop in Object.setupWebComponent skips
			// any key that's already defined on the element, silently leaving
			// this stuck at the native default ("") instead of our number
			facing: 1,
			render: (tag) => {
				tag.classList += 'Collidable';
				tag.style.position = 'absolute';
				tag.style.width = '8px';
				tag.style.height = '8px';
				tag.style.left = tag.x * 16 + 'px';
				tag.style.bottom = tag.y * 16 + 'px';
				tag.style.zIndex = 2;

				return Collidable.html`
					<style>
						/* no fireball art actually exists in mario.png/items.png/
						   enemies.png (the round "ember" tile at items.png x=64,y=16
						   this used to point at is checkered/brick-like, not a fireball
						   - the original is a plain smooth ball, bright orange highlight upper-right
						   fading to a dark red crescent lower-left) - a CSS gradient
						   is the closest match without inventing new pixel art */
						item-fireball .m{
							position: absolute;
							width: 8px;
							height: 8px;
							border-radius: 50%;
							background: radial-gradient(circle at 65% 35%, #ffd54f, #ff7000 45%, #8b0000 100%);
							top: 0;
							left: 0;
							animation: fireball-spin .15s steps(4) infinite;
						}
						@keyframes fireball-spin {
							0% { transform: rotate(0deg); }
							100% { transform: rotate(360deg); }
						}
					</style>
					<div class="m"></div>
				`;
			},
		});
	}
}

export default Fireball;
