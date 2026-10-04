import Inject from './Inject';
import Object from './Object';

class Collidable extends Object {
	constructor(tag) {
		super(tag);
		// where this tag actually lived in the markup - a reset() that
		// needs to reattach a removed tag (an enemy/item that gets removed
		// from the DOM and later restored to how it started) must restore
		// it here, not just anywhere under .Scene (see Inject.scene.addTag,
		// which always appends straight to .Scene's own root). Without
		// this, the first reset() after this object's tag was ever
		// detached silently moved it out from under any wrapper it
		// originally lived in - e.g. an item inside a differently-styled
		// wrapper losing that styling for good the first time the player
		// dies anywhere in the level, since resetLevel() calls reset() on
		// everything, not just objects near them.
		this.originalParent = tag.parentNode;

		// how this collides, same "attribute, not CSS class" convention as
		// `type` below - a class is for styling, not game logic. A plain div
		// says kind="solid"/"platform" in markup; a subclass that always has
		// one kind just calls setKind() itself instead
		this.setKind(tag.getAttribute('kind'));

		// defaults to 'scenario' - right for most Collidables (floors,
		// blocks, pipes...), but 'scenario' IS solid-by-default in
		// Puppet.update()'s own collision response (border.bottom/top are
		// 'solid' unless kind="platform"), even without kind="solid" set.
		// Anything meant to be walked THROUGH instead - a coin, a warp
		// marker with no pipe art of its own (see Portal.js), any other
		// pass-through item - has to opt out explicitly with type="item"
		// or the player will land on and get stuck on top of it.
		this.type = tag.getAttribute('type') || 'scenario';
		this.updatable = false;
		this.affectedByGravity = false;
		this.collideWithTheScene = false;
	}

	setKind(kind) {
		this.solid = kind === 'solid';
		this.platform = kind === 'platform';
		this.border = {
			top: 'solid',
			bottom: 'solid',
			horizontal: 'solid',
		};
		if (this.platform) {
			this.border.top = 'platform';
			this.border.bottom = false;
			this.border.horizontal = false;
		}
	}

	// default no-op - a subclass overrides this to react to whatever
	// touched it (see e.g. Pipe.js/Question.js)
	collide(from, collisions) {}

	collides = (from) => {
		let collisions = { top: false, bottom: false, left: false, right: false };
		// above or below this object (checked against the middle of `from`,
		// with a small tolerance)
		if ((from.ax + from.width / 2).inRange(this.x - 0.25, this.x + this.width + 1.25)) {
			if ((from.ay + from.height).inRange(this.y, this.y + this.height - 1)) {
				collisions.bottom = true;
			} else if (from.ay.inRange(this.y, this.y + this.height)) {
				collisions.top = true;
			}
		}
		// right or left of this object
		if ((from.ay + from.height / 2).inRange(this.y - 0.25, this.y + this.height + 1.25)) {
			// from is straddling this object's LEFT
			// edge (approaching from the left) - its right edge has passed
			// that edge but its left edge hasn't reached it yet. This is an
			// overlap test, not "is from anywhere inside this object's
			// span" (the old check) - that was true almost everywhere along
			// the level's 1000+px-wide Floor strips, so merely landing on
			// ordinary flat ground kept spuriously registering a side hit
			// and snapping/zeroing speedX ("teleporting" on nearly every
			// jump landing). It's also not a narrow proximity band around
			// the edge - at real movement speeds (several px/tick) that
			// band gets stepped over entirely most ticks, missing genuine
			// wall hits (e.g. running straight through a pipe).
			if (from.ax + from.width > this.x && from.ax < this.x) {
				collisions.right = true;
			}
			// from is straddling this object's RIGHT edge
			if (from.ax < this.x + this.width && from.ax + from.width > this.x + this.width) {
				collisions.left = true;
			}
		}
		return collisions;
	};

	update = () => {
		if (this.updatable) {
			this.ax = this.x;
			this.ay = this.y;

			this.ax += this.speedX;

			if (this.affectedByGravity) {
				this.speedY += Inject.scene.gravity;
				if (Math.abs(this.speedY) < 0.1) this.speedY = 0;

				if (this.speedY > this.speed_limit_y) {
					this.speedY = this.speed_limit_y;
				}

				this.ay += this.speedY;
			}

			if (this.collideWithTheScene) {
				Inject.scene.sceneMap.forEach((object) => {
					const collisions = object.collides(this);
					object.collide(this, collisions);
				});
			}

			this.x = this.ax;
			this.y = this.ay;
		}
	};

	get scenario() {
		return this.type == 'scenario';
	}
	get enemy() {
		return this.type == 'enemy';
	}
	get item() {
		return this.type == 'item';
	}
}

export { Collidable as default };
