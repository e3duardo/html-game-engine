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

	// Static collidables (floors, bricks, pipes... - everything that isn't
	// `updatable`) read their box from the DOM (offsetLeft/clientWidth...),
	// and every such read after ANY style write elsewhere on the page (an
	// enemy moving, say) forces a synchronous layout of the whole level -
	// with hundreds of them checked every tick that was most of the frame. So
	// the first read caches the box; moving one of them through the x/y
	// setters (a bumped block) or changing its size by hand (invalidateBox(),
	// e.g. a collapsing bridge) refreshes it. Anything `updatable` still reads
	// live, since it can move on its own.
	_box() {
		if (this.updatable) return null;
		return (this._cachedBox ??= {
			x: this.tag.offsetLeft,
			y: this.tag.offsetTop,
			width: this.tag.clientWidth,
			height: this.tag.clientHeight,
		});
	}

	// the part of the tag that counts for collisions, as {l, t, w, h} insets
	// from the tag's top-left: a `.c` child (a div the markup positions and sizes
	// like any other, next to the `.g` group and its `.m` sprite) if there is
	// one, else `hitInset` if a class sets it, else the whole tag
	hitBox() {
		if (this._hit) return this._hit;
		const c = this.tag.querySelector && this.tag.querySelector('.c');
		if (c) this._hit = { l: c.offsetLeft, t: c.offsetTop, w: c.offsetWidth, h: c.offsetHeight };
		else if (this.hitInset) this._hit = this.hitInset;
		else return { l: 0, t: 0, w: this.width, h: this.height };
		return this._hit;
	}

	// this object's collision box in level coordinates
	_ownBox() {
		const hb = this.hitBox();
		return { x: this.x + hb.l, y: this.y + hb.t, w: hb.w, h: hb.h };
	}

	invalidateBox() {
		this._cachedBox = null;
	}

	get x() {
		const box = this._box();
		return box ? box.x : super.x;
	}
	set x(x) {
		super.x = x;
		this._cachedBox = null;
	}
	get y() {
		const box = this._box();
		return box ? box.y : super.y;
	}
	set y(y) {
		super.y = y;
		this._cachedBox = null;
	}
	get width() {
		const box = this._box();
		return box ? box.width : super.width;
	}
	get height() {
		const box = this._box();
		return box ? box.height : super.height;
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

	// Collision against a player whose box is not its whole tag (see
	// Puppet.hitBox): `from` is a plain {ax, ay, width, height, prevAx, prevAy,
	// center} snapshot of that box. Each axis is decided separately - the
	// feet stand on whatever the box overlaps at all, the head bumps whatever is
	// above its centre, the sides push back - and which one it is comes from
	// where the box was the frame before, not from how deep it ended up.
	collidesBox = (from) => {
		const collisions = { top: false, bottom: false, left: false, right: false };
		const fl = from.ax;
		const fr = fl + from.width;
		const ft = from.ay;
		const fb = ft + from.height;
		const prevFb = from.prevAy + from.height;
		const prevFt = from.prevAy;
		const box = this._ownBox();
		const ol = box.x;
		const or = ol + box.w;
		const ot = box.y;
		const ob = ot + box.h;
		const TOL = 4;

		// a platform that moves (a lift going down) leaves the standing player a
		// pixel or so above it each frame; he gets re-seated on it, so
		// allow that gap
		const gap = this.updatable ? 4 : 0;
		if (fr > ol && fl < or && fb >= ot - gap && fb <= ot + box.h - 1 && prevFb <= ot + TOL) {
			collisions.bottom = true;
			return collisions;
		}
		const cx = fl + from.width / 2;
		if (cx >= ol - 0.25 && cx <= or + 1.25 && ft >= ot && ft <= ob && prevFt >= ob - TOL) {
			collisions.top = true;
			return collisions;
		}
		const cy = ft + from.height / 2;
		if (cy >= ot - 0.25 && cy <= ob + 1.25) {
			if (fr > ol && fl < ol) collisions.right = true;
			if (fl < or && fr > or) collisions.left = true;
		}
		return collisions;
	};

	collides = (from) => {
		if (from.boxed) return this.collidesBox(from);
		let collisions = { top: false, bottom: false, left: false, right: false };
		const box = this._ownBox();
		const bx = box.x, by = box.y, bw = box.w, bh = box.h;
		// above or below this object (checked against the middle of `from`,
		// with a small tolerance)
		if ((from.ax + from.width / 2).inRange(bx - 0.25, bx + bw + 1.25)) {
			if ((from.ay + from.height).inRange(by, by + bh - 1)) {
				collisions.bottom = true;
			} else if (from.ay.inRange(by, by + bh)) {
				collisions.top = true;
			}
		}
		// right or left of this object
		if ((from.ay + from.height / 2).inRange(by - 0.25, by + bh + 1.25)) {
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
			if (from.ax + from.width > bx && from.ax < bx) {
				collisions.right = true;
			}
			// from is straddling this object's RIGHT edge
			if (from.ax < bx + bw && from.ax + from.width > bx + bw) {
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
