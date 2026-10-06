import Inject from './Inject';
import Tag from './Tag';

class SceneBase extends Tag {
	constructor() {
		super(document.querySelector('.Scene'));

		// quartered (not halved!) from the old 30fps-tick value of 2 - see
		// Game.js's `fps` (now 60). `gravity` is added to speedY every tick,
		// so it's an acceleration term: speedY (px/tick) already carries one
		// factor of the tick duration `dt` (it's added straight to position
		// each tick), so accumulating it via `speedY += gravity` needs
		// `gravity` itself to carry a SECOND factor of `dt` to represent a
		// constant real-world acceleration - halving `dt` (doubling fps)
		// means `gravity` must scale by dt^2, i.e. by 1/4, not by dt^1 (1/2).
		// (A one-time velocity, like the jump impulse below, only carries
		// the single dt factor and correctly halves instead - don't confuse
		// the two when touching fps again.)
		this.gravity = 0.5;

		// the camera only starts following once the player's on-screen X
		// reaches 80px, not the screen's center (128, half of the real
		// 256px-wide .Stage) - holding them there instead keeps them
		// visibly further left/back on screen, with more room ahead than
		// behind while walking. A reasonable default, not something every
		// game on this engine has to match exactly - see line_to_scroll's
		// own usage below.
		this.line_to_scroll = 80;
		// through the setter, not just the field: a Router scene swap reuses the
		// same .Scene element, which still has the previous level's scroll
		// offset applied (left: -3136px after finishing 1-1) - the new scene
		// starts at 0 and the DOM has to agree
		this.scroll_x = 0;
		this.scroll_x_start = 0;

		this.collisionMap = [];
		this.updatableMap = [];
		this.sceneMap = [];

		// true for a subclass whose own opening plays a scripted cutscene
		// (see openingCutscene() below) before handing control to the player -
		// set true in that subclass's own constructor, after super(). Read by
		// the game's boot code to freeze input from the moment the scene is
		// created, not just once the cutscene itself starts running (there's
		// otherwise a gap - the level's intro card - where real input could
		// already be moving the player).
		this.opensWithCutscene = false;
	}

	// override in a subclass with opensWithCutscene = true - runs once
	// control would normally be handed to the player. Default: nothing,
	// matching opensWithCutscene's own default.
	openingCutscene() {}

	// called once the castle celebration is over - a no-op here
	// since this engine has no built-in idea of a "next" stage. Deciding
	// what comes after THIS stage is over is stage/level knowledge, not
	// the player puppet's job - a game's own Stage subclass overrides this
	// to route to whatever comes next via Inject.router.goTo().
	onLevelComplete() {}

	constructCollisionMap = () => {
		this.collisionMap = [];
		this.updatableMap = [];
		this.sceneMap = [];

		document.querySelectorAll('.Collidable').forEach((object) => {
			object = Inject.collidableFactory.from(object);
			this.collisionMap.push(object);
			if (object.updatable) {
				this.updatableMap.push(object);
			}
			if (object.solid || object.platform) {
				this.sceneMap.push(object);
			}
		});
	};

	// todo: cull to what's actually on/near screen instead of returning
	// every collidable in the level every tick
	getCollisionMapVisible = () => {
		return this.collisionMap;
	};

	addTag = (tag) => {
		this.tag.appendChild(tag);
	};

	// creates and registers a new collidable/updatable game object at
	// runtime (e.g. a mushroom popping out of a block) - constructCollisionMap
	// only runs once at game start, so anything appended later has to be
	// pushed into these maps by hand to actually collide/update
	spawn = (tagName, attrs) => {
		const tag = document.createElement(tagName);
		Object.entries(attrs).forEach(([key, value]) => tag.setAttribute(key, value));
		this.addTag(tag);

		const object = Inject.collidableFactory.from(tag);
		// marks this object as "didn't exist when the level loaded" - see
		// resetLevel(), which removes anything spawned instead of trying to
		// restore it to a default it never had
		object.spawned = true;
		this.collisionMap.push(object);
		if (object.updatable) {
			this.updatableMap.push(object);
		}
		return object;
	};

