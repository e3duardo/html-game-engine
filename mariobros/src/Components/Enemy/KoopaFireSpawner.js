import Collidable from '~/engine/src/Collidable';
import Inject from '~/engine/src/Inject';
import fireSound from '../../../sounds/fire.wav';

// Stand-in for Bowser's fire breathing until Bowser exists. Invisible; from
// the moment mario passes its x, it keeps firing flames at the original's
// rhythm, until mario passes `to` (if given) or dies.
//
// SMBDIS timing (RunBowser / SetFlameTimer / FlameTimerData): the breath
// timer starts at $df (223 frames); every expiry flips bowser's mouth, and
// the flame is made when it closes again, 32 frames after it opened. The
// wait before the next opening is FlameTimerData[n++ & 7].
const FIRST_WAIT = 0xdf;
const MOUTH_OPEN = 32;
const WAITS = [0xbf, 0x40, 0xbf, 0xbf, 0xbf, 0x40, 0x40, 0xbf];
// FlameYPosData: sprite top in px. Level and NES coordinates coincide here
// (floor top at 208 in both), so these are used as-is. Picked at random
// (2 bits), hence $90 twice.
const FLAME_Y = [0x90, 0x80, 0x70, 0x90];
// InitBowserFlame/PutAtRightExtent: without Bowser, a flame is placed 32px
// past the screen's right edge
const SPAWN_OFFSET = 32;

class KoopaFireSpawner extends Collidable {
	static tagName = 'enemy-koopa-fire-spawner';

	constructor(tag) {
		super(tag);
		this.type = 'item';
		this.updatable = true;
		this.fromX = tag.offsetLeft;
		this.toX = tag.hasAttribute('to') ? Number(tag.getAttribute('to')) * 16 : Infinity;
		this.resetCycle();
	}

	resetCycle() {
		this._index = 0;
		this._timer = FIRST_WAIT + MOUTH_OPEN;
	}

	update = () => {
		const puppet = Inject.puppet;
		if (!puppet || puppet.dying) return;
		if (puppet.x < this.fromX || puppet.x >= this.toX) return;

		if (--this._timer > 0) return;
		this.fire();
		this._timer = WAITS[this._index++ & 7] + MOUTH_OPEN;
	};

	fire = () => {
		const top = FLAME_Y[Math.floor(Math.random() * FLAME_Y.length)];
		const flame = Inject.scene.spawn('enemy-koopa-fire', { x: 0, y: 0 });
		flame.x = Inject.scene.scroll_x + Inject.stage.width + SPAWN_OFFSET;
		flame.y = top;
		Inject.audio.play(fireSound);
	};

	reset = () => this.resetCycle();

	// x: the tile mario has to reach for it to start; to: optional tile
	// where it stops again
	static setupWebComponent() {
		Collidable.setupWebComponent(this.tagName, {
			x: 0,
			to: 0,
			render: (tag) => {
				tag.classList += 'Collidable';
				tag.style.position = 'absolute';
				tag.style.width = '0px';
				tag.style.height = '0px';
				tag.style.left = tag.x * 16 + 'px';
				tag.style.top = '0px';
				return '';
			},
		});
	}
}

export default KoopaFireSpawner;
