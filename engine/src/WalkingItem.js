import Inject from './Inject';
import Collidable from './Collidable';

// generic "wanders off on its own" behavior shared by any item that just
// walks in a straight line once it exists: falls with gravity, turns
// around when it hits a wall, and is lost for good if it walks off a ledge
// past the bottom of the level - reused by mushrooms and future power-ups
// instead of each one reimplementing the same movement/collision code
class WalkingItem extends Collidable {
	constructor(tag) {
		super(tag);

		this.type = 'item';
		this.updatable = true;
		this.dead = false;
		// this used to be 0.3 (itself halved from a guessed 0.6 at the old
		// 30fps tick rate), noticeably too slow - that gap let the
		// player's own walk speed (see Puppet.js's velocity_x) catch up to
		// an enemy that should already have walked further away, dying on
		// contact.
		this.walkSpeed = 0.5;
		// most walking items (mushrooms, enemies) just settle once they land
		// - a subclass that should keep hopping forever instead (the star
		// power-up) sets this true and speedY gets replaced with
		// `bounceImpulse` on landing instead of zeroed, see walk() below
		this.bounceOnLand = false;
		this.bounceImpulse = -4.5;
		// one-time read of the tag's starting position to seed the logical
		// position - after this, physics never reads position back from the
		// DOM again, see the x/y getters below (same fix applied to the
		// player's own position in Puppet.js, for the same reason)
		this._x = this.tag.offsetLeft;
		this._y = this.tag.offsetTop;
		this.speedX = this.walkSpeed;
		this.speedY = 0;
	}

	// `_x`/`_y` are the logical position and the only thing the physics
	// reads back - never the DOM. Reading offsetLeft/offsetTop back reports
	// whatever the browser is currently rendering, which lags behind the
	// real target while a CSS transition is animating (and Tag's default
	// setters round with parseInt, which throws away a sub-1px speed like
	// `walkSpeed` every single tick - parseInt(336.6) == 336, so the
	// position would never advance). Keeping our own field as the source of
	// truth means a transition can be added purely for visual smoothing
	// without corrupting the simulation, same as Puppet.js.
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

	update = () => {
		this.walk();
	};

	// the movement/collision step itself, factored out of `update` so a
	// subclass (like Enemy, which gates *when* this runs) can call it by
	// name - these methods are arrow-function instance fields, not real
	// prototype methods, so `super.update()` would not resolve here
	walk = () => {
		if (this.dead) return;

		this.ax = this.x + this.speedX;
		this.speedY += Inject.scene.gravity;
		if (this.speedY > this.speed_limit_y) {
			this.speedY = this.speed_limit_y;
		}
		this.ay = this.y + this.speedY;

		Inject.scene.sceneMap.forEach((object) => {
			const collisions = object.collides(this);

			if (collisions.bottom && (object.border.top == 'solid' || object.border.top == 'platform')) {
				this.ay = object.y - this.height;
				this.speedY = this.bounceOnLand ? this.bounceImpulse : 0;
			}
			if (collisions.top && object.border.bottom == 'solid') {
				this.ay = object.y + this.height;
				this.speedY = 1;
			}
			if (collisions.right && object.border.horizontal == 'solid' && this.speedX > 0) {
				this.ax = object.x - this.width;
				this.speedX *= -1;
			}
			if (collisions.left && object.border.horizontal == 'solid' && this.speedX < 0) {
				this.ax = object.x + object.width;
				this.speedX *= -1;
			}
		});

		this.x = this.ax;
		this.y = this.ay;

		// fell off a ledge and past the bottom of the level - same as the
		// player falling to their death, it's just gone; stop updating and
		// remove it instead of letting it free-fall forever off-screen
		if (this.ay > Inject.scene.height) {
			this.remove();
		}
	};

	remove = () => {
		this.dead = true;
		this.tag.remove();
	};
}

export default WalkingItem;
