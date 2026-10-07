import Inject from './Inject';
import WalkingItem from './WalkingItem';

// activation behavior on top of WalkingItem's wandering: an enemy doesn't
// move (or collide with anything) until the screen's right edge gets
// within 48px of it, and once it has scrolled off the left edge of the
// screen for good, it freezes instead of running forever off-screen. It
// stays visible the whole time (no CSS hiding), so sprite positions can
// still be inspected off-screen (e.g. with the level's overflow clipping
// turned off for debugging).
class Enemy extends WalkingItem {
	constructor(tag) {
		super(tag);

		this.type = 'enemy';
		this.activated = false;
		this.activationLookahead = 48;
		// The members of an enemy group (goomba pairs...)
		// are not placed from their data column - the whole group appears at the
		// right edge of the screen (x = ScreenRight, +24 per member) in the frame
		// the screen reaches the group's trigger, so there is no 48px lookahead.
		// `group` marks a member; `lead` (tiles) names the first member's column,
		// the one whose arrival triggers everybody
		if (tag.hasAttribute && tag.hasAttribute('group')) this.activationLookahead = -1;
		const lead = tag.getAttribute && tag.getAttribute('lead');
		this.groupLead = lead !== null && lead !== undefined && lead !== '' ? Number(lead) * 16 : null;
	}

	// true while the enemy is in its "alive" window: past activation, not
	// yet scrolled off behind the camera. Call this first thing from both
	// update() and collide() to skip everything else while it isn't.
	isActive = () => {
		if (this.x + this.width < Inject.scene.scroll_x) {
			return false; // scrolled off the left edge for good
		}
		if (this.activated) return true;
		const trigger = this.groupLead ?? this.x;
		if (trigger > Inject.scene.scroll_x + Inject.stage.width + this.activationLookahead) {
			return false; // still too far ahead of the camera
		}
		this.activated = true;
		return true;
	};

	update = () => {
		if (!this.isActive()) return;
		this.walk();
	};

	// a clean top-down landing already shows up as collisions.bottom, but
	// that flag requires the player's horizontal CENTER to already be
	// inside this object's x-span - while they're still approaching
	// diagonally (jumping onto an enemy ahead of them, the normal way you
	// stomp one), their leading edge can overlap and register a side hit
	// first, before their center ever catches up. This is the same "is the
	// player's foot already at/above this object's top, with any x-overlap
	// at all" check, without the center-alignment requirement - kept local
	// to enemies rather than loosening Collidable.collides() itself, which
	// floors/pipes/blocks also share and where the same change broke
	// narrow gaps between adjacent blocks (the player's own width bridging
	// two neighbors' spans at once) and floor/pipe edges.
	landedOn = (from) => {
		// the player's contact rules (even frames, once per contact) already live
		// in the collision flags the caller has
		if (from.intPhysics) return false;
		const hb = from.hitBox ? from.hitBox() : { l: 0, t: 0, w: from.width, h: from.height };
		const mine = this._ownBox();
		const falling = from.intPhysics ? from._nSy > 0 : from.speedY > 0;
		return (
			falling &&
			from.ax + hb.l + hb.w > mine.x &&
			from.ax + hb.l < mine.x + mine.w &&
			from.ay + hb.t + hb.h > mine.y &&
			from.ay + hb.t < mine.y + mine.h
		);
	};
}

export default Enemy;