	// called on every player respawn (see Puppet.respawnPlayer) to put the
	// whole level back the way it was at boot: anything spawned at runtime
	// (a mushroom, a fire flower, a fireball) is removed outright, and
	// everything else that was part of the original markup gets its own
	// reset() called, if it has one (plain scenery like Floor/Pipe/Block
	// never changes state, so it has none - the `object.reset &&` guard
	// just skips those).
	resetLevel = () => {
		this.collisionMap = this.collisionMap.filter((object) => {
			if (object.spawned) {
				object.tag.remove();
				return false;
			}
			if (object.reset) object.reset();
			return true;
		});
		this.updatableMap = this.updatableMap.filter((object) => !object.spawned);
	};

	// teleports the player to whichever pipe (or other warp target) was set
	// up with a matching `warpId` - called by a pipe when the player stands
	// on it and presses down. This one continuous scrolling `.Scene` has no
	// rooms of its own, so a same-scene target is just another spot in it;
	// the camera is re-centered on it
	// the same way the normal scroll-follow in Puppet.update() clamps to
	// the scene's edges. If `warpId` isn't any local target's id, it's
	// tried as a Router route name instead (see Router.js) - this is what
	// lets a pipe send the player to a whole different registered stage
	// (e.g. a warp zone pipe into another world), reusing the exact same
	// warp-to attribute pipes already use for a same-scene marker.
	warp = (warpId, puppet) => {
		const target = this.collisionMap.find((object) => object.warpId === warpId);
		if (!target) {
			if (Inject.router.routes.has(warpId)) Inject.router.goTo(warpId);
			return;
		}

		// this runs from inside a Pipe's collide(), itself called mid-tick
		// from Puppet.update()'s own collision loop - update() finalizes
		// the tick with `this.x = this.ax; this.y = this.ay`, so ax/ay (its
		// own in-progress physics position for *this* tick) have to be
		// moved too, or that line would silently undo the teleport a
		// moment later
		puppet.ax = target.x + (target.width - puppet.width) / 2;
		puppet.ay = target.y - puppet.height;
		puppet.x = puppet.ax;
		puppet.y = puppet.ay;
		puppet.speedX = 0;
		puppet.speedY = 0;
		// tells update()'s own "never move more than 30px in one tick" safety
		// net to stand down just this once - see Puppet.js
		puppet._justWarped = true;

		puppet.warpLocked = true;
		setTimeout(() => {
			puppet.warpLocked = false;
		}, 500);

		let scroll = puppet.x - Inject.stage.width / 2;
		const maxScroll = this.width - Inject.stage.width;
		if (scroll < 0) scroll = 0;
		else if (scroll > maxScroll) scroll = maxScroll;
		// a warp target can pin the camera to an exact scroll position
		// instead of the usual "centered on the player" one, via a
		// `lock-scroll-x` attribute (tile units, matching every other
		// coordinate in the level markup) - for a self-contained
		// single-screen room, this is what makes its own left wall line up
		// with the screen's left edge on entry, instead of wherever
		// centering on the player's landing spot happens to put it.
		if (target.tag && target.tag.hasAttribute('lock-scroll-x')) {
			scroll = Number(target.tag.getAttribute('lock-scroll-x')) * 16;
		}
		this.scroll_x = scroll;
		// a warp can legitimately send the camera backward (e.g. a
		// warp-zone's own return pipe, back to the main level) - the
		// "never scroll back" rule in Puppet.update() only applies to the
		// player's own walking, so let this scripted jump reset the mark
		// it's tracked against instead of being fought/undone next tick
		puppet.maxScrollX = scroll;
	};

	get scroll_x() {
		return this._scroll_x;
	}
	set scroll_x(scroll) {
		this.x = -scroll;
		this._scroll_x = scroll;
	}
}

export default SceneBase;
